import { type SoftCapValues, softCapSchema } from "../schema";

import { useSnackbar } from "notistack";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import type { FeeScheduleFieldsFragment } from "@/__generated__/graphql";
import { useAuthContext } from "@/auth";
import ConfirmDialog from "@/components/ConfirmDialog";
import DataTable from "@/components/DataTable";
import { Form, FormErrorSummary, RHFNumberField } from "@/components/Form";
import ContentWrapper from "@/components/layout/containers/content-wrapper";
import StatusChip, { statusLabel } from "@/components/StatusChip";
import { CANCEL_FEE_SCHEDULE, FEE_OVERVIEW, FEE_SCHEDULES, UPDATE_FEE_SETTINGS } from "@/libs/Fee/useApollo";
import { useGridQuery } from "@/routes/hooks";
import { paths } from "@/routes/paths";
import { TierTable } from "@/sections/Fee/TierTable";
import { tierRangeLabel } from "@/utils/fee";
import { fDateTime, fPeriod } from "@/utils/format-time";
import { applyServerErrors, errorMessage } from "@/utils/graphql";
import { bpsToPercent, formatMoney } from "@/utils/money";
import { useMutation, useQuery } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";

type Schedule = FeeScheduleFieldsFragment;

const editable = (s: Schedule) => s.status === "Draft" || s.status === "Scheduled";

const tierSummary = (s: Schedule) =>
  [...s.tiers]
    .sort((a, b) => a.position - b.position)
    .map((t) => `${tierRangeLabel(t)} ${bpsToPercent(t.rateBps)}`)
    .join(" · ");

function ScheduleCard({
  title,
  schedule,
  empty,
  onCancel,
}: {
  title: string;
  schedule: Schedule | null | undefined;
  empty: string;
  onCancel?: (s: Schedule) => void;
}) {
  const { isAdmin } = useAuthContext();

  return (
    <Card className="h-full">
      <CardContent>
        <Box className="mb-1 flex flex-row items-center justify-between gap-2">
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          {schedule && <StatusChip kind="feeSchedule" value={schedule.status} />}
        </Box>
        {!schedule ? (
          <Typography variant="body2" className="text-text-secondary">
            {empty}
          </Typography>
        ) : (
          <>
            <Typography variant="body2" className="text-text-secondary mb-2">
              From {fPeriod(schedule.effectivePeriod)} 1st
              {schedule.publishedBy && ` · published by ${schedule.publishedBy.name}`}
              {schedule.notifyCustomers && schedule.status === "Scheduled" && " · customers emailed"}
            </Typography>
            <TierTable tiers={schedule.tiers} dense />
            {schedule.notes && (
              <Typography variant="body2" className="text-text-secondary mt-2 whitespace-pre-wrap">
                {schedule.notes}
              </Typography>
            )}
            {isAdmin && editable(schedule) && (
              <Box className="mt-3 flex flex-row gap-2">
                <Button component={Link} to={paths.fees.edit(schedule.id)} variant="outlined" size="small">
                  Edit
                </Button>
                {onCancel && (
                  <Button variant="outlined" color="error" size="small" onClick={() => onCancel(schedule)}>
                    Cancel change
                  </Button>
                )}
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SoftCapDialog({ open, softCapBps, onClose }: { open: boolean; softCapBps: number; onClose: () => void }) {
  const { enqueueSnackbar } = useSnackbar();
  const [update] = useMutation(UPDATE_FEE_SETTINGS);
  const methods = useForm<SoftCapValues>({
    resolver: zodResolver(softCapSchema),
    values: { softCap: softCapBps / 100 },
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      await update({ variables: { data: { softCapBps: Math.round(values.softCap * 100) } } });
      enqueueSnackbar("Soft cap updated", { variant: "success" });
      onClose();
    } catch (e) {
      if (!applyServerErrors(e, methods.setError, ["softCap"])) enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Rate soft cap</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <Typography variant="body2" className="text-text-secondary">
            The editor warns when a tier's rate is above this. It doesn&apos;t block publishing.
          </Typography>
          <RHFNumberField name="softCap" label="Soft cap %" min={0} max={100} step={0.5} decimals={2} />
          <FormErrorSummary />
        </DialogContent>
        <DialogActions>
          <Button variant="text" color="grey" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={methods.formState.isSubmitting}>
            Save
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

export default function FeeScheduleListView() {
  const { isAdmin } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [cancelTarget, setCancelTarget] = useState<Schedule | null>(null);
  const [softCapOpen, setSoftCapOpen] = useState(false);
  const overview = useQuery(FEE_OVERVIEW);
  const { variables, gridProps } = useGridQuery({ defaultSort: [{ field: "effectivePeriod", sort: "desc" }] });
  const history = useQuery(FEE_SCHEDULES, { variables });
  const [cancel, cancelState] = useMutation(CANCEL_FEE_SCHEDULE, { refetchQueries: [FEE_OVERVIEW, FEE_SCHEDULES] });
  const result = (history.data ?? history.previousData)?.feeSchedules;
  const settings = overview.data?.feeSettings;

  const onCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancel({ variables: { id: cancelTarget.id } });
      enqueueSnackbar(cancelTarget.status === "Draft" ? "Draft discarded" : "Scheduled change cancelled", {
        variant: "success",
      });
      setCancelTarget(null);
    } catch (e) {
      enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  };

  const columns = useMemo<GridColDef<Schedule>[]>(
    () => [
      {
        field: "effectivePeriod",
        headerName: "Takes effect",
        minWidth: 150,
        valueFormatter: (value: string) => fPeriod(value),
      },
      {
        field: "status",
        headerName: "Status",
        type: "singleSelect",
        valueOptions: ["Draft", "Scheduled", "Active", "Superseded", "Cancelled"].map((value) => ({
          value,
          label: statusLabel("feeSchedule", value),
        })),
        width: 130,
        sortable: false,
        renderCell: ({ row }) => <StatusChip kind="feeSchedule" value={row.status} />,
      },
      {
        field: "tiers",
        headerName: "Tiers",
        minWidth: 320,
        flex: 2,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Typography variant="body2" className="truncate" title={tierSummary(row)}>
            {tierSummary(row)}
          </Typography>
        ),
      },
      {
        field: "createdAt",
        headerName: "Created",
        minWidth: 170,
        filterable: false,
        renderCell: ({ row }) => (
          <Box>
            <Typography variant="body2">{fDateTime(row.createdAt)}</Typography>
            <Typography variant="caption" className="text-text-secondary">
              {row.createdBy?.name ?? "—"}
            </Typography>
          </Box>
        ),
      },
      {
        field: "publishedAt",
        headerName: "Published",
        minWidth: 170,
        filterable: false,
        renderCell: ({ row }) => (
          <Box>
            <Typography variant="body2">{fDateTime(row.publishedAt)}</Typography>
            {row.publishedBy && (
              <Typography variant="caption" className="text-text-secondary">
                {row.publishedBy.name}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        field: "actions",
        headerName: "",
        width: 170,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) =>
          isAdmin && editable(row) ? (
            <Box className="flex flex-row gap-1">
              <Button component={Link} to={paths.fees.edit(row.id)} size="small" variant="text">
                Edit
              </Button>
              <Button size="small" variant="text" color="error" onClick={() => setCancelTarget(row)}>
                {row.status === "Draft" ? "Discard" : "Cancel"}
              </Button>
            </Box>
          ) : null,
      },
    ],
    [isAdmin],
  );

  return (
    <ContentWrapper>
      {(overview.error || history.error) && (
        <Alert severity="error" className="mb-4">
          {errorMessage(overview.error ?? history.error)}
        </Alert>
      )}
      <Grid container spacing={2.5} className="mb-5">
        <Grid size={{ xs: 12, md: 6 }}>
          <ScheduleCard
            title="Current fees"
            schedule={overview.data?.currentFeeSchedule}
            empty="No schedule is in effect."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ScheduleCard
            title="Upcoming change"
            schedule={overview.data?.upcomingFeeSchedule}
            empty="No change is scheduled."
            onCancel={setCancelTarget}
          />
        </Grid>
        {settings && (
          <Grid size={12}>
            <Card>
              <CardContent className="flex flex-row flex-wrap items-center justify-between gap-3">
                <Typography variant="body2" className="text-text-secondary">
                  Rate soft cap <strong className="text-text-primary">{bpsToPercent(settings.softCapBps)}</strong> ·
                  Bridge minimum payout{" "}
                  <strong className="text-text-primary">{formatMoney(settings.minimumPayoutInCents, "usd")}</strong>{" "}
                  (fees are lowered so payouts never fall below it) · earliest new schedule{" "}
                  <strong className="text-text-primary">{fPeriod(settings.earliestEffectivePeriod)}</strong>
                </Typography>
                {isAdmin && (
                  <Button size="small" variant="outlined" color="grey" onClick={() => setSoftCapOpen(true)}>
                    Change soft cap
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" className="mb-2">
            History
          </Typography>
          <DataTable
            {...gridProps}
            rows={result?.feeSchedules ?? []}
            rowCount={result?.total ?? 0}
            columns={columns}
            loading={history.loading && !result}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!cancelTarget}
        title={cancelTarget?.status === "Draft" ? "Discard this draft?" : "Cancel this fee change?"}
        description={
          cancelTarget?.status === "Draft"
            ? "The draft is kept in history as cancelled."
            : `The ${fPeriod(cancelTarget?.effectivePeriod)} change won't take effect; current fees stay in place.${
                cancelTarget?.notifyCustomers ? " Customers who were emailed are not told automatically." : ""
              }`
        }
        confirmLabel={cancelTarget?.status === "Draft" ? "Discard" : "Cancel change"}
        color="error"
        loading={cancelState.loading}
        onConfirm={onCancel}
        onClose={() => setCancelTarget(null)}
      />
      {settings && (
        <SoftCapDialog open={softCapOpen} softCapBps={settings.softCapBps} onClose={() => setSoftCapOpen(false)} />
      )}
    </ContentWrapper>
  );
}
