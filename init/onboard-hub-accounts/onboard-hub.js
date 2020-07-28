const uuid = require('uuid');
const {
  onboarding: {
    createHubAccounts
  },
} = require('@mojaloop/finance-portal-lib');

function log(message) {
  const timestamp = (new Date()).toISOString();
  // eslint-disable-next-line no-console
  console.log(`[${timestamp}] ${message}`);
}

console.log('ENV:');
console.table({
  ACCOUNTS: process.env.ACCOUNTS,
  AUTH_BEARER_TOKEN: process.env.AUTH_BEARER_TOKEN,
  HOST_CENTRAL_LEDGER: process.env.HOST_CENTRAL_LEDGER,
  HUB_OPERATOR_NAME: process.env.HUB_OPERATOR_NAME,
});

const accounts = JSON.parse(process.env.ACCOUNTS);
const authToken = process.env.AUTH_BEARER_TOKEN;
const hostCentralLedger = process.env.HOST_CENTRAL_LEDGER;
const fspiopSource = process.env.HUB_OPERATOR_NAME;

async function onboardHubAccounts() {
  try {
    log('EXE: INIT: sendRequest->createHubAccounts');
    const requests = accounts.map((acc) => createHubAccounts({ authToken, fspiopSource, ...acc }));

    // Deliberately sequential
    requests.forEach((req) => {
      const response = await sendRequest(createHubAccounts({
        authToken,
        hostCentralLedger,
        baseCentralLedgerAdmin,
        fspiopSource,
      }));
      if (response.ok) {
        log('EXE: SUCC: sendRequest->createHubAccounts');
      } else {
        const error = await response.json();
        // Allow re-registering of the same hub account
        if (
          response.status === 400 &&
          error.errorInformation.errorCode === '3003' &&
          /already/.test(error.errorInformation.errorDescription)
        ) {
          log(`EXE: FAIL: sendRequest->createHubAccounts:\t\t\t${JSON.stringify(error)}`);
          log('EXE: INFO: Allowed failure:\t\t\t\tContinuing');
        } else {
          throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
        }
      }
    })

  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->createHubAccounts:\t${message}`);
    process.exitCode = 1;
    return;
  }
}

onboardHubAccounts();
