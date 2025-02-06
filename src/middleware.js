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

 * Eugen Klymniuk <eugen.klymniuk@infitx.com>
 --------------
 **********/
/* istanbul ignore file */

const { generateSlug } = require('random-word-slugs');

// todo: review code to avoid duplication
const createRequestLoggingMiddleware = (simLogger) => async function requestLoggingMiddleware (ctx, next) {
    // Create new child for lifespan of request
    ctx.state.logger = simLogger.child({
        context: {
            app: 'simulator',
            request: {
                id: generateSlug(4),
                path: ctx.path,
                method: ctx.method,
            }
        }

    });

    if (ctx.path === '/' || ctx.path === '/health') {
        ctx.state.logger.isDebugEnabled && ctx.state.logger.debug({'msg': 'Request received', body: ctx.request.body});

        await next();

        const { body, status } = ctx.response;
        ctx.state.logger.isDebugEnabled && ctx.state.logger.debug({'msg': 'Request processed', body, status});
    } else {
        ctx.state.logger.isInfoEnabled && ctx.state.logger.info({'msg': 'Request received', body: ctx.request.body});

        await next();

        const { body, status } = ctx.response;
        ctx.state.logger.isInfoEnabled && ctx.state.logger.info({'msg': 'Request processed', body, status});
    }
};

const createReportLoggingMiddleware = (reportLogger) => async function reportLoggingMiddleware (ctx, next) {
    // Create new child for lifespan of request
    ctx.state.logger = reportLogger.child({
        context: {
            app: 'report',
            request: {
                id: generateSlug(4),
                path: ctx.path,
                method: ctx.method,
            }
        }

    });
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info({'msg': 'Request received', body: ctx.request.body});

    await next();

    const { body, status } = ctx.response;
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info({'msg': 'Request processed', body, status});
};

const createTestApiLoggingMiddleware = (testApiLogger) => async function testApiLoggingMiddleware (ctx, next) {
    // Create new child for lifespan of request
    ctx.state.logger = testApiLogger.child({
        context: {
            app: 'test-api',
            request: {
                id: generateSlug(4),
                path: ctx.path,
                method: ctx.method,
            }
        }
    });
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info({'msg': 'Request received', body: ctx.request.body});

    await next();

    const { body, status } = ctx.response;
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info({'msg': 'Request processed', body, status});
};

module.exports = {
    createRequestLoggingMiddleware,
    createReportLoggingMiddleware,
    createTestApiLoggingMiddleware
};
