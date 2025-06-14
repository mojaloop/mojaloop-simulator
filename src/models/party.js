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
    * Retrieves a Extensions.
    *
    * @async
    * @param {String} idValue    The party idValue.
    * @param {String} idSubValue    The optional party idSubValue.
    * @returns {Promise<Object>} PartyExtensions object list.
    */
    async getPartyExtensions(idValue, idSubValue = null) {
        let res;
        if (!idSubValue) {
            res = await this.db.all(`
            SELECT pe.key, pe.value, pe.key FROM ${partyExtensionTable} AS pe
            WHERE pe.idValue = ? AND pe.idSubValue IS NULL`, [idValue]);
        } else {
            res = await this.db.all(`
            SELECT pe.key, pe.value, pe.key FROM ${partyExtensionTable} AS pe
            WHERE pe.idValue = ? AND pe.idSubValue = ?`, [idValue, idSubValue]);
        }
        const resultMap = {};
        res.forEach((row) => {
            resultMap[row.key] = {
                key: row.key,
                value: row.value,
            };
        });
        if (res && res.length && res.length > 0) {
            return Object.values(resultMap);
        }
        return undefined;
    }

    /**
    * Retrieves a PartyAccounts.
    *
    * @async
    * @param {String} idType     The party idType.
    * @param {String} idValue    The party idValue.
    * @param {String} idSubValue    The optional party idSubValue.
    * @returns {Promise<Object>} PartyAccounts object list.
    */
    async getPartyAccounts(idValue, idSubValue = null) {
        let res;
        if (!idSubValue) {
            res = await this.db.all(`
            SELECT pa.address, pa.currency, pa.description FROM ${partyAccountsTable} AS pa
            WHERE pa.idValue = ? AND pa.idSubValue IS NULL`, [idValue]);
        } else {
            res = await this.db.all(`
            SELECT pa.address, pa.currency, pa.description FROM ${partyAccountsTable} AS pa
            WHERE pa.idValue = ? AND pa.idSubValue = ?`, [idValue, idSubValue]);
        }
        const resultMap = {};
        res.forEach((row) => {
            resultMap[row.address] = {
                address: row.address,
                currency: row.currency,
                description: row.description,
            };
        });
        if (res && res.length && res.length > 0) {
            return Object.values(resultMap);
        }
        return undefined;
    }

    /**
    * Retrieves a Party.
    *
    * @async
    * @param {String} idType     The party idType.
    * @param {String} idValue    The party idValue.
    * @param {String} idSubValue    The optional party idSubValue.
    * @returns {Promise<Object>} Party object.
    */
    async get(idType, idValue, idSubValue = null) {
        let res;
        if (!idSubValue) {
            res = await this.db.all(`
            SELECT p.displayName, p.firstName, p.middleName, p.lastName, p.dateOfBirth, p.idType, p.idValue, p.idSubValue FROM ${partyTable} AS p
            WHERE p.idType = ? AND p.idValue = ? AND p.idSubValue IS NULL`, [idType, idValue]);
        } else {
            res = await this.db.all(`
            SELECT p.displayName, p.firstName, p.middleName, p.lastName, p.dateOfBirth, p.idType, p.idValue, p.idSubValue FROM ${partyTable} AS p
            WHERE p.idType = ? AND p.idValue = ? AND p.idSubValue = ?`, [idType, idValue, idSubValue]);
        }

        const resultMap = {};
        for (const row of res) {  
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
                if (row.idSubValue) {
                    party.idSubValue = row.idSubValue;
                }
                resultMap[row.idValue] = party;
            }

            // lets check for Extensions
            const partyExtensionsRes = await this.getPartyExtensions(row.idValue, row.idSubValue);  
            if (partyExtensionsRes) {
                party.extensionList = partyExtensionsRes;
            }

            // lets check for Accounts
            const partyAccountsRes = await this.getPartyAccounts(row.idValue, row.idSubValue);  
            if (partyAccountsRes) {
                party.accounts = partyAccountsRes;
            }
        }
        if (res && res.length && res.length > 0) {
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
        const res = await this.db.all(`SELECT p.displayName, p.firstName, p.middleName, p.lastName, p.dateOfBirth, p.idType, p.idValue, p.idSubValue FROM ${partyTable} AS p`);

        const resultMap = {};
        for (const row of res) {  
            let party;
            if (resultMap[`${row.idValue}-${row.idSubValue}`]) {
                party = resultMap[`${row.idValue}-${row.idSubValue}`];
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
                if (row.idSubValue) {
                    party.idSubValue = row.idSubValue;
                }
                resultMap[`${row.idValue}-${row.idSubValue}`] = party;
            }

            // lets check for Extensions
            const partyExtensionsRes = await this.getPartyExtensions(row.idValue, row.idSubValue);  
            if (partyExtensionsRes) {
                party.extensionList = partyExtensionsRes;
            }

            // lets check for Accounts
            const partyAccountsRes = await this.getPartyAccounts(row.idValue, row.idSubValue);  
            if (partyAccountsRes) {
                party.accounts = partyAccountsRes;
            }
        }
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
            displayName, firstName, middleName, lastName, dateOfBirth, idType, idValue, idSubValue,
        } = party;
        await this.db.get(
            `INSERT INTO ${partyTable} (displayName, firstName, middleName, lastName, dateOfBirth, idType, idValue, idSubValue) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                displayName,
                firstName,
                middleName,
                lastName,
                dateOfBirth,
                idType,
                idValue,
                idSubValue,
            ],
        );
        if (party.extensionList) {
            const { extensionList } = party;
            extensionList.forEach((extension) => {
                this.db.get(
                    `INSERT INTO ${partyExtensionTable} (idValue, idSubValue, key, value) VALUES (?, ?, ?, ?)`,
                    [idValue, idSubValue, extension.key, extension.value],
                );
            });
        }
        if (party.accounts) {
            const { accounts } = party;
            await Promise.all(accounts.map(async (account) => this.db.get(
                `INSERT INTO ${partyAccountsTable} (idValue, idSubValue, address, currency, description) VALUES (?, ?, ?, ?, ?)`,
                [idValue, idSubValue, account.address, account.currency, account.description],
            )));
        }
    }

    /**
    * Updates a party
    *
    * @param {Object} newParty The new Party object.
    * @param {String} idType  The party idType to update.
    * @param {String} idValue  The party idValue to update.
    * @param {String} idSubValue  The optional party idSubValue to update.
    */
    async update(newParty, idType, idValue, idSubValue = null) {
        const {
            displayName, firstName, middleName, lastName, dateOfBirth,
        } = newParty;
        if (!idSubValue) {
            // If idSubValue is not passed then only updated the record where idSubValue IS NULL
            // This will make sure we accidentally don't update all records for idValue by ignoring idSubValue
            await this.db.run(
                `
                UPDATE ${partyTable}
                SET displayName = ?, firstName = ?, middleName = ?, lastName = ?, dateOfBirth = ?, idType = ?, idValue = ?
                WHERE idType = ? AND idValue = ? AND idSubValue IS NULL`,
                [
                    displayName,
                    firstName,
                    middleName,
                    lastName,
                    dateOfBirth,
                    idType,
                    idValue,
                    idType,
                    idValue,
                ],
            );

            if (newParty.extensionList) {
                const { extensionList } = newParty;
                extensionList.forEach((extension) => {
                    this.db.run(
                        `
                    UPDATE ${partyExtensionTable}
                    SET value = ?
                    WHERE key = ? AND idValue = ? AND idSubValue IS NULL`,
                        [extension.value, extension.key, idValue],
                    );
                    this.db.run(
                        `
                    INSERT OR IGNORE INTO ${partyExtensionTable} (idValue, idSubValue, key, value)
                    VALUES (?, ?, ?, ?)`,
                        [idValue, idSubValue, extension.key, extension.value],
                    );
                });
            }
            if (newParty.accounts) {
                const { accounts } = newParty;
                accounts.forEach((account) => {
                    this.db.run(
                        `
                    UPDATE ${partyAccountsTable}
                    SET currency = ?, description = ?
                    WHERE address = ? AND idValue = ? AND idSubValue IS NULL`,
                        [account.address, idValue],
                    );
                    this.db.get(
                        `
                    INSERT OR IGNORE INTO ${partyAccountsTable} (idValue, idSubValue, address, currency, description)
                    VALUES (?, ?, ?, ?, ?)`,
                        [
                            idValue,
                            idSubValue,
                            account.address,
                            account.currency,
                            account.description,
                        ],
                    );
                });
            }
        } else {
            // Update the record for a specific idValue and idSubValue
            await this.db.run(
                `
                UPDATE ${partyTable}
                SET displayName = ?, firstName = ?, middleName = ?, lastName = ?, dateOfBirth = ?, idType = ?, idValue = ?, idSubValue = ?
                WHERE idType = ? AND idValue = ? AND idSubValue = ?`,
                [displayName,
                    firstName,
                    middleName,
                    lastName,
                    dateOfBirth,
                    idType,
                    idValue,
                    idSubValue,
                    idType,
                    idValue,
                    idSubValue],
            );
            if (newParty.extensionList) {
                const { extensionList } = newParty;
                extensionList.forEach((extension) => {
                    this.db.run(
                        `
                    UPDATE ${partyExtensionTable}
                    SET value = ?
                    WHERE key = ? AND idValue = ? AND idSubValue = ?`,
                        [extension.value, extension.key, idValue, idSubValue],
                    );
                    this.db.run(
                        `
                    INSERT OR IGNORE INTO ${partyExtensionTable} (idValue, idSubValue, key, value)
                    VALUES (?, ?, ?, ?)`,
                        [idValue, idSubValue, extension.key, extension.value],
                    );
                });
            }
            if (newParty.accounts) {
                const { accounts } = newParty;
                accounts.forEach((account) => {
                    this.db.run(
                        `
                    UPDATE ${partyAccountsTable}
                    SET currency = ?, description = ?
                    WHERE address = ? AND idValue = ? AND idSubValue = ?`,
                        [account.address, idValue, idSubValue],
                    );
                    this.db.get(
                        `
                    INSERT OR IGNORE INTO ${partyAccountsTable} (idValue, idSubValue, address, currency, description)
                    VALUES (?, ?, ?, ?, ?)`,
                        [
                            idValue,
                            idSubValue,
                            account.address,
                            account.currency,
                            account.description,
                        ],
                    );
                });
            }
        }
    }

    /**
    * Deletes a Party.
    *
    * @param {String} idType  The party idType.
    * @param {String} idValue The party idValue.
    * @param {String} idSubValue The optional party idSubValue.
    */
    async delete(idType, idValue, idSubValue = null) {
        if (!idSubValue) {
            await this.db.run(`DELETE FROM ${partyTable} WHERE idType = ? AND idValue = ? AND idSubValue IS NULL`, [idType, idValue]);
            await this.db.run(`DELETE FROM ${partyExtensionTable} WHERE idValue = ? AND idSubValue IS NULL`, [idValue]);
            await this.db.run(`DELETE FROM ${partyAccountsTable} WHERE idValue = ? AND idSubValue IS NULL`, [idValue]);
        } else {
            await this.db.run(`DELETE FROM ${partyTable} WHERE idType = ? AND idValue = ? AND idSubValue = ?`, [idType, idValue, idSubValue]);
            await this.db.run(`DELETE FROM ${partyExtensionTable} WHERE idValue = ? AND idSubValue = ?`, [idValue, idSubValue]);
            await this.db.run(`DELETE FROM ${partyAccountsTable} WHERE idValue = ? AND idSubValue = ?`, [idValue, idSubValue]);
        }
    }
};
