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

const partyAccountsTable = 'account';
const partyTable = 'party';
const quoteTable = 'quote';
const transactionRequestTable = 'transactionRequest';
const transferTable = 'transfer';
const bulkQuoteTable = 'bulkQuote';
const bulkTransferTable = 'bulkTransfer';
const partyExtensionTable = 'partyExtension';

const createPartyTable = `
CREATE TABLE IF NOT EXISTS ${partyTable} (
    displayName TEXT,
    firstName TEXT,
    middleName TEXT,
    lastName TEXT,
    dateOfBirth TEXT,
    idType TEXT,
    idValue TEXT NOT NULL,
    idSubValue TEXT,
    CHECK(idValue <> '')
)
`;

// below index is a workaround to avoid the duplicates since sqlite treats every null as a unique value
// thus allowing to insert multiple records for same the idValue having idSubValue as NULL
const createPartyTableUniqueIndex = `
CREATE UNIQUE INDEX IF NOT EXISTS idx_party_unique ON ${partyTable} (
    idValue,
    IFNULL(idSubValue, '')
)
`;

const createPartyExtensionTable = `
CREATE TABLE IF NOT EXISTS ${partyExtensionTable} (
    idValue TEXT NOT NULL,
    idSubValue TEXT,
    key TEXT NOT NULL,
    value TEXT NOT NULL
)
`;

// below index is a workaround to avoid the duplicates since sqlite treats every null as a unique value
// thus allowing to insert multiple records for same the idValue/key having idSubValue as NULL
const createPartyExtensionTableUniqueIndex = `
CREATE UNIQUE INDEX IF NOT EXISTS idx_party_extension_unique ON ${partyExtensionTable} (
    idValue,
    IFNULL(idSubValue, ''),
    key
)
`;

const createQuoteTable = `
CREATE TABLE IF NOT EXISTS ${quoteTable} (
    id TEXT NOT NULL PRIMARY KEY,
    request TEXT,
    response TEXT,
    created TIMESTAMP
    CHECK(id <> '')
)
`;

const createBulkQuoteTable = `
CREATE TABLE IF NOT EXISTS ${bulkQuoteTable} (
    id TEXT NOT NULL PRIMARY KEY,
    request TEXT,
    response TEXT,
    created TIMESTAMP
    CHECK(id <> '')
)
`;

const createTransactionRequestTable = `
CREATE TABLE IF NOT EXISTS ${transactionRequestTable} (
    id TEXT NOT NULL PRIMARY KEY,
    request TEXT,
    response TEXT,
    created TIMESTAMP
    CHECK(id <> '')
)
`;

const createTransferTable = `
CREATE TABLE IF NOT EXISTS ${transferTable} (
    id TEXT NOT NULL PRIMARY KEY,
    request TEXT,
    response TEXT,
    CHECK(id <> '')
)
`;

const createBulkTransferTable = `
CREATE TABLE IF NOT EXISTS ${bulkTransferTable} (
    id TEXT NOT NULL PRIMARY KEY,
    request TEXT,
    response TEXT,
    CHECK(id <> '')
)
`;

const createAccountTable = `
CREATE TABLE IF NOT EXISTS ${partyAccountsTable} (
    address TEXT NOT NULL PRIMARY KEY,
    currency TEXT NOT NULL,
    description TEXT NOT NULL,
    idValue TEXT NOT NULL,
    idSubValue TEXT
)
`;

// below index is a workaround to avoid the duplicates since sqlite treats every null as a unique value
// thus allowing to insert multiple records for same the idValue/key having idSubValue as NULL
const createAccountTableUniqueIndex = `
CREATE UNIQUE INDEX IF NOT EXISTS idx_party_account_unique ON ${partyAccountsTable} (
    idValue,
    IFNULL(idSubValue, ''),
    address
)
`;

module.exports = {
    partyTable,
    quoteTable,
    bulkQuoteTable,
    transferTable,
    bulkTransferTable,
    transactionRequestTable,
    partyExtensionTable,
    createPartyTable,
    createQuoteTable,
    createBulkQuoteTable,
    createBulkTransferTable,
    createTransactionRequestTable,
    createTransferTable,
    createPartyExtensionTable,
    createPartyTableUniqueIndex,
    createPartyExtensionTableUniqueIndex,
    partyAccountsTable,
    createAccountTable,
    createAccountTableUniqueIndex,
};
