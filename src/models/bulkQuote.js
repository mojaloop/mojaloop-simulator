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
 * ModusBox <https://modusbox.com>
 --------------
 ******/
'use strict';

/**
 * @file Simulator resources BulkQuote model
 * @description Defines the bulk quote model structure and operations within the simulator.
 */
const { bulkQuoteTable } = require('./constants');

// eslint-disable-next-line import/no-unresolved
require('dotenv').config();

/**
 * @typedef {Object} BulkQuote
 *
 * Data model for bulk quotes.
 */
module.exports = class BulkQuote {
    constructor(db) {
        this.db = db;
    }

    /**
   * Gets a BulkQuote with the provided bulkQuoteId
   *
   * @async
   * @param {String} bulkQuoteId     The bulk quote Id.
   * @returns {Promise<Object>}  BulkQuote object.
   */
    async get(bulkQuoteId) {
        const res = await this.db.get(`SELECT * FROM ${bulkQuoteTable} WHERE id = ?`, [bulkQuoteId]);
        return res;
    }

    /**
   * Creates a bulk quote.
   *
   * @async
   * @param {Object} bulkQuoteRequest     The bulk quote request object.
   * @returns {Promise<Object>}       The BulkQuote response.
   */
    async create(bulkQuoteRequest) {
        const individualQuoteResults = bulkQuoteRequest.individualQuote.map((quote) => {
            const fee = Math
                .floor(Number(quote.amount) * Number(process.env.FEE_MULTIPLIER))
                .toString();
            return {
                quoteId: quote.quoteId,
                transactionId: quote.transactionId,
                transferAmount: quote.amount,
                transferAmountCurrency: quote.currency,
                payeeFspFeeAmount: fee,
                payeeFspFeeAmountCurrency: quote.currency,
                payeeFspCommissionAmount: fee,
                payeeFspCommissionAmountCurrency: quote.currency,
            };
        });
        const response = {
            bulkQuoteId: bulkQuoteRequest.bulkQuoteId,
            individualQuoteResults,
        };
        const reqStr = JSON.stringify(bulkQuoteRequest);
        const resStr = JSON.stringify(response);
        const created = new Date().toISOString().slice(0, 19);

        await this.db.get(`INSERT INTO ${bulkQuoteTable} (id, request, response, created) VALUES (?, ?, ?, ?)`,
            [bulkQuoteRequest.bulkQuoteId, reqStr, resStr, created]);
        return response;
    }

    /**
   * Updates a bulk quote
   *
   * @param {String} currentBulkOuoteId    The bulk quote id to update.
   * @param {Object} newBulkQuoteRequest   The new BulkQuote object.
   */
    async update(currentBulkOuoteId, newBulkQuoteRequest) {
        const response = newBulkQuoteRequest.individualQuotes.map(
            (quote) => ({ transferAmount: quote.amount, transferAmountCurrency: quote.currency }),
        );
        const reqStr = JSON.stringify(newBulkQuoteRequest);
        const resStr = JSON.stringify(response);

        await this.db.run(`
            UPDATE ${bulkQuoteTable}
            SET id = ?, request = ?, response = ?
            WHERE id = ?`, [newBulkQuoteRequest.bulkQuoteId, reqStr, resStr, currentBulkOuoteId]);
    }

    /**
     * Deletes a BulkQuote.
     *
     * @async
     * @param {String} bulkQuoteId The bulk quote id.
     */
    async delete(bulkQuoteId) {
        await this.db.run(`DELETE FROM ${bulkQuoteTable} WHERE id = ?`, [bulkQuoteId]);
    }
};
