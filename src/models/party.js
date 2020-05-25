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
 * @file Simulator resources Party model
 * @description Defines the party model structure and operations within the simulator.
 */

const { partyTable, partyExtensionTable, partyAccountsTable } = require('./constants');


/**
 * @typedef {Object} Party
 *
 * Creates, updates and deletes parties.
 */
module.exports = class Party {
    constructor(db) {
        this.db = db;
    }

    /**
    * Retrieves a Party.
    *
    * @async
    * @param {String} idType     The party idType.
    * @param {String} idValue    The party idValue.
    * @returns {Promise<Object>} Party object.
    */

    async get(idType, idValue) {
        const res = await this.db.all(`
          SELECT p.displayName, p.firstName, p.middleName, p.lastName, p.dateOfBirth, p.idType, p.idValue, pe.key, pe.value, pa.address, pa.currency, pa.description
          FROM ${partyTable} p
          LEFT JOIN ${partyExtensionTable} pe ON p.idValue = pe.idValue
          LEFT JOIN ${partyAccountsTable} pa ON p.idValue = pa.idValue
          WHERE p.idType = ? AND p.idValue = ?`, [idType, idValue]);
        const resultMap = {};
        res.forEach((row) => {
            let party;
            if (resultMap[row.idValue]) {
                party = resultMap[row.idValue];
            } else {
                party = {
                    displayName: row.displayName,
                    firstName: row.firstName,
                    middleName: row.middleName,
                    lastName: row.lastName,
                    dateOfBirth: row.dateOfBirth,
                    idType: row.idType,
                    idValue: row.idValue,
                };
                resultMap[row.idValue] = party;
            }
            if (row.key) {
                if (!party.extensionList) {
                    party.extensionList = [];
                }
                party.extensionList.push({ key: row.key, value: row.value });
            }
            if (row.address) {
                if (!party.accounts) {
                    party.accounts = [];
                }
                party.accounts.push({
                    address: row.address,
                    currency: row.currency,
                    description: row.description,
                });
            }
        });
        if (res.length && res.length > 0) {
            return Object.values(resultMap)[0];
        }
        return undefined;
    }

    /**
    * Retrieves all Parties.
    *
    * @async
    * @returns {Promise<Object>} Party object.
    */
    async getAll() {
        const res = await this.db.all(`
           SELECT p.displayName, p.firstName, p.middleName, p.lastName, p.dateOfBirth, p.idType, p.idValue, pe.key, pe.value, pa.address, pa.currency, pa.description
           FROM ${partyTable} p
           LEFT JOIN ${partyExtensionTable} pe ON p.idValue = pe.idValue
           LEFT JOIN ${partyAccountsTable} pa ON p.idValue = pa.idValue`);
        const resultMap = {};
        res.forEach((row) => {
            let party;
            if (resultMap[row.idValue]) {
                party = resultMap[row.idValue];
            } else {
                party = {
                    displayName: row.displayName,
                    firstName: row.firstName,
                    middleName: row.middleName,
                    lastName: row.lastName,
                    dateOfBirth: row.dateOfBirth,
                    idType: row.idType,
                    idValue: row.idValue,
                };
                resultMap[row.idValue] = party;
            }
            if (row.key) {
                if (!party.extensionList) {
                    party.extensionList = [];
                }
                party.extensionList.push({ key: row.key, value: row.value });
            }
            if (row.address) {
                if (!party.accounts) {
                    party.accounts = [];
                }
                party.accounts.push({
                    address: row.address,
                    currency: row.currency,
                    description: row.description,
                });
            }
        });
        return Object.values(resultMap);
    }

    /**
    * Creates a Party.
    *
    * @async
    * @param {Object} party      The Party object.
    * @returns {Promise<Object>} Party object.
    */
    async create(party) {
        const {
            displayName, firstName, middleName, lastName, dateOfBirth, idType, idValue,
        } = party;
        await this.db.get(`
  INSERT INTO ${partyTable} (displayName, firstName, middleName, lastName, dateOfBirth, idType, idValue)
  VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [displayName, firstName, middleName, lastName, dateOfBirth, idType, idValue]);
        if (party.extensionList) {
            const { extensionList } = party;
            extensionList.forEach((extension) => {
                this.db.get(`
              INSERT INTO ${partyExtensionTable} (idValue, key, value)
              VALUES (?, ?, ?)`,
                [idValue, extension.key, extension.value]);
            });
        }
        if (party.accounts) {
            const { accounts } = party;
            accounts.forEach((account) => {
                this.db.get(`
              INSERT INTO ${partyAccountsTable} (idValue, address, currency, description)
              VALUES (?, ?, ?, ?)`,
                [idValue, account.address, account.currency, account.description]);
            });
        }
    }


    /**
    * Updates a party
    *
    * @param {String} idValue  The party idValue to update.
    * @param {Object} newParty The new Party object.
    */
    async update(idType, idValue, newParty) {
        const {
            displayName, firstName, middleName, lastName, dateOfBirth,
        } = newParty;
        await this.db.run(`
            UPDATE ${partyTable}
            SET displayName = ?, firstName = ?, middleName = ?, lastName = ?, dateOfBirth = ?, idType = ?, idValue = ?
            WHERE idType = ? AND idValue = ?`,
        [displayName,
            firstName,
            middleName,
            lastName,
            dateOfBirth,
            idType,
            idValue,
            idType,
            idValue]);
        if (newParty.extensionList) {
            const { extensionList } = newParty;
            extensionList.forEach((extension) => {
                this.db.run(`
              UPDATE ${partyExtensionTable}
              SET value = ?
              WHERE key = ?`,
                [extension.value, extension.key]);
                this.db.run(`
                INSERT OR IGNORE INTO ${partyExtensionTable} (idValue, key, value)
                VALUES (?, ?, ?)`,
                [idValue, extension.key, extension.value]);
            });
        }
        if (newParty.accounts) {
            const { accounts } = newParty;
            accounts.forEach((account) => {
                this.db.run(`
                INSERT OR IGNORE INTO ${partyAccountsTable} (idValue, address, currency, description)
                VALUES (?, ?, ?, ?);`,
                [idValue, account.address, account.currency, account.description]);
            });
        }
    }

    /**
    * Deletes a Party.
    *
    * @param {String} idType  The party idType.
    * @param {String} idValue The party idValue.
    */
    async delete(idType, idValue) {
        await this.db.run(`DELETE FROM ${partyTable} WHERE idType = ? AND idValue = ?`, [idType, idValue]);
    }
};
