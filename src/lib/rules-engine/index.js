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
 --------------
 ******/
'use strict';

const util = require('util');
const { Engine } = require('json-rules-engine');
const { getStackOrInspect } = require('@internal/log');

class RulesEngine {
    constructor(config) {
        this.config = config;
        this.logger = config.logger || console;
        this.engine = new Engine();
        // eslint-disable-next-line no-underscore-dangle
        this._addCustomOperators();
    }

    // eslint-disable-next-line no-underscore-dangle
    _addCustomOperators() {
        /* istanbul ignore next */
        this.engine.addOperator('numberStringLessThanInclusive', (a, b) => Number(a) <= b);
        /* istanbul ignore next */
        this.engine.addOperator('numberStringGreaterThanInclusive', (a, b) => Number(a) >= b);
    }

    /**
     * Loads an array of rules into the engine
     *
     * @param {object[]} rules - an array of rules to load into the engine
     * @returns {undefined}
     */
    loadRules(rules) {
        try {
            rules.forEach((r) => { this.engine.addRule(r); });
            this.logger.log(`Rules loaded: ${util.inspect(rules, { depth: 20 })}`);
        } catch (err) {
            this.logger.log(`Error loading rules: ${getStackOrInspect(err)}`);
            throw err;
        }
    }

    /**
     * Runs the engine to evaluate facts
     *
     * @async
     * @param {Object} facts facts to evalute
     * @returns {Promise.<Object>} response
     */
    async evaluate(facts) {
        return new Promise((resolve, reject) => {
            this.logger.log(`Rule engine evaluating facts: ${util.inspect(facts)}`);
            this.engine
                .run(facts)
                .then((engineResult) => {
                    const { events } = engineResult;

                    this.logger.log(`Rule engine returning events: ${util.inspect(engineResult)}`);
                    // Events is always longer than 0 for istanbul
                    /* istanbul ignore next */
                    return resolve(events.length === 0 ? null : events.map((e) => e.params));
                }).catch(reject);
        });
    }
}

module.exports = RulesEngine;
