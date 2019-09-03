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
'use strict'

const fs = require('fs');
const RC = require('rc')('ML_SIM', require('../config/default.js'))

module.exports = {
  tls: {
    enabled: RC.tls.enabled,
    mutualTLS: { 
      enabled: RC.tls.mutualTLS.enabled,
    },
    creds: {
      ca: fs.readFileSync(RC.CA_CERT_PATH),
      cert: fs.readFileSync(RC.SERVER_CERT_PATH),
      key: fs.readFileSync(RC.SERVER_KEY_PAT),
    },
  },
  LOG_INDENT: RC.LOG_INDENT,
  SQLITE_LOG_FILE: RC.SQLITE_LOG_FILE,
  MODEL_DATABASE: RC.MODEL_DATABASE,
  OUTBOUND_ENDPOINT: RC.OUTBOUND_ENDPOINT,
  DFSP_ID: RC.DFSP_ID,
  FEE_MULTIPLIER: RC.FEE_MULTIPLIER,
  RULES_FILE: RC.RULES_FILE,
  SIMULATOR_PORT: RC.SIMULATOR_PORT,
  REPORT_PORT: RC.REPORT_PORT,
  TEST_API_PORT: RC.TEST_API_PORT,
}