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

const { Engine } = require('json-rules-engine');
const { getStackOrInspect } = require('./log/log');

class RulesEngine {
    constructor(config) {
        this.config = config;
        this.logger = config.logger || console;
        this.engine = new Engine();
     
        this._addCustomOperators();
    }

   
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
            this.logger.isInfoEnabled && this.logger.info({msg: 'Rules loaded', rules});
        } catch (err) {
            this.logger.isErrorEnabled && this.logger.error(`Error loading rules: ${getStackOrInspect(err)}`);
            throw err;
        }
    }

    /**
     * Runs the engine to evaluate facts
     *
     * @async
     * @param {Object} facts facts to evaluate
     * @returns {Promise.<Object>} response
     */
    async evaluate(facts) {
        return new Promise((resolve, reject) => {
            if (facts.path == '/' || facts.path == '/health') {
                this.logger.isDebugEnabled && this.logger.debug({ msg: 'Rule engine evaluating facts', facts});
            } else {
                this.logger.isInfoEnabled && this.logger.info({ msg: 'Rule engine evaluating facts', facts});
            }
            this.engine
                .run(facts)
                .then((engineResult) => {
                    const { events } = engineResult;
                    if (facts.path == '/' || facts.path == '/health') {
                        this.logger.isDebugEnabled && this.logger.debug({ msg: 'Rule engine returning events', engineResult});
                    } else {
                        this.logger.isInfoEnabled && this.logger.info({ msg: 'Rule engine returning events', engineResult});
                    }
                    // Events is always longer than 0 for istanbul
                    /* istanbul ignore next */
                    return resolve(events.length === 0 ? null : events.map((e) => e.params));
                }).catch(reject);
        });
    }
}

module.exports = RulesEngine;
