import { gql } from "@/__generated__";

export const CUSTOMER_ROW = gql(`
  fragment CustomerRow on Customer {
    id
    status
    type
    country
    region
    kycStatus
    tosStatus
    onboardingStep
    onboardedAt
    suspendedAt
    createdAt
    user {
      id
      name
      email
      isEmailVerified
      totpEnabled
      lastLoginAt
    }
  }
`);

export const CUSTOMERS = gql(`
  query Customers($page: String, $sort: String, $filter: JSONObject, $search: String) {
    customers(page: $page, sort: $sort, filter: $filter, search: $search) {
      total
      customers {
        ...CustomerRow
      }
    }
  }
`);

export const CUSTOMER_WALLET = gql(`
  fragment CustomerWallet on Wallet {
    id
    chain
    address
    type
    label
    status
    isPayout
    keyStatus
    keyExportedAt
    keyRemovedAt
    createdAt
  }
`);

export const CUSTOMER_DETAIL = gql(`
  query CustomerDetail($id: ID!) {
    customer(id: $id) {
      ...CustomerRow
      bridgeCustomerId
      kycLink
      endorsements
      rejectionReasons
      payoutWalletId
      wallets {
        ...CustomerWallet
      }
      virtualAccounts {
        id
        bridgeVirtualAccountId
        sourceCurrency
        destinationCurrency
        destinationChain
        status
        deactivatedAt
        createdAt
        depositInstructions {
          paymentRails
          accountNumber
          routingNumber
          iban
          bic
          bankName
        }
      }
    }
  }
`);

export const CUSTOMER_VOLUMES = gql(`
  query CustomerVolumes($filter: JSONObject, $page: String, $sort: String) {
    monthlyVolumes(filter: $filter, page: $page, sort: $sort) {
      total
      monthlyVolumes {
        id
        periodKey
        volumeInCents
        feeInCents
        txCount
      }
    }
  }
`);

export const SUSPEND_CUSTOMER = gql(`
  mutation SuspendCustomer($data: SuspendCustomerInput!) {
    suspendCustomer(data: $data) {
      ...CustomerRow
    }
  }
`);

export const REACTIVATE_CUSTOMER = gql(`
  mutation ReactivateCustomer($id: ID!) {
    reactivateCustomer(id: $id) {
      ...CustomerRow
    }
  }
`);

export const REGENERATE_CUSTOMER_KYC_LINK = gql(`
  mutation RegenerateCustomerKycLink($id: ID!) {
    regenerateCustomerKycLink(id: $id) {
      id
      kycLink
      kycStatus
      tosStatus
      onboardingStep
    }
  }
`);

export const DEACTIVATE_VIRTUAL_ACCOUNT = gql(`
  mutation DeactivateVirtualAccount($id: ID!) {
    deactivateVirtualAccount(id: $id) {
      id
      status
      deactivatedAt
    }
  }
`);

export const RESET_CUSTOMER_TWO_FACTOR = gql(`
  mutation ResetCustomerTwoFactor($customerId: ID!) {
    resetCustomerTwoFactor(customerId: $customerId) {
      id
      totpEnabled
    }
  }
`);
