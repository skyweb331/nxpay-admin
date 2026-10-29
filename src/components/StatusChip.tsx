import { Chip, ChipProps } from "@mui/material";

type Color = ChipProps["color"];
type Entry = { label: string; color: Color };

const MAPS = {
  transaction: {
    Received: { label: "Received", color: "info" },
    Converting: { label: "Converting", color: "info" },
    InReview: { label: "In review", color: "warning" },
    Credited: { label: "Credited", color: "info" },
    PayoutPending: { label: "Payout pending", color: "info" },
    PayoutSubmitted: { label: "Payout submitted", color: "info" },
    PayoutFailed: { label: "Payout failed", color: "error" },
    Completed: { label: "Completed", color: "success" },
    Refunded: { label: "Refunded", color: "grey" },
  },
  customer: {
    AwaitingApproval: { label: "Awaiting approval", color: "warning" },
    Onboarding: { label: "Onboarding", color: "info" },
    Active: { label: "Active", color: "success" },
    Suspended: { label: "Suspended", color: "error" },
  },
  kyc: {
    not_started: { label: "Not started", color: "grey" },
    incomplete: { label: "Incomplete", color: "warning" },
    awaiting_questionnaire: { label: "Action needed", color: "warning" },
    awaiting_ubo: { label: "Action needed", color: "warning" },
    under_review: { label: "Under review", color: "info" },
    paused: { label: "Paused", color: "warning" },
    approved: { label: "Approved", color: "success" },
    active: { label: "Approved", color: "success" },
    rejected: { label: "Rejected", color: "error" },
    offboarded: { label: "Offboarded", color: "error" },
  },
  virtualAccount: {
    activated: { label: "Active", color: "success" },
    active: { label: "Active", color: "success" },
    deactivated: { label: "Deactivated", color: "grey" },
    pending: { label: "Pending", color: "info" },
  },
  ticket: {
    Open: { label: "Open", color: "info" },
    Pending: { label: "Awaiting customer", color: "warning" },
    Resolved: { label: "Resolved", color: "success" },
    Closed: { label: "Closed", color: "grey" },
  },
  wallet: {
    Active: { label: "Active", color: "success" },
    Archived: { label: "Archived", color: "grey" },
  },
  walletKey: {
    Stored: { label: "Key stored", color: "info" },
    Exported: { label: "Key exported", color: "warning" },
    Removed: { label: "Key removed", color: "grey" },
    None: { label: "External", color: "grey" },
  },
  feeSchedule: {
    Draft: { label: "Draft", color: "grey" },
    Scheduled: { label: "Scheduled", color: "info" },
    Active: { label: "Active", color: "success" },
    Superseded: { label: "Superseded", color: "grey" },
    Cancelled: { label: "Cancelled", color: "grey" },
  },
  webhook: {
    Pending: { label: "Pending", color: "info" },
    Processed: { label: "Processed", color: "success" },
    Ignored: { label: "Ignored", color: "grey" },
    Failed: { label: "Failed", color: "error" },
  },
  staff: {
    Admin: { label: "Admin", color: "primary" },
    Support: { label: "Support", color: "info" },
  },
} satisfies Record<string, Record<string, Entry>>;

export type StatusKind = keyof typeof MAPS;

export const statusLabel = (kind: StatusKind, value?: string | null) =>
  value ? ((MAPS[kind] as Record<string, Entry>)[value]?.label ?? value.replace(/_/g, " ")) : "—";

export function StatusChip({
  kind,
  value,
  size = "small",
  ...props
}: { kind: StatusKind; value?: string | null } & Omit<ChipProps, "label" | "color">) {
  const entry = value ? (MAPS[kind] as Record<string, Entry>)[value] : undefined;

  return (
    <Chip
      size={size}
      variant="filled"
      color={entry?.color ?? "grey"}
      label={entry?.label ?? statusLabel(kind, value)}
      {...props}
    />
  );
}

export default StatusChip;
