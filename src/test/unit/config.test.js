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

 * ModusBox <https://modusbox.com>
 - Steven Oderayi <steven.oderayi@modusbox.com>
 --------------
 ******/
'use strict';

const test = require('ava');
const { setConfig, getConfig } = require('../../config');


// Note: these were originally 3 different tests, which I had to combine into 1
// because of the way that ava tries to run the tests in paralell, which was causing
// issues with the global scope of config

test('Sets the basic config', async (t) => {
    // Arrange
    const env = {
        MUTUAL_TLS_ENABLED: 'false',
        HTTPS_ENABLED: 'false',
    };
    const expected = {
        tls:
        {
            enabled: false,
            mutualTLS: { enabled: false },
            creds: { ca: null, cert: null, key: null },
        },
        ports: {
            simulatorApi: 3000,
            reportApi: 3002,
            testApi: 3003,
        },
    };

    // Act
    await setConfig(env);
    const result = getConfig();

    // Assert
    t.deepEqual(result, expected, 'Values should match.');

    /* Test 2 - Fails if Mutual TLS is enabled, but HTTPS is disabled */
    // Arrange
    const env2 = {
        MUTUAL_TLS_ENABLED: 'true',
        HTTPS_ENABLED: 'false',
    };

    // Act
    const error = await t.throwsAsync(async () => {
        await setConfig(env2);
    });

    // Assert
    t.is(error.message, 'Mutual TLS enabled, but HTTPS disabled', 'Error messages should match');

    /* Test 3 - Reads CA files */

    // Arrange
    const env3 = {
        MUTUAL_TLS_ENABLED: 'true',
        HTTPS_ENABLED: 'true',
        CA_CERT_PATH: '/dev/null',
        SERVER_CERT_PATH: '/dev/null',
        SERVER_KEY_PATH: '/dev/null',
    };

    // Act
    await setConfig(env3);

    // Assert
    t.pass();
});
