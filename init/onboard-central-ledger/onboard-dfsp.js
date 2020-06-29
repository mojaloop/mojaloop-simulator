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
const netDebitCap = parseInt(process.env.NET_DEBIT_CAP, 10);
const ndcAdjustmentEmail = process.env.NDC_ADJUSTMENT_EMAIL;
const ndcThresholdBreachEmail = process.env.NDC_THRESHOLD_BREACH_EMAIL;
const settlementTransferPositionChangeEmail = process.env.SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL;

async function onboardDfsp() {
  await sendRequest(addDfsp({
    dfspName,
    dfspCurrency,
    authToken,
    hostCentralLedger,
    baseCentralLedgerAdmin,
    fspiopSource,
  }));

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

  const hubAccounts = await sendRequest(getDfspAccounts({
    dfspName,
    authToken,
    hostCentralLedger,
    baseCentralLedgerAdmin,
    fspiopSource,
  }));
  const settlementAccountId = settlementIdFromHubAccounts(hubAccounts);

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

  // TODO: What is requestId?
  await sendRequest(addCallbackParticipantPutBatch({
    dfspName,
    dfspCallbackUrl,
    requestId: 'requestId',
    authToken,
    hostCentralLedger,
    baseCentralLedgerAdmin,
    fspiopSource,
  }));

  // TODO: What is requestId?
  await sendRequest(addCallbackParticipantPutBatchError({
    dfspName,
    dfspCallbackUrl,
    requestId: 'requestId',
    authToken,
    hostCentralLedger,
    baseCentralLedgerAdmin,
    fspiopSource,
  }));

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

  await sendRequest(addCallbackQuotes({
    dfspName,
    dfspCallbackUrl,
    authToken,
    hostCentralLedger,
    baseCentralLedgerAdmin,
    fspiopSource,
  }));

  await sendRequest(addCallbackTransferPost({
    dfspName,
    dfspCallbackUrl,
    authToken,
    hostCentralLedger,
    baseCentralLedgerAdmin,
    fspiopSource,
  }));

  await sendRequest(addCallbackTransferPut({
    dfspName,
    dfspCallbackUrl,
    transferId: uuid.v4(),
    authToken,
    hostCentralLedger,
    baseCentralLedgerAdmin,
    fspiopSource,
  }));

  await sendRequest(addCallbackTransferError({
    dfspName,
    dfspCallbackUrl,
    transferId: uuid.v4(),
    authToken,
    hostCentralLedger,
    baseCentralLedgerAdmin,
    fspiopSource,
  }));

  await sendRequest(setEmailNetDebitCapAdjustment({
    dfspName,
    email: ndcAdjustmentEmail,
    authToken,
    hostCentralLedger,
    baseCentralLedgerAdmin,
    fspiopSource,
  }));

  await sendRequest(setEmailSettlementTransferPositionChange({
    dfspName,
    email: settlementTransferPositionChangeEmail,
    authToken,
    hostCentralLedger,
    baseCentralLedgerAdmin,
    fspiopSource,
  }));

  await sendRequest(setEmailNetDebitCapThresholdBreach({
    dfspName,
    email: ndcThresholdBreachEmail,
    authToken,
    hostCentralLedger,
    baseCentralLedgerAdmin,
    fspiopSource,
  }));
}

onboardDfsp();
