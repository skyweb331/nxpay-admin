import { gql } from "@/__generated__";

export const FEE_SCHEDULE_FIELDS = gql(`
  fragment FeeScheduleFields on FeeSchedule {
    id
    status
    effectivePeriod
    notes
    notifyCustomers
    publishedAt
    cancelledAt
    createdAt
    createdBy {
      id
      name
    }
    publishedBy {
      id
      name
    }
    tiers {
      id
      position
      fromInCents
      toInCents
      rateBps
    }
  }
`);

export const FEE_OVERVIEW = gql(`
  query FeeOverview {
    currentFeeSchedule {
      ...FeeScheduleFields
    }
    upcomingFeeSchedule {
      ...FeeScheduleFields
    }
    feeSettings {
      earliestEffectivePeriod
      minimumPayoutInCents
      softCapBps
    }
  }
`);

export const FEE_SCHEDULES = gql(`
  query FeeSchedules($page: String, $sort: String, $filter: JSONObject) {
    feeSchedules(page: $page, sort: $sort, filter: $filter) {
      total
      feeSchedules {
        ...FeeScheduleFields
      }
    }
  }
`);

export const FEE_SCHEDULE = gql(`
  query FeeSchedule($id: ID!) {
    feeSchedule(id: $id) {
      ...FeeScheduleFields
    }
  }
`);

export const CREATE_FEE_SCHEDULE_DRAFT = gql(`
  mutation CreateFeeScheduleDraft($data: CreateFeeScheduleDraftInput!) {
    createFeeScheduleDraft(data: $data) {
      ...FeeScheduleFields
    }
  }
`);

export const UPDATE_FEE_SCHEDULE_DRAFT = gql(`
  mutation UpdateFeeScheduleDraft($data: UpdateFeeScheduleDraftInput!) {
    updateFeeScheduleDraft(data: $data) {
      ...FeeScheduleFields
    }
  }
`);

export const PUBLISH_FEE_SCHEDULE = gql(`
  mutation PublishFeeSchedule($data: PublishFeeScheduleInput!) {
    publishFeeSchedule(data: $data) {
      ...FeeScheduleFields
    }
  }
`);

export const CANCEL_FEE_SCHEDULE = gql(`
  mutation CancelFeeSchedule($id: ID!) {
    cancelFeeSchedule(id: $id) {
      ...FeeScheduleFields
    }
  }
`);

export const UPDATE_FEE_SETTINGS = gql(`
  mutation UpdateFeeSettings($data: UpdateFeeSettingsInput!) {
    updateFeeSettings(data: $data) {
      earliestEffectivePeriod
      minimumPayoutInCents
      softCapBps
    }
  }
`);
