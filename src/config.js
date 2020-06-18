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

const fs = require('fs');

// A promise wrapper around fs.readFile
// Redundant on node 10 and above, use require('fs').promises instead
async function readFile(...args) {
    const p = new Promise((resolve, reject) => {
        fs.readFile(...args, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
    return p;
}


// TODO: implement toString, toJSON toAnythingElse methods on config so that secrets can't be
// printed
const config = {
    tls: {
        enabled: true,
        mutualTLS: { enabled: false },
        creds: { // copied directly into https opts; check usage before modifying
            ca: null,
            cert: null,
            key: null,
        },
    },
    ports: {
        simulatorApi: 3000,
        reportApi: 3002,
        testApi: 3003,
    },
};


const setConfig = async (cfg) => {
    config.tls.mutualTLS.enabled = cfg.MUTUAL_TLS_ENABLED.toLowerCase() !== 'false';
    config.tls.enabled = cfg.HTTPS_ENABLED !== 'false';
    // Getting secrets from files instead of environment variables reduces the likelihood of
    // accidental leakage. Nobody dumps
    if (config.tls.mutualTLS.enabled && !config.tls.enabled) {
        throw new Error('Mutual TLS enabled, but HTTPS disabled');
    }
    if (config.tls.mutualTLS.enabled || config.tls.enabled) {
        [config.tls.creds.ca, config.tls.creds.cert, config.tls.creds.key] = await Promise.all([
            readFile(cfg.CA_CERT_PATH),
            readFile(cfg.SERVER_CERT_PATH),
            readFile(cfg.SERVER_KEY_PATH),
        ]);
    }
    config.ports.simulatorApi = cfg.SIMULATOR_API_LISTEN_PORT || config.ports.simulatorApi;
    config.ports.reportApi = cfg.REPORT_API_LISTEN_PORT || config.ports.reportApi;
    config.ports.testApi = cfg.TEST_API_LISTEN_PORT || config.ports.testApi;
};


const getConfig = () => config;


module.exports = {
    getConfig,
    setConfig,
};
