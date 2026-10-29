import { gql } from "@/__generated__";

export const AUDIT_LOG_ROW = gql(`
  fragment AuditLogRow on AuditLog {
    id
    action
    entity
    entityId
    actorId
    actorRole
    actor {
      id
      name
      email
    }
    ip
    before
    after
    createdAt
  }
`);

export const AUDIT_LOGS = gql(`
  query AuditLogs($page: String, $sort: String, $filter: JSONObject) {
    auditLogs(page: $page, sort: $sort, filter: $filter) {
      total
      auditLogs {
        ...AuditLogRow
      }
    }
  }
`);

export const WEBHOOK_EVENT_ROW = gql(`
  fragment WebhookEventRow on WebhookEvent {
    id
    bridgeEventId
    category
    type
    objectId
    status
    attempts
    error
    payload
    receivedAt
    processedAt
  }
`);

export const WEBHOOK_EVENTS = gql(`
  query WebhookEvents($page: String, $sort: String, $filter: JSONObject) {
    webhookEvents(page: $page, sort: $sort, filter: $filter) {
      total
      webhookEvents {
        ...WebhookEventRow
      }
    }
  }
`);

export const REPLAY_WEBHOOK_EVENT = gql(`
  mutation ReplayWebhookEvent($id: ID!) {
    replayWebhookEvent(id: $id) {
      ...WebhookEventRow
    }
  }
`);
