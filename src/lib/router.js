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
 --------------
 ******/
'use strict';

module.exports = (handlerMap) => async (ctx, next) => {
    const handlers = handlerMap[ctx.state.path.pattern];
    const handler = handlers ? handlers[ctx.method.toLowerCase()] : undefined;
    if (!handlers || !handler) {
        ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.info('No handler found');
        ctx.response.status = 404;
        // TODO: response content according to API spec. Should probably actually be a 404 here.
        ctx.response.body = { statusCode: 404, message: 'Not found' };
    } else {
        /* istanbul ignore next */
        if (ctx.path == '/' || ctx.path == '/health' || ctx.path) {
            /* istanbul ignore next */
            ctx.state.logger.getLoggerInstance().isDebugEnabled && ctx.state.logger.debug(`Found handler: ${handler}`);
        } else {
            ctx.state.logger.getLoggerInstance().isInfoEnabled && ctx.state.logger.info(`Found handler: ${handler}`);
        }
        await handler(ctx);
    }
    await next();
};
