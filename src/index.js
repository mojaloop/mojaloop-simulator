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

const { Logger, Transports, getStackOrInspect } = require('@internal/log');
const Koa = require('koa');
const koaBody = require('koa-body');
const randomPhrase = require('@internal/randomphrase');
const Validate = require('@internal/validate');
const yaml = require('yamljs');
const util = require('util');
const router = require('@internal/router');
const https = require('https');
const cors = require('@koa/cors');
const RulesEngine = require('@internal/rules-engine');
const _ = require('lodash');
require('dotenv').config();

// eslint-disable-next-line import/no-dynamic-require
const rules = require(process.env.RULES_FILE);

const simHandlers = require('./simulator/handlers');
const reportHandlers = require('./reports/handlers');
const testApiHandlers = require('./test-api/handlers');

const { setConfig, getConfig } = require('./config.js');
const Model = require('./models/model');


const simApiSpec = yaml.load('./simulator/api.yaml');
const reportApiSpec = yaml.load('./reports/api.yaml');
const testApiSpec = yaml.load('./test-api/api.yaml');

const simulator = new Koa();
const report = new Koa();
const testApi = new Koa();

(async function start() {
    // Set up the config from the environment
    await setConfig(process.env);
    const conf = getConfig();

    // Set up a logger for each running server
    const space = Number(process.env.LOG_INDENT);
    const transports = await Promise.all([
        Transports.consoleDir(),
        Transports.sqlite(process.env.SQLITE_LOG_FILE),
    ]);
    const simLogger = new Logger({ context: { app: 'simulator' }, space, transports });
    const reportLogger = new Logger({ context: { app: 'report' }, space, transports });
    const testApiLogger = new Logger({ context: { app: 'test-api' }, space, transports });


    const rulesEngine = new RulesEngine({ logger: simLogger });
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
            console.log(`Unhandled error in handler chain: ${getStackOrInspect(err, { depth: Infinity })}`);
        }
    };

    simulator.use(failSafe);
    report.use(failSafe);
    testApi.use(failSafe);

    testApi.use(cors());

    // Add a log context for each request, log the receipt and handling thereof
    simulator.use(async (ctx, next) => {
        ctx.state.logger = simLogger.push({
            request: {
                id: randomPhrase(),
                path: ctx.path,
                method: ctx.method,
            },
        });
        ctx.state.logger.push({ body: ctx.request.body }).log('Request received');
        await next();

        ctx.state.logger.log('Request processed');
    });


    report.use(async (ctx, next) => {
        ctx.state.logger = reportLogger.push({
            request: {
                id: randomPhrase(),
                path: ctx.path,
                method: ctx.method,
            },
        });
        ctx.state.logger.push({ body: ctx.request.body }).log('Request received');
        await next();

        ctx.state.logger.log('Request processed');
    });


    testApi.use(async (ctx, next) => {
        ctx.state.logger = testApiLogger.push({
            request: {
                id: randomPhrase(),
                path: ctx.path,
                method: ctx.method,
            },
        });
        ctx.state.logger.push({ body: ctx.request.body }).log('Request received');
        await next();

        ctx.state.logger.log('Request processed');
    });


    simulator.use(koaBody());
    report.use(koaBody());
    testApi.use(koaBody());


    // Add validation and data model for each request
    const simValidator = new Validate();

    simulator.use(async (ctx, next) => {
        ctx.state.logger.log('Validating request');
        try {
            ctx.state.path = simValidator.validateRequest(ctx, ctx.state.logger);
            ctx.state.logger.log('Request passed validation');
            ctx.state.model = model;
            await next();
        } catch (err) {
            ctx.state.logger.push({ err }).log('Request failed validation.');
            ctx.response.status = 400;
            ctx.response.body = {
                message: err.message,
                statusCode: 400,
            };
        }
    });

    const reportValidator = new Validate();

    report.use(async (ctx, next) => {
        ctx.state.logger.log('Validating request');
        try {
            ctx.state.path = reportValidator.validateRequest(ctx, ctx.state.logger);
            ctx.state.logger.log('Request passed validation');
            await next();
        } catch (err) {
            ctx.state.logger.push({ err }).log('Request failed validation.');
            ctx.response.status = 400;
            ctx.response.body = {
                message: err.message,
                statusCode: 400,
            };
        }
    });

    const testApiValidator = new Validate();

    testApi.use(async (ctx, next) => {
        ctx.state.logger.log('Validating request');
        try {
            ctx.state.path = testApiValidator.validateRequest(ctx, ctx.state.logger);
            ctx.state.logger.log('Request passed validation');
            ctx.state.model = model;
            await next();
        } catch (err) {
            ctx.state.logger.push({ err }).log('Request failed validation.');
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

        ctx.state.logger.log(`Rules engine evaluating request against facts: ${util.inspect(facts)}`);

        const res = await rulesEngine.evaluate(facts);
        if (res && res.length > 0) {
            // res will be an array of events from the rule engine.
            // note that we will only use the first event to send
            // our response

            const evt = res[0];

            if (evt.noResponse) {
                // simulating no response
                ctx.state.logger.log('Rule engine is triggering a no response scenario');
                ctx.res.end();
                return;
            }

            // append the extensionList
            if (evt.modifyExtension === 'append') {
                const { extensionList } = res[0];
                const newBody = { ...ctx.request.body };
                newBody.extensionList = Array.isArray(newBody.extensionList.extension)
                    ? newBody.extensionList : { extension: [] };
                newBody.extensionList.extension = _.unionBy(extensionList.extension, newBody.extensionList.extension, 'key');
                ctx.request.body = newBody;
                // eslint-disable-next-line
                return await next();
            }

            // overwrite the extensionList
            if (evt.modifyExtension === 'overwrite') {
                const { extensionList } = res[0];
                const newBody = { ...ctx.request.body };
                newBody.extensionList = extensionList;
                ctx.request.body = newBody;
                // eslint-disable-next-line
                return await next();
            }

            const { body, statusCode } = res[0];
            ctx.state.logger.log(`Rules engine returned a response for request: ${util.inspect(res)}.`);
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
    simLogger.log(`Serving simulator on port ${simulatorPort}`);
    const reportServer = report.listen(reportPort);
    reportLogger.log(`Serving report API on port ${reportPort}`);
    const testApiServer = testApi.listen(testApiPort);
    testApiLogger.log(`Serving test API on port ${testApiPort}`);

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
