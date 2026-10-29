import { gql } from "@/__generated__";

export const TRANSACTION_ROW = gql(`
  fragment TransactionRow on Transaction {
    id
    reference
    state
    currency
    rail
    grossAmountInCents
    feeInCents
    netAmountInCents
    usdEquivalentInCents
    attempts
    canRetry
    failureReason
    nextRetryAt
    fundsReceivedAt
    completedAt
    createdAt
    customerId
    customer {
      id
      user {
        id
        name
        email
      }
    }
  }
`);

export const TRANSACTIONS = gql(`
  query Transactions($page: String, $sort: String, $filter: JSONObject) {
    transactions(page: $page, sort: $sort, filter: $filter) {
      total
      transactions {
        ...TransactionRow
      }
    }
  }
`);

export const TRANSACTION_DETAIL = gql(`
  query TransactionDetail($id: ID!) {
    transaction(id: $id) {
      ...TransactionRow
      bridgeDepositId
      bridgeTransferId
      creditedAmountInCents
      exchangeFeeInCents
      fxRate
      periodKey
      creditedAt
      sourceDetails
      feeBreakdown
      destinationWalletSnapshot
      txHash
      explorerUrl
      feeSchedule {
        id
        effectivePeriod
      }
      virtualAccount {
        id
        bridgeVirtualAccountId
        sourceCurrency
        destinationCurrency
        destinationChain
      }
      events {
        id
        source
        type
        payload
        createdAt
      }
    }
  }
`);

export const RETRY_PAYOUT = gql(`
  mutation RetryPayout($id: ID!) {
    retryPayout(id: $id) {
      ...TransactionRow
    }
  }
`);
