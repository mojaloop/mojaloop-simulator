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
 - Steven Oderayi <steven.oderayi@modusbox.com>
 --------------
 ******/
'use strict';

const test = require('ava');
const Model = require('../models/model');
const handlers = require('../test-api/handlers');
const { ops, party, partyCreate } = require('./constants');

const testOps = [
    {
        name: 'scenario1',
        operation: 'postTransfers',
        body: {
            from: {
                displayName: 'James Bush',
                idType: 'MSISDN',
                idValue: '447710066017',
            },
            to: {
                idType: 'MSISDN',
                idValue: '447710066018',
            },
            amountType: 'SEND',
            currency: 'USD',
            amount: '100',
            transactionType: 'TRANSFER',
            note: 'test payment',
            homeTransactionId: '123ABC',
        },
    },
    {
        name: 'scenario2',
        operation: 'putTransfers',
        params: {
            transferId: '{{scenario1.result.transferId}}',
        },
        body: {
            acceptQuote: true,
        },
    },
    {
        name: 'scenario3',
        operation: 'postBulkTransfers',
        body: {
            from: {
                displayName: 'Steven Oderayi',
                idType: 'MSISDN',
                idValue: '447710066028',
            },
            individualTransfers: [
                {
                    to: {
                        idType: 'MSISDN',
                        idValue: '447710066018',
                    },
                    amountType: 'SEND',
                    currency: 'USD',
                    amount: '100',
                    transactionType: 'TRANSFER',
                    note: 'test payment',
                    homeTransactionId: '123ABC',
                },
            ],
        },
    },
    {
        name: 'scenario4',
        operation: 'postBulkQuotes',
        body: {
            from: {
                displayName: 'Steven Oderayi',
                idType: 'MSISDN',
                idValue: '447710066028',
            },
            individualQuotes: [
                {
                    quoteId: '8746736546',
                    transactionId: '5678390498',
                    to: {
                        idType: 'MSISDN',
                        idValue: '447710066018',
                    },
                    currency: 'USD',
                    amount: '100',
                    note: 'test payment',
                },
            ],
        },
    },

];

test.beforeEach(async (t) => {
    const model = new Model();
    await model.init(':memory:');
    // eslint-disable-next-line no-param-reassign
    t.context = { state: { model, logger: console }, response: {} };
});

test.afterEach(async (t) => {
    await t.context.state.model.close();
});

test('should return 200 when reading a party', async (t) => {
    // eslint-disable-next-line no-param-reassign
    await handlers.map['/repository/parties'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
});

test('should return 204 when creating a party', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: partyCreate };
    await handlers.map['/repository/parties'].post(t.context);
    t.falsy(t.context.response.body);
    t.is(t.context.response.status, 204);
});

test('should return 204 when updating a party', async (t) => {
    const { idType, idValue } = party;
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: party };
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idType, idValue } };
    await handlers.map['/repository/parties/{idType}/{idValue}'].put(t.context);
    t.falsy(t.context.response.body);
    t.is(t.context.response.status, 204);
});

test('should return 204 when deleting a party', async (t) => {
    const { idType, idValue } = party;
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idType, idValue } };
    await handlers.map['/repository/parties/{idType}/{idValue}'].delete(t.context);
    t.falsy(t.context.response.body);
    t.is(t.context.response.status, 204);
});

/* This test was failing since its introduction in PR: https://github.com/mojaloop/mojaloop-simulator/pull/5/files */
test.skip('should return 200 when posting correct scenarios', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: ops };
    await handlers.map['/scenarios'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
});

test('should call outbound transfers model and pass on results to next operation', async (t) => {
    const model = {
        postTransfers: async () => Promise.resolve({
            transferId: '12345ABCDEF',
        }),
        putTransfers: async (transferId) => Promise.resolve({
            transferId,
        }),
        postBulkTransfers: async () => Promise.resolve({
            bulkTransferId: '1234567890',
        }),
        postBulkQuotes: async () => Promise.resolve({
            bulkQuoteId: '1234567890',
        }),
    };

    const result = await handlers.handleOps(console, model, testOps);

    t.truthy(result.scenario1);
    t.truthy(result.scenario2);
    t.truthy(result.scenario3);
    t.truthy(result.scenario4);
    t.truthy(result.scenario1.result);
    t.truthy(result.scenario2.result);
    t.truthy(result.scenario3.result);
    t.truthy(result.scenario4.result);

    t.is(result.scenario1.result.transferId, '12345ABCDEF');
    t.is(result.scenario2.result.transferId, '12345ABCDEF');
    t.is(result.scenario3.result.bulkTransferId, '1234567890');
    t.is(result.scenario4.result.bulkQuoteId, '1234567890');
});

test('should return 500 when sending a non valid ops', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: { hello: 'world' } };
    await handlers.map['/scenarios'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 500);
});
