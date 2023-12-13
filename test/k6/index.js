export { getPartyScenarios } from './scenarios/getParty.js';
export { postQuotesScenarios } from './scenarios/postQuotes.js';
export { postTransfersScenarios } from './scenarios/postTransfers.js';

// export { fspiopTransfersScenarios } from './scenarios/fspiopTransfers.js';
// export { fspiopTransfersNoCallbackScenarios } from './scenarios/fspiopTransfersNoCallback.js';

const configFile = __ENV.K6_SCRIPT_CONFIG_FILE_NAME ? './config/' + __ENV.K6_SCRIPT_CONFIG_FILE_NAME : './config/test.json';
const testConfig = JSON.parse(open(configFile));

export const options = Object.assign(
  { // default configs
    tags: {
      testid: `${Date.now()}`,
    },
  },
  testConfig
);

// used to store global variables
globalThis.VARS = [];

// global min/max sleep durations (in seconds):
globalThis.PAUSE_MIN = __ENV.K6_SCRIPT_PAUSE_MIN || 5;
globalThis.PAUSE_MAX = __ENV.K6_SCRIPT_PAUSE_MAX || 15;

export default async () => {
  console.log("No scenarios found in config/test.json. Executing default function...");
}
