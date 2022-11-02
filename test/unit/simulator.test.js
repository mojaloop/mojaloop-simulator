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

// Load config
const Config = require('#src/lib/config');

const test = require('ava');
const sinon = require('sinon');
const { cloneDeep } = require('./TestUtils');
const Model = require('#src/models/model');
const { map } = require('#src/simulator/handlers');
const {
    transfer,
    transferWithoutQuote,
    quote,
    transactionrequest,
    party,
    idType,
    idValue,
    transactionRequestId,
    bulkQuote,
    bulkTransfer,
    bulkTransferId,
    authorizationRequest,
} = require('./constants');
const { ApiErrorCodes } = require('#src/models/errors');
const Logger = require('@mojaloop/central-services-logger');

let sandbox;

test.before(async () => {
    const configResult = await Config(process.env.CONFIG_OVERRIDE);
    // eslint-disable-next-line no-console
    console.log(configResult);
});

test.beforeEach(async (t) => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Logger, 'info');
    sandbox.stub(Logger, 'error');
    sandbox.stub(Logger, 'isInfoEnabled').value(true);
    sandbox.stub(Logger, 'isErrorEnabled').value(true);

    const model = new Model();
    await model.init({ databaseFilepath: ':memory:' });
    // eslint-disable-next-line no-param-reassign
    t.context = {
        state: { model, logger: Logger }, response: {},
    };
});

test.afterEach(async (t) => {
    sandbox.restore();
    await t.context.state.model.close();
});

test('get an otp', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { transactionRequestId } };
    await map['/otp/{requestToPayId}'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('get accounts by user Id', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { ID: 'test123' } };
    await map['/accounts/{ID}'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 404);
    t.truthy(Logger.info.called);
});

test('get scopes by Id', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { ID: 'test123' } };
    await map['/scopes/{ID}'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('post validateConsentRequests', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = {
        body: { consentRequestId: '123456' },
    };
    await map['/validateConsentRequests'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.body.isValid, true);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('post sendOTP', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = {
        body: { consentRequestId: '123456' },
    };
    await map['/sendOTP'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('post storeConsentRequest', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { ID: '123456' } };
    // eslint-disable-next-line no-param-reassign
    t.context.request = {
        body: { consentRequestId: '123456' },
    };
    await map['/store/consentRequests/{ID}'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.body.status, 'OK');
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('get consentRequest', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { ID: '123456' } };

    await map['/store/consentRequests/{ID}'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('post validate authToken valid', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = {
        body: {
            authToken: '123456',
            consentRequestId: idValue,
        },
    };
    await map['/validateAuthToken'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.body.isValid, true);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('post validate authToken invalid', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = {
        body: {
            authToken: '123457',
            consentRequestId: idValue,
        },
    };
    await map['/validateAuthToken'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.body.isValid, false);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('get a party', async (t) => {
    await t.context.state.model.party.create(party);
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue, idType } };
    await map['/parties/{idType}/{idValue}'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('create a quote', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: quote };
    await map['/quoterequests'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('create a bulk quote', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: cloneDeep(bulkQuote) };
    await map['/bulkQuotes'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('get a bulk quote', async (t) => {
    await t.context.state.model.bulkQuote.create(bulkQuote);
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue } };
    await map['/bulkQuotes/{idValue}'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('create a transfer', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: transfer };
    await map['/transfers'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('create a bulk transfer', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: cloneDeep(bulkTransfer) };
    await map['/bulkTransfers'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('get a bulk transfer', async (t) => {
    await t.context.state.model.bulkTransfer.create(bulkTransfer);
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue: bulkTransferId } };
    await map['/bulkTransfers/{idValue}'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('create a transactionrequest', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: transactionrequest };
    await map['/transactionrequests'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('get signed challenge', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: authorizationRequest };
    await map['/signchallenge'].post(t.context);
    t.truthy(t.context.response.body);
    t.assert({}.hasOwnProperty.call(t.context.response.body, 'pinValue'));
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
});

test('create a transfer without a quote', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: transferWithoutQuote };
    await map['/transfers'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 200);
    t.truthy(Logger.info.called);
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
    t.truthy(Logger.info.called);
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
    t.truthy(Logger.error.called);
});

test('should return 500 while posting a non valid transfer object', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: { hello: 'world' } };
    await map['/transfers'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 500);
    t.truthy(Logger.error.called);
});

test('should return 500 while posting a non valid bulk quote object', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: { hello: 'world' } };
    await map['/bulkQuotes'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 500);
    t.truthy(Logger.error.called);
});

test('should return 500 while posting a non valid bulk transfer object', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: { hello: 'world' } };
    await map['/bulkTransfers'].post(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 500);
    t.truthy(Logger.error.called);
});

test('should return 404 while getting a non existing participant', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue: 'invalidID0001', idType: 'invalidType' } };
    await map['/participants/{idType}/{idValue}'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 404);
});

test('should return 404 while getting a non existent bulk quote', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue: 'invalidID0001' } };
    await map['/bulkQuotes/{idValue}'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 404);
});

test('should return 404 while getting a non existent bulk transfer', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue: 'invalidID0001' } };
    await map['/bulkTransfers/{idValue}'].get(t.context);
    t.truthy(t.context.response.body);
    t.is(t.context.response.status, 404);
});

test('should return a valid health check', async (t) => {
    // Arrange
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue, idType } };
    const expected = {
        status: 200,
        body: '{"status":"OK"}',
    };

    // Act
    await map['/'].get(t.context);

    // Assert
    t.deepEqual(t.context.response, expected, 'Response did not match expected');
});

test('postQuotes should handle 500 errors', async (t) => {
    // Arrange
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue, idType } };
    // eslint-disable-next-line no-throw-literal, no-param-reassign
    t.context.state.model.quote.create = () => { throw 'Bad error!'; };
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: quote };

    const expected = {
        body: ApiErrorCodes.SERVER_ERROR,
        status: 500,
    };

    // Act
    await map['/quoterequests'].post(t.context);
    // Assert
    t.deepEqual(t.context.response, expected, 'Response did not match expected');
    t.truthy(Logger.error.called);
    t.pass();
});

test('postBulkQuotes should handle 500 errors', async (t) => {
    // Arrange
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue, idType } };
    // eslint-disable-next-line no-throw-literal, no-param-reassign
    t.context.state.model.bulkQuote.create = () => { throw 'Bad error!'; };
    // eslint-disable-next-line no-param-reassign
    t.context.request = { body: cloneDeep(bulkQuote) };

    const expected = {
        body: ApiErrorCodes.SERVER_ERROR,
        status: 500,
    };

    // Act
    await map['/bulkQuotes'].post(t.context);
    // Assert
    t.deepEqual(t.context.response, expected, 'Response did not match expected');
    t.truthy(Logger.error.called);
    t.pass();
});

test('putTransfersById should handle request', async (t) => {
    // Arrange
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { transferId: '1234' } };
    // eslint-disable-next-line no-throw-literal, no-param-reassign
    t.context.request = {
        body: {
            completedTimestamp: '2017-11-15T14:16:09.663+01:00',
            transferState: 'COMMITTED',
        },
    };
    await map['/transfers/{transferId}'].put(t.context);
    const expected = t.context.request.body;
    t.deepEqual(t.context.response, { body: { ...expected }, status: 200 }, 'response is received');
    t.truthy(Logger.info.called);
    t.pass();
});

test('getParticipantsByTypeAndId should handle 500 errors', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue: 'invalidID0001', idType: 'invalidType' } };
    t.context.state.model.party.get = () => { throw 'Bad error!'; };
    await map['/participants/{idType}/{idValue}'].get(t.context);

    const expected = {
        body: ApiErrorCodes.SERVER_ERROR,
        status: 500,
    };

    // Assert
    t.deepEqual(t.context.response, expected, 'Response did not match expected');
    t.truthy(Logger.error.called);
    t.pass();
});

test('getPartiesByTypeAndId should handle 500 errors', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue: 'invalidID0001', idType: 'invalidType' } };
    t.context.state.model.party.get = () => { throw 'Bad error!'; };
    await map['/parties/{idType}/{idValue}'].get(t.context);

    const expected = {
        body: ApiErrorCodes.SERVER_ERROR,
        status: 500,
    };

    // Assert
    t.deepEqual(t.context.response, expected, 'Response did not match expected');
    t.truthy(Logger.error.called);
    t.pass();
});

test('getBulkQuoteById should handle 500 errors', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue: 'invalidID0001' } };
    t.context.state.model.bulkQuote.get = () => { throw 'Bad error!'; };
    await map['/bulkQuotes/{idValue}'].get(t.context);

    const expected = {
        body: ApiErrorCodes.SERVER_ERROR,
        status: 500,
    };

    // Assert
    t.deepEqual(t.context.response, expected, 'Response did not match expected');
    t.truthy(Logger.error.called);
    t.pass();
});

test('postTransactionRequests should handle 500 errors', async (t) => {
    t.context.state.model.transactionrequest.create = () => { throw 'Bad error!'; };
    await map['/transactionrequests'].post(t.context);

    const expected = {
        body: ApiErrorCodes.SERVER_ERROR,
        status: 500,
    };

    // Assert
    t.deepEqual(t.context.response, expected, 'Response did not match expected');
    t.truthy(Logger.error.called);
    t.pass();
});

test('getBulkTransferById should handle 500 errors', async (t) => {
    // eslint-disable-next-line no-param-reassign
    t.context.state.path = { params: { idValue: 'invalidID0001' } };
    t.context.state.model.bulkTransfer.get = () => { throw 'Bad error!'; };
    await map['/bulkTransfers/{idValue}'].get(t.context);

    const expected = {
        body: ApiErrorCodes.SERVER_ERROR,
        status: 500,
    };

    // Assert
    t.deepEqual(t.context.response, expected, 'Response did not match expected');
    t.truthy(Logger.error.called);
    t.pass();
});
