/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation

 - Name Surname <name.surname@gatesfoundation.com>
 * Mowali

 * ModusBox <https://modusbox.com>
 - Steven Oderayi <steven.oderayi@modusbox.com>
 --------------
 ******/
'use strict';

// Ignore this file in coverage checks since most of it can't be tested in unit tests
/* istanbul ignore file */

const Koa = require('koa');
const koaBody = require('koa-body').default;
const { generateSlug } = require('random-word-slugs');
const yaml = require('yamljs');
const util = require('util');
const https = require('https');
const cors = require('@koa/cors');
const router = require('./lib/router');
const Validate = require('./lib/validate');
const { getStackOrInspect } = require('./lib/log/log');
const Logger = require('@mojaloop/central-services-logger');
const RulesEngine = require('./lib/rules-engine');
const { LogLayer, LoggerType } = require('loglayer');

const Config = require('./lib/config');

const simHandlers = require('./simulator/handlers');
const reportHandlers = require('./reports/handlers');
const testApiHandlers = require('./test-api/handlers');

const { setConfig, getConfig } = require('./config');
const Model = require('./models/model');

const simApiSpec = yaml.load('./src/simulator/api.yaml');
const reportApiSpec = yaml.load('./src/reports/api.yaml');
const testApiSpec = yaml.load('./src/test-api/api.yaml');

const simulator = new Koa();
const report = new Koa();
const testApi = new Koa();

/*
    when using simulator with sdk-standard-components ThirdpartyRequests
    the need to rewrite content-type header appears because koaBody has problems
    with interoperability headers and doesn't parse properly the request body
*/

// map where keys are the content-type values to be rewritten, extend it if needed
const rewriteContentTypes = {
    'application/vnd.interoperability.authorizations+json;version=1.0': 'application/json',
};

// rewrite content-type header middleware
async function rewriteContentTypeHeader(ctx, next) {
    const contentType = ctx.header['content-type'];

    // rewrite only if contentType found in rewriteContentTypes
    // elsewhere keep original value
    ctx.header['content-type'] = rewriteContentTypes[contentType] || contentType;

    await next();
}

(async function start() {
    // Try overload config file
    const configResult = await Config(process.env.CONFIG_OVERRIDE);
    // eslint-disable-next-line no-console
    console.log(configResult);
    // Set up the config from the environment
    await setConfig(process.env);
    const conf = getConfig();


    // Set up a logger for each running server
    const simLogger = new LogLayer({
        logger: {
            instance: Logger,
            type: LoggerType.WINSTON,
        },
        context: {
            // we'll put our context into a field called context
            fieldName: 'context'
        }
    }).withContext({
        app: 'simulator'
    });
    const reportLogger = new LogLayer({
        logger: {
            instance: Logger,
            type: LoggerType.WINSTON,
        },
        context: {
            // we'll put our context into a field called context
            fieldName: 'context'
        }
    }).withContext({
        app: 'report'
    });
    const testApiLogger = new LogLayer({
        logger: {
            instance: Logger,
            type: LoggerType.WINSTON,
        },
        context: {
            // we'll put our context into a field called context
            fieldName: 'context'
        }
    }).withContext({
        app: 'test-api'
    });

    const rulesEngine = new RulesEngine({ logger: simLogger });

    // parse rules file
    const rules = require(process.env.RULES_FILE);

    // load rules file into engine
    rulesEngine.loadRules(rules);

    // Initialise the model
    const model = new Model();
    await model.init({ databaseFilepath: process.env.MODEL_DATABASE, parties: conf.parties });

    // Log raw to console as a last resort- if the logging framework crashes
    const failSafe = async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            // eslint-disable-next-line no-console
            console.log(JSON.stringify({
                message: `Unhandled error in handler chain: ${getStackOrInspect(err, { depth: Infinity })}`,
            }, null, 2));
        }
    };

    simulator.use(failSafe);
    report.use(failSafe);
    testApi.use(failSafe);

    simulator.use(koaBody());
    report.use(koaBody());
    testApi.use(koaBody());

    // Add a log context for each request, log the receipt and handling thereof
    simulator.use(async (ctx, next) => {
        // Create new child for lifespan of request
        ctx.state.logger = simLogger.child();
        ctx.state.logger.withContext({
            request: {
                id: generateSlug(4),
                path: ctx.path,
                method: ctx.method,
            }
        });

        if (ctx.path == '/' || ctx.path == '/health') {
            ctx.state.logger.getLoggerInstance().isDebugEnabled && ctx.state.logger.withContext({
                body: ctx.request.body
            }).debug('Request received');

            await next();

            const { body, status } = ctx.response;
            ctx.state.logger.getLoggerInstance().isDebugEnabled && ctx.state.logger.withContext({
                response: { body, status }
            }).debug('Request processed');
        } else {
            ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.withContext({
                body: ctx.request.body
            }).info('Request received');

            await next();

            const { body, status } = ctx.response;
            ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.withContext({
                response: { body, status }
            }).info('Request processed');
        }
    });

    report.use(async (ctx, next) => {
        // Create new child for lifespan of request
        ctx.state.logger = reportLogger.child();
        ctx.state.logger.withContext({
            request: {
                id: generateSlug(4),
                path: ctx.path,
                method: ctx.method,
            }
        });
        ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.withContext({
            body: ctx.request.body
        }).info('Request received');

        await next();

        const { body, status } = ctx.response;
        ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.withContext({
            response: { body, status }
        }).info('Request processed');
    });

    testApi.use(async (ctx, next) => {
        // Create new child for lifespan of request
        ctx.state.logger = testApiLogger.child();
        ctx.state.logger.withContext({
            request: {
                id: generateSlug(4),
                path: ctx.path,
                method: ctx.method,
            }
        });
        ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.withContext({
            body: ctx.request.body
        }).info('Request received');

        await next();

        const { body, status } = ctx.response;
        ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.withContext({
            response: { body, status }
        }).info('Request processed');
    });

    simulator.use(rewriteContentTypeHeader);
    testApi.use(cors());

    // Add validation and data model for each request
    const simValidator = new Validate();

    simulator.use(async (ctx, next) => {
        try {
            if (ctx.path == '/' || ctx.path == '/health') {
                ctx.state.logger.getLoggerInstance().isDebugEnabled && ctx.state.logger.debug(`Validating request - ${util.inspect(ctx.request)}`);
                ctx.state.path = simValidator.validateRequest(ctx, ctx.state.logger);
                ctx.state.logger.getLoggerInstance().isDebugEnabled && ctx.state.logger.debug(`Request passed validation - ${util.inspect(ctx.request)}`);
                ctx.state.model = model;
            } else {
                ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.info(`Validating request - ${util.inspect(ctx.request)}`);
                ctx.state.path = simValidator.validateRequest(ctx, ctx.state.logger);
                ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.info(`Request passed validation - ${util.inspect(ctx.request)}`);
                ctx.state.model = model;
            }
            await next();
        } catch (err) {
            ctx.state.logger.getLoggerInstance().isErrorEnabled && ctx.state.logger.error(`Request failed validation. - ${err}`);
            ctx.response.status = 400;
            ctx.response.body = {
                message: err.message,
                statusCode: 400,
            };
        }
    });

    const reportValidator = new Validate();

    report.use(async (ctx, next) => {
        try {
            ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.info(`Validating request - ${util.inspect(ctx.request)}`);
            ctx.state.path = reportValidator.validateRequest(ctx, ctx.state.logger);
            ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.info(`Request passed validation - ${util.inspect(ctx.request)}`);
            await next();
        } catch (err) {
            ctx.state.logger.getLoggerInstance().isErrorEnabled && ctx.state.logger.error(`Request failed validation. - ${err}`);
            ctx.response.status = 400;
            ctx.response.body = {
                message: err.message,
                statusCode: 400,
            };
        }
    });

    const testApiValidator = new Validate();

    testApi.use(async (ctx, next) => {
        try {
            ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.info(`Validating request - ${util.inspect(ctx.request)}`);
            ctx.state.path = testApiValidator.validateRequest(ctx, ctx.state.logger);
            ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.info(`Request passed validation - ${util.inspect(ctx.request)}`);
            ctx.state.model = model;
            await next();
        } catch (err) {
            ctx.state.logger.getLoggerInstance().isErrorEnabled && ctx.state.logger.error(`Request failed validation. - ${err}`);
            ctx.response.status = 400;
            ctx.response.body = {
                message: err.message,
                statusCode: 400,
            };
        }
    });

    // Add rule engine evaluation for each simulator request
    simulator.use(async (ctx, next) => {
        const facts = {
            path: ctx.path,
            body: ctx.request.body,
            method: ctx.request.method,
        };
        if (ctx.path == '/' || ctx.path == '/health') {
            ctx.state.logger.getLoggerInstance().isDebugEnabled && ctx.state.logger.debug(`Rules engine evaluating request against facts: ${util.inspect(facts)}`);
        } else {
            ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.info(`Rules engine evaluating request against facts: ${util.inspect(facts)}`);
        }

        const res = await rulesEngine.evaluate(facts);
        if (res && res.length > 0) {
            // res will be an array of events from the rule engine.
            // note that we will only use the first event to send
            // our response

            const evt = res[0];

            if (evt.noResponse) {
                // simulating no response
                ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.info('Rule engine is triggering a no response scenario');
                ctx.res.end();
                return;
            }

            // merge the extensionList
            if (evt.modifyExtension === 'merge') {
                const { extensionList } = res[0];
                const newBody = { ...ctx.request.body };
                newBody.extensionList = Array.isArray(newBody.extensionList.extension)
                    ? newBody.extensionList : { extension: [] };
                newBody.extensionList.extension = newBody.extensionList.extension
                    .filter((originalList) => !extensionList.extension
                        .find((newList) => originalList.key === newList.key))
                    .concat(extensionList.extension);

                ctx.request.body = newBody;
                // eslint-disable-next-line
                return await next();
            }

            // replace the extensionList
            if (evt.modifyExtension === 'replace') {
                const { extensionList } = res[0];
                const newBody = { ...ctx.request.body };
                newBody.extensionList = extensionList;
                ctx.request.body = newBody;
                // eslint-disable-next-line
                return await next();
            }

            const { body, statusCode } = res[0];
            ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.info(`Rules engine returned a response for request: ${util.inspect(res)}.`);
            ctx.response.body = body;
            ctx.response.status = statusCode;
            return;
        }
        await next();
    });

    // Handle requests
    simulator.use(router(simHandlers.map));
    report.use(router(reportHandlers.map));
    testApi.use(router(testApiHandlers.map));

    await Promise.all([
        simValidator.initialise(simApiSpec),
        reportValidator.initialise(reportApiSpec),
        testApiValidator.initialise(testApiSpec),
    ]);

    // If config specifies TLS, start an HTTPS server; otherwise HTTP
    let simServer;
    const simulatorPort = conf.ports.simulatorApi;
    const reportPort = conf.ports.reportApi;
    const testApiPort = conf.ports.testApi;

    if (conf.tls.mutualTLS.enabled || conf.tls.enabled) {
        if (!(conf.tls.creds.ca && conf.tls.creds.cert && conf.tls.creds.key)) {
            throw new Error(
                'Incompatible parameters.\n'
                + `Mutual TLS enabled: ${conf.tls.mutualTLS.enabled}.\n`
                + `HTTPS enabled: ${conf.tls.enabled}.\n`
                + `Server key present: ${conf.tls.creds.key !== null}.\n`
                + `CA cert present: ${conf.tls.creds.ca !== null}.\n`
                + `Server cert present: ${conf.tls.creds.cert !== null}`,
            );
        }
        const httpsOpts = {
            ...conf.tls.creds,
            requestCert: conf.tls.mutualTLS.enabled,
            rejectUnauthorized: true, // no effect if requestCert is not true
        };
        simServer = https.createServer(httpsOpts, simulator.callback()).listen(simulatorPort);
    } else {
        simServer = simulator.listen(simulatorPort);
    }
    simLogger.getLoggerInstance().isInfoEnabled && simLogger.info(`Serving simulator on port ${simulatorPort}`);
    const reportServer = report.listen(reportPort);
    reportLogger.getLoggerInstance().isInfoEnabled && reportLogger.info(`Serving report API on port ${reportPort}`);
    const testApiServer = testApi.listen(testApiPort);
    testApiLogger.getLoggerInstance().isInfoEnabled && testApiLogger.info(`Serving test API on port ${testApiPort}`);

    // Gracefully handle shutdown. This should drain the servers.
    process.on('SIGTERM', () => {
        simServer.close();
        reportServer.close();
        testApiServer.close();
    });
}()).catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
});
