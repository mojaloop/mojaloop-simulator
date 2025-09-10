/*****
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>

 * ModusBox <https://modusbox.com>
 - Steven Oderayi <steven.oderayi@modusbox.com>
 --------------
 ******/
'use strict';

// Ignore this file in coverage checks since most of it can't be tested in unit tests
/* istanbul ignore file */

const Koa = require('koa');
const koaBody = require('koa-body').default;
const yaml = require('yamljs');
const https = require('https');
const cors = require('@koa/cors');
const router = require('./lib/router');
const Validate = require('./lib/validate');
const { logger } = require('./lib/logger');
const RulesEngine = require('./lib/rules-engine');

const Config = require('./lib/config');

const simHandlers = require('./simulator/handlers');
const reportHandlers = require('./reports/handlers');
const testApiHandlers = require('./test-api/handlers');
const middleware = require('./middleware');

const getConfig = require('./config');
const Model = require('./models/model');
const { join } = require('path');

const simApiSpec = yaml.load(join(__dirname, 'simulator/api.yaml'));
const reportApiSpec = yaml.load(join(__dirname, 'reports/api.yaml'));
const testApiSpec = yaml.load(join(__dirname, 'test-api/api.yaml'));

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

module.exports = async function start(config = process.env) {
    // Try overload config file
    const configResult = await Config(config.CONFIG_OVERRIDE);
    logger.info('configResult: ', { configResult });
    // Set up the config from the environment
    const conf = await getConfig(config);


    // Set up a logger for each running server
    const simLogger = logger.child({ component: 'simulator' });
    const reportLogger =  logger.child({ component: 'report' });
    const testApiLogger =  logger.child({ component: 'test-api' });

    const rulesEngine = new RulesEngine({ logger: simLogger });

    // parse rules file
    const rules = require(config.RULES_FILE);

    // load rules file into engine
    rulesEngine.loadRules(rules);

    // Initialise the model
    const model = new Model();
    await model.init({ databaseFilepath: config.MODEL_DATABASE, parties: conf.parties });

    // Log raw to console as a last resort- if the logging framework crashes
    const failSafe = async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            logger.error('Unhandled error in handler chain: ', err);
        }
    };

    simulator.use(failSafe);
    report.use(failSafe);
    testApi.use(failSafe);

    simulator.use(koaBody());
    report.use(koaBody());
    testApi.use(koaBody());

    // Add a log context for each request, log the receipt and handling thereof
    simulator.use(middleware.createLoggingMiddleware(simLogger));
    report.use(middleware.createLoggingMiddleware(reportLogger));
    testApi.use(middleware.createLoggingMiddleware(testApiLogger));

    simulator.use(rewriteContentTypeHeader);
    testApi.use(cors());

    // Add validation and data model for each request
    const simValidator = new Validate();

    simulator.use(async function simValidationMiddleware (ctx, next) {
        try {
            if (ctx.path === '/' || ctx.path === '/health') {
                ctx.state.logger.debug('Validating Request', { request: ctx.request });
                ctx.state.path = simValidator.validateRequest(ctx, ctx.state.logger);
                ctx.state.logger.debug('Request passed validation', { request: ctx.request });
                ctx.state.model = model;
            } else {
                ctx.state.logger.info('Validating Request', { request: ctx.request });
                ctx.state.path = simValidator.validateRequest(ctx, ctx.state.logger);
                ctx.state.logger.info('Request passed validation', { request: ctx.request });
                ctx.state.model = model;
            }
            await next();
        } catch (error) {
            ctx.state.logger.error('Request validation failed: ', error);
            ctx.response.status = 400;
            ctx.response.body = {
                message: error.message,
                statusCode: 400,
            };
        }
    });

    const reportValidator = new Validate();

    report.use(async function reportValidationMiddleware (ctx, next) {
        try {
            ctx.state.logger.info('Validating Request', { request: ctx.request });
            ctx.state.path = reportValidator.validateRequest(ctx, ctx.state.logger);
            ctx.state.logger.info('Request passed validation', { request: ctx.request });
            await next();
        } catch (error) {
            ctx.state.logger.error('Request validation failed: ', error);
            ctx.response.status = 400;
            ctx.response.body = {
                message: error.message,
                statusCode: 400,
            };
        }
    });

    const testApiValidator = new Validate();

    testApi.use(async function testApiValidationMiddleware (ctx, next) {
        try {
            ctx.state.logger.info('Validating Request', { request: ctx.request });
            ctx.state.path = testApiValidator.validateRequest(ctx, ctx.state.logger);
            ctx.state.logger.info('Request passed validation', { request: ctx.request });
            ctx.state.model = model;
            await next();
        } catch (error) {
            ctx.state.logger.error('Request validation failed: ', error);
            ctx.response.status = 400;
            ctx.response.body = {
                message: error.message,
                statusCode: 400,
            };
        }
    });

    // Add rule engine evaluation for each simulator request
    simulator.use(async function ruleEvaluationMiddleware (ctx, next) {
        const facts = {
            path: ctx.path,
            body: ctx.request.body,
            method: ctx.request.method,
        };
        if (ctx.path === '/' || ctx.path === '/health') {
            ctx.state.logger.debug('Rules engine evaluating request against facts', { facts });
        } else {
            ctx.state.logger.info('Rules engine evaluating request against facts', { facts });
        }

        const res = await rulesEngine.evaluate(facts);
        if (res && res.length > 0) {
            // res will be an array of events from the rule engine.
            // note that we will only use the first event to send
            // our response

            const evt = res[0];

            if (evt.noResponse) {
                // simulating no response
                ctx.state.logger.info('Rule engine is triggering a no response scenario');
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

                return await next();
            }

            // replace the extensionList
            if (evt.modifyExtension === 'replace') {
                const { extensionList } = res[0];
                const newBody = { ...ctx.request.body };
                newBody.extensionList = extensionList;
                ctx.request.body = newBody;

                return await next();
            }

            const { body, statusCode } = res[0];
            ctx.state.logger.info('Rules engine returned a response for request', { res });
            ctx.response.body = body;
            ctx.response.status = statusCode;
            return;
        }
        await next();
    });

    function mount(routes) {
        if (!config.MULTI_DFSP) return routes;
        return Object.fromEntries(Object.entries(routes).map(([path, route]) => {
            return [`/{dfspId}${path}`, route];
        }));
    }
    // Handle requests
    simulator.use(router(mount(simHandlers.map)));
    report.use(router(mount(reportHandlers.map)));
    testApi.use(router(mount(testApiHandlers.map)));

    await Promise.all([
        simValidator.initialise(simApiSpec, config.MULTI_DFSP),
        reportValidator.initialise(reportApiSpec, config.MULTI_DFSP),
        testApiValidator.initialise(testApiSpec, config.MULTI_DFSP),
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
    simLogger.info(`Serving simulator on port ${simulatorPort}`);
    const reportServer = report.listen(reportPort);
    reportLogger.info(`Serving report API on port ${reportPort}`);
    const testApiServer = testApi.listen(testApiPort);
    testApiLogger.info(`Serving test API on port ${testApiPort}`);

    // Gracefully handle shutdown. This should drain the servers.
    process.on('SIGTERM', () => {
        simServer.close();
        reportServer.close();
        testApiServer.close();
    });
};

if (require.main === module) {
    module.exports(process.env).catch((err) => {
        logger.error('error in module.exports(process.env): ', err);
        process.exit(1);
    });
}
