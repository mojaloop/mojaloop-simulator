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

 * ModusBox
 - Steven Oderayi <steven.oderayi@modusbox.com>
 --------------
 ******/
'use strict';

const util = require('util');
require('dotenv').config();
const { getStackOrInspect } = require('@internal/log');
const { ApiErrorCodes } = require('../models/errors.js');


const getParticipantsByTypeAndId = async (ctx) => {
    try {
        const { idValue, idType } = ctx.state.path.params;
        const res = await ctx.state.model.party.get(idType, idValue);
        if (!res) {
            ctx.response.body = ApiErrorCodes.ID_NOT_FOUND;
            ctx.response.status = 404;
            return;
        }
        ctx.response.body = { fspId: process.env.DFSP_ID };
        ctx.response.status = 200;
    } catch (err) {
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};


const getPartiesByTypeAndId = async (ctx) => {
    // TODO: check that the provided type was MSISDN? Or just encode that in the API spec..
    try {
        const { idValue, idType } = ctx.state.path.params;
        const res = await ctx.state.model.party.get(idType, idValue);
        if (!res) {
            ctx.response.body = ApiErrorCodes.ID_NOT_FOUND;
            ctx.response.status = 404;
            return;
        }
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const getOTPById = async (ctx) => {
    try {
        const res = {
            otpValue: Math.floor(Math.random() * 90000) + 10000,
        };
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};


const postTransfers = async (ctx) => {
    try {
        const res = await ctx.state.model.transfer.create(ctx.request.body);
        ctx.state.logger.log(`postTransfers is returning body: ${util.inspect(res)}`);
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.state.logger.log(`Error in postTransfers: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};


const postQuotes = async (ctx) => {
    try {
        const res = await ctx.state.model.quote.create(ctx.request.body);
        ctx.state.logger.log(`postQuotes is returning body: ${util.inspect(res)}`);
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.state.logger.log(`Error in postQuotes: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const postBulkQuotes = async (ctx) => {
    try {
        const res = await ctx.state.model.bulkQuote.create(ctx.request.body);
        ctx.state.logger.log(`postBulkQuotes is returning body: ${util.inspect(res)}`);
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.state.logger.log(`Error in postBulkQuotes: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};


const getBulkQuoteById = async (ctx) => {
    try {
        const { idValue } = ctx.state.path.params;
        const res = await ctx.state.model.bulkQuote.get(idValue);
        if (!res) {
            ctx.response.body = ApiErrorCodes.ID_NOT_FOUND;
            ctx.response.status = 404;
            return;
        }
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const postTransactionRequests = async (ctx) => {
    try {
        const res = await ctx.state.model.transactionrequest.create(ctx.request.body);
        ctx.state.logger.log(`postTransactionRequests is returning body: ${util.inspect(res)}`);
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.state.logger.log(`Error in postTransactionRequests: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const postBulkTransfers = async (ctx) => {
    try {
        const res = await ctx.state.model.bulkTransfer.create(ctx.request.body);
        ctx.state.logger.log(`postBulkTransfers is returning body: ${util.inspect(res)}`);
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.state.logger.log(`Error in postBulkTransfers: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const getBulkTransferById = async (ctx) => {
    try {
        const { idValue } = ctx.state.path.params;
        const res = await ctx.state.model.bulkTransfer.get(idValue);
        if (!res) {
            ctx.response.body = ApiErrorCodes.ID_NOT_FOUND;
            ctx.response.status = 404;
            return;
        }
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const healthCheck = async (ctx) => {
    ctx.response.status = 200;
    ctx.response.body = '';
};


const map = {
    '/': {
        get: healthCheck,
    },
    '/participants/{idType}/{idValue}': {
        get: getParticipantsByTypeAndId,
    },
    '/parties/{idType}/{idValue}': {
        get: getPartiesByTypeAndId,
    },
    '/quoterequests': {
        post: postQuotes,
    },
    '/bulkQuotes': {
        post: postBulkQuotes,
    },
    '/bulkQuotes/{idValue}': {
        get: getBulkQuoteById,
    },
    '/transactionrequests': {
        post: postTransactionRequests,
    },
    '/transfers': {
        post: postTransfers,
    },
    '/bulkTransfers': {
        post: postBulkTransfers,
    },
    '/bulkTransfers/{idValue}': {
        get: getBulkTransferById,
    },
    '/otp/{requestToPayId}': {
        get: getOTPById,
    },
};


module.exports = {
    map,
};
