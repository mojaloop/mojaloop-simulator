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
'use strict'

const test = require('ava');

const Model = require('../models/model');
const { map } = require('../simulator/handlers');
const {
    transfer, quote, party, idType, idValue,
} = require('./constants');

test.beforeEach(async (t) => {
    const model = new Model();
    await model.init(':memory:');
    // eslint-disable-next-line no-param-reassign
    t.context = {
        state: { model, logger: console }, response: {},
    };
});

test.afterEach(async (t) => {
    await t.context.state.model.close();
});

test('get a party', async (t) => {
    await t.context.state.model.party.create(party);
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue, idType } };
    await map['/parties/{idType}/{idValue}'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
});

test('create a quote', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: quote };
    await map['/quoterequests'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
});

test('create a transfer', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: transfer };
    await map['/transfers'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
});

test('get a participant', async (t) => {
    const { state: { model } } = t.context;
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue, idType } };
    await model.party.create(party);
    await map['/participants/{idType}/{idValue}'].get(t.context);
    t.truthy(t.context.response.body);
    t.assert({}.hasOwnProperty.call(t.context.response.body, 'fspId'));
    t.is(t.context.response.status, 200);
});

test('should return 404 while getting a non existing party', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue: 'invalidID0001', idType: 'invalidType' } };
    await map['/parties/{idType}/{idValue}'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 404);
});

test('should return 500 while posting a non valid quote object', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: { hello: 'world' } };
    await map['/quoterequests'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 500);
});

test('should return 500 while posting a non valid transfer object', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: { hello: 'world' } };
    await map['/transfers'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 500);
});

test('should return 404 while getting a non existing participant', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue: 'invalidID0001', idType: 'invalidType' } };
    await map['/participants/{idType}/{idValue}'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 404);
});
