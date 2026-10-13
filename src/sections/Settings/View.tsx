import { type FeeAccountValues, feeAccountSchema } from "./schema";

import { useSnackbar } from "notistack";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";

import { Form, FormErrorSummary, RHFSelect, RHFTextField } from "@/components/Form";
import ContentWrapper from "@/components/layout/containers/content-wrapper";
import { CONFIGURE_FEE_EXTERNAL_ACCOUNT, FEE_EXTERNAL_ACCOUNT } from "@/libs/Admin/useApollo";
import { useAppInfo } from "@/libs/AppInfo/useApollo";
import { chainLabel } from "@/utils/explorer";
import { fDateTime } from "@/utils/format-time";
import { applyServerErrors, errorMessage } from "@/utils/graphql";
import { useMutation, useQuery } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";

const FIELDS = [
  "bankName",
  "accountOwnerName",
  "routingNumber",
  "accountNumber",
  "checkingOrSavings",
  "streetLine1",
  "streetLine2",
  "city",
  "state",
  "postalCode",
] as const;

function FeeAccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { enqueueSnackbar } = useSnackbar();
  const [configure] = useMutation(CONFIGURE_FEE_EXTERNAL_ACCOUNT, { refetchQueries: [FEE_EXTERNAL_ACCOUNT] });
  const methods = useForm<FeeAccountValues>({
    resolver: zodResolver(feeAccountSchema),
    defaultValues: {
      bankName: "",
      accountOwnerName: "",
      routingNumber: "",
      accountNumber: "",
      checkingOrSavings: "checking",
      streetLine1: "",
      streetLine2: "",
      city: "",
      state: "",
      postalCode: "",
    },
  });

  const close = () => {
    methods.reset();
    onClose();
  };

  const onSubmit = methods.handleSubmit(async (v) => {
    try {
      await configure({
        variables: {
          input: {
            bankName: v.bankName,
            accountOwnerName: v.accountOwnerName,
            routingNumber: v.routingNumber,
            accountNumber: v.accountNumber,
            checkingOrSavings: v.checkingOrSavings,
            address: {
              streetLine1: v.streetLine1,
              streetLine2: v.streetLine2 || undefined,
              city: v.city,
              state: v.state.toUpperCase(),
              postalCode: v.postalCode,
              country: "USA",
            },
          },
        },
      });
      enqueueSnackbar("Fee payout account saved at Bridge", { variant: "success" });
      close();
    } catch (e) {
      if (!applyServerErrors(e, methods.setError, [...FIELDS])) enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  });

  return (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Fee payout account</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <Typography variant="body2" className="text-text-secondary">
            Bridge sends the developer fees it collects to this US bank account. The details go straight to Bridge; NxPay
            only shows the last 4 digits.
          </Typography>
          <RHFTextField name="bankName" label="Bank name" />
          <RHFTextField name="accountOwnerName" label="Account holder" />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField name="routingNumber" label="Routing number" inputProps={{ inputMode: "numeric" }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField name="accountNumber" label="Account number" inputProps={{ inputMode: "numeric" }} />
            </Grid>
          </Grid>
          <RHFSelect
            name="checkingOrSavings"
            label="Account type"
            options={[
              { value: "checking", label: "Checking" },
              { value: "savings", label: "Savings" },
            ]}
          />
          <Typography variant="subtitle2">Account holder address (US)</Typography>
          <RHFTextField name="streetLine1" label="Street address" />
          <RHFTextField name="streetLine2" label="Address line 2 (optional)" />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField name="city" label="City" />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <RHFTextField name="state" label="State" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <RHFTextField name="postalCode" label="ZIP code" inputProps={{ inputMode: "numeric" }} />
            </Grid>
          </Grid>
          <FormErrorSummary />
        </DialogContent>
        <DialogActions>
          <Button variant="text" color="grey" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={methods.formState.isSubmitting}>
            Save at Bridge
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

export default function SettingsView() {
  const appInfo = useAppInfo();
  const [open, setOpen] = useState(false);
  const { data, loading, error } = useQuery(FEE_EXTERNAL_ACCOUNT);
  const account = data?.feeExternalAccount;

  return (
    <ContentWrapper>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="h-full">
            <CardContent>
              <Typography variant="h6" component="h2" className="mb-3">
                Bridge
              </Typography>
              <Box className="mb-3 flex flex-row items-center gap-2">
                <Typography variant="body2" className="text-text-secondary">
                  Environment
                </Typography>
                {appInfo ? (
                  <Chip
                    size="small"
                    color={appInfo.sandbox ? "warning" : "success"}
                    label={appInfo.sandbox ? `Sandbox (${appInfo.bridgeEnv})` : `Live (${appInfo.bridgeEnv})`}
                  />
                ) : (
                  <Chip size="small" label="Loading" />
                )}
              </Box>
              <Typography variant="body2" className="text-text-secondary">
                Default payout network: {chainLabel(appInfo?.defaultPayoutChain)}
              </Typography>
              <Typography variant="body2" className="text-text-secondary mt-2">
                The environment and API key come from the backend&apos;s environment variables, so switching to live is
                a deploy, not a setting.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="h-full">
            <CardContent>
              <Box className="mb-3 flex flex-row items-center justify-between gap-2">
                <Typography variant="h6" component="h2">
                  Fee payout account
                </Typography>
                {account && (
                  <Chip
                    size="small"
                    color={account.active ? "success" : "warning"}
                    label={account.active ? "Active" : "Inactive"}
                  />
                )}
              </Box>
              {error && (
                <Alert severity="error" className="mb-3">
                  {errorMessage(error)}
                </Alert>
              )}
              {loading && !data ? null : account ? (
                <>
                  <Typography variant="body1">
                    {account.bankName} ···· {account.last4}
                  </Typography>
                  <Typography variant="body2" className="text-text-secondary">
                    {account.accountOwnerName} · updated {fDateTime(account.updatedAt)}
                  </Typography>
                </>
              ) : (
                <Alert severity="warning">
                  No fee payout account yet. Configure one so Bridge can pay out the fees it collects.
                </Alert>
              )}
              <Button variant="outlined" className="mt-3" onClick={() => setOpen(true)}>
                {account ? "Replace account" : "Configure account"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <FeeAccountDialog open={open} onClose={() => setOpen(false)} />
    </ContentWrapper>
  );
}
