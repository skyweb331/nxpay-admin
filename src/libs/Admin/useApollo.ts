import { gql } from "@/__generated__";

export const DASHBOARD_STATS = gql(`
  query DashboardStats {
    dashboardStats {
      periodKey
      volumeInCents
      feesInCents
      depositCount
      activeCustomers
      onboardingCustomers
      pendingKyc
      failedPayouts
      inFlightPayouts
      openTickets
      failedWebhooks
      daily {
        date
        count
        volumeInCents
      }
    }
  }
`);

export const FEE_EXTERNAL_ACCOUNT = gql(`
  query FeeExternalAccount {
    feeExternalAccount {
      id
      accountOwnerName
      bankName
      last4
      active
      updatedAt
    }
  }
`);

export const CONFIGURE_FEE_EXTERNAL_ACCOUNT = gql(`
  mutation ConfigureFeeExternalAccount($input: ConfigureFeeExternalAccountInput!) {
    configureFeeExternalAccount(input: $input) {
      id
      accountOwnerName
      bankName
      last4
      active
      updatedAt
    }
  }
`);

export const SIMULATE_DEPOSIT = gql(`
  mutation SimulateDeposit($input: SimulateDepositInput!) {
    simulateDeposit(input: $input) {
      id
      reference
      state
      currency
      grossAmountInCents
      feeInCents
    }
  }
`);
