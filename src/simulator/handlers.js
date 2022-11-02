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
const crypto = require('crypto');
require('dotenv').config();
const { getStackOrInspect } = require('../lib/log/log');
const { ApiErrorCodes } = require('../models/errors');
const objectStore = require('../lib/objectStore/objectStoreInterface');

const getParticipantsByTypeAndId = async (ctx) => {
    try {
        const { idValue, idType, subIdValue } = ctx.state.path.params;
        const res = await ctx.state.model.party.get(idType, idValue, subIdValue);
        if (!res) {
            ctx.response.body = ApiErrorCodes.ID_NOT_FOUND;
            ctx.response.status = 404;
            return;
        }
        ctx.response.body = { fspId: process.env.DFSP_ID };
        ctx.response.status = 200;
    } catch (err) {
        ctx.state.logger.isErrorEnabled && ctx.state.logger.error(`Error in getParticipantsByTypeAndId: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const getPartiesByTypeAndId = async (ctx) => {
    // TODO: check that the provided type was MSISDN? Or just encode that in the API spec..
    try {
        const { idValue, idType, subIdValue } = ctx.state.path.params;
        const res = await ctx.state.model.party.get(idType, idValue, subIdValue);
        if (!res) {
            ctx.response.body = ApiErrorCodes.ID_NOT_FOUND;
            ctx.response.status = 404;
            return;
        }
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.state.logger.isErrorEnabled && ctx.state.logger.error(`Error in getPartiesByTypeAndId: ${getStackOrInspect(err)}`);
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
        ctx.state.logger.isErrorEnabled && ctx.state.logger.error(`Error in getOTPById: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const postTransfers = async (ctx) => {
    try {
        const res = await ctx.state.model.transfer.create(ctx.request.body);
        ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`postTransfers is returning body: ${util.inspect(res)}`);
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.state.logger.isErrorEnabled && ctx.state.logger.error(`Error in postTransfers: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const putTransfersById = async (ctx) => {
    try {
        const res = await ctx.state.model.transfer.update(ctx.state.path.params.transferId, {
            ...ctx.request.body,
        });
        ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`putTransfersById is returning body: ${util.inspect(res)}`);
        ctx.response.body = ctx.request.body;
        ctx.response.status = 200;
    } catch (err) {
        ctx.state.logger.isErrorEnabled && ctx.state.logger.error(`Error in putTransfersById: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const postQuotes = async (ctx) => {
    try {
        const res = await ctx.state.model.quote.create(ctx.request.body);
        ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`postQuotes is returning body: ${util.inspect(res)}`);
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.state.logger.isErrorEnabled && ctx.state.logger.error(`Error in postQuotes: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const postBulkQuotes = async (ctx) => {
    try {
        const res = await ctx.state.model.bulkQuote.create(ctx.request.body);
        ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`postBulkQuotes is returning body: ${util.inspect(res)}`);
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.state.logger.isErrorEnabled && ctx.state.logger.error(`Error in postBulkQuotes: ${getStackOrInspect(err)}`);
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
        ctx.state.logger.isErrorEnabled && ctx.state.logger.error(`Error in getBulkQuoteById: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const postTransactionRequests = async (ctx) => {
    try {
        const res = await ctx.state.model.transactionrequest.create(ctx.request.body);
        ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`postTransactionRequests is returning body: ${util.inspect(res)}`);
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.state.logger.isErrorEnabled && ctx.state.logger.error(`Error in postTransactionRequests: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const postBulkTransfers = async (ctx) => {
    try {
        const res = await ctx.state.model.bulkTransfer.create(ctx.request.body);
        ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`postBulkTransfers is returning body: ${util.inspect(res)}`);
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.state.logger.isErrorEnabled && ctx.state.logger.error(`Error in postBulkTransfers: ${getStackOrInspect(err)}`);
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
        ctx.state.logger.isErrorEnabled && ctx.state.logger.error(`Error in getBulkTransferById: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const healthCheck = async (ctx) => {
    ctx.response.status = 200;
    ctx.response.body = JSON.stringify({ status: 'OK' });
};

const getAccountsByUserId = async (ctx) => {
    try {
        const { ID } = ctx.state.path.params;
        // if rules not configured, return ID not found error
        ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`getAccountsByUserId rules not configured for : ${ID}`);
        ctx.response.body = ApiErrorCodes.ID_NOT_FOUND;
        ctx.response.status = 404;
        return;
    } catch (err) {
        ctx.state.logger.isErrorEnabled && ctx.state.logger.error(`Error in getAccountsByUserId: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const getScopesById = async (ctx) => {
    // default mock response, if rules not configured
    const res = {
        scopes: [
            {
                address: 'dfsp.blue.account.one',
                actions: [
                    'ACCOUNTS_GET_BALANCE',
                    'ACCOUNTS_TRANSFER',
                ],
            },
            {
                address: 'dfsp.blue.account.two',
                actions: [
                    'ACCOUNTS_GET_BALANCE',
                    'ACCOUNTS_TRANSFER',
                ],
            },
        ],
    };
    ctx.response.body = res;
    ctx.response.status = 200;
};

const postValidateAuthToken = async (ctx) => {
    // fake validation for testing purposes
    // even auth tokens validate true as default mock response, if rules not configured
    const res = {
        isValid: ctx.request.body.authToken % 2 === 0,
    };
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`postValidateOTP is returning body: ${util.inspect(res)}`);
    ctx.response.body = res;
    ctx.response.status = 200;
};

const validateConsentRequests = async (ctx) => {
    const request = ctx.request.body;
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`validateConsentRequests request body: ${util.inspect(request)}`);
    // default mock response, if rules not configured
    const res = {
        isValid: true,
        data: {
            authChannels: ['WEB'],
            authUri: `dfspa.com/authorize?consentRequestId=${request.id}`,
        },
    };
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`validateConsentRequests is returning body: ${util.inspect(res)}`);
    ctx.response.body = res;
    ctx.response.status = 200;
};

const sendOTP = async (ctx) => {
    const request = ctx.request.body;
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`sendOTP request body: ${util.inspect(request)}`);
    // default mock reponse, if rules not configured
    const res = {
        otp: Math.floor(Math.random() * 90000) + 10000,
    };
    await objectStore.set(`${request.consentRequestId}-OTP`, res);
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`sendOTP is returning body: ${util.inspect(res)}`);
    ctx.response.body = res;
    ctx.response.status = 200;
};

const storeConsentRequest = async (ctx) => {
    const { ID } = ctx.state.path.params;
    const request = ctx.request.body;
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`storeConsentRequest request body: ${util.inspect(request)}`);
    // default mock reponse, if rules not configured
    const res = {
        status: 'OK',
    };
    await objectStore.set(`${ID}-CR`, request);
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`sendOTP is returning body: ${util.inspect(res)}`);
    ctx.response.body = res;
    ctx.response.status = 200;
};

const getConsentRequest = async (ctx) => {
    const { ID } = ctx.state.path.params;
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`getConsentRequest : ${ID}`);
    // default mock reponse, if rules not configured
    const res = await objectStore.get(`${ID}-CR`);
    ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`getConsentRequest : ${ID} is returning body: ${util.inspect(res)}`);
    ctx.response.body = res;
    ctx.response.status = 200;
};

const getSignedChallenge = async (ctx) => {
    try {
        const res = {
            pinValue: crypto.randomBytes(256).toString('base64').slice(0, 64),
            counter: '1',
        };
        ctx.state.logger.isInfoEnabled && ctx.state.logger.info(`getSignedChallenge is returning body: ${util.inspect(res)}`);
        ctx.response.body = res;
        ctx.response.status = 200;
    } catch (err) {
        ctx.state.logger.isErrorEnabled && ctx.state.logger.error(`Error in getSignedChallenge: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.SERVER_ERROR;
        ctx.response.status = 500;
    }
};

const map = {
    '/': {
        get: healthCheck,
    },
    '/health': {
        get: healthCheck,
    },
    '/participants/{idType}/{idValue}': {
        get: getParticipantsByTypeAndId,
    },
    '/participants/{idType}/{idValue}/{subIdValue}': {
        get: getParticipantsByTypeAndId,
    },
    '/parties/{idType}/{idValue}': {
        get: getPartiesByTypeAndId,
    },
    '/parties/{idType}/{idValue}/{subIdValue}': {
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
    '/signchallenge': {
        post: getSignedChallenge,
    },
    '/otp/{requestToPayId}': {
        get: getOTPById,
    },
    '/transfers/{transferId}': {
        put: putTransfersById,
    },
    '/accounts/{ID}': {
        get: getAccountsByUserId,
    },
    '/scopes/{ID}': {
        get: getScopesById,
    },
    '/validateAuthToken': {
        post: postValidateAuthToken,
    },
    '/validateConsentRequests': {
        post: validateConsentRequests,
    },
    '/sendOTP': {
        post: sendOTP,
    },
    '/store/consentRequests/{ID}': {
        get: getConsentRequest,
        post: storeConsentRequest,
    },
};

module.exports = {
    map,
};
