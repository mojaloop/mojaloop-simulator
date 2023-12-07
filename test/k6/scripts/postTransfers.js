import http from 'k6/http';
import { crypto } from "k6/experimental/webcrypto";
import { check, group } from 'k6';
import exec from 'k6/execution';
import { getTwoItemsFromArray } from "../common/utils.js";

console.log(`Env Vars -->
  K6_SCRIPT_SIM_ENDPOINT_URL=${__ENV.K6_SCRIPT_SIM_ENDPOINT_URL},
  K6_SCRIPT_FSPIOP_FSP_POOL=${__ENV.K6_SCRIPT_FSPIOP_FSP_POOL},
`);

const fspList = JSON.parse(__ENV.K6_SCRIPT_FSPIOP_FSP_POOL)

const abortOnError = (__ENV.K6_SCRIPT_ABORT_ON_ERROR && __ENV.K6_SCRIPT_ABORT_ON_ERROR.toLowerCase() === 'true') ? true : false

export function postTransfers() {
  group("Post Transfers", function () {
    let payerFsp
    let payeeFsp

    if (__ENV.UNIDIRECTIONAL === "true" || __ENV.UNIDIRECTIONAL === "TRUE") {
      payerFsp = fspList[0]
      payeeFsp =  fspList[1]
    } else {
      const selectedFsps = getTwoItemsFromArray(fspList)
      payerFsp = selectedFsps[0]
      payeeFsp =  selectedFsps[1]
    }

    const transferId = crypto.randomUUID();
    const quoteId = crypto.randomUUID();
    const payerFspId = payerFsp['fspId'];
    const payeeFspId = payeeFsp['fspId'];

    const params = {
      tags: {
        payerFspId,
        payeeFspId
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const body = {
      transferId,
      quote: {
        quoteId,
        transactionId: transferId,
        transferAmount: 100,
        transferAmountCurrency: "USD"
      },
      from: {
        idType: "MSISDN",
        idValue: payerFspId
      },
      to: {
        idType: "MSISDN",
        idValue: payeeFspId
      },
      amountType: "SEND",
      currency: "USD",
      amount: "100",
      transactionType: "TRANSFER",
      ilpPacket: {
        data: {
          amount: {
            amount: 100,
            currency: "USD"
          },
          quoteId,
          transactionId: transferId,
          transactionType: {
            initiator: "PAYER",
            initiatorType: "CONSUMER",
            scenario: "TRANSFER"
          }
        }
    }
    }

    // Lets send the FSPIOP POST /transfers request
    const res = http.post(`${__ENV.K6_SCRIPT_SIM_ENDPOINT_URL}/transfers`, JSON.stringify(body), params);
    check(res, { 'TRANSFERS_FSPIOP_POST_TRANSFERS_RESPONSE_IS_200' : (r) => r.status == 200 });

    if (abortOnError && res.status != 200) {
      // Abort the entire k6 test exection runner
      console.error(traceId, `FSPIOP POST /transfers returned status: ${res.status}`);
      ws.close();
      exec.test.abort()
    }
  });
}
