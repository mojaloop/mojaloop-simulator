import http from 'k6/http';
import { crypto } from "k6/experimental/webcrypto";
import { check, group } from 'k6';
import { Trace } from "../common/trace.js";
import { getTwoItemsFromArray } from "../common/utils.js";

console.log(`Env Vars -->
  K6_SCRIPT_SIM_ENDPOINT_URL=${__ENV.K6_SCRIPT_SIM_ENDPOINT_URL},
  K6_SCRIPT_FSPIOP_FSP_POOL=${__ENV.K6_SCRIPT_FSPIOP_FSP_POOL}
`);

const fspList = JSON.parse(__ENV.K6_SCRIPT_FSPIOP_FSP_POOL)

export function postQuotes() {
  group("Post Quotes", function () {
    let payerFsp
    let payeeFsp

    const selectedFsps = getTwoItemsFromArray(fspList)
    payerFsp = selectedFsps[0]
    payeeFsp =  selectedFsps[1]

    const quoteId = crypto.randomUUID();
    const transactionId = crypto.randomUUID();
    const payerFspId = payerFsp['fspId'];
    const payeeFspId = payeeFsp['fspId'];

    const params = {
      tags: {
        payerFspId,
        payeeFspId
      },
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    const body = {
      quoteId,
      transactionId,
      to: {
          idType: 'MSISDN',
          idValue: payeeFspId,
      },
      from: {
          idType: 'MSISDN',
          idValue: payerFspId,
      },
      amountType: 'SEND',
      amount: '100',
      currency: 'USD',
      feesAmount: '0.5',
      feesCurrency: 'USD',
      transactionType: 'TRANSFER',
      initiator: 'PAYER',
      initiatorType: 'CONSUMER',
  };

    // Lets send the FSPIOP POST /quotes request
    const res = http.post(`${__ENV.K6_SCRIPT_SIM_ENDPOINT_URL}/quoterequests`, JSON.stringify(body), params);
    check(res, { 'QUOTES_FSPIOP_POST_QUOTES_RESPONSE_IS_200' : (r) => r.status == 200 });
  });
}
