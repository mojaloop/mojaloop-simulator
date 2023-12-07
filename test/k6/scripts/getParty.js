import http from 'k6/http';
import { check, group } from 'k6';

console.log(`Env Vars -->
  K6_SCRIPT_SIM_ENDPOINT_URL=${__ENV.K6_SCRIPT_SIM_ENDPOINT_URL},
  K6_SCRIPT_FSPIOP_FSP_POOL=${__ENV.K6_SCRIPT_FSPIOP_FSP_POOL},
`);

const fspList = JSON.parse(__ENV.K6_SCRIPT_FSPIOP_FSP_POOL)


export function getParty() {
  group("Get Parties", function () {
    const partyId = fspList[0]['partyId'];

    // Lets send the GET /party request to the Simulator
    const res = http.get(`${__ENV.K6_SCRIPT_SIM_ENDPOINT_URL}/parties/MSISDN/${partyId}`);
    check(res, { 'SIM_GET_PARTY_RESPONSE_IS_202' : (r) => r.status == 200 });
  });
}
