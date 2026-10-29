/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query FetchMe {\n    me {\n      id\n      name\n      email\n      role\n      totpEnabled\n      lastLoginAt\n    }\n  }\n": typeof types.FetchMeDocument,
    "\n  query DashboardStats {\n    dashboardStats {\n      periodKey\n      volumeInCents\n      feesInCents\n      depositCount\n      activeCustomers\n      onboardingCustomers\n      pendingKyc\n      failedPayouts\n      inFlightPayouts\n      openTickets\n      failedWebhooks\n      daily {\n        date\n        count\n        volumeInCents\n      }\n    }\n  }\n": typeof types.DashboardStatsDocument,
    "\n  query FeeExternalAccount {\n    feeExternalAccount {\n      id\n      accountOwnerName\n      bankName\n      last4\n      active\n      updatedAt\n    }\n  }\n": typeof types.FeeExternalAccountDocument,
    "\n  mutation ConfigureFeeExternalAccount($input: ConfigureFeeExternalAccountInput!) {\n    configureFeeExternalAccount(input: $input) {\n      id\n      accountOwnerName\n      bankName\n      last4\n      active\n      updatedAt\n    }\n  }\n": typeof types.ConfigureFeeExternalAccountDocument,
    "\n  mutation SimulateDeposit($input: SimulateDepositInput!) {\n    simulateDeposit(input: $input) {\n      id\n      reference\n      state\n      currency\n      grossAmountInCents\n      feeInCents\n    }\n  }\n": typeof types.SimulateDepositDocument,
    "\n  query AppInfo {\n    appInfo {\n      sandbox\n      bridgeEnv\n      defaultPayoutChain\n    }\n  }\n": typeof types.AppInfoDocument,
    "\n  fragment CustomerRow on Customer {\n    id\n    status\n    type\n    country\n    region\n    kycStatus\n    tosStatus\n    onboardingStep\n    onboardedAt\n    suspendedAt\n    createdAt\n    user {\n      id\n      name\n      email\n      isEmailVerified\n      lastLoginAt\n    }\n  }\n": typeof types.CustomerRowFragmentDoc,
    "\n  query Customers($page: String, $sort: String, $filter: JSONObject, $search: String) {\n    customers(page: $page, sort: $sort, filter: $filter, search: $search) {\n      total\n      customers {\n        ...CustomerRow\n      }\n    }\n  }\n": typeof types.CustomersDocument,
    "\n  fragment CustomerWallet on Wallet {\n    id\n    chain\n    address\n    type\n    label\n    status\n    isPayout\n    keyStatus\n    keyExportedAt\n    keyRemovedAt\n    createdAt\n  }\n": typeof types.CustomerWalletFragmentDoc,
    "\n  query CustomerDetail($id: ID!) {\n    customer(id: $id) {\n      ...CustomerRow\n      bridgeCustomerId\n      kycLink\n      endorsements\n      rejectionReasons\n      payoutWalletId\n      wallets {\n        ...CustomerWallet\n      }\n      virtualAccounts {\n        id\n        bridgeVirtualAccountId\n        sourceCurrency\n        destinationCurrency\n        destinationChain\n        status\n        deactivatedAt\n        createdAt\n        depositInstructions {\n          paymentRails\n          accountNumber\n          routingNumber\n          iban\n          bic\n          bankName\n        }\n      }\n    }\n  }\n": typeof types.CustomerDetailDocument,
    "\n  query CustomerVolumes($filter: JSONObject, $page: String, $sort: String) {\n    monthlyVolumes(filter: $filter, page: $page, sort: $sort) {\n      total\n      monthlyVolumes {\n        id\n        periodKey\n        volumeInCents\n        feeInCents\n        txCount\n      }\n    }\n  }\n": typeof types.CustomerVolumesDocument,
    "\n  mutation SuspendCustomer($data: SuspendCustomerInput!) {\n    suspendCustomer(data: $data) {\n      ...CustomerRow\n    }\n  }\n": typeof types.SuspendCustomerDocument,
    "\n  mutation ReactivateCustomer($id: ID!) {\n    reactivateCustomer(id: $id) {\n      ...CustomerRow\n    }\n  }\n": typeof types.ReactivateCustomerDocument,
    "\n  mutation RegenerateCustomerKycLink($id: ID!) {\n    regenerateCustomerKycLink(id: $id) {\n      id\n      kycLink\n      kycStatus\n      tosStatus\n      onboardingStep\n    }\n  }\n": typeof types.RegenerateCustomerKycLinkDocument,
    "\n  mutation DeactivateVirtualAccount($id: ID!) {\n    deactivateVirtualAccount(id: $id) {\n      id\n      status\n      deactivatedAt\n    }\n  }\n": typeof types.DeactivateVirtualAccountDocument,
    "\n  fragment FeeScheduleFields on FeeSchedule {\n    id\n    status\n    effectivePeriod\n    notes\n    notifyCustomers\n    publishedAt\n    cancelledAt\n    createdAt\n    createdBy {\n      id\n      name\n    }\n    publishedBy {\n      id\n      name\n    }\n    tiers {\n      id\n      position\n      fromInCents\n      toInCents\n      rateBps\n    }\n  }\n": typeof types.FeeScheduleFieldsFragmentDoc,
    "\n  query FeeOverview {\n    currentFeeSchedule {\n      ...FeeScheduleFields\n    }\n    upcomingFeeSchedule {\n      ...FeeScheduleFields\n    }\n    feeSettings {\n      earliestEffectivePeriod\n      minimumPayoutInCents\n      softCapBps\n    }\n  }\n": typeof types.FeeOverviewDocument,
    "\n  query FeeSchedules($page: String, $sort: String, $filter: JSONObject) {\n    feeSchedules(page: $page, sort: $sort, filter: $filter) {\n      total\n      feeSchedules {\n        ...FeeScheduleFields\n      }\n    }\n  }\n": typeof types.FeeSchedulesDocument,
    "\n  query FeeSchedule($id: ID!) {\n    feeSchedule(id: $id) {\n      ...FeeScheduleFields\n    }\n  }\n": typeof types.FeeScheduleDocument,
    "\n  mutation CreateFeeScheduleDraft($data: CreateFeeScheduleDraftInput!) {\n    createFeeScheduleDraft(data: $data) {\n      ...FeeScheduleFields\n    }\n  }\n": typeof types.CreateFeeScheduleDraftDocument,
    "\n  mutation UpdateFeeScheduleDraft($data: UpdateFeeScheduleDraftInput!) {\n    updateFeeScheduleDraft(data: $data) {\n      ...FeeScheduleFields\n    }\n  }\n": typeof types.UpdateFeeScheduleDraftDocument,
    "\n  mutation PublishFeeSchedule($data: PublishFeeScheduleInput!) {\n    publishFeeSchedule(data: $data) {\n      ...FeeScheduleFields\n    }\n  }\n": typeof types.PublishFeeScheduleDocument,
    "\n  mutation CancelFeeSchedule($id: ID!) {\n    cancelFeeSchedule(id: $id) {\n      ...FeeScheduleFields\n    }\n  }\n": typeof types.CancelFeeScheduleDocument,
    "\n  mutation UpdateFeeSettings($data: UpdateFeeSettingsInput!) {\n    updateFeeSettings(data: $data) {\n      earliestEffectivePeriod\n      minimumPayoutInCents\n      softCapBps\n    }\n  }\n": typeof types.UpdateFeeSettingsDocument,
    "\n  fragment AuditLogRow on AuditLog {\n    id\n    action\n    entity\n    entityId\n    actorId\n    actorRole\n    actor {\n      id\n      name\n      email\n    }\n    ip\n    before\n    after\n    createdAt\n  }\n": typeof types.AuditLogRowFragmentDoc,
    "\n  query AuditLogs($page: String, $sort: String, $filter: JSONObject) {\n    auditLogs(page: $page, sort: $sort, filter: $filter) {\n      total\n      auditLogs {\n        ...AuditLogRow\n      }\n    }\n  }\n": typeof types.AuditLogsDocument,
    "\n  fragment WebhookEventRow on WebhookEvent {\n    id\n    bridgeEventId\n    category\n    type\n    objectId\n    status\n    attempts\n    error\n    payload\n    receivedAt\n    processedAt\n  }\n": typeof types.WebhookEventRowFragmentDoc,
    "\n  query WebhookEvents($page: String, $sort: String, $filter: JSONObject) {\n    webhookEvents(page: $page, sort: $sort, filter: $filter) {\n      total\n      webhookEvents {\n        ...WebhookEventRow\n      }\n    }\n  }\n": typeof types.WebhookEventsDocument,
    "\n  mutation ReplayWebhookEvent($id: ID!) {\n    replayWebhookEvent(id: $id) {\n      ...WebhookEventRow\n    }\n  }\n": typeof types.ReplayWebhookEventDocument,
    "\n  fragment StaffRow on User {\n    id\n    name\n    email\n    role\n    totpEnabled\n    lastLoginAt\n    deletedAt\n    createdAt\n  }\n": typeof types.StaffRowFragmentDoc,
    "\n  query StaffUsers($page: String, $sort: String, $filter: JSONObject) {\n    staffUsers(page: $page, sort: $sort, filter: $filter) {\n      total\n      users {\n        ...StaffRow\n      }\n    }\n  }\n": typeof types.StaffUsersDocument,
    "\n  mutation CreateStaffUser($data: CreateStaffUserInput!) {\n    createStaffUser(data: $data) {\n      ...StaffRow\n    }\n  }\n": typeof types.CreateStaffUserDocument,
    "\n  mutation UpdateStaffUser($data: UpdateStaffUserInput!) {\n    updateStaffUser(data: $data) {\n      ...StaffRow\n    }\n  }\n": typeof types.UpdateStaffUserDocument,
    "\n  mutation ResetStaffTotp($id: ID!) {\n    resetStaffTotp(id: $id) {\n      ...StaffRow\n    }\n  }\n": typeof types.ResetStaffTotpDocument,
    "\n  fragment SupportTicketRow on SupportTicket {\n    id\n    reference\n    subject\n    status\n    lastMessageAt\n    createdAt\n    customerId\n    customer {\n      id\n      user {\n        id\n        name\n        email\n      }\n    }\n    assigneeId\n    assignee {\n      id\n      name\n    }\n  }\n": typeof types.SupportTicketRowFragmentDoc,
    "\n  query SupportTickets($page: String, $sort: String, $filter: JSONObject) {\n    supportTickets(page: $page, sort: $sort, filter: $filter) {\n      total\n      supportTickets {\n        ...SupportTicketRow\n      }\n    }\n  }\n": typeof types.SupportTicketsDocument,
    "\n  query SupportTicket($id: ID!) {\n    supportTicket(id: $id) {\n      ...SupportTicketRow\n      messages {\n        id\n        body\n        authorName\n        isStaff\n        createdAt\n      }\n    }\n  }\n": typeof types.SupportTicketDocument,
    "\n  mutation ReplySupportTicket($input: ReplySupportTicketInput!) {\n    replySupportTicket(input: $input) {\n      id\n      status\n      lastMessageAt\n      messages {\n        id\n        body\n        authorName\n        isStaff\n        createdAt\n      }\n    }\n  }\n": typeof types.ReplySupportTicketDocument,
    "\n  mutation UpdateSupportTicket($input: UpdateSupportTicketInput!) {\n    updateSupportTicket(input: $input) {\n      ...SupportTicketRow\n    }\n  }\n": typeof types.UpdateSupportTicketDocument,
    "\n  fragment TransactionRow on Transaction {\n    id\n    reference\n    state\n    currency\n    rail\n    grossAmountInCents\n    feeInCents\n    netAmountInCents\n    usdEquivalentInCents\n    attempts\n    canRetry\n    failureReason\n    nextRetryAt\n    fundsReceivedAt\n    completedAt\n    createdAt\n    customerId\n    customer {\n      id\n      user {\n        id\n        name\n        email\n      }\n    }\n  }\n": typeof types.TransactionRowFragmentDoc,
    "\n  query Transactions($page: String, $sort: String, $filter: JSONObject) {\n    transactions(page: $page, sort: $sort, filter: $filter) {\n      total\n      transactions {\n        ...TransactionRow\n      }\n    }\n  }\n": typeof types.TransactionsDocument,
    "\n  query TransactionDetail($id: ID!) {\n    transaction(id: $id) {\n      ...TransactionRow\n      bridgeDepositId\n      bridgeTransferId\n      creditedAmountInCents\n      exchangeFeeInCents\n      fxRate\n      periodKey\n      creditedAt\n      sourceDetails\n      feeBreakdown\n      destinationWalletSnapshot\n      txHash\n      explorerUrl\n      feeSchedule {\n        id\n        effectivePeriod\n      }\n      virtualAccount {\n        id\n        bridgeVirtualAccountId\n        sourceCurrency\n        destinationCurrency\n        destinationChain\n      }\n      events {\n        id\n        source\n        type\n        payload\n        createdAt\n      }\n    }\n  }\n": typeof types.TransactionDetailDocument,
    "\n  mutation RetryPayout($id: ID!) {\n    retryPayout(id: $id) {\n      ...TransactionRow\n    }\n  }\n": typeof types.RetryPayoutDocument,
    "\n  mutation Login($data: LoginInput!) {\n    login(data: $data) {\n      accessToken\n      mfaRequired\n      mfaToken\n      totpSetupRequired\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation VerifyAdminTotp($data: TotpInput!) {\n    verifyAdminTotp(data: $data) {\n      accessToken\n    }\n  }\n": typeof types.VerifyAdminTotpDocument,
    "\n  mutation BeginTotpSetup($mfaToken: String!) {\n    beginTotpSetup(mfaToken: $mfaToken) {\n      secret\n      otpauthUrl\n    }\n  }\n": typeof types.BeginTotpSetupDocument,
    "\n  mutation ConfirmTotpSetup($data: TotpInput!) {\n    confirmTotpSetup(data: $data) {\n      accessToken\n    }\n  }\n": typeof types.ConfirmTotpSetupDocument,
    "\n  mutation RequestPasswordReset($data: RequestPasswordResetInput!) {\n    requestPasswordReset(data: $data) {\n      success\n    }\n  }\n": typeof types.RequestPasswordResetDocument,
    "\n  mutation ResetPassword($data: ResetPasswordInput!) {\n    resetPassword(data: $data) {\n      success\n    }\n  }\n": typeof types.ResetPasswordDocument,
};
const documents: Documents = {
    "\n  query FetchMe {\n    me {\n      id\n      name\n      email\n      role\n      totpEnabled\n      lastLoginAt\n    }\n  }\n": types.FetchMeDocument,
    "\n  query DashboardStats {\n    dashboardStats {\n      periodKey\n      volumeInCents\n      feesInCents\n      depositCount\n      activeCustomers\n      onboardingCustomers\n      pendingKyc\n      failedPayouts\n      inFlightPayouts\n      openTickets\n      failedWebhooks\n      daily {\n        date\n        count\n        volumeInCents\n      }\n    }\n  }\n": types.DashboardStatsDocument,
    "\n  query FeeExternalAccount {\n    feeExternalAccount {\n      id\n      accountOwnerName\n      bankName\n      last4\n      active\n      updatedAt\n    }\n  }\n": types.FeeExternalAccountDocument,
    "\n  mutation ConfigureFeeExternalAccount($input: ConfigureFeeExternalAccountInput!) {\n    configureFeeExternalAccount(input: $input) {\n      id\n      accountOwnerName\n      bankName\n      last4\n      active\n      updatedAt\n    }\n  }\n": types.ConfigureFeeExternalAccountDocument,
    "\n  mutation SimulateDeposit($input: SimulateDepositInput!) {\n    simulateDeposit(input: $input) {\n      id\n      reference\n      state\n      currency\n      grossAmountInCents\n      feeInCents\n    }\n  }\n": types.SimulateDepositDocument,
    "\n  query AppInfo {\n    appInfo {\n      sandbox\n      bridgeEnv\n      defaultPayoutChain\n    }\n  }\n": types.AppInfoDocument,
    "\n  fragment CustomerRow on Customer {\n    id\n    status\n    type\n    country\n    region\n    kycStatus\n    tosStatus\n    onboardingStep\n    onboardedAt\n    suspendedAt\n    createdAt\n    user {\n      id\n      name\n      email\n      isEmailVerified\n      lastLoginAt\n    }\n  }\n": types.CustomerRowFragmentDoc,
    "\n  query Customers($page: String, $sort: String, $filter: JSONObject, $search: String) {\n    customers(page: $page, sort: $sort, filter: $filter, search: $search) {\n      total\n      customers {\n        ...CustomerRow\n      }\n    }\n  }\n": types.CustomersDocument,
    "\n  fragment CustomerWallet on Wallet {\n    id\n    chain\n    address\n    type\n    label\n    status\n    isPayout\n    keyStatus\n    keyExportedAt\n    keyRemovedAt\n    createdAt\n  }\n": types.CustomerWalletFragmentDoc,
    "\n  query CustomerDetail($id: ID!) {\n    customer(id: $id) {\n      ...CustomerRow\n      bridgeCustomerId\n      kycLink\n      endorsements\n      rejectionReasons\n      payoutWalletId\n      wallets {\n        ...CustomerWallet\n      }\n      virtualAccounts {\n        id\n        bridgeVirtualAccountId\n        sourceCurrency\n        destinationCurrency\n        destinationChain\n        status\n        deactivatedAt\n        createdAt\n        depositInstructions {\n          paymentRails\n          accountNumber\n          routingNumber\n          iban\n          bic\n          bankName\n        }\n      }\n    }\n  }\n": types.CustomerDetailDocument,
    "\n  query CustomerVolumes($filter: JSONObject, $page: String, $sort: String) {\n    monthlyVolumes(filter: $filter, page: $page, sort: $sort) {\n      total\n      monthlyVolumes {\n        id\n        periodKey\n        volumeInCents\n        feeInCents\n        txCount\n      }\n    }\n  }\n": types.CustomerVolumesDocument,
    "\n  mutation SuspendCustomer($data: SuspendCustomerInput!) {\n    suspendCustomer(data: $data) {\n      ...CustomerRow\n    }\n  }\n": types.SuspendCustomerDocument,
    "\n  mutation ReactivateCustomer($id: ID!) {\n    reactivateCustomer(id: $id) {\n      ...CustomerRow\n    }\n  }\n": types.ReactivateCustomerDocument,
    "\n  mutation RegenerateCustomerKycLink($id: ID!) {\n    regenerateCustomerKycLink(id: $id) {\n      id\n      kycLink\n      kycStatus\n      tosStatus\n      onboardingStep\n    }\n  }\n": types.RegenerateCustomerKycLinkDocument,
    "\n  mutation DeactivateVirtualAccount($id: ID!) {\n    deactivateVirtualAccount(id: $id) {\n      id\n      status\n      deactivatedAt\n    }\n  }\n": types.DeactivateVirtualAccountDocument,
    "\n  fragment FeeScheduleFields on FeeSchedule {\n    id\n    status\n    effectivePeriod\n    notes\n    notifyCustomers\n    publishedAt\n    cancelledAt\n    createdAt\n    createdBy {\n      id\n      name\n    }\n    publishedBy {\n      id\n      name\n    }\n    tiers {\n      id\n      position\n      fromInCents\n      toInCents\n      rateBps\n    }\n  }\n": types.FeeScheduleFieldsFragmentDoc,
    "\n  query FeeOverview {\n    currentFeeSchedule {\n      ...FeeScheduleFields\n    }\n    upcomingFeeSchedule {\n      ...FeeScheduleFields\n    }\n    feeSettings {\n      earliestEffectivePeriod\n      minimumPayoutInCents\n      softCapBps\n    }\n  }\n": types.FeeOverviewDocument,
    "\n  query FeeSchedules($page: String, $sort: String, $filter: JSONObject) {\n    feeSchedules(page: $page, sort: $sort, filter: $filter) {\n      total\n      feeSchedules {\n        ...FeeScheduleFields\n      }\n    }\n  }\n": types.FeeSchedulesDocument,
    "\n  query FeeSchedule($id: ID!) {\n    feeSchedule(id: $id) {\n      ...FeeScheduleFields\n    }\n  }\n": types.FeeScheduleDocument,
    "\n  mutation CreateFeeScheduleDraft($data: CreateFeeScheduleDraftInput!) {\n    createFeeScheduleDraft(data: $data) {\n      ...FeeScheduleFields\n    }\n  }\n": types.CreateFeeScheduleDraftDocument,
    "\n  mutation UpdateFeeScheduleDraft($data: UpdateFeeScheduleDraftInput!) {\n    updateFeeScheduleDraft(data: $data) {\n      ...FeeScheduleFields\n    }\n  }\n": types.UpdateFeeScheduleDraftDocument,
    "\n  mutation PublishFeeSchedule($data: PublishFeeScheduleInput!) {\n    publishFeeSchedule(data: $data) {\n      ...FeeScheduleFields\n    }\n  }\n": types.PublishFeeScheduleDocument,
    "\n  mutation CancelFeeSchedule($id: ID!) {\n    cancelFeeSchedule(id: $id) {\n      ...FeeScheduleFields\n    }\n  }\n": types.CancelFeeScheduleDocument,
    "\n  mutation UpdateFeeSettings($data: UpdateFeeSettingsInput!) {\n    updateFeeSettings(data: $data) {\n      earliestEffectivePeriod\n      minimumPayoutInCents\n      softCapBps\n    }\n  }\n": types.UpdateFeeSettingsDocument,
    "\n  fragment AuditLogRow on AuditLog {\n    id\n    action\n    entity\n    entityId\n    actorId\n    actorRole\n    actor {\n      id\n      name\n      email\n    }\n    ip\n    before\n    after\n    createdAt\n  }\n": types.AuditLogRowFragmentDoc,
    "\n  query AuditLogs($page: String, $sort: String, $filter: JSONObject) {\n    auditLogs(page: $page, sort: $sort, filter: $filter) {\n      total\n      auditLogs {\n        ...AuditLogRow\n      }\n    }\n  }\n": types.AuditLogsDocument,
    "\n  fragment WebhookEventRow on WebhookEvent {\n    id\n    bridgeEventId\n    category\n    type\n    objectId\n    status\n    attempts\n    error\n    payload\n    receivedAt\n    processedAt\n  }\n": types.WebhookEventRowFragmentDoc,
    "\n  query WebhookEvents($page: String, $sort: String, $filter: JSONObject) {\n    webhookEvents(page: $page, sort: $sort, filter: $filter) {\n      total\n      webhookEvents {\n        ...WebhookEventRow\n      }\n    }\n  }\n": types.WebhookEventsDocument,
    "\n  mutation ReplayWebhookEvent($id: ID!) {\n    replayWebhookEvent(id: $id) {\n      ...WebhookEventRow\n    }\n  }\n": types.ReplayWebhookEventDocument,
    "\n  fragment StaffRow on User {\n    id\n    name\n    email\n    role\n    totpEnabled\n    lastLoginAt\n    deletedAt\n    createdAt\n  }\n": types.StaffRowFragmentDoc,
    "\n  query StaffUsers($page: String, $sort: String, $filter: JSONObject) {\n    staffUsers(page: $page, sort: $sort, filter: $filter) {\n      total\n      users {\n        ...StaffRow\n      }\n    }\n  }\n": types.StaffUsersDocument,
    "\n  mutation CreateStaffUser($data: CreateStaffUserInput!) {\n    createStaffUser(data: $data) {\n      ...StaffRow\n    }\n  }\n": types.CreateStaffUserDocument,
    "\n  mutation UpdateStaffUser($data: UpdateStaffUserInput!) {\n    updateStaffUser(data: $data) {\n      ...StaffRow\n    }\n  }\n": types.UpdateStaffUserDocument,
    "\n  mutation ResetStaffTotp($id: ID!) {\n    resetStaffTotp(id: $id) {\n      ...StaffRow\n    }\n  }\n": types.ResetStaffTotpDocument,
    "\n  fragment SupportTicketRow on SupportTicket {\n    id\n    reference\n    subject\n    status\n    lastMessageAt\n    createdAt\n    customerId\n    customer {\n      id\n      user {\n        id\n        name\n        email\n      }\n    }\n    assigneeId\n    assignee {\n      id\n      name\n    }\n  }\n": types.SupportTicketRowFragmentDoc,
    "\n  query SupportTickets($page: String, $sort: String, $filter: JSONObject) {\n    supportTickets(page: $page, sort: $sort, filter: $filter) {\n      total\n      supportTickets {\n        ...SupportTicketRow\n      }\n    }\n  }\n": types.SupportTicketsDocument,
    "\n  query SupportTicket($id: ID!) {\n    supportTicket(id: $id) {\n      ...SupportTicketRow\n      messages {\n        id\n        body\n        authorName\n        isStaff\n        createdAt\n      }\n    }\n  }\n": types.SupportTicketDocument,
    "\n  mutation ReplySupportTicket($input: ReplySupportTicketInput!) {\n    replySupportTicket(input: $input) {\n      id\n      status\n      lastMessageAt\n      messages {\n        id\n        body\n        authorName\n        isStaff\n        createdAt\n      }\n    }\n  }\n": types.ReplySupportTicketDocument,
    "\n  mutation UpdateSupportTicket($input: UpdateSupportTicketInput!) {\n    updateSupportTicket(input: $input) {\n      ...SupportTicketRow\n    }\n  }\n": types.UpdateSupportTicketDocument,
    "\n  fragment TransactionRow on Transaction {\n    id\n    reference\n    state\n    currency\n    rail\n    grossAmountInCents\n    feeInCents\n    netAmountInCents\n    usdEquivalentInCents\n    attempts\n    canRetry\n    failureReason\n    nextRetryAt\n    fundsReceivedAt\n    completedAt\n    createdAt\n    customerId\n    customer {\n      id\n      user {\n        id\n        name\n        email\n      }\n    }\n  }\n": types.TransactionRowFragmentDoc,
    "\n  query Transactions($page: String, $sort: String, $filter: JSONObject) {\n    transactions(page: $page, sort: $sort, filter: $filter) {\n      total\n      transactions {\n        ...TransactionRow\n      }\n    }\n  }\n": types.TransactionsDocument,
    "\n  query TransactionDetail($id: ID!) {\n    transaction(id: $id) {\n      ...TransactionRow\n      bridgeDepositId\n      bridgeTransferId\n      creditedAmountInCents\n      exchangeFeeInCents\n      fxRate\n      periodKey\n      creditedAt\n      sourceDetails\n      feeBreakdown\n      destinationWalletSnapshot\n      txHash\n      explorerUrl\n      feeSchedule {\n        id\n        effectivePeriod\n      }\n      virtualAccount {\n        id\n        bridgeVirtualAccountId\n        sourceCurrency\n        destinationCurrency\n        destinationChain\n      }\n      events {\n        id\n        source\n        type\n        payload\n        createdAt\n      }\n    }\n  }\n": types.TransactionDetailDocument,
    "\n  mutation RetryPayout($id: ID!) {\n    retryPayout(id: $id) {\n      ...TransactionRow\n    }\n  }\n": types.RetryPayoutDocument,
    "\n  mutation Login($data: LoginInput!) {\n    login(data: $data) {\n      accessToken\n      mfaRequired\n      mfaToken\n      totpSetupRequired\n    }\n  }\n": types.LoginDocument,
    "\n  mutation VerifyAdminTotp($data: TotpInput!) {\n    verifyAdminTotp(data: $data) {\n      accessToken\n    }\n  }\n": types.VerifyAdminTotpDocument,
    "\n  mutation BeginTotpSetup($mfaToken: String!) {\n    beginTotpSetup(mfaToken: $mfaToken) {\n      secret\n      otpauthUrl\n    }\n  }\n": types.BeginTotpSetupDocument,
    "\n  mutation ConfirmTotpSetup($data: TotpInput!) {\n    confirmTotpSetup(data: $data) {\n      accessToken\n    }\n  }\n": types.ConfirmTotpSetupDocument,
    "\n  mutation RequestPasswordReset($data: RequestPasswordResetInput!) {\n    requestPasswordReset(data: $data) {\n      success\n    }\n  }\n": types.RequestPasswordResetDocument,
    "\n  mutation ResetPassword($data: ResetPasswordInput!) {\n    resetPassword(data: $data) {\n      success\n    }\n  }\n": types.ResetPasswordDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query FetchMe {\n    me {\n      id\n      name\n      email\n      role\n      totpEnabled\n      lastLoginAt\n    }\n  }\n"): (typeof documents)["\n  query FetchMe {\n    me {\n      id\n      name\n      email\n      role\n      totpEnabled\n      lastLoginAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query DashboardStats {\n    dashboardStats {\n      periodKey\n      volumeInCents\n      feesInCents\n      depositCount\n      activeCustomers\n      onboardingCustomers\n      pendingKyc\n      failedPayouts\n      inFlightPayouts\n      openTickets\n      failedWebhooks\n      daily {\n        date\n        count\n        volumeInCents\n      }\n    }\n  }\n"): (typeof documents)["\n  query DashboardStats {\n    dashboardStats {\n      periodKey\n      volumeInCents\n      feesInCents\n      depositCount\n      activeCustomers\n      onboardingCustomers\n      pendingKyc\n      failedPayouts\n      inFlightPayouts\n      openTickets\n      failedWebhooks\n      daily {\n        date\n        count\n        volumeInCents\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query FeeExternalAccount {\n    feeExternalAccount {\n      id\n      accountOwnerName\n      bankName\n      last4\n      active\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query FeeExternalAccount {\n    feeExternalAccount {\n      id\n      accountOwnerName\n      bankName\n      last4\n      active\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ConfigureFeeExternalAccount($input: ConfigureFeeExternalAccountInput!) {\n    configureFeeExternalAccount(input: $input) {\n      id\n      accountOwnerName\n      bankName\n      last4\n      active\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation ConfigureFeeExternalAccount($input: ConfigureFeeExternalAccountInput!) {\n    configureFeeExternalAccount(input: $input) {\n      id\n      accountOwnerName\n      bankName\n      last4\n      active\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SimulateDeposit($input: SimulateDepositInput!) {\n    simulateDeposit(input: $input) {\n      id\n      reference\n      state\n      currency\n      grossAmountInCents\n      feeInCents\n    }\n  }\n"): (typeof documents)["\n  mutation SimulateDeposit($input: SimulateDepositInput!) {\n    simulateDeposit(input: $input) {\n      id\n      reference\n      state\n      currency\n      grossAmountInCents\n      feeInCents\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query AppInfo {\n    appInfo {\n      sandbox\n      bridgeEnv\n      defaultPayoutChain\n    }\n  }\n"): (typeof documents)["\n  query AppInfo {\n    appInfo {\n      sandbox\n      bridgeEnv\n      defaultPayoutChain\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment CustomerRow on Customer {\n    id\n    status\n    type\n    country\n    region\n    kycStatus\n    tosStatus\n    onboardingStep\n    onboardedAt\n    suspendedAt\n    createdAt\n    user {\n      id\n      name\n      email\n      isEmailVerified\n      lastLoginAt\n    }\n  }\n"): (typeof documents)["\n  fragment CustomerRow on Customer {\n    id\n    status\n    type\n    country\n    region\n    kycStatus\n    tosStatus\n    onboardingStep\n    onboardedAt\n    suspendedAt\n    createdAt\n    user {\n      id\n      name\n      email\n      isEmailVerified\n      lastLoginAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Customers($page: String, $sort: String, $filter: JSONObject, $search: String) {\n    customers(page: $page, sort: $sort, filter: $filter, search: $search) {\n      total\n      customers {\n        ...CustomerRow\n      }\n    }\n  }\n"): (typeof documents)["\n  query Customers($page: String, $sort: String, $filter: JSONObject, $search: String) {\n    customers(page: $page, sort: $sort, filter: $filter, search: $search) {\n      total\n      customers {\n        ...CustomerRow\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment CustomerWallet on Wallet {\n    id\n    chain\n    address\n    type\n    label\n    status\n    isPayout\n    keyStatus\n    keyExportedAt\n    keyRemovedAt\n    createdAt\n  }\n"): (typeof documents)["\n  fragment CustomerWallet on Wallet {\n    id\n    chain\n    address\n    type\n    label\n    status\n    isPayout\n    keyStatus\n    keyExportedAt\n    keyRemovedAt\n    createdAt\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query CustomerDetail($id: ID!) {\n    customer(id: $id) {\n      ...CustomerRow\n      bridgeCustomerId\n      kycLink\n      endorsements\n      rejectionReasons\n      payoutWalletId\n      wallets {\n        ...CustomerWallet\n      }\n      virtualAccounts {\n        id\n        bridgeVirtualAccountId\n        sourceCurrency\n        destinationCurrency\n        destinationChain\n        status\n        deactivatedAt\n        createdAt\n        depositInstructions {\n          paymentRails\n          accountNumber\n          routingNumber\n          iban\n          bic\n          bankName\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query CustomerDetail($id: ID!) {\n    customer(id: $id) {\n      ...CustomerRow\n      bridgeCustomerId\n      kycLink\n      endorsements\n      rejectionReasons\n      payoutWalletId\n      wallets {\n        ...CustomerWallet\n      }\n      virtualAccounts {\n        id\n        bridgeVirtualAccountId\n        sourceCurrency\n        destinationCurrency\n        destinationChain\n        status\n        deactivatedAt\n        createdAt\n        depositInstructions {\n          paymentRails\n          accountNumber\n          routingNumber\n          iban\n          bic\n          bankName\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query CustomerVolumes($filter: JSONObject, $page: String, $sort: String) {\n    monthlyVolumes(filter: $filter, page: $page, sort: $sort) {\n      total\n      monthlyVolumes {\n        id\n        periodKey\n        volumeInCents\n        feeInCents\n        txCount\n      }\n    }\n  }\n"): (typeof documents)["\n  query CustomerVolumes($filter: JSONObject, $page: String, $sort: String) {\n    monthlyVolumes(filter: $filter, page: $page, sort: $sort) {\n      total\n      monthlyVolumes {\n        id\n        periodKey\n        volumeInCents\n        feeInCents\n        txCount\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SuspendCustomer($data: SuspendCustomerInput!) {\n    suspendCustomer(data: $data) {\n      ...CustomerRow\n    }\n  }\n"): (typeof documents)["\n  mutation SuspendCustomer($data: SuspendCustomerInput!) {\n    suspendCustomer(data: $data) {\n      ...CustomerRow\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ReactivateCustomer($id: ID!) {\n    reactivateCustomer(id: $id) {\n      ...CustomerRow\n    }\n  }\n"): (typeof documents)["\n  mutation ReactivateCustomer($id: ID!) {\n    reactivateCustomer(id: $id) {\n      ...CustomerRow\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RegenerateCustomerKycLink($id: ID!) {\n    regenerateCustomerKycLink(id: $id) {\n      id\n      kycLink\n      kycStatus\n      tosStatus\n      onboardingStep\n    }\n  }\n"): (typeof documents)["\n  mutation RegenerateCustomerKycLink($id: ID!) {\n    regenerateCustomerKycLink(id: $id) {\n      id\n      kycLink\n      kycStatus\n      tosStatus\n      onboardingStep\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeactivateVirtualAccount($id: ID!) {\n    deactivateVirtualAccount(id: $id) {\n      id\n      status\n      deactivatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation DeactivateVirtualAccount($id: ID!) {\n    deactivateVirtualAccount(id: $id) {\n      id\n      status\n      deactivatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment FeeScheduleFields on FeeSchedule {\n    id\n    status\n    effectivePeriod\n    notes\n    notifyCustomers\n    publishedAt\n    cancelledAt\n    createdAt\n    createdBy {\n      id\n      name\n    }\n    publishedBy {\n      id\n      name\n    }\n    tiers {\n      id\n      position\n      fromInCents\n      toInCents\n      rateBps\n    }\n  }\n"): (typeof documents)["\n  fragment FeeScheduleFields on FeeSchedule {\n    id\n    status\n    effectivePeriod\n    notes\n    notifyCustomers\n    publishedAt\n    cancelledAt\n    createdAt\n    createdBy {\n      id\n      name\n    }\n    publishedBy {\n      id\n      name\n    }\n    tiers {\n      id\n      position\n      fromInCents\n      toInCents\n      rateBps\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query FeeOverview {\n    currentFeeSchedule {\n      ...FeeScheduleFields\n    }\n    upcomingFeeSchedule {\n      ...FeeScheduleFields\n    }\n    feeSettings {\n      earliestEffectivePeriod\n      minimumPayoutInCents\n      softCapBps\n    }\n  }\n"): (typeof documents)["\n  query FeeOverview {\n    currentFeeSchedule {\n      ...FeeScheduleFields\n    }\n    upcomingFeeSchedule {\n      ...FeeScheduleFields\n    }\n    feeSettings {\n      earliestEffectivePeriod\n      minimumPayoutInCents\n      softCapBps\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query FeeSchedules($page: String, $sort: String, $filter: JSONObject) {\n    feeSchedules(page: $page, sort: $sort, filter: $filter) {\n      total\n      feeSchedules {\n        ...FeeScheduleFields\n      }\n    }\n  }\n"): (typeof documents)["\n  query FeeSchedules($page: String, $sort: String, $filter: JSONObject) {\n    feeSchedules(page: $page, sort: $sort, filter: $filter) {\n      total\n      feeSchedules {\n        ...FeeScheduleFields\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query FeeSchedule($id: ID!) {\n    feeSchedule(id: $id) {\n      ...FeeScheduleFields\n    }\n  }\n"): (typeof documents)["\n  query FeeSchedule($id: ID!) {\n    feeSchedule(id: $id) {\n      ...FeeScheduleFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateFeeScheduleDraft($data: CreateFeeScheduleDraftInput!) {\n    createFeeScheduleDraft(data: $data) {\n      ...FeeScheduleFields\n    }\n  }\n"): (typeof documents)["\n  mutation CreateFeeScheduleDraft($data: CreateFeeScheduleDraftInput!) {\n    createFeeScheduleDraft(data: $data) {\n      ...FeeScheduleFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateFeeScheduleDraft($data: UpdateFeeScheduleDraftInput!) {\n    updateFeeScheduleDraft(data: $data) {\n      ...FeeScheduleFields\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateFeeScheduleDraft($data: UpdateFeeScheduleDraftInput!) {\n    updateFeeScheduleDraft(data: $data) {\n      ...FeeScheduleFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation PublishFeeSchedule($data: PublishFeeScheduleInput!) {\n    publishFeeSchedule(data: $data) {\n      ...FeeScheduleFields\n    }\n  }\n"): (typeof documents)["\n  mutation PublishFeeSchedule($data: PublishFeeScheduleInput!) {\n    publishFeeSchedule(data: $data) {\n      ...FeeScheduleFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CancelFeeSchedule($id: ID!) {\n    cancelFeeSchedule(id: $id) {\n      ...FeeScheduleFields\n    }\n  }\n"): (typeof documents)["\n  mutation CancelFeeSchedule($id: ID!) {\n    cancelFeeSchedule(id: $id) {\n      ...FeeScheduleFields\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateFeeSettings($data: UpdateFeeSettingsInput!) {\n    updateFeeSettings(data: $data) {\n      earliestEffectivePeriod\n      minimumPayoutInCents\n      softCapBps\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateFeeSettings($data: UpdateFeeSettingsInput!) {\n    updateFeeSettings(data: $data) {\n      earliestEffectivePeriod\n      minimumPayoutInCents\n      softCapBps\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment AuditLogRow on AuditLog {\n    id\n    action\n    entity\n    entityId\n    actorId\n    actorRole\n    actor {\n      id\n      name\n      email\n    }\n    ip\n    before\n    after\n    createdAt\n  }\n"): (typeof documents)["\n  fragment AuditLogRow on AuditLog {\n    id\n    action\n    entity\n    entityId\n    actorId\n    actorRole\n    actor {\n      id\n      name\n      email\n    }\n    ip\n    before\n    after\n    createdAt\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query AuditLogs($page: String, $sort: String, $filter: JSONObject) {\n    auditLogs(page: $page, sort: $sort, filter: $filter) {\n      total\n      auditLogs {\n        ...AuditLogRow\n      }\n    }\n  }\n"): (typeof documents)["\n  query AuditLogs($page: String, $sort: String, $filter: JSONObject) {\n    auditLogs(page: $page, sort: $sort, filter: $filter) {\n      total\n      auditLogs {\n        ...AuditLogRow\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment WebhookEventRow on WebhookEvent {\n    id\n    bridgeEventId\n    category\n    type\n    objectId\n    status\n    attempts\n    error\n    payload\n    receivedAt\n    processedAt\n  }\n"): (typeof documents)["\n  fragment WebhookEventRow on WebhookEvent {\n    id\n    bridgeEventId\n    category\n    type\n    objectId\n    status\n    attempts\n    error\n    payload\n    receivedAt\n    processedAt\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query WebhookEvents($page: String, $sort: String, $filter: JSONObject) {\n    webhookEvents(page: $page, sort: $sort, filter: $filter) {\n      total\n      webhookEvents {\n        ...WebhookEventRow\n      }\n    }\n  }\n"): (typeof documents)["\n  query WebhookEvents($page: String, $sort: String, $filter: JSONObject) {\n    webhookEvents(page: $page, sort: $sort, filter: $filter) {\n      total\n      webhookEvents {\n        ...WebhookEventRow\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ReplayWebhookEvent($id: ID!) {\n    replayWebhookEvent(id: $id) {\n      ...WebhookEventRow\n    }\n  }\n"): (typeof documents)["\n  mutation ReplayWebhookEvent($id: ID!) {\n    replayWebhookEvent(id: $id) {\n      ...WebhookEventRow\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment StaffRow on User {\n    id\n    name\n    email\n    role\n    totpEnabled\n    lastLoginAt\n    deletedAt\n    createdAt\n  }\n"): (typeof documents)["\n  fragment StaffRow on User {\n    id\n    name\n    email\n    role\n    totpEnabled\n    lastLoginAt\n    deletedAt\n    createdAt\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query StaffUsers($page: String, $sort: String, $filter: JSONObject) {\n    staffUsers(page: $page, sort: $sort, filter: $filter) {\n      total\n      users {\n        ...StaffRow\n      }\n    }\n  }\n"): (typeof documents)["\n  query StaffUsers($page: String, $sort: String, $filter: JSONObject) {\n    staffUsers(page: $page, sort: $sort, filter: $filter) {\n      total\n      users {\n        ...StaffRow\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateStaffUser($data: CreateStaffUserInput!) {\n    createStaffUser(data: $data) {\n      ...StaffRow\n    }\n  }\n"): (typeof documents)["\n  mutation CreateStaffUser($data: CreateStaffUserInput!) {\n    createStaffUser(data: $data) {\n      ...StaffRow\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateStaffUser($data: UpdateStaffUserInput!) {\n    updateStaffUser(data: $data) {\n      ...StaffRow\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateStaffUser($data: UpdateStaffUserInput!) {\n    updateStaffUser(data: $data) {\n      ...StaffRow\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ResetStaffTotp($id: ID!) {\n    resetStaffTotp(id: $id) {\n      ...StaffRow\n    }\n  }\n"): (typeof documents)["\n  mutation ResetStaffTotp($id: ID!) {\n    resetStaffTotp(id: $id) {\n      ...StaffRow\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment SupportTicketRow on SupportTicket {\n    id\n    reference\n    subject\n    status\n    lastMessageAt\n    createdAt\n    customerId\n    customer {\n      id\n      user {\n        id\n        name\n        email\n      }\n    }\n    assigneeId\n    assignee {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  fragment SupportTicketRow on SupportTicket {\n    id\n    reference\n    subject\n    status\n    lastMessageAt\n    createdAt\n    customerId\n    customer {\n      id\n      user {\n        id\n        name\n        email\n      }\n    }\n    assigneeId\n    assignee {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query SupportTickets($page: String, $sort: String, $filter: JSONObject) {\n    supportTickets(page: $page, sort: $sort, filter: $filter) {\n      total\n      supportTickets {\n        ...SupportTicketRow\n      }\n    }\n  }\n"): (typeof documents)["\n  query SupportTickets($page: String, $sort: String, $filter: JSONObject) {\n    supportTickets(page: $page, sort: $sort, filter: $filter) {\n      total\n      supportTickets {\n        ...SupportTicketRow\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query SupportTicket($id: ID!) {\n    supportTicket(id: $id) {\n      ...SupportTicketRow\n      messages {\n        id\n        body\n        authorName\n        isStaff\n        createdAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query SupportTicket($id: ID!) {\n    supportTicket(id: $id) {\n      ...SupportTicketRow\n      messages {\n        id\n        body\n        authorName\n        isStaff\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ReplySupportTicket($input: ReplySupportTicketInput!) {\n    replySupportTicket(input: $input) {\n      id\n      status\n      lastMessageAt\n      messages {\n        id\n        body\n        authorName\n        isStaff\n        createdAt\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ReplySupportTicket($input: ReplySupportTicketInput!) {\n    replySupportTicket(input: $input) {\n      id\n      status\n      lastMessageAt\n      messages {\n        id\n        body\n        authorName\n        isStaff\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateSupportTicket($input: UpdateSupportTicketInput!) {\n    updateSupportTicket(input: $input) {\n      ...SupportTicketRow\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateSupportTicket($input: UpdateSupportTicketInput!) {\n    updateSupportTicket(input: $input) {\n      ...SupportTicketRow\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  fragment TransactionRow on Transaction {\n    id\n    reference\n    state\n    currency\n    rail\n    grossAmountInCents\n    feeInCents\n    netAmountInCents\n    usdEquivalentInCents\n    attempts\n    canRetry\n    failureReason\n    nextRetryAt\n    fundsReceivedAt\n    completedAt\n    createdAt\n    customerId\n    customer {\n      id\n      user {\n        id\n        name\n        email\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment TransactionRow on Transaction {\n    id\n    reference\n    state\n    currency\n    rail\n    grossAmountInCents\n    feeInCents\n    netAmountInCents\n    usdEquivalentInCents\n    attempts\n    canRetry\n    failureReason\n    nextRetryAt\n    fundsReceivedAt\n    completedAt\n    createdAt\n    customerId\n    customer {\n      id\n      user {\n        id\n        name\n        email\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Transactions($page: String, $sort: String, $filter: JSONObject) {\n    transactions(page: $page, sort: $sort, filter: $filter) {\n      total\n      transactions {\n        ...TransactionRow\n      }\n    }\n  }\n"): (typeof documents)["\n  query Transactions($page: String, $sort: String, $filter: JSONObject) {\n    transactions(page: $page, sort: $sort, filter: $filter) {\n      total\n      transactions {\n        ...TransactionRow\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query TransactionDetail($id: ID!) {\n    transaction(id: $id) {\n      ...TransactionRow\n      bridgeDepositId\n      bridgeTransferId\n      creditedAmountInCents\n      exchangeFeeInCents\n      fxRate\n      periodKey\n      creditedAt\n      sourceDetails\n      feeBreakdown\n      destinationWalletSnapshot\n      txHash\n      explorerUrl\n      feeSchedule {\n        id\n        effectivePeriod\n      }\n      virtualAccount {\n        id\n        bridgeVirtualAccountId\n        sourceCurrency\n        destinationCurrency\n        destinationChain\n      }\n      events {\n        id\n        source\n        type\n        payload\n        createdAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query TransactionDetail($id: ID!) {\n    transaction(id: $id) {\n      ...TransactionRow\n      bridgeDepositId\n      bridgeTransferId\n      creditedAmountInCents\n      exchangeFeeInCents\n      fxRate\n      periodKey\n      creditedAt\n      sourceDetails\n      feeBreakdown\n      destinationWalletSnapshot\n      txHash\n      explorerUrl\n      feeSchedule {\n        id\n        effectivePeriod\n      }\n      virtualAccount {\n        id\n        bridgeVirtualAccountId\n        sourceCurrency\n        destinationCurrency\n        destinationChain\n      }\n      events {\n        id\n        source\n        type\n        payload\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RetryPayout($id: ID!) {\n    retryPayout(id: $id) {\n      ...TransactionRow\n    }\n  }\n"): (typeof documents)["\n  mutation RetryPayout($id: ID!) {\n    retryPayout(id: $id) {\n      ...TransactionRow\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Login($data: LoginInput!) {\n    login(data: $data) {\n      accessToken\n      mfaRequired\n      mfaToken\n      totpSetupRequired\n    }\n  }\n"): (typeof documents)["\n  mutation Login($data: LoginInput!) {\n    login(data: $data) {\n      accessToken\n      mfaRequired\n      mfaToken\n      totpSetupRequired\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation VerifyAdminTotp($data: TotpInput!) {\n    verifyAdminTotp(data: $data) {\n      accessToken\n    }\n  }\n"): (typeof documents)["\n  mutation VerifyAdminTotp($data: TotpInput!) {\n    verifyAdminTotp(data: $data) {\n      accessToken\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation BeginTotpSetup($mfaToken: String!) {\n    beginTotpSetup(mfaToken: $mfaToken) {\n      secret\n      otpauthUrl\n    }\n  }\n"): (typeof documents)["\n  mutation BeginTotpSetup($mfaToken: String!) {\n    beginTotpSetup(mfaToken: $mfaToken) {\n      secret\n      otpauthUrl\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ConfirmTotpSetup($data: TotpInput!) {\n    confirmTotpSetup(data: $data) {\n      accessToken\n    }\n  }\n"): (typeof documents)["\n  mutation ConfirmTotpSetup($data: TotpInput!) {\n    confirmTotpSetup(data: $data) {\n      accessToken\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RequestPasswordReset($data: RequestPasswordResetInput!) {\n    requestPasswordReset(data: $data) {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation RequestPasswordReset($data: RequestPasswordResetInput!) {\n    requestPasswordReset(data: $data) {\n      success\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ResetPassword($data: ResetPasswordInput!) {\n    resetPassword(data: $data) {\n      success\n    }\n  }\n"): (typeof documents)["\n  mutation ResetPassword($data: ResetPasswordInput!) {\n    resetPassword(data: $data) {\n      success\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;