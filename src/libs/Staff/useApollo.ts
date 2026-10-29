import { gql } from "@/__generated__";

export const STAFF_ROW = gql(`
  fragment StaffRow on User {
    id
    name
    email
    role
    totpEnabled
    lastLoginAt
    deletedAt
    createdAt
  }
`);

export const STAFF_USERS = gql(`
  query StaffUsers($page: String, $sort: String, $filter: JSONObject) {
    staffUsers(page: $page, sort: $sort, filter: $filter) {
      total
      users {
        ...StaffRow
      }
    }
  }
`);

export const CREATE_STAFF_USER = gql(`
  mutation CreateStaffUser($data: CreateStaffUserInput!) {
    createStaffUser(data: $data) {
      ...StaffRow
    }
  }
`);

export const UPDATE_STAFF_USER = gql(`
  mutation UpdateStaffUser($data: UpdateStaffUserInput!) {
    updateStaffUser(data: $data) {
      ...StaffRow
    }
  }
`);

export const RESET_STAFF_TOTP = gql(`
  mutation ResetStaffTotp($id: ID!) {
    resetStaffTotp(id: $id) {
      ...StaffRow
    }
  }
`);
