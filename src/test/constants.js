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
const Chance = require('chance');
const { v1: uuid } = require('uuid');

const chance = new Chance();
const randName = chance.name({ suffix: true, middle: true });
const transferId = uuid();
const bulkTransferId = uuid();
const transactionRequestId = uuid();
const idType = 'msisdn';
const idValue = uuid();
const subIdValue = uuid();
const currency = '$';
const amount = 100;
const amountType = 'SEND';
const transactionType = 'TRANSFER';

const party = {
    displayName: randName,
    firstName: randName.split(' ')[0] || '',
    middleName: randName.split(' ')[1] || '',
    lastName: randName.split(' ')[2] || '',
    dateOfBirth: '1970-01-01T00:00:00.000Z',
    idType,
    idValue,
};

const partyWithSubIdValue = {
    displayName: randName,
    firstName: randName.split(' ')[0] || '',
    middleName: randName.split(' ')[1] || '',
    lastName: randName.split(' ')[2] || '',
    dateOfBirth: '1970-01-01T00:00:00.000Z',
    idType,
    idValue,
    subIdValue,
};

const partyCreate = {
    displayName: randName,
    firstName: randName.split(' ')[0] || '',
    middleName: randName.split(' ')[1] || '',
    lastName: randName.split(' ')[2] || '',
    dateOfBirth: '1970-01-01T00:00:00.000Z',
    idType,
    idValue,
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

const partyCreateWithSubIdValue = {
    displayName: randName,
    firstName: randName.split(' ')[0] || '',
    middleName: randName.split(' ')[1] || '',
    lastName: randName.split(' ')[2] || '',
    dateOfBirth: '1970-01-01T00:00:00.000Z',
    idType,
    idValue,
    subIdValue,
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

const quote = {
    quoteId: idValue,
    transactionId: uuid(),
    to: {
        idType: 'MSISDN',
        idValue: '0012345',
    },
    from: {
        idType: 'MSISDN',
        idValue: '0067890',
    },
    amountType: 'SEND',
    amount: '100',
    currency: 'USD',
    feesAmount: '0.5',
    feesCurrency: 'USD',
    transactionType: 'TRANSFER',
    initiator: 'PAYER',
    initiatorType: 'CONSUMER',
};

const quoteWithExtensionList = {
    quoteId: idValue,
    transactionId: uuid(),
    to: {
        idType: 'MSISDN',
        idValue: '0012345',
    },
    from: {
        idType: 'MSISDN',
        idValue: '0067890',
    },
    amountType: 'SEND',
    amount: '100',
    currency: 'USD',
    feesAmount: '0.5',
    feesCurrency: 'USD',
    transactionType: 'TRANSFER',
    initiator: 'PAYER',
    initiatorType: 'CONSUMER',
    extensionList: {
        extension: [
            {
                key: 'KYCPayerTier',
                value: '1',
            },
            {
                key: 'KYCNationality',
                value: 'CI',
            },
        ],
    },
};

const newQuote = {
    quoteId: uuid(),
    transactionId: uuid(),
    to: {
        idType: 'MSISDN',
        idValue: '0012345',
    },
    from: {
        idType: 'MSISDN',
        idValue: '0067890',
    },
    amountType: 'SEND',
    amount: '100',
    currency: 'USD',
    feesAmount: '0.5',
    feesCurrency: 'USD',
    transactionType: 'TRANSFER',
    initiator: 'PAYER',
    initiatorType: 'CONSUMER',
    extensionList: {
        extension: [
            {
                key: 'KYCPayerTier',
                value: '1',
            },
            {
                key: 'KYCNationality',
                value: 'CI',
            },
        ],
    },
};

const newQuoteWithExtensionList = {
    quoteId: uuid(),
    transactionId: uuid(),
    to: {
        idType: 'MSISDN',
        idValue: '0012345',
    },
    from: {
        idType: 'MSISDN',
        idValue: '0067890',
    },
    amountType: 'SEND',
    amount: '100',
    currency: 'USD',
    feesAmount: '0.5',
    feesCurrency: 'USD',
    transactionType: 'TRANSFER',
    initiator: 'PAYER',
    initiatorType: 'CONSUMER',
};

const bulkQuote = {
    bulkQuoteId: idValue,
    from: {
        idType: 'MSISDN',
        idValue: '0067890',
    },
    individualQuotes: [
        {
            quoteId: idValue,
            transactionId: uuid(),
            to: {
                idType: 'MSISDN',
                idValue: '0012345',
            },
            amountType: 'SEND',
            amount: '100',
            currency: 'USD',
            feesAmount: '0.5',
            feesCurrency: 'USD',
            transactionType: 'TRANSFER',
            initiator: 'PAYER',
            initiatorType: 'CONSUMER',
        },
    ],
};

const newBulkQuote = {
    bulkQuoteId: uuid(),
    from: {
        idType: 'MSISDN',
        idValue: '0067890',
    },
    individualQuotes: [
        {
            quoteId: uuid(),
            transactionId: uuid(),
            to: {
                idType: 'MSISDN',
                idValue: '0012345',
            },
            amountType: 'SEND',
            amount: '100',
            currency: 'USD',
            feesAmount: '0.5',
            feesCurrency: 'USD',
            transactionType: 'TRANSFER',
            initiator: 'PAYER',
            initiatorType: 'CONSUMER',
        },
    ],
};

const transactionrequest = {
    transactionRequestId,
    to: {
        idType: 'MSISDN',
        idValue: '0012345',
    },
    from: {
        idType: 'BUSINESS',
        idValue: 'Starbucks',
    },
    amountType: 'SEND',
    amount: '100',
    currency: 'USD',
    feesAmount: '0.5',
    feesCurrency: 'USD',
    transactionType: 'TRANSFER',
    initiator: 'PAYER',
    initiatorType: 'CONSUMER',
};

const transfer = {
    transferId,
    quote: {
        quoteId: idValue,
        transactionId: randName,
        transferAmount: amount,
        transferAmountCurrency: currency,
    },
    from: {
        idType,
        idValue,
    },
    to: {
        idType,
        idValue: '67890',
    },
    amountType,
    currency,
    amount,
    transactionType,
};

const newTransfer = {
    transferId: uuid(),
    quote: {
        quoteId: idValue,
        transactionId: randName,
        transferAmount: amount,
        transferAmountCurrency: currency,
    },
    from: {
        idType,
        idValue,
    },
    to: {
        idType,
        idValue: '67890',
    },
    amountType,
    currency,
    amount,
    transactionType,
};

const bulkTransfer = {
    bulkTransferId,
    from: {
        idType,
        idValue,
    },
    bulkQuote: {
        bulkQuoteId: idValue,
        individualQuotes: [
            {
                quoteId: uuid(),
                transactionId: randName,
                transferAmount: amount,
                transferAmountCurrency: currency,
            },
        ],
    },
    individualTransfers: [
        {
            transferId: uuid(),
            to: {
                idType,
                idValue: '67890',
            },
            amountType,
            currency,
            amount,
            transactionType,
        },
    ],
};

const newBulkTransfer = {
    bulkTransferId: uuid(),
    from: {
        idType,
        idValue,
    },
    bulkQuote: {
        bulkQuoteId: uuid(),
        individualQuotes: [
            {
                quoteId: uuid(),
                transactionId: randName,
                transferAmount: amount,
                transferAmountCurrency: currency,
            },
        ],
    },
    individualTransfers: [
        {
            transferId: uuid(),
            to: {
                idType,
                idValue: '67890',
            },
            amountType,
            currency,
            amount,
            transactionType,
        },
    ],
};

const transferWithoutQuote = {
    transferId,
    currency,
    amount,
};

test('constants', async (t) => {
    // to avoid test warnings
    t.pass();
});

module.exports = {
    transfer,
    newTransfer,
    transferWithoutQuote,
    bulkTransfer,
    newBulkTransfer,
    bulkTransferId,
    quote,
    quoteWithExtensionList,
    newQuote,
    newQuoteWithExtensionList,
    bulkQuote,
    newBulkQuote,
    transactionrequest,
    transactionRequestId,
    party,
    partyCreate,
    idType,
    idValue,
    transferId,
    partyWithSubIdValue,
    partyCreateWithSubIdValue,
    subIdValue,
};
