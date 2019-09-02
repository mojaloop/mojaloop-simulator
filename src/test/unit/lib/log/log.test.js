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

const {
    Logger, Transports, getStackOrInspect, _replaceOutput,
} = require('@internal/log');

test('sets the space', (t) => {
    const testTransport = (input) => input;
    const logger = new Logger({
        context: { app: 'simulator' },
        space: 2,
        transports: [testTransport],
    });

    logger.setSpace(10);
    t.is(true, true);
});

test('initializes the logger and prints', (t) => {
    // Arrange
    const logger = new Logger({
        context: { app: 'simulator' },
        space: 2,
        transports: [Transports.nullTransport],
    });

    // Act
    logger.push('Testing 123').log('Testing 456');

    // Assert
    t.pass();
});

test('initializes with an empty or no context', (t) => {
    // Arrange
    const logger = new Logger();

    // Act
    logger.push('Testing 123').log('Testing 456');

    // Assert
    t.pass();
});

test('logs an empty message', (t) => {
    // Arrange
    const logger = new Logger();

    // Act
    logger.push();
    logger.log();

    // Assert
    t.pass();
});

test('Throws when initializing a logger with reserved words', (t) => {
    // Arrange
    t.throws(() => {
        // eslint-disable-next-line no-new
        new Logger({
            context: { timestamp: '12345' },
        });
    });

    t.throws(() => {
        // eslint-disable-next-line no-new
        new Logger({
            context: { msg: '12345' },
        });
    });

    // Assert
    t.pass();
});

test('getStackOrInspect prints an error stack', (t) => {
    // Arrange
    const error = new Error('This is an error with a stack.');

    // Act
    const result = getStackOrInspect(error);

    // Assert
    t.is(result, error.stack, 'values should match');
});

test('getStackOrInspect inspects an error with no stack', (t) => {
    // Arrange
    const error = 'This is a bad error, with no stack';

    // Act
    const result = getStackOrInspect(error);

    // Assert
    t.is(result, `'${error}'`, 'values should match');
});


test('getStackOrInspect gets nested data', (t) => {
    // Arrange
    const error = { a: { b: { c: { d: { e: 'This is a bad error, with no stack' } } } } };

    // Act
    const resultDefault = getStackOrInspect(error);
    const resultDepth4 = getStackOrInspect(error, { depth: 4 });

    // Assert
    t.notDeepEqual(resultDefault, resultDepth4, 'Values should not match.');
});

test('replaceOutput handles a function', (t) => {
    // Arrange
    const input = (a) => `You gave me ${a}.`;
    const expected = '[Function: input]';

    // Act
    const result = _replaceOutput(null, input);

    // Assert
    t.is(result, expected, 'Expected values to match');
});

test('replaceOutput handles a regex', (t) => {
    // Arrange
    const input = /\{[^{}]+\}/g;
    const expected = '/\\{[^{}]+\\}/g';

    // Act
    const result = _replaceOutput(null, input);

    // Assert
    t.is(result, expected, 'Expected values to match');
});
