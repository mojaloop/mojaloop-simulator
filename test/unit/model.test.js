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

 * ModusBox <https://modusbox.com>
 - Steven Oderayi <steven.oderayi@modusbox.com>
 --------------
 ******/
'use strict';

// Load config
const Config = require('#src/lib/config');

const test = require('ava');

const Model = require('#src/models/model');

const { cloneDeep } = require('./TestUtils');

const {
    transfer, quote, quoteWithExtensionList, newQuote, newQuoteWithExtensionList, bulkQuote,
    newBulkQuote, transactionrequest, party, newTransfer, bulkTransfer, newBulkTransfer,
    bulkTransferId, idType, idValue, partyCreate, transferId, transactionRequestId,
    partyWithIdSubValue, partyCreateWithIdSubValue, idSubValue,
} = require('./constants');

test.before(async () => {
    const configResult = await Config(process.env.CONFIG_OVERRIDE);
    // eslint-disable-next-line no-console
    console.log(configResult);
});

test.beforeEach(async (t) => {
    const model = new Model();
    await model.init({ databaseFilepath: ':memory:' });
    // // below line is useful for debugging
    // await model.init({ databaseFilepath: 'sqldb.db' });
    // eslint-disable-next-line no-param-reassign
    t.context = { model };
});

test.afterEach(async (t) => {
    await t.context.model.close();
});

test('create a model with an in-memory database', async (t) => {
    // work is done in beforeEach
    t.pass();
});

test('create a party', async (t) => {
    await t.context.model.party.create(partyCreate);
    t.pass();
});

test('create and retrieve all parties', async (t) => {
    const { model } = t.context;

    await model.party.create(partyCreate);
    const res = await model.party.getAll();

    if (!res) {
        t.fail('Result not found');
    }
    if (res != null && res.length === 1) {
        t.deepEqual(res[0], partyCreate);
    } else {
        t.fail('Result not found or do not match');
    }
});

test('create and retrieve all parties with idSubValue', async (t) => {
    const { model } = t.context;

    await model.party.create(partyCreateWithIdSubValue);
    const res = await model.party.getAll();

    if (!res) {
        t.fail('Result not found');
    }
    if (res != null && res.length === 1) {
        t.deepEqual(res[0], partyCreateWithIdSubValue);
    } else {
        t.fail('Result not found or do not match');
    }
});

test('create and retrieve all parties duplicates', async (t) => {
    const { model } = t.context;
    await model.party.create(partyCreate);
    const res = await model.party.getAll();
    if (res != null && res.length === 1) {
        t.deepEqual(res[0], partyCreate);
        t.pass('partyCreate valid');
    } else {
        t.fail('Result not found or do not match');
    }
});

test('create and retrieve a party', async (t) => {
    const { model } = t.context;

    await model.party.create(partyCreate);
    const res = await model.party.get(idType, idValue);
    if (!res) {
        t.fail('Result not found');
    }
    t.deepEqual(res, partyCreate);
});

test('create and retrieve a party with idSubValue', async (t) => {
    const { model } = t.context;

    await model.party.create(partyCreateWithIdSubValue);
    const res = await model.party.get(idType, idValue, idSubValue);
    if (!res) {
        t.fail('Result not found');
    }
    t.deepEqual(res, partyCreateWithIdSubValue);
});

test('create and update a party', async (t) => {
    const { model } = t.context;
    const newParty = {
        displayName: 'randName',
        firstName: 'hello',
        middleName: 'world',
        lastName: 'lambda',
        dateOfBirth: '1970-01-01T00:00:00.000Z',
        idType,
        idValue,
        extensionList: [
            {
                key: 'accountNumber',
                value: '12345343',
            },
            {
                key: 'accountType',
                value: 'Wallet',
            },
        ],
        accounts: [
            {
                currency: 'USD',
                description: 'savings',
                address: 'moja.blue.8f027046-b82a-4fa9-838b-514514543785',
            },
            {
                currency: 'USD',
                description: 'checking',
                address: 'moja.blue.8f027046-b82a-4fa9-838b-70210fcf8137',
            },
        ],
    };
    await model.party.create(partyCreate);
    const orig = await model.party.get(idType, idValue);
    t.deepEqual(orig, partyCreate);
    await model.party.update(newParty, idType, idValue);
    const changed = await model.party.get(idType, idValue);
    t.deepEqual(changed, newParty);
    t.notDeepEqual({ orig }, { changed });
});

test('create and update a party without extensionList', async (t) => {
    const { model } = t.context;
    const newParty = {
        displayName: 'randName',
        firstName: 'hello',
        middleName: 'world',
        lastName: 'lambda',
        dateOfBirth: '1970-01-01T00:00:00.000Z',
        idType,
        idValue,
    };
    await model.party.create(partyCreate);
    const orig = await model.party.get(idType, idValue);
    await model.party.update(newParty, idType, idValue);
    const changed = await model.party.get(idType, idValue);
    t.notDeepEqual({ orig }, { changed });
});

// test('create and update a party without extensionList', async (t) => {
//     const { model } = t.context;
//     const newParty = {
//         displayName: 'randName',
//         firstName: 'hello',
//         middleName: 'world',
//         lastName: 'lambda',
//         dateOfBirth: '1970-01-01T00:00:00.000Z',
//         idType,
//         idValue,
//     };
//     await model.party.create(partyCreate);
//     const orig = await model.party.get(idType, idValue);
//     await model.party.update(newParty, idType, idValue);
//     const changed = await model.party.get(idType, idValue);
//     t.notDeepEqual({ orig }, { changed });
// });

test('create and update a party with idSubValue', async (t) => {
    const { model } = t.context;
    const newParty = {
        displayName: 'randName',
        firstName: 'hello',
        middleName: 'world',
        lastName: 'lambda',
        dateOfBirth: '1970-01-01T00:00:00.000Z',
        idType,
        idValue,
        idSubValue,
        extensionList: [
            {
                key: 'accountType',
                value: 'Wallet',
            },
            {
                key: 'accountNumber',
                value: '12345343',
            },
        ],
    };
    await model.party.create(partyCreateWithIdSubValue);
    const orig = await model.party.get(idType, idValue, idSubValue);
    await model.party.update(newParty, idType, idValue, idSubValue);
    const changed = await model.party.get(idType, idValue, idSubValue);
    t.notDeepEqual({ orig }, { changed });
});

test('create and update a party with idSubValue without extensionList', async (t) => {
    const { model } = t.context;
    const newParty = {
        displayName: 'randName',
        firstName: 'hello',
        middleName: 'world',
        lastName: 'lambda',
        dateOfBirth: '1970-01-01T00:00:00.000Z',
        idType,
        idValue,
        idSubValue,
    };
    await model.party.create(partyWithIdSubValue);
    const orig = await model.party.get(idType, idValue, idSubValue);
    await model.party.update(newParty, idType, idValue, idSubValue);
    const changed = await model.party.get(idType, idValue, idSubValue);
    t.notDeepEqual({ orig }, { changed });
});

test('retrieve a participant', async (t) => {
    const { model } = t.context;
    await model.party.create(party);
    const res = await model.party.get(idType, idValue);
    t.truthy(res);
});

test('retrieve a participant with idSubValue', async (t) => {
    const { model } = t.context;
    await model.party.create(partyWithIdSubValue);
    const res = await model.party.get(idType, idValue, idSubValue);
    t.truthy(res);
});

test('create and delete a party', async (t) => {
    const { model } = t.context;
    await model.party.create(partyCreate);
    await model.party.get(idType, idValue);
    await model.party.delete(idType, idValue);
    const deleted = await model.party.get(idType, idValue);
    t.is(deleted, undefined);
});

test('create and delete a party with idSubValue', async (t) => {
    const { model } = t.context;
    await model.party.create(partyCreateWithIdSubValue);
    await model.party.get(idType, idValue, idSubValue);
    await model.party.delete(idType, idValue, idSubValue);
    const deleted = await model.party.get(idType, idValue, idSubValue);
    t.is(deleted, undefined);
});

test('should be undefined for non existing participant', async (t) => {
    const { model } = t.context;
    const res = await model.party.get('hello', '000000');
    t.is(res, undefined);
});

test('should be undefined for deleted participant', async (t) => {
    const { model } = t.context;
    await model.party.create(party);
    await model.party.get(idType, idValue);
    await model.party.delete(idType, idValue);
    const deleted = await model.party.get(idType, idValue);
    t.is(deleted, undefined);
});

test('create a quote', async (t) => {
    await t.context.model.quote.create(quote);
    t.pass();
});

test('create and retrieve a quote', async (t) => {
    const { model } = t.context;

    await model.quote.create(quote);
    const res = await model.quote.get(idValue);
    if (!res) {
        t.fail('Result not found');
    }
    t.pass();
});

test('created quote has correct fees', async (t) => {
    const { model } = t.context;

    const q = await model.quote.create(quote);

    if (q.payeeFspFeeAmount !== '5') {
        return t.fail(`Fee is ${q.payeeFspFeeAmount}`);
    }
    if (q.payeeFspCommissionAmount !== '5') {
        return t.fail(`Fee is ${q.payeeFspCommissionAmount}`);
    }

    return t.pass();
});

test('created quote has correct fees when transfer amount is small', async (t) => {
    const { model } = t.context;

    const smq = { ...quote };
    smq.amount = 1;

    const q = await model.quote.create(smq);

    if (q.payeeFspFeeAmount !== '0') {
        return t.fail(`Fee is ${q.payeeFspFeeAmount}`);
    }
    if (q.payeeFspCommissionAmount !== '0') {
        return t.fail(`Fee is ${q.payeeFspCommissionAmount}`);
    }

    return t.pass();
});

test('create and update a quote', async (t) => {
    const { model } = t.context;

    await model.quote.create(quote);
    const orig = await model.quote.get(idValue);
    await model.quote.update(idValue, newQuote);
    const changed = await model.quote.get(idValue);
    t.notDeepEqual({ orig }, { changed });
});

test('create and update a quote with extensionList', async (t) => {
    const { model } = t.context;

    await model.quote.create(quoteWithExtensionList);
    const orig = await model.quote.get(idValue);
    await model.quote.update(idValue, newQuoteWithExtensionList);
    const changed = await model.quote.get(idValue);
    t.notDeepEqual({ orig }, { changed });
});

test('create and delete a quote', async (t) => {
    const { model } = t.context;
    await model.quote.create(quote);
    await model.quote.get(idValue);
    await model.quote.delete(idValue);
    const deleted = await model.quote.get(idValue);
    t.is(deleted, undefined);
});

test('create a bulk quote', async (t) => {
    await t.context.model.bulkQuote.create(cloneDeep(bulkQuote));
    t.pass();
});

test('create and retrieve a bulk quote', async (t) => {
    const { model } = t.context;

    await model.bulkQuote.create(cloneDeep(bulkQuote));
    const res = await model.bulkQuote.get(idValue);

    if (!res) {
        t.fail('Result not found');
    }

    t.pass();
});

test('created bulk quote has correct fees', async (t) => {
    const { model } = t.context;

    const bq = await model.bulkQuote.create(cloneDeep(bulkQuote));
    const q = bq.individualQuoteResults[0];

    if (q.payeeFspFeeAmount !== '5') {
        return t.fail(`Fee is ${q.payeeFspFeeAmount}`);
    }
    if (q.payeeFspCommissionAmount !== '5') {
        return t.fail(`Fee is ${q.payeeFspCommissionAmount}`);
    }

    return t.pass();
});

test('created bulk quote has correct fees when transfer amounts is small', async (t) => {
    const { model } = t.context;

    const smq = cloneDeep(bulkQuote);
    smq.individualQuotes[0].amount = 1;
    const bq = await model.bulkQuote.create(smq);
    const q = bq.individualQuoteResults[0];

    if (q.payeeFspFeeAmount !== '0') {
        return t.fail(`Fee is ${q.payeeFspFeeAmount}`);
    }
    if (q.payeeFspCommissionAmount !== '0') {
        return t.fail(`Fee is ${q.payeeFspCommissionAmount}`);
    }

    return t.pass();
});

test('create and update a bulk quote', async (t) => {
    const { model } = t.context;

    await model.bulkQuote.create(cloneDeep(bulkQuote));
    const orig = await model.bulkQuote.get(idValue);
    await model.bulkQuote.update(idValue, cloneDeep(newBulkQuote));
    const changed = await model.bulkQuote.get(idValue);
    t.notDeepEqual({ orig }, { changed });
});

test('create and delete a bulk quote', async (t) => {
    const { model } = t.context;
    await model.bulkQuote.create(cloneDeep(bulkQuote));
    await model.bulkQuote.get(idValue);
    await model.bulkQuote.delete(idValue);
    const deleted = await model.bulkQuote.get(idValue);
    t.is(deleted, undefined);
});

test('create a transfer', async (t) => {
    await t.context.model.transfer.create(transfer);
    t.pass();
});

test('create and retrieve a transfer', async (t) => {
    const { model } = t.context;

    await model.transfer.create(transfer);
    const res = await model.transfer.get(transferId);
    if (!res) {
        t.fail('Result not found');
    }
    t.pass();
});

test('create and update a transfer', async (t) => {
    const { model } = t.context;

    await model.transfer.create(transfer);
    const orig = await model.transfer.get(idValue);
    await model.transfer.update(idValue, newTransfer);
    const changed = await model.transfer.get(idValue);
    t.notDeepEqual({ orig }, { changed });
});

test('create and delete a transfer', async (t) => {
    const { model } = t.context;
    await model.transfer.create(transfer);
    await model.transfer.get(transferId);
    await model.transfer.delete(transferId);
    const deleted = await model.transfer.get(transferId);
    t.is(deleted, undefined);
});

test('create and retrieve a bulk transfer', async (t) => {
    const { model } = t.context;

    await model.bulkTransfer.create(cloneDeep(bulkTransfer));
    const res = await model.bulkTransfer.get(bulkTransferId);
    if (!res) {
        t.fail('Result not found');
    }
    t.pass();
});

test('create and update a bulk transfer', async (t) => {
    const { model } = t.context;

    await model.bulkTransfer.create(cloneDeep(bulkTransfer));
    const orig = await model.bulkTransfer.get(idValue);
    await model.bulkTransfer.update(idValue, cloneDeep(newBulkTransfer));
    const changed = await model.bulkTransfer.get(idValue);
    t.notDeepEqual({ orig }, { changed });
});

test('create and delete a bulkTransfer', async (t) => {
    const { model } = t.context;
    await model.bulkTransfer.create(cloneDeep(bulkTransfer));
    await model.bulkTransfer.get(bulkTransferId);
    await model.bulkTransfer.delete(bulkTransferId);
    const deleted = await model.bulkTransfer.get(bulkTransferId);
    t.is(deleted, undefined);
});

test('create a transactionrequest', async (t) => {
    await t.context.model.transactionrequest.create(transactionrequest);
    t.pass();
});

test('create and delete a transactionrequest', async (t) => {
    const { model } = t.context;

    await model.transactionrequest.create(transactionrequest);
    await model.transactionrequest.get(transactionRequestId);
    await model.transactionrequest.delete(transactionRequestId);
    const deleted = await model.transactionrequest.get(transactionRequestId);
    t.is(deleted, undefined);
});

test('throws if we try to init the db twice', async (t) => {
    // Arrange
    const { model } = t.context;

    // Act
    const error = await t.throwsAsync(() => model.init(':memory:'));

    // Assert
    t.is(error.message, 'Attempted to initialise database twice', 'Invalid error message.');
});

test('throws if we try to init the db incorrectly', async (t) => {
    // Arrange
    const badModel = new Model();

    // Act
    const error = await t.throwsAsync(async () => {
        await badModel.init();
    });

    // Assert
    t.is(error.message, 'Cannot destructure property \'databaseFilepath\' of \'undefined\' as it is undefined.', 'Invalid error message.');
});

test('does nothing if trying to close a non existent db', async (t) => {
    // Arrange
    const unInitModel = new Model();

    // Act
    unInitModel.close();

    // Assert
    t.pass();
});
