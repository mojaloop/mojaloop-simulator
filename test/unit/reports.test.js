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

/* eslint-disable no-unused-vars */

// Load config
const Config = require('#src/lib/config');

const test = require('ava');
const { stringify } = require('querystring');
const { v1: uuid } = require('uuid');

const { map } = require('#src/reports/handlers');
const Model = require('#src/models/model');
const { quote } = require('./constants');

const model = new Model();
const end = new Date();
end.setMonth(end.getMonth() + 2);
const validQuerystring = stringify({ START_DATE_TIME: '2019-05-20T21:20:56', END_DATE_TIME: end.toISOString().slice(0, 19) });
const nonFindableQuerystring = stringify({ START_DATE_TIME: '2019-05-19T21:20:00', END_DATE_TIME: '2019-05-20T21:20:56' });

test.before(async (t) => {
    const configResult = await Config(process.env.CONFIG_OVERRIDE);
    // eslint-disable-next-line no-console
    console.log(configResult);
    // // below line is useful for debugging
    // await model.init({ databaseFilepath: ':memory:' });
    await model.init({ databaseFilepath: process.env.MODEL_DATABASE });
    Array.from({ length: 10 }).forEach(async (x, i) => {
        quote.quoteId = uuid();
        await model.quote.create(quote);
    });
    await model.close();
});

test.beforeEach(async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context = { state: {}, request: {}, response: {} };
});

test('get reports', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { querystring: validQuerystring };
    await map['/reports'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
});

test('should return 404 when cannot find report', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { querystring: nonFindableQuerystring };
    await map['/reports'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 404);
});

test('should return 400 when sending invalid querystrings', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { querystring: {} };
    await map['/reports'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 400);
});
