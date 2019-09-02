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
 * @file Simulator resources Transfer model
 * @description Defines the transfer model structure and operations within the simulator.
 */
const { transferTable } = require('./constants');
require('dotenv').config();

/**
 * @typedef {Object} Transfer
 *
 * Data model for transfer.
 */
module.exports = class Transfer {
    constructor(db) {
        this.db = db;
    }

    /**
    * Retrieves a transfer
    *
    * @async
    * @param {String} transferId  The transfer id.
    * @returns {Promise<Object>}  Transfer object.
    */
    async get(transferId) {
        const res = await this.db.get(`SELECT * FROM ${transferTable} WHERE id = ?`, [transferId]);
        return res;
    }

    /**
    * Creates a transfer.
    *
    * @async
    * @param {Object} transferRequest  The transfer request object.
    * @returns {Promise<Object>}       Transfer response.
    */
    async create(transferRequest) {
        const { transferId } = transferRequest;
        const response = { transferId };
        const reqStr = JSON.stringify(transferRequest);
        const resStr = JSON.stringify(response);

        await this.db.get(`INSERT INTO ${transferTable} (id, request, response) VALUES (?, ?, ?)`, [transferId, reqStr, resStr]);
        return response;
    }

    /**
    * Updates a transfer
    *
    * @param {String} transferId       The current transfer id.
    * @param {Object} TansferRequest   The new transfer object.
    */
    async update(currentTransferId, transferRequest) {
        const { homeTransactionId: newTransferId } = transferRequest;
        const response = { newTransferId };
        const reqStr = JSON.stringify(transferRequest);
        const resStr = JSON.stringify(response);

        await this.db.run(`
            UPDATE ${transferTable}
            SET id = ?, request = ?, response = ?
            WHERE id = ?`, [newTransferId, reqStr, resStr, currentTransferId]);
    }

    /**
    * Deletes a transfer.
    *
    * @async
    * @param {String} transferId The transfer id.
    */
    async delete(transferId) {
        await this.db.run(`DELETE FROM ${transferTable} WHERE id = ?`, [transferId]);
    }
};
