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
 * @file Simulator resources Transfer model
 * @description Defines the transfer model structure and operations within the simulator.
 */
const { bulkTransferTable } = require('./constants');
require('dotenv').config();

/**
 * @typedef {Object} BulkTransfer
 *
 * Data model for bulk transfer.
 */
module.exports = class BulkTransfer {
    constructor(db) {
        this.db = db;
    }

    /**
    * Retrieves a bulk transfer
    *
    * @async
    * @param {String} bulkTransferId  The transfer id.
    * @returns {Promise<Object>}  Transfer object.
    */
    async get(bulkTransferId) {
        const res = await this.db.get(`SELECT * FROM ${bulkTransferTable} WHERE id = ?`, [bulkTransferId]);
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
        const { bulkTransferId } = transferRequest;
        const response = { bulkTransferId };
        const reqStr = JSON.stringify(transferRequest);
        const resStr = JSON.stringify(response);

        await this.db.get(`INSERT INTO ${bulkTransferTable} (id, request, response) VALUES (?, ?, ?)`, [bulkTransferId, reqStr, resStr]);
        return response;
    }

    /**
    * Updates a transfer
    *
    * @param {String} bulkTransferId       The current transfer id.
    * @param {Object} TansferRequest   The new transfer object.
    */
    async update(currentbulkTransferId, transferRequest) {
        const { homeTransactionId: newbulkTransferId } = transferRequest;
        const response = { newbulkTransferId };
        const reqStr = JSON.stringify(transferRequest);
        const resStr = JSON.stringify(response);

        await this.db.run(`
            UPDATE ${bulkTransferTable}
            SET id = ?, request = ?, response = ?
            WHERE id = ?`, [newbulkTransferId, reqStr, resStr, currentbulkTransferId]);
    }

    /**
    * Deletes a transfer.
    *
    * @async
    * @param {String} bulkTransferId The transfer id.
    */
    async delete(bulkTransferId) {
        await this.db.run(`DELETE FROM ${bulkTransferTable} WHERE id = ?`, [bulkTransferId]);
    }
};
