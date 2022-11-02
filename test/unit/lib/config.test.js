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
const fs = require('fs');

test.before(async () => {
    // clear require caches in-case config is pre-loaded
    delete require.cache[require.resolve('#src/lib/config')];
    delete require.cache[require.resolve('dotenv')];
});

test.afterEach(async () => {
    // clear require caches for other tests
    delete require.cache[require.resolve('#src/lib/config')];
    delete require.cache[require.resolve('dotenv')];
});

test('Check config is loaded with example.env', async (t) => {
    // SETUP
    const testConfig = './example.env';

    // ACT
    // Load config
    const config = await require('#src/lib/config')(testConfig);
    // eslint-disable-next-line no-console
    console.log(config);

    // ASSERT
    t.truthy(config.parsed);
});

test('Check config fails to load', async (t) => {
    // SETUP
    const testConfig = 'doesNotExist.env';

    // ACT
    // Load config
    const config = await require('#src/lib/config')(testConfig);
    // eslint-disable-next-line no-console
    console.log(config.error);

    // ASSERT
    t.truthy(config.error);
});

test('Check config with defaults', async (t) => {
    // SETUP
    const testConfig = './.env';

    // ACT
    try {
        // lets handle the case that the default config exists
        if (fs.existsSync(testConfig)) {
            // Load config with defaults
            const config = await require('#src/lib/config')();
            // eslint-disable-next-line no-console
            console.log(config);

            // ASSERT
            t.truthy(config.parsed);
        } else { // lets handle the case that the default config does not exist
            // ACT
            // Load config with defaults
            const config = await require('#src/lib/config')();
            // eslint-disable-next-line no-console
            console.log(config);

            // ASSERT
            t.truthy(config.error);
        }
    } catch(err) {
        // eslint-disable-next-line no-console
        console.error(err);
        // ASSERT
        t.fail(err);
    }
});
