const axios = require('axios');
const { v4 } = require('uuid');

const axiosConfig = {
    headers: {
        'Content-Type': 'application/json',
    },
};

describe('handlers', () => {
    it('GET /health', async () => {
    // Arrange
        const uri = 'http://localhost:3000/health';
        const expected = {
            status: 'OK',
        };

        // Act
        const result = (await axios.get(uri)).data;

        // Assert
        expect(result).toStrictEqual(expected);
    });

    it('POST /validateConsentRequests returns the mock payload for consentRequestId `b51ec534-ee48-4575-b6a9-ead2955b8069`', async () => {
    // Arrange
        const payload = {
            consentRequestId: 'b51ec534-ee48-4575-b6a9-ead2955b8069',
            userId: 'dfspa.username',
            scopes: [
                {
                    accountId: 'dfspa.username.1234',
                    actions: [
                        'accounts.transfer',
                        'accounts.getBalance',
                    ],
                },
                {
                    accountId: 'dfspa.username.5678',
                    actions: [
                        'accounts.transfer',
                        'accounts.getBalance',
                    ],
                },
            ],
            authChannels: [
                'WEB',
                'OTP',
            ],
            callbackUri: 'pisp-app://callback.com',
        };
        const expected = {
            isValid: true,
            data: {
                authChannels: [
                    'WEB',
                ],
                authUri: 'http://localhost:6060/admin/dfsp/authorize?consentRequestId=b51ec534-ee48-4575-b6a9-ead2955b8069&callbackUri=http://localhost:42181/flutter-web-auth.html',
            },
        };
        const uri = 'http://localhost:3000/validateConsentRequests';

        // Act
        const result = (await axios.post(uri, payload, axiosConfig)).data;

        // Assert
        expect(result).toStrictEqual(expected);
    });

    it('POST /validate-thirdparty-transaction-request a FIXED_CALLBACK`', async () => {
        // Arrange
        const payload = {
            transactionRequestId: v4(),
            payee: {
                partyIdInfo: {
                    partyIdType: 'MSISDN',
                    partyIdentifier: '4412345678',
                },
            },
            payer: {
                partyIdType: 'THIRD_PARTY_LINK',
                partyIdentifier: 'qwerty1234',
            },
            amountType: 'SEND',
            amount: {
                currency: 'USD',
                amount: '100',
            },
            transactionType: {
                scenario: 'TRANSFER',
                initiator: 'PAYER',
                initiatorType: 'CONSUMER',
            },
            expiration: (new Date()).toISOString(),
        };
        const expected = {
            isValid: true,
            payerPartyIdInfo: {
                partyIdType: 'MSISDN',
                partyIdentifier: '123456789',
                fspId: 'dfspa',
            },
            consentId: '46876aac-5db8-4353-bb3c-a6a905843ce7',
        };
        const uri = 'http://localhost:3000/validate-thirdparty-transaction-request';

        // Act
        const result = (await axios.post(uri, payload, axiosConfig)).data;

        // Assert
        expect(result).toStrictEqual(expected);
    });
});
