import { tiersAboveSoftCap } from "../feeRules";
import { FeePreview } from "../Preview";
import { type FeeScheduleValues, feeScheduleSchema, futureMonths, toRows, toTiers } from "../schema";

import { useSnackbar } from "notistack";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link } from "react-router";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import type { FeeOverviewQuery, FeeScheduleFieldsFragment } from "@/__generated__/graphql";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  Form,
  FormErrorSummary,
  RHFAmount,
  RHFNumberField,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
} from "@/components/Form";
import ContentWrapper from "@/components/layout/containers/content-wrapper";
import LoadingScreen from "@/components/LoadingScreen";
import PageHeader from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiPlus from "@/icons/nexture/ni-plus";
import {
  CREATE_FEE_SCHEDULE_DRAFT,
  FEE_OVERVIEW,
  FEE_SCHEDULE,
  FEE_SCHEDULES,
  PUBLISH_FEE_SCHEDULE,
  UPDATE_FEE_SCHEDULE_DRAFT,
} from "@/libs/Fee/useApollo";
import { useRouter } from "@/routes/hooks";
import { paths } from "@/routes/paths";
import { fPeriod } from "@/utils/format-time";
import { applyServerErrors, errorMessage } from "@/utils/graphql";
import { bpsToPercent, formatMoney } from "@/utils/money";
import { useMutation, useQuery } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";

type Overview = FeeOverviewQuery;
type Schedule = FeeScheduleFieldsFragment;

const MAX_TIERS = 20;
const FORM_FIELDS = ["effectivePeriod", "notes", "notifyCustomers", "tiers"] as const;

function Editor({ overview, schedule }: { overview: Overview; schedule: Schedule | null }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [busy, setBusy] = useState(false);
  const refetchQueries = [FEE_OVERVIEW, FEE_SCHEDULES];
  const [createDraft] = useMutation(CREATE_FEE_SCHEDULE_DRAFT, { refetchQueries });
  const [updateDraft] = useMutation(UPDATE_FEE_SCHEDULE_DRAFT, { refetchQueries });
  const [publish] = useMutation(PUBLISH_FEE_SCHEDULE, { refetchQueries });

  const settings = overview.feeSettings;
  const current = overview.currentFeeSchedule;
  const scheduled = schedule?.status === "Scheduled";
  const months = useMemo(() => futureMonths(settings.earliestEffectivePeriod), [settings.earliestEffectivePeriod]);

  const methods = useForm<FeeScheduleValues>({
    resolver: zodResolver(feeScheduleSchema),
    mode: "onChange",
    defaultValues: {
      effectivePeriod:
        schedule && schedule.effectivePeriod >= settings.earliestEffectivePeriod
          ? schedule.effectivePeriod
          : settings.earliestEffectivePeriod,
      notes: schedule?.notes ?? "",
      notifyCustomers: schedule?.notifyCustomers ?? true,
      tiers: toRows(schedule?.tiers ?? current?.tiers ?? [{ position: 1, toInCents: null, rateBps: 0 }]),
    },
  });
  const { fields, append, remove } = useFieldArray({ control: methods.control, name: "tiers" });
  const rows = useWatch({ control: methods.control, name: "tiers" });
  const period = useWatch({ control: methods.control, name: "effectivePeriod" });
  const tiers = useMemo(() => toTiers(rows ?? []), [rows]);
  const currentTiers = useMemo(
    () =>
      current?.tiers.map((t) => ({
        position: t.position,
        fromInCents: t.fromInCents,
        toInCents: t.toInCents ?? null,
        rateBps: t.rateBps,
      })) ?? null,
    [current],
  );
  const aboveCap = tiersAboveSoftCap(tiers, settings.softCapBps);

  const addTier = () => {
    const last = rows[rows.length - 1];
    const from = tiers[tiers.length - 1]?.fromInCents ?? 0n;
    // The old last tier needs an upper limit now; suggest double its start (at least $1,000)
    const suggested = from > 0n ? from * 2n : 100_000n;
    methods.setValue(`tiers.${rows.length - 1}.toInCents`, last?.toInCents ?? suggested, { shouldValidate: true });
    append({ toInCents: null, rate: last?.rate ?? 0 });
  };

  const save = async (values: FeeScheduleValues) => {
    const input = {
      effectivePeriod: values.effectivePeriod,
      notes: values.notes,
      tiers: toTiers(values.tiers).map((t) => ({
        fromInCents: t.fromInCents,
        toInCents: t.toInCents,
        rateBps: t.rateBps,
      })),
    };
    if (schedule) {
      const { data } = await updateDraft({
        variables: { data: { id: schedule.id, ...input, notifyCustomers: values.notifyCustomers } },
      });
      return data!.updateFeeScheduleDraft;
    }
    const { data } = await createDraft({ variables: { data: input } });
    const created = data!.createFeeScheduleDraft;
    if (created.notifyCustomers !== values.notifyCustomers) {
      await updateDraft({ variables: { data: { id: created.id, notifyCustomers: values.notifyCustomers } } });
    }
    return created;
  };

  const handleError = (e: unknown) => {
    if (!applyServerErrors(e, methods.setError, [...FORM_FIELDS]))
      enqueueSnackbar(errorMessage(e), { variant: "error" });
  };

  const onSave = methods.handleSubmit(async (values) => {
    try {
      const saved = await save(values);
      enqueueSnackbar(scheduled ? "Scheduled change updated" : "Draft saved", { variant: "success" });
      if (!schedule) router.replace(paths.fees.edit(saved.id));
    } catch (e) {
      handleError(e);
    }
  });

  const onPublishClick = methods.handleSubmit(() => setConfirmPublish(true));

  const onPublish = async () => {
    const values = methods.getValues();
    setBusy(true);
    try {
      const saved = await save(values);
      await publish({
        variables: {
          data: { id: saved.id, effectivePeriod: values.effectivePeriod, notifyCustomers: values.notifyCustomers },
        },
      });
      enqueueSnackbar(`New fees scheduled for ${fPeriod(values.effectivePeriod)}`, { variant: "success" });
      router.push(paths.fees.root);
    } catch (e) {
      setConfirmPublish(false);
      handleError(e);
    } finally {
      setBusy(false);
    }
  };

  const submitting = methods.formState.isSubmitting || busy;

  return (
    <Form methods={methods} onSubmit={onSave}>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card className="mb-5">
            <CardContent>
              <Box className="mb-3 flex flex-row items-center justify-between gap-2">
                <Typography variant="h6" component="h2">
                  Tiers
                </Typography>
                {schedule && <StatusChip kind="feeSchedule" value={schedule.status} />}
              </Box>
              <Typography variant="body2" className="text-text-secondary mb-3">
                Each portion of a customer's monthly USD volume is charged at its tier's rate. Tiers reset on the 1st of
                every month (UTC).
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell className="w-1/4">From</TableCell>
                    <TableCell className="w-1/3">Up to</TableCell>
                    <TableCell className="w-1/4">Rate %</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, index) => {
                    const last = index === fields.length - 1;
                    return (
                      <TableRow key={field.id} className="align-top">
                        <TableCell className="pt-4">
                          <Typography variant="body2">{formatMoney(tiers[index]?.fromInCents ?? 0n, "usd")}</Typography>
                        </TableCell>
                        <TableCell>
                          {last ? (
                            <Typography variant="body2" className="text-text-secondary pt-2">
                              No limit
                            </Typography>
                          ) : (
                            <RHFAmount name={`tiers.${index}.toInCents`} label={`Tier ${index + 1} up to`} />
                          )}
                        </TableCell>
                        <TableCell>
                          <RHFNumberField
                            name={`tiers.${index}.rate`}
                            label={`Tier ${index + 1} rate %`}
                            min={0}
                            max={100}
                            step={0.25}
                            decimals={2}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Remove tier">
                            <span>
                              <IconButton
                                aria-label={`Remove tier ${index + 1}`}
                                size="small"
                                disabled={fields.length === 1}
                                onClick={() => remove(index)}
                              >
                                <NiBinEmpty size="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Button
                variant="outlined"
                color="grey"
                size="small"
                startIcon={<NiPlus size="small" />}
                className="mt-3"
                disabled={fields.length >= MAX_TIERS}
                onClick={addTier}
              >
                Add tier
              </Button>
              {methods.formState.errors.tiers?.root?.message && (
                <Alert severity="error" className="mt-3">
                  {methods.formState.errors.tiers.root.message}
                </Alert>
              )}
              {aboveCap.length > 0 && (
                <Alert severity="warning" className="mt-3">
                  {aboveCap.map((i) => `Tier ${i + 1}`).join(", ")} {aboveCap.length === 1 ? "is" : "are"} above the
                  soft cap of {bpsToPercent(settings.softCapBps)}. You can still publish, but double-check the rate.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card className="mb-5">
            <CardContent className="flex flex-col gap-4">
              <Typography variant="h6" component="h2">
                Schedule
              </Typography>
              <RHFSelect name="effectivePeriod" label="Takes effect" options={months} />
              <RHFTextField name="notes" label="Internal notes" multiline rows={3} />
              <RHFSwitch
                name="notifyCustomers"
                label="Email customers about this change"
                helperText={
                  scheduled
                    ? "Emails go out when a schedule is published, so changing this now has no effect."
                    : "Sent once, when you publish."
                }
                disabled={scheduled}
              />
              <FormErrorSummary />
              <Box className="flex flex-row flex-wrap justify-end gap-2">
                <Button component={Link} to={paths.fees.root} variant="text" color="grey" disabled={submitting}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant={scheduled ? "contained" : "outlined"}
                  loading={methods.formState.isSubmitting}
                >
                  {scheduled ? "Save changes" : "Save draft"}
                </Button>
                {!scheduled && (
                  <Button variant="contained" onClick={onPublishClick} disabled={submitting}>
                    Publish
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <FeePreview current={currentTiers} next={tiers} />
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirmPublish}
        title={`Publish new fees for ${fPeriod(period)}?`}
        description={
          <>
            Deposits received from {fPeriod(period)} 1st (UTC) use these tiers. Earlier deposits keep their fees.
            {methods.getValues("notifyCustomers") && " Every active customer gets an email about the change."} You can
            still edit or cancel it until the month starts.
          </>
        }
        confirmLabel="Publish"
        loading={busy}
        onConfirm={onPublish}
        onClose={() => setConfirmPublish(false)}
      />
    </Form>
  );
}

export default function FeeScheduleFormView({ id }: { id?: string }) {
  const overview = useQuery(FEE_OVERVIEW);
  const detail = useQuery(FEE_SCHEDULE, { variables: { id: id ?? "" }, skip: !id });
  const schedule = detail.data?.feeSchedule ?? null;
  const title = id ? "Edit fee schedule" : "New fee schedule";
  const editable = !schedule || schedule.status === "Draft" || schedule.status === "Scheduled";

  const header = (
    <PageHeader title={title} crumbs={[{ label: "Fees", href: paths.fees.root }, { label: id ? "Edit" : "New" }]} />
  );

  if ((overview.loading && !overview.data) || (id && detail.loading && !detail.data)) return <LoadingScreen inline />;
  const error = overview.error ?? detail.error;
  if (!overview.data || (id && !schedule) || !editable) {
    return (
      <>
        {header}
        <ContentWrapper>
          <Alert severity={error ? "error" : "warning"}>
            {error
              ? errorMessage(error)
              : !editable
                ? "Active and past schedules can't be changed. Create a new schedule for a later month."
                : "Fee schedule not found."}
          </Alert>
        </ContentWrapper>
      </>
    );
  }

  return (
    <>
      {header}
      <ContentWrapper>
        <Editor key={schedule?.id ?? "new"} overview={overview.data} schedule={schedule} />
      </ContentWrapper>
    </>
  );
}
