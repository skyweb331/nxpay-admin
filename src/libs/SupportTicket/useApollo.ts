import { gql } from "@/__generated__";

export const SUPPORT_TICKET_ROW = gql(`
  fragment SupportTicketRow on SupportTicket {
    id
    reference
    subject
    status
    lastMessageAt
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
    assigneeId
    assignee {
      id
      name
    }
  }
`);

export const SUPPORT_TICKETS = gql(`
  query SupportTickets($page: String, $sort: String, $filter: JSONObject) {
    supportTickets(page: $page, sort: $sort, filter: $filter) {
      total
      supportTickets {
        ...SupportTicketRow
      }
    }
  }
`);

export const SUPPORT_TICKET = gql(`
  query SupportTicket($id: ID!) {
    supportTicket(id: $id) {
      ...SupportTicketRow
      messages {
        id
        body
        authorName
        isStaff
        createdAt
      }
    }
  }
`);

export const REPLY_SUPPORT_TICKET = gql(`
  mutation ReplySupportTicket($input: ReplySupportTicketInput!) {
    replySupportTicket(input: $input) {
      id
      status
      lastMessageAt
      messages {
        id
        body
        authorName
        isStaff
        createdAt
      }
    }
  }
`);

export const UPDATE_SUPPORT_TICKET = gql(`
  mutation UpdateSupportTicket($input: UpdateSupportTicketInput!) {
    updateSupportTicket(input: $input) {
      ...SupportTicketRow
    }
  }
`);
