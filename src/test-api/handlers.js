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

const util = require('util');
const Mustache = require('mustache');
const {
    postTransfers,
    putTransfers,
    postBulkTransfers,
    postBulkQuotes,
} = require('./client');
const { ApiErrorCodes } = require('../models/errors');

const supportedOperations = {
    POST_TRANSFERS: 'postTransfers',
    PUT_TRANSFERS: 'putTransfers',
    POST_BULK_TRANSFERS: 'postBulkTransfers',
    POST_BULK_QUOTES: 'postBulkQuotes',
};


const createParty = async (ctx) => {
    if (!Object.prototype.hasOwnProperty.call(ctx.request.body, 'idValue')) {
        ctx.response.body = ApiErrorCodes.MISSING_ID_VALUE;
        ctx.response.status = 400;
        return;
    }

    try {
        await ctx.state.model.party.create(ctx.request.body);
        ctx.response.body = '';
        ctx.response.status = 204;
        return;
    } catch (err) {
        ctx.response.body = ApiErrorCodes.ID_NOT_UNIQUE;
        ctx.response.status = 500;
    }
};

const readParties = async (ctx) => {
    try {
        const res = await ctx.state.model.party.getAll();
        if (!res) {
            ctx.response.body = '';
            ctx.response.status = 404;
            return;
        }
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.response.body = '';
        ctx.response.status = 500;
    }
};

const readParty = async (ctx) => {
    try {
        const { idValue, idType } = ctx.state.path.params;
        if (!idValue || !idType) {
            ctx.response.body = ApiErrorCodes.MISSING_ID_VALUE;
            ctx.response.status = 400;
            return;
        }
        const res = await ctx.state.model.party.get(idType, idValue);
        if (!res) {
            ctx.response.body = '';
            ctx.response.status = 404;
            return;
        }
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.response.body = '';
        ctx.response.status = 500;
    }
};

const updateParty = async (ctx) => {
    const { idValue, idType } = ctx.state.path.params;
    const model = ctx.request.body;
    if (!idValue || !idType) {
        ctx.response.body = ApiErrorCodes.MISSING_ID_VALUE;
        ctx.response.status = 400;
        return;
    }

    try {
        await ctx.state.model.party.update(idType, idValue, model);
        ctx.response.status = 204;
        return;
    } catch (err) {
        ctx.response.body = ApiErrorCodes.ID_NOT_UNIQUE;
        ctx.response.status = 500;
    }
};

const deleteParty = async (ctx) => {
    const { idValue, idType } = ctx.state.path.params;
    if (!idValue || !idType) {
        ctx.response.body = ApiErrorCodes.MISSING_ID_VALUE;
        ctx.response.status = 500;
        return;
    }

    try {
        await ctx.state.model.party.delete(idType, idValue);
        ctx.response.status = 204;
        return;
    } catch (err) {
        ctx.response.body = ApiErrorCodes.ID_NOT_UNIQUE;
        ctx.response.status = 500;
    }
};


/**
 * Handles all operation scenarios
 *
 * @param {Array} ops - operation scenarios to test
 * @returns {Promise.<Array>} results
 */
const handleOps = async (logger, model, ops) => {
    if (!Array.isArray(ops)) {
        throw new Error(ApiErrorCodes.OPS_ERROR.message);
    }

    // run operations in series and reduce to a result

    const result = await ops.reduce(async (accPromise, op) => {
        const acc = await accPromise;

        try {
            if (!Object.values(supportedOperations).includes(op.operation)) {
                acc[op.name] = { error: 'unsupported operation' };
            }

            // render the op body as a template with input being the current value of acc.
            // this allows the user to use the results of ops as inputs into following
            // ops.
            let renderedParams = {};

            if (op.params) {
                renderedParams = JSON.parse(Mustache.render(JSON.stringify(op.params), acc));
            }

            const renderedBody = JSON.parse(Mustache.render(JSON.stringify(op.body), acc));

            if (op.operation === supportedOperations.POST_TRANSFERS) {
                const response = await model.postTransfers(renderedBody);
                acc[op.name] = { result: response };
            }

            if (op.operation === supportedOperations.PUT_TRANSFERS) {
                if (!renderedParams.transferId) {
                    throw new Error(`Scenario ${op.name} does not have required transferId param for putTransfers operation`);
                }

                const response = await model.putTransfers(renderedParams.transferId, renderedBody);
                acc[op.name] = { result: response };
            }

            if (op.operation === supportedOperations.POST_BULK_TRANSFERS) {
                const response = await model.postBulkTransfers(renderedBody);
                acc[op.name] = { result: response };
            }

            if (op.operation === supportedOperations.POST_BULK_QUOTES) {
                const response = await model.postBulkQuotes(renderedBody);
                acc[op.name] = { result: response };
            }
        } catch (error) {
            acc[op.name] = { error };
        }

        logger.log(`Operation ${op.name} result: ${util.inspect(acc[op.name])}`);
        return acc;
    }, Promise.resolve({}));

    return result;
};


const handleScenarios = async (ctx) => {
    try {
        const res = await handleOps(ctx.state.logger, {
            postTransfers,
            putTransfers,
            postBulkTransfers,
            postBulkQuotes,
        }, ctx.request.body);

        ctx.state.logger.log(`Scenario operations returned: ${util.inspect(res)}`);
        if (res) {
            ctx.response.body = res;
            ctx.response.status = 200;
            return;
        }
        ctx.response.body = ApiErrorCodes.OP_NOT_SET;
        ctx.response.status = 400;
        return;
    } catch (err) {
        const e = { ...ApiErrorCodes.EXECUTION_ERROR };
        e.cause = err;
        ctx.response.body = e;
        ctx.response.status = 500;
    }
};

const map = {
    '/scenarios': {
        post: handleScenarios,
    },
    '/repository/parties': {
        get: readParties,
        post: createParty,
    },
    '/repository/parties/{idType}/{idValue}': {
        put: updateParty,
        delete: deleteParty,
        get: readParty,
    },
};


module.exports = {
    map,
    handleOps, // export for testing purposes
};
