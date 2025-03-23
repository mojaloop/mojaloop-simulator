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
 --------------
 ******/
'use strict';

const { parse } = require('querystring');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const { getStackOrInspect } = require('../lib/log/log');
const { ApiErrorCodes } = require('../models/errors');
const { quoteTable } = require('../models/constants');

/**
 * Parses all quotes and returns responses.
 *
 * @param {Array} quotes  Quotes aggregated from database.
 */
const parseQuotes = (quotes, ctx) => {
    try {
        const responses = [];
        const { dfspId } = ctx.state.path.params;
        quotes.forEach((quote) => {
            const { request, created } = quote;
            const quoteReq = JSON.parse(request);
            const {
                transactionId,
                transactionType,
                currency,
                amount,
                from: { idValue: fromIdValue },
                to: { id: toIdValue },
            } = quoteReq;

            responses.push({
                senderDFSPId: dfspId ?? process.env.DFSP_ID,
                senderDFSPName: dfspId ?? process.env.DFSP_ID,
                receiverDFSPId: '',
                receiverDFSPName: '',
                hubTxnID: transactionId,
                transactionType,
                natureOfTxnType: 'Original',
                requestDate: created,
                createDate: created,
                modificationDate: created,
                settlementDate: '',
                senderCountryCurrencyCode: currency,
                receiverCountryCurrencyCode: currency,
                senderID: fromIdValue,
                receiverID: toIdValue,
                reconciliationAmount: amount,
                receiverNameStatus: 'RNR',
                pricingOption: '',
                receiverKYCLevelStatus: '',
                status: 'COMMITTED',
                errorCode: '',
                senderDFSPTxnID: transactionId,
                receiverDFSPTxnID: transactionId,
            });
        });

        return responses;
    } catch (err) {
        throw new Error(err);
    }
};

const getReport = async (ctx) => {
    try {
        const { START_DATE_TIME, END_DATE_TIME } = parse(ctx.request.querystring);
        if (!START_DATE_TIME || !END_DATE_TIME) {
            ctx.response.body = ApiErrorCodes.REPORT_NOT_FOUND;
            ctx.response.status = 400;
            return;
        }
        const db = await sqlite.open({
            filename: process.env.MODEL_DATABASE,
            driver: sqlite3.Database,
        });

        const quotes = await db.all(`SELECT request, response, created FROM ${quoteTable} where created >= '${START_DATE_TIME}' AND created < '${END_DATE_TIME}'`);
        if (quotes.length === 0) {
            ctx.response.body = ApiErrorCodes.REPORT_EMPTY;
            ctx.response.status = 404;
            return;
        }
        const responses = await parseQuotes(quotes, ctx);
        ctx.response.body = responses;
        ctx.response.status = 200;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log(`Error generating report: ${getStackOrInspect(err)}`);
        ctx.response.body = ApiErrorCodes.REPORT_ERROR;
        ctx.response.status = 500;
    }
};

const map = {
    '/reports': {
        get: getReport,
    },
};

module.exports = {
    map,
};
