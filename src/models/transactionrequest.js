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
 --------------
 ******/
'use strict';

/**
 * @file Simulator resources TransactionRequest model
 * @description Defines the transactionrequest model structure and operations within the simulator.
 */
const { transactionRequestTable } = require('./constants');

// eslint-disable-next-line import/no-unresolved
require('dotenv').config();

/**
 * @typedef {Object} Quote
 *
 * Data model for quotes.
 */
module.exports = class TransactionRequest {
    constructor(db) {
        this.db = db;
    }

    /**
   * Gets a Quote with the provided quoteId
   *
   * @async
   * @param {String} quoteId     The quote Id.
   * @returns {Promise<Object>}  Quote object.
   */
    async get(transactionRequestId) {
        const res = await this.db.get(`SELECT * FROM ${transactionRequestTable} WHERE id = ?`, [transactionRequestId]);
        return res;
    }

    /**
   * Creates a quote.
   *
   * @async
   * @param {Object} quoteRequest     The quote request object.
   * @returns {Promise<Object>}       The Quote response.
   */
    async create(transactionRequest) {
        const {transactionRequestId} = transactionRequest;
        const response = {
            transactionId,
            transactionRequestState: 'RECEIVED'
        };
        const reqStr = JSON.stringify(transactionRequest);
        const resStr = JSON.stringify(response);
        const created = new Date().toISOString().slice(0, 19);

        await this.db.get(`INSERT INTO ${quoteTable} (id, request, response, created) VALUES (?, ?, ?, ?)`, [transactionRequestId, reqStr, resStr, created]);
        return response;
    }

    /**
     * Deletes a Transaction Request.
     *
     * @async
     * @param {String} transactionRequestId The transaction request id.
     */
    async delete(transactionRequestId) {
        await this.db.run(`DELETE FROM ${transactionRequestTable} WHERE id = ?`, [transactionRequestId]);
    }
};
