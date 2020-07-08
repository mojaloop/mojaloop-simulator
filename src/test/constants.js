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
const Chance = require('chance');
const uuid = require('uuid/v1');

const chance = new Chance();
const randName = chance.name({ suffix: true, middle: true });
const transferId = uuid();
const transactionRequestId = uuid();
const idType = 'msisdn';
const idValue = uuid();
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

const authorizationRequest = {
    authenticationType: 'U2F',
    retriesLeft: '1',
    amount: {
        currency: 'USD',
        amount: '100',
    },
    transactionId: '2f169631-ef99-4cb1-96dc-91e8fc08f539',
    transactionRequestId: '02e28448-3c05-4059-b5f7-d518d0a2d8ea',
    quote: {
        transferAmount: {
            currency: 'USD',
            amount: '100',
        },
        payeeReceiveAmount: {
            currency: 'USD',
            amount: '99',
        },
        payeeFspFee: {
            currency: 'USD',
            amount: '1',
        },
        payeeFspCommission: {
            currency: 'USD',
            amount: '0',
        },
        expiration: '2020-05-17T15:28:54.250Z',
        geoCode: {
            latitude: '+45.4215',
            longitude: '+75.6972',
        },
        ilpPacket: 'AYIBgQAAAAAAAASwNGxldmVsb25lLmRmc3AxLm1lci45T2RTOF81MDdqUUZERmZlakgy...',
        condition: 'f5sqb7tBTWPd5Y8BDFdMm9BJR_MNI4isf8p8n4D5pHA',
        extensionList: {
            extension: [
                {
                    key: 'errorDescription1',
                    value: 'This is a more detailed error description',
                },
            ],
        },
    },
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
    quote,
    transactionrequest,
    party,
    partyCreate,
    newQuote,
    newTransfer,
    transferWithoutQuote,
    idType,
    idValue,
    transferId,
    authorizationRequest,
    transactionRequestId,
};
