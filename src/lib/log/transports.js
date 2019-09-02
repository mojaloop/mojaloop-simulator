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
// TODO: consider: https://github.com/JoshuaWise/better-sqlite3
// TODO: consider moving this require into the sqliteTransport function
const sqlite = require('sqlite');

const nullTransport = () => { };

const consoleDir = () => (msg) => {
  console.dir(JSON.parse(msg), { depth: Infinity, colors: true });
};

const stdout = () => (msg) => {
  process.stdout.write(msg);
  process.stdout.write('\n');
};

const file = (path) => {
  // TODO: check this isn't in object mode. See here for more:
  // https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback
  const stream = fs.createWriteStream(path, { flags: 'a' });
  // TODO: when the filesystem fills up?
  // TODO: Implement a reject case
  return async msg => new Promise((res) => {
    if (!stream.write(msg)) {
      stream.once('drain', res);
    } else {
      res();
    }
  });
};

const sqliteTransport = async (path) => {
  // TODO: enable db object cache? https://github.com/mapbox/node-sqlite3/wiki/Caching
  const db = await sqlite.open(path);
  await db.run('CREATE TABLE IF NOT EXISTS log(timestamp TEXT, entry TEXT)');
  await db.run('CREATE INDEX IF NOT EXISTS log_timestamp_index ON log(timestamp)');
  // TODO: when the filesystem fills up?
  //       - set a maximum table size? Discard earlier entries when full?
  return async ($msg, timestamp) => {
    const $ts = timestamp.toISOString();
    await db.run('INSERT INTO log(timestamp, entry) VALUES ($ts, json($msg))', { $ts, $msg });
  };
};

module.exports = {
  stdout,
  sqlite: sqliteTransport,
  file,
  consoleDir,
  nullTransport,
};
