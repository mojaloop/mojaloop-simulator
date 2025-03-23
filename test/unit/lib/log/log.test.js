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
 * Vessels Tech
 - Lewis Daly <lewis@vesselstech.com>
 --------------
 ******/
'use strict';

const test = require('ava');

const {
    getStackOrInspect
} = require('#src/lib/log/log');

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
