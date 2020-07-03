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
log(`LOC: initialPosition:\t${initialPosition}`);
const netDebitCap = parseInt(process.env.NET_DEBIT_CAP, 10);
log(`LOC: netDebitCap:\t\t${netDebitCap}`);
const ndcAdjustmentEmail = process.env.NDC_ADJUSTMENT_EMAIL;
const ndcThresholdBreachEmail = process.env.NDC_THRESHOLD_BREACH_EMAIL;
const settlementTransferPositionChangeEmail = process.env.SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL;

async function onboardDfsp() {
  try {
    log('EXE: INIT: sendRequest->addDfsp');
    await sendRequest(addDfsp({
      dfspName,
      dfspCurrency,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->addDfsp');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addDfsp:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addInitialPositionAndLimits');
    await sendRequest(addInitialPositionAndLimits({
      dfspName,
      dfspCurrency,
      netDebitCap,
      initialPosition,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->addInitialPositionAndLimits');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addInitialPositionAndLimits:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->getDfspAccounts');
    const hubAccounts = await sendRequest(getDfspAccounts({
      dfspName,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->getDfspAccounts');
    log(`LOC: hubAccounts:\t${hubAccounts}`);

    const settlementAccountId = settlementIdFromHubAccounts(hubAccounts);
    log(`LOC: settlementAccountId:\t${settlementAccountId}`);

    log('EXE: INIT: sendRequest->depositFunds');
    await sendRequest(depositFunds({
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
    log('EXE: SUCC: sendRequest->depositFunds');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->depositFunds:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackParticipantPut');
    await sendRequest(addCallbackParticipantPut({
      dfspName,
      dfspCallbackUrl,
      dfspPartyId,
      dfspPartyIdType,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->addCallbackParticipantPut');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackParticipantPut:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackParticipantPutError');
    await sendRequest(addCallbackParticipantPutError({
      dfspName,
      dfspCallbackUrl,
      dfspPartyId,
      dfspPartyIdType,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->addCallbackParticipantPutError');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackParticipantPutError:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackParticipantPutBatch');
    await sendRequest(addCallbackParticipantPutBatch({
      dfspName,
      dfspCallbackUrl,
      requestId: uuid.v4(),
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->addCallbackParticipantPutBatch');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackParticipantPutBatch:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackParticipantPutBatchError');
    await sendRequest(addCallbackParticipantPutBatchError({
      dfspName,
      dfspCallbackUrl,
      requestId: uuid.v4(),
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->addCallbackParticipantPutBatchError');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackParticipantPutBatchError:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackPartiesGet');
    await sendRequest(addCallbackPartiesGet({
      dfspName,
      dfspCallbackUrl,
      dfspPartyId,
      dfspPartyIdType,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->addCallbackPartiesGet');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackPartiesGet:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackPartiesPut');
    await sendRequest(addCallbackPartiesPut({
      dfspName,
      dfspCallbackUrl,
      dfspPartyId,
      dfspPartyIdType,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));

    log('EXE: SUCC: sendRequest->addCallbackPartiesPut');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackPartiesPut:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackPartiesPutError');
    await sendRequest(addCallbackPartiesPutError({
      dfspName,
      dfspCallbackUrl,
      dfspPartyId,
      dfspPartyIdType,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));

    log('EXE: SUCC: sendRequest->addCallbackPartiesPutError');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackPartiesPutError:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackQuotes');
    await sendRequest(addCallbackQuotes({
      dfspName,
      dfspCallbackUrl,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->addCallbackQuotes');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackQuotes:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackTransferPost');
    await sendRequest(addCallbackTransferPost({
      dfspName,
      dfspCallbackUrl,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->addCallbackTransferPost');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackTransferPost:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackTransferPut');
    await sendRequest(addCallbackTransferPut({
      dfspName,
      dfspCallbackUrl,
      transferId: uuid.v4(),
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->addCallbackTransferPut');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackTransferPut:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->addCallbackTransferError');
    await sendRequest(addCallbackTransferError({
      dfspName,
      dfspCallbackUrl,
      transferId: uuid.v4(),
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->addCallbackTransferError');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->addCallbackTransferError:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->setEmailNetDebitCapAdjustment');
    await sendRequest(setEmailNetDebitCapAdjustment({
      dfspName,
      email: ndcAdjustmentEmail,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->setEmailNetDebitCapAdjustment');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->setEmailNetDebitCapAdjustment:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->setEmailSettlementTransferPositionChange');
    await sendRequest(setEmailSettlementTransferPositionChange({
      dfspName,
      email: settlementTransferPositionChangeEmail,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->setEmailSettlementTransferPositionChange');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->setEmailSettlementTransferPositionChange:\t${message}`);
    process.exitCode = 1;
    return;
  }

  try {
    log('EXE: INIT: sendRequest->setEmailNetDebitCapThresholdBreach');
    await sendRequest(setEmailNetDebitCapThresholdBreach({
      dfspName,
      email: ndcThresholdBreachEmail,
      authToken,
      hostCentralLedger,
      baseCentralLedgerAdmin,
      fspiopSource,
    }));
    log('EXE: SUCC: sendRequest->setEmailNetDebitCapThresholdBreach');
  } catch ({ message }) {
    log(`EXE: FAIL: sendRequest->setEmailNetDebitCapThresholdBreach:\t${message}`);
    process.exitCode = 1;
  }
}

onboardDfsp();
