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

const test = require('ava');

const handlers = require('../test-api/handlers');

const testOps = [{
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
}, {
    name: 'scenario2',
    operation: 'putTransfers',
    params: {
        transferId: '{{scenario1.result.transferId}}',
    },
    body: {
        acceptQuote: true,
    },
}];


test.beforeEach(async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context = { state: { logger: console }, response: {} };
});


test('should call outbound transfers model and pass on results to next operation', async (t) => {
    const model = {
        postTransfers: async () => Promise.resolve({
            transferId: '12345ABCDEF',
        }),
        putTransfers: async (transferId) => Promise.resolve({
            transferId,
        }),
    };

    const result = await handlers.handleOps(console, model, testOps);

    t.truthy(result.scenario1);
    t.truthy(result.scenario2);
    t.truthy(result.scenario1.result);
    t.truthy(result.scenario2.result);

    t.is(result.scenario1.result.transferId, '12345ABCDEF');
    t.is(result.scenario2.result.transferId, '12345ABCDEF');
});


test('should return 500 when sending a non valid ops', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: { hello: 'world' } };
    await handlers.map['/scenarios'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 500);
});
