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
    * @param {String} subIdValue    The optional party subIdValue.
    * @returns {Promise<Object>} Party object.
    */

    async get(idType, idValue, subIdValue = null) {
        let res;
        if (!subIdValue) {
            res = await this.db.all(`
            SELECT p.displayName, p.firstName, p.middleName, p.lastName, p.dateOfBirth, p.idType, p.idValue, p.subIdValue, pe.key, pe.value, pa.address, pa.currency, pa.description  
            FROM ${partyTable} p 
            LEFT JOIN ${partyExtensionTable} pe ON p.idValue = pe.idValue 
            LEFT JOIN ${partyAccountsTable} pa ON p.idValue = pa.idValue
            WHERE p.idType = ? AND p.idValue = ? AND p.subIdValue IS NULL AND pe.subIdValue IS NULL`, [idType, idValue]);
        } else {
            res = await this.db.all(`
            SELECT p.displayName, p.firstName, p.middleName, p.lastName, p.dateOfBirth, p.idType, p.idValue, p.subIdValue, pe.key, pe.value, pa.address, pa.currency, pa.description  
            FROM ${partyTable} p 
            LEFT JOIN ${partyExtensionTable} pe ON p.idValue = pe.idValue  AND p.subIdValue = pe.subIdValue 
            LEFT JOIN ${partyAccountsTable} pa ON p.idValue = pa.idValue
            WHERE p.idType = ? AND p.idValue = ? AND p.subIdValue = ?`, [idType, idValue, subIdValue]);
        }
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
                if (row.subIdValue) {
                    party.subIdValue = row.subIdValue;
                }
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
            SELECT p.displayName, p.firstName, p.middleName, p.lastName, p.dateOfBirth, p.idType, p.idValue, p.subIdValue, pe.key, pe.value, pa.address, pa.currency, pa.description
            FROM ${partyTable} p
            LEFT JOIN ${partyExtensionTable} pe ON (p.idValue = pe.idValue AND pe.subIdValue IS NULL AND p.subIdValue IS NULL) OR (p.idValue = pe.idValue AND p.subIdValue = pe.subIdValue)
            LEFT JOIN ${partyAccountsTable} pa ON p.idValue = pa.idValue`);
        const resultMap = {};
        res.forEach((row) => {
            let party;
            if (resultMap[`${row.idValue}-${row.subIdValue}`]) {
                party = resultMap[`${row.idValue}-${row.subIdValue}`];
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
                if (row.subIdValue) {
                    party.subIdValue = row.subIdValue;
                }
                resultMap[`${row.idValue}-${row.subIdValue}`] = party;
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
            displayName, firstName, middleName, lastName, dateOfBirth, idType, idValue, subIdValue,
        } = party;
        await this.db.get(`INSERT INTO ${partyTable} (displayName, firstName, middleName, lastName, dateOfBirth, idType, idValue, subIdValue)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [displayName, firstName, middleName, lastName, dateOfBirth, idType, idValue, subIdValue]);
        if (party.extensionList) {
            const { extensionList } = party;
            extensionList.forEach((extension) => {
                this.db.get(`INSERT INTO ${partyExtensionTable} (idValue, subIdValue, key, value)
                VALUES (?, ?, ?, ?)`,
                [idValue, subIdValue, extension.key, extension.value]);
            });
        }
        if (party.accounts) {
            const { accounts } = party;
            await Promise.all(accounts.map(async (account) => this.db.get(`
                  INSERT INTO ${partyAccountsTable} (idValue, address, currency, description)
                  VALUES (?, ?, ?, ?)`,
            [idValue, account.address, account.currency, account.description])));
        }
    }


    /**
    * Updates a party
    *
    * @param {Object} newParty The new Party object.
    * @param {String} idType  The party idType to update.
    * @param {String} idValue  The party idValue to update.
    * @param {String} subIdValue  The optional party subIdValue to update.
    */
    async update(newParty, idType, idValue, subIdValue = null) {
        const {
            displayName, firstName, middleName, lastName, dateOfBirth,
        } = newParty;
        if (!subIdValue) {
            // If subIdValue is not passed then only updated the record where subIdValue IS NULL
            // This will make sure we accidentally don't update all records for idValue by ignoring subIdValue
            await this.db.run(`
                UPDATE ${partyTable}
                SET displayName = ?, firstName = ?, middleName = ?, lastName = ?, dateOfBirth = ?, idType = ?, idValue = ?
                WHERE idType = ? AND idValue = ? AND subIdValue IS NULL`,
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
                    WHERE key = ? AND idValue = ? AND subIdValue IS NULL`,
                    [extension.value, extension.key, idValue]);
                    this.db.run(`
                    INSERT OR IGNORE INTO ${partyExtensionTable} (idValue, subIdValue, key, value)
                    VALUES (?, ?, ?, ?)`,
                    [idValue, subIdValue, extension.key, extension.value]);
                });
            }
        } else {
            // Update the record for a specific idValue and subIdValue
            await this.db.run(`
                UPDATE ${partyTable}
                SET displayName = ?, firstName = ?, middleName = ?, lastName = ?, dateOfBirth = ?, idType = ?, idValue = ?, subIdValue = ?
                WHERE idType = ? AND idValue = ? AND subIdValue = ?`,
            [displayName,
                firstName,
                middleName,
                lastName,
                dateOfBirth,
                idType,
                idValue,
                subIdValue,
                idType,
                idValue,
                subIdValue]);
            if (newParty.extensionList) {
                const { extensionList } = newParty;
                extensionList.forEach((extension) => {
                    this.db.run(`
                    UPDATE ${partyExtensionTable}
                    SET value = ?
                    WHERE key = ? AND idValue = ? AND subIdValue = ?`,
                    [extension.value, extension.key, idValue, subIdValue]);
                    this.db.run(`
                    INSERT OR IGNORE INTO ${partyExtensionTable} (idValue, subIdValue, key, value)
                    VALUES (?, ?, ?, ?)`,
                    [idValue, subIdValue, extension.key, extension.value]);
                });
            }
        }
    }

    /**
    * Deletes a Party.
    *
    * @param {String} idType  The party idType.
    * @param {String} idValue The party idValue.
    * @param {String} subIdValue The optional party subIdValue.
    */
    async delete(idType, idValue, subIdValue = null) {
        if (!subIdValue) {
            await this.db.run(`DELETE FROM ${partyTable} WHERE idType = ? AND idValue = ? AND subIdValue IS NULL`, [idType, idValue]);
            await this.db.run(`DELETE FROM ${partyExtensionTable} WHERE idValue = ? AND subIdValue IS NULL`, [idValue]);
        } else {
            await this.db.run(`DELETE FROM ${partyTable} WHERE idType = ? AND idValue = ? AND subIdValue = ?`, [idType, idValue, subIdValue]);
            await this.db.run(`DELETE FROM ${partyExtensionTable} WHERE idValue = ? AND subIdValue = ?`, [idValue, subIdValue]);
        }
    }
};
