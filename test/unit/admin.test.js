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

// Load config
const Config = require('#src/lib/config');

const test = require('ava');

const Model = require('#src/models/model');
const { map } = require('#src/test-api/handlers');
const { party, idType, idValue } = require('./constants');

test.before(async () => {
    const configResult = await Config(process.env.CONFIG_OVERRIDE);
    // eslint-disable-next-line no-console
    console.log(configResult);
});

test.beforeEach(async (t) => {
    const model = new Model();
    await model.init({ databaseFilepath: ':memory:' });
    // eslint-disable-next-line no-param-reassign
    t.context = { state: { model }, response: {} };
});

test.afterEach(async (t) => {
    await t.context.state.model.close();
});

test('create a party', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: party };
    await map['/repository/parties'].post(t.context);
    t.is(t.context.response.status, 204);
    const data = await t.context.state.model.party.get(idType, idValue);
    t.truthy(data);
});

test('should return 400 when creating a non valid party', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: { hello: 'world' } };
    await map['/repository/parties'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 400);
});
