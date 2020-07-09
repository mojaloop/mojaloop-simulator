const uuid = require('uuid');
const {
  onboarding: {
    sendRequest,
    settlementIdFromHubAccounts,
    getDfspAccounts,
    addDfsp,
    addInitialPositionAndLimits,
    depositFunds,
    addCallbackParticipantPut,
    addCallbackParticipantPutError,
    addCallbackParticipantPutBatch,
    addCallbackParticipantPutBatchError,
    addCallbackPartiesGet,
    addCallbackPartiesPut,
    addCallbackPartiesPutError,
    addCallbackQuotes,
    addCallbackTransferPost,
    addCallbackTransferPut,
    addCallbackTransferError,
    setEmailNetDebitCapAdjustment,
    setEmailSettlementTransferPositionChange,
    setEmailNetDebitCapThresholdBreach,
  },
} = require('@mojaloop/finance-portal-lib');

function log(message) {
  const timestamp = (new Date()).toISOString();
  // eslint-disable-next-line no-console
  console.log(`[${timestamp}] ${message}`);
}

log(`ENV: AUTH_BEARER_TOKEN:\t\t\t\t${process.env.AUTH_BEARER_TOKEN}`);
log(`ENV: BASE_CENTRAL_LEDGER_ADMIN:\t\t\t${process.env.BASE_CENTRAL_LEDGER_ADMIN}`);
log(`ENV: DFSP_CALLBACK_URL:\t\t\t\t${process.env.DFSP_CALLBACK_URL}`);
log(`ENV: DFSP_CURRENCY:\t\t\t\t\t${process.env.DFSP_CURRENCY}`);
log(`ENV: DFSP_NAME:\t\t\t\t\t${process.env.DFSP_NAME}`);
log(`ENV: DFSP_PARTY_ID:\t\t\t\t\t${process.env.DFSP_PARTY_ID}`);
log(`ENV: DFSP_PARTY_ID_TYPE:\t\t\t\t${process.env.DFSP_PARTY_ID_TYPE}`);
log(`ENV: FUNDS_IN_PREPARE_AMOUNT:\t\t\t${process.env.FUNDS_IN_PREPARE_AMOUNT}`);
log(`ENV: HOST_CENTRAL_LEDGER:\t\t\t\t${process.env.HOST_CENTRAL_LEDGER}`);
log(`ENV: HUB_OPERATOR_NAME:\t\t\t\t${process.env.HUB_OPERATOR_NAME}`);
log(`ENV: INITIAL_POSITION:\t\t\t\t${process.env.INITIAL_POSITION}`);
log(`ENV: NDC_ADJUSTMENT_EMAIL:\t\t\t\t${process.env.NDC_ADJUSTMENT_EMAIL}`);
log(`ENV: NDC_THRESHOLD_BREACH_EMAIL:\t\t\t${process.env.NDC_THRESHOLD_BREACH_EMAIL}`);
log(`ENV: NET_DEBIT_CAP:\t\t\t\t\t${process.env.NET_DEBIT_CAP}`);
log(`ENV: SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL:\t${process.env.SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL}`);

const amount = process.env.FUNDS_IN_PREPARE_AMOUNT;
const authToken = process.env.AUTH_BEARER_TOKEN;
const baseCentralLedgerAdmin = process.env.BASE_CENTRAL_LEDGER_ADMIN;
const dfspCallbackUrl = process.env.DFSP_CALLBACK_URL;
const dfspCurrency = process.env.DFSP_CURRENCY;
const dfspPartyIdType = process.env.DFSP_PARTY_ID_TYPE;
const dfspPartyId = process.env.DFSP_PARTY_ID;
const dfspName = process.env.DFSP_NAME;
const fspiopSource = process.env.HUB_OPERATOR_NAME;
const hostCentralLedger = process.env.HOST_CENTRAL_LEDGER;
const initialPosition = parseInt(process.env.INITIAL_POSITION, 10);
log(`LOC: initialPosition:\t\t\t\t${initialPosition}`);
const netDebitCap = parseInt(process.env.NET_DEBIT_CAP, 10);
log(`LOC: netDebitCap:\t\t\t\t\t${netDebitCap}`);
const ndcAdjustmentEmail = process.env.NDC_ADJUSTMENT_EMAIL;
const ndcThresholdBreachEmail = process.env.NDC_THRESHOLD_BREACH_EMAIL;
const settlementTransferPositionChangeEmail = process.env.SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL;

async function onboardDfsp() {
  try {
    log('EXE: INIT: sendRequest->addDfsp');
    const response = await sendRequest(addDfsp({
      dfspName,
      dfspCurrency,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->addDfsp');
    } else {
      const error = await response.json();
      // Allow re-registering of the same DFSP name and currency
      if (response.status === 400 && error.errorInformation.errorCode === '3000'
        && /already/.test(error.errorInformation.errorDescription)) {
        log(`EXE: FAIL: sendRequest->addDfsp:\t\t\t${JSON.stringify(error)}`);
        log('EXE: INFO: Allowed failure:\t\t\t\tProceeding with next request');
      } else {
        throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
      }
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addDfsp:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addInitialPositionAndLimits');
    const response = await sendRequest(addInitialPositionAndLimits({
      dfspName,
      dfspCurrency,
      netDebitCap,
      initialPosition,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->addInitialPositionAndLimits');
    } else {
      const error = await response.json();
      // Allow re-registering
      if (response.status === 500 && error.errorInformation.errorCode === '2001'
      && /already/.test(error.errorInformation.errorDescription)) {
        log(`EXE: FAIL: sendRequest->addInitialPositionAndLimits:\t${JSON.stringify(error)}`);
        log('EXE: INFO: Allowed failure:\t\t\t\tProceeding with next request');
      } else {
        throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
      }
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addInitialPositionAndLimits:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->getDfspAccounts');
    const response = await sendRequest(getDfspAccounts({
      dfspName,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      const dfspAccounts = await response.json();
      log('EXE: SUCC: sendRequest->getDfspAccounts');
      log(`LOC: dfspAccounts:\t\t\t\t\t${JSON.stringify(dfspAccounts)}`);
      log('EXE: INIT: settlementAccountIdFromHubAccounts');
      const settlementAccountId = settlementIdFromHubAccounts(dfspAccounts, dfspCurrency);
      log('EXE: SUCC: settlementAccountIdFromHubAccounts');
      log(`LOC: settlementAccountId:\t\t\t\t${settlementAccountId}`);
      log('EXE: INIT: sendRequest->depositFunds');
      const innerResponse = await sendRequest(depositFunds({
        dfspName,
        dfspCurrency,
        amount,
        transferId: uuid.v4(),
        settlementAccountId,
        authToken,
        hostCentralLedger,
        baseCentralLedgerAdmin,
        fspiopSource,
      }));
      if (innerResponse.ok) {
        log('EXE: SUCC: sendRequest->depositFunds');
      } else {
        const innerError = await innerResponse.json();
        throw new Error(`Response not OK/2XX: ${JSON.stringify(innerError)}`);
      }
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    // Identify an issue with settlementAccountIdFromHubAccounts with a pattern match
    if (/property/.test(message)) {
      // So that a more specific failure can be logged
      log(`EXE: FAIL: settlementAccountIdFromHubAccounts:\t${message}`);
    } else {
      log(`EXE: FAIL: sendRequest->depositFunds:\t\t${message}`);
    }
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackParticipantPut');
    const response = await sendRequest(addCallbackParticipantPut({
      dfspName,
      dfspCallbackUrl,
      dfspPartyId,
      dfspPartyIdType,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->addCallbackParticipantPut');
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackParticipantPut:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackParticipantPutError');
    const response = await sendRequest(addCallbackParticipantPutError({
      dfspName,
      dfspCallbackUrl,
      dfspPartyId,
      dfspPartyIdType,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->addCallbackParticipantPutError');
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackParticipantPutError:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackParticipantPutBatch');
    const response = await sendRequest(addCallbackParticipantPutBatch({
      dfspName,
      dfspCallbackUrl,
      requestId: uuid.v4(),
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->addCallbackParticipantPutBatch');
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackParticipantPutBatch:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackParticipantPutBatchError');
    const response = await sendRequest(addCallbackParticipantPutBatchError({
      dfspName,
      dfspCallbackUrl,
      requestId: uuid.v4(),
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->addCallbackParticipantPutBatchError');
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackParticipantPutBatchError:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackPartiesGet');
    const response = await sendRequest(addCallbackPartiesGet({
      dfspName,
      dfspCallbackUrl,
      dfspPartyId,
      dfspPartyIdType,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->addCallbackPartiesGet');
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackPartiesGet:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackPartiesPut');
    const response = await sendRequest(addCallbackPartiesPut({
      dfspName,
      dfspCallbackUrl,
      dfspPartyId,
      dfspPartyIdType,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->addCallbackPartiesPut');
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackPartiesPut:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackPartiesPutError');
    const response = await sendRequest(addCallbackPartiesPutError({
      dfspName,
      dfspCallbackUrl,
      dfspPartyId,
      dfspPartyIdType,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->addCallbackPartiesPutError');
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackPartiesPutError:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackQuotes');
    const response = await sendRequest(addCallbackQuotes({
      dfspName,
      dfspCallbackUrl,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->addCallbackQuotes');
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackQuotes:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackTransferPost');
    const response = await sendRequest(addCallbackTransferPost({
      dfspName,
      dfspCallbackUrl,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->addCallbackTransferPost');
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackTransferPost:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackTransferPut');
    const response = await sendRequest(addCallbackTransferPut({
      dfspName,
      dfspCallbackUrl,
      transferId: uuid.v4(),
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->addCallbackTransferPut');
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackTransferPut:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackTransferError');
    const response = await sendRequest(addCallbackTransferError({
      dfspName,
      dfspCallbackUrl,
      transferId: uuid.v4(),
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->addCallbackTransferError');
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackTransferError:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->setEmailNetDebitCapAdjustment');
    const response = await sendRequest(setEmailNetDebitCapAdjustment({
      dfspName,
      email: ndcAdjustmentEmail,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->setEmailNetDebitCapAdjustment');
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->setEmailNetDebitCapAdjustment:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->setEmailSettlementTransferPositionChange');
    const response = await sendRequest(setEmailSettlementTransferPositionChange({
      dfspName,
      email: settlementTransferPositionChangeEmail,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->setEmailSettlementTransferPositionChange');
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->setEmailSettlementTransferPositionChange:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->setEmailNetDebitCapThresholdBreach');
    const response = await sendRequest(setEmailNetDebitCapThresholdBreach({
      dfspName,
      email: ndcThresholdBreachEmail,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    if (response.ok) {
      log('EXE: SUCC: sendRequest->setEmailNetDebitCapThresholdBreach');
    } else {
      const error = await response.json();
      throw new Error(`Response not OK/2XX: ${JSON.stringify(error)}`);
    }
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->setEmailNetDebitCapThresholdBreach:\t${message}`);
    process.exitCode = 1;
  }
}

onboardDfsp();
