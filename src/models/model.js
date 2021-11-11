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
 * Modusbox <https://modusbox.com>
 --------------
 ******/
'use strict';

/**
 * @file Simulator resources Model
 * @description Models parties, partcipants and quotes with the simulator.
 */

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

const Party = require('./party');
const Quote = require('./quote');
const BulkQuote = require('./bulkQuote');
const TransactionRequest = require('./transactionrequest');
const Transfer = require('./transfer');
const BulkTransfer = require('./bulkTransfer');

const {
    createPartyTable,
    createPartyTableUniqueIndex,
    createQuoteTable,
    createBulkQuoteTable,
    createTransferTable,
    createBulkTransferTable,
    createTransactionRequestTable,
    createPartyExtensionTable,
    createPartyExtensionTableUniqueIndex,
    createAccountTable,
    createAccountTableUniqueIndex,
} = require('./constants');

/**
 * @typedef {Object} Model
 *
 * Simulator Model
 *
 * Initialises both Party and Participant models
 */
module.exports = class Model {
    constructor() {
        this.db = null;
        this.party = null;
        this.quote = null;
        this.bulkQuote = null;
        this.transactionrequest = null;
        this.transfer = null;
        this.bulkTransfer = null;
    }

    /**
   * Closes db object.
   *
   * @async
   */
    async close() {
        if (this.db) {
            await this.db.close();
        }
    }

    /**
   * Initialises db.
   *
   * @async
   * @param {String} databaseFilepath   SqliteDB file path
   * @param [{Object}] parties          Array of party objects to create after db initialisation
   * @throws {Error}
   */
    async init({ databaseFilepath, parties = null }) {
        if (this.db) {
            throw new Error('Attempted to initialise database twice');
        }

        this.db = await sqlite.open({
            filename: databaseFilepath,
            driver: sqlite3.Database,
        });
        await this.db.run('PRAGMA foreign_keys = true');
        await this.db.run(createPartyTable);
        await this.db.run(createPartyTableUniqueIndex);
        await this.db.run(createQuoteTable);
        await this.db.run(createTransactionRequestTable);
        await this.db.run(createTransferTable);
        await this.db.run(createPartyExtensionTable);
        await this.db.run(createPartyExtensionTableUniqueIndex);
        await this.db.run(createBulkQuoteTable);
        await this.db.run(createBulkTransferTable);
        await this.db.run(createAccountTable);
        await this.db.run(createAccountTableUniqueIndex);

        this.party = new Party(this.db);
        this.quote = new Quote(this.db);
        this.bulkQuote = new BulkQuote(this.db);
        this.transactionrequest = new TransactionRequest(this.db);
        this.transfer = new Transfer(this.db);
        this.bulkTransfer = new BulkTransfer(this.db);

        if (parties) {
            await Promise.all(parties.map((p) => this.party.create(p)));
        }
    }
};
