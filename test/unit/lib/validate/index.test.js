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

 * Vessels Tech
 - Lewis Daly <lewis@vesselstech.com>
 --------------
 ******/
'use strict';

const test = require('ava');
const sinon = require('sinon');
const yaml = require('yamljs');
const { v1: uuid } = require('uuid');

const Validate = require('#src/lib/validate');
const Logger = require('@mojaloop/central-services-logger');
const { LogLayer, LoggerType } = require('loglayer');

const simApiSpec = yaml.load('./src/simulator/api.yaml');

let sandbox;
let logLayer;

test.beforeEach(async () => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Logger, 'info');
    sandbox.stub(Logger, 'error');
    sandbox.stub(Logger, 'debug');
    sandbox.stub(Logger, 'isInfoEnabled').value(true);
    sandbox.stub(Logger, 'isErrorEnabled').value(true);
    sandbox.stub(Logger, 'isDebugEnabled').value(true);
    logLayer = new LogLayer({
        logger: {
            instance: Logger,
            type: LoggerType.WINSTON,
        },
        context: {
            // we'll put our context into a field called context
            fieldName: 'context'
        }
    }).withContext({
        app: 'simulator'
    });
    sandbox.stub(logLayer, 'info');
    sandbox.stub(logLayer, 'error');
    sandbox.stub(logLayer, 'debug');
});

test.afterEach.always(async () => {
    sandbox.restore();
});

test('Validates a simple request', async (t) => {
    // Arrange
    const validator = new Validate();
    const ctx = {
        path: '/',
        method: 'GET',
        params: {},
        request: {
            body: {},
            headers: {},
            query: {},
        },
    };

    // Act
    await validator.initialise(simApiSpec);
    validator.validateRequest(ctx, logLayer);

    // Assert
    t.pass();
});

test('Validation fails with wrong method', async (t) => {
    // Arrange
    const validator = new Validate();
    const ctx = {
        path: '/participants/MSISDN/12345',
        method: 'POST',
        params: {},
        request: {
            body: {},
            headers: {},
            query: {},
        },
    };

    // Act
    await validator.initialise(simApiSpec);
    t.throws(() => {
        validator.validateRequest(ctx, logLayer);
    });

    // Assert
    t.pass();
});

test('Validation fails with wrong path', async (t) => {
    // Arrange
    const validator = new Validate();
    const ctx = {
        path: '/marticipants/MSISDN',
        method: 'GET',
        params: {},
        request: {
            body: {},
            headers: {},
            query: {},
        },
    };

    // Act
    await validator.initialise(simApiSpec);
    t.throws(() => {
        validator.validateRequest(ctx, logLayer);
    });

    // Assert
    t.pass();
});

test('Validation gets a path param', async (t) => {
    // Arrange
    const validator = new Validate();
    const ctx = {
        path: '/participants/MSISDN/12345',
        method: 'GET',
        params: {
            idType: 'MSISDN',
            idValue: '12345',
        },
        request: {
            body: {},
            headers: {},
            query: {},
        },
    };

    // Act
    await validator.initialise(simApiSpec);
    validator.validateRequest(ctx, logLayer);

    // Assert
    t.pass();
});

test('Validation parses a request body', async (t) => {
    // Arrange
    const validator = new Validate();
    const body = {
        quoteId: uuid(),
        transactionId: uuid(),
        to: {
            idType: 'MSISDN',
            idValue: '12345',
        },
        from: {
            idType: 'MSISDN',
            idValue: '54321',
        },
        amountType: 'SEND',
        amount: '100',
        currency: 'XOF',
        transactionType: 'TRANSFER',
        initiator: 'PAYER',
        initiatorType: 'CONSUMER',
    };

    const ctx = {
        path: '/quoterequests',
        method: 'POST',
        params: {
            idType: 'MSISDN',
            idValue: '12345',
        },
        request: {
            body,
            headers: {},
            query: {},
        },
    };

    // Act
    await validator.initialise(simApiSpec);
    validator.validateRequest(ctx, logLayer);

    // Assert
    t.pass();
});

test('Validation fails on an invalid body', async (t) => {
    // Arrange
    const validator = new Validate();
    const body = {
        quoteId: uuid(),
        transactionId: uuid(),
        to: {
            // missing fields!
        },
        from: {
            idType: 'MSISDN',
            idValue: '54321',
        },
        amountType: 'SEND',
        amount: '100',
        currency: 'XOF',
        transactionType: 'TRANSFER',
        initiator: 'PAYER',
        initiatorType: 'CONSUMER',
    };

    const ctx = {
        path: '/quoterequests',
        method: 'POST',
        params: {
            idType: 'MSISDN',
            idValue: '12345',
        },
        request: {
            body,
            headers: {
                'Content-Type': 'application/json',
            },
            query: {},
        },
    };

    // Act
    await validator.initialise(simApiSpec);
    t.throws(() => {
        validator.validateRequest(ctx, logLayer);
    });

    // Assert
    t.pass();
});
