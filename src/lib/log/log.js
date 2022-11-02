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

const util = require('util');

const Transports = require('#src/lib/log/transports');

// TODO: Is `key` necessary input to the replaceOutput function?
const replaceOutput = (key, value) => {
    if (value instanceof Error) {
        return Object
            .getOwnPropertyNames(value)
            .reduce((acc, objectKey) => ({ ...acc, [objectKey]: value[objectKey] }), {});
    }
    if (value instanceof RegExp) {
        return value.toString();
    }
    if (value instanceof Function) {
        return `[Function: ${value.name || 'anonymous'}]`;
    }
    return value;
};

/**
 * @function getStackOrInspect
 * @description Given an anonymous error, return said error's stack if it has it, or util.inspect it
 * @param {any} err - The error object to inspect
 */
const getStackOrInspect = (err, options = null) => err.stack || util.inspect(err, options);

module.exports = {
    Transports,
    getStackOrInspect,
    // Export for unit testing only
    _replaceOutput: replaceOutput,
};
