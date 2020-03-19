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

const { partyTable, partyExtensionTable } = require('./constants');



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
        const res = await this.db.get(`SELECT * FROM ${partyTable} WHERE idType = ? AND idValue = ?`, [idType, idValue]);
        return res;
    }

    /**
    * Retrieves all Parties.
    *
    * @async
    * @returns {Promise<Object>} Party object.
    */
    async getAll() {
        const res = await this.db.all(`SELECT * FROM ${partyTable} `);
        return res;
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
    }


    /**
    * Updates a party
    *
    * @param {String} idValue  The party idValue to update.
    * @param {Object} newParty The new Party object.
    */
    async update(idType, idValue, newParty) {
        const entries = Object.entries(newParty)
            .filter(([, v]) => v !== undefined); // get rid of undefined values
        const vals = [...entries.reduce((pv, [, v]) => [...pv, v], []), idType, idValue]; // recombine array
        const query = entries
            .map(([k]) => `${k} = ?`) // turn each key, e.g. displayName into 'displayName = ?'
            .join(', '); // join each of the above with a comma
        await this.db.run(`
            UPDATE ${partyTable}
            SET ${query}
            WHERE idType = ? AND idValue = ?`,
        vals);
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
