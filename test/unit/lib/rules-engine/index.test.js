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

 * Vessels Tech
 - Lewis Daly <lewis@vesselstech.com>
 --------------
 ******/
'use strict';

const test = require('ava');
const Logger = require('@mojaloop/central-services-logger');
const sinon = require('sinon');

const RulesEngine = require('#src/lib/rules-engine');
const rules = require('#rules/example');

let sandbox;

test.beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Logger, 'info');
    sandbox.stub(Logger, 'error');
    sandbox.stub(Logger, 'isInfoEnabled').value(true);
    sandbox.stub(Logger, 'isErrorEnabled').value(true);
});

test.afterEach(async () => {
    sandbox.restore();
});

test('Sets up the rules engine with empty rules', (t) => {
    // Arrange
    const emptyRules = [];
    const rulesEngine = new RulesEngine({ logger: Logger });

    // Act
    rulesEngine.loadRules(emptyRules);

    // Assert
    t.pass();

});

test('Fails to load the rules with invalid input', (t) => {
    // Arrange
    const invalidRules = {};
    const rulesEngine = new RulesEngine({ logger: Logger });

    // Act
    t.throws(() => rulesEngine.loadRules(invalidRules));

    // Assert
    t.truthy(Logger.error.called);
    t.pass();
});

test('Sets up the rules engine with default rules', (t) => {
    // Arrange
    const rulesEngine = new RulesEngine({ logger: Logger });

    // Act
    rulesEngine.loadRules(rules);

    // Assert
    t.truthy(Logger.info.called);
    t.pass();
});

test('Evaluates a rule based on demo data', async (t) => {
    // Arrange
    const rulesEngine = new RulesEngine({ logger: Logger });
    rulesEngine.loadRules(rules);

    const input = {
        path: '/transfers',
        // body: '123', // <-- This still passes and seems to be a bug with the json-rules-engine: https://github.com/CacheControl/json-rules-engine/issues/285. This comment is kept here until this can be addressed in future with the library dependency, and once done we can add a negative test scenario for it.
        body: {
            amount: '123',
        },
        method: 'POST',
    };
    const expected = [{
        statusCode: 500,
        body: {
            statusCode: '4001',
            message: 'Payer FSP insufficient liquidity',
        },
    }];

    // Act
    const response = await rulesEngine.evaluate(input);

    // Assert
    t.truthy(Logger.info.called);
    t.deepEqual(response, expected, 'Expected values to match');
});
