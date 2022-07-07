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

const router = require('~/lib/router');
const { testLogger } = require('~/test/unit/TestUtils');

test('Handles when a route cannot be found with a 404', async (t) => {
    // Arrange
    const ctx = {
        state: {
            path: { pattern: '*' },
            logger: testLogger(t),
        },
        response: {},
    };
    const nextFunction = () => {};
    const handlerMap = { }; // empty handler

    // Act
    await router(handlerMap)(ctx, nextFunction);

    // Assert
    t.is(ctx.response.status, 404, 'Router returned the wrong status');
});

test('Handles when a route can be found', async (t) => {
    // Arrange
    const ctx = {
        method: 'method1',
        state: {
            path: { pattern: '*' },
            logger: testLogger(t),
        },
        response: {},
    };
    const nextFunction = () => {};

    // Simple handler that sets the status to 200
    const handler = async (handlerCtx) => {
        // eslint-disable-next-line no-param-reassign
        handlerCtx.response.status = 200;
    };
    const handlerMap = { '*': { method1: handler } }; // simple handler

    // Act
    await router(handlerMap)(ctx, nextFunction);

    // Assert
    t.is(ctx.response.status, 200, 'Router returned the wrong status');
});
