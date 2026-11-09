import { ONBOARDING_STEP_LABELS } from "../columns";
import { changeEmailSchema, type ChangeEmailValues } from "../schema";
import { useSnackbar } from "notistack";
import { ReactNode, useState } from "react";
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

import type { CustomerDetailQuery } from "@/__generated__/graphql";
import { useAuthContext } from "@/auth";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CopyField } from "@/components/CopyButton";
import { Form, FormErrorSummary, RHFTextField } from "@/components/Form";
import JsonView from "@/components/JsonView";
import StatusChip from "@/components/StatusChip";
import {
  REGENERATE_CUSTOMER_KYC_LINK,
  RESET_CUSTOMER_TWO_FACTOR,
  UPDATE_CUSTOMER_EMAIL,
} from "@/libs/Customer/useApollo";
import { fDateTime } from "@/utils/format-time";
import { applyServerErrors, errorMessage } from "@/utils/graphql";
import { useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";

type Customer = NonNullable<CustomerDetailQuery["customer"]>;

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box className="flex flex-row items-baseline justify-between gap-4 py-1.5">
    <Typography variant="body2" className="text-text-secondary">
      {label}
    </Typography>
    <Typography variant="body2" component="span" className="text-end">
      {children}
    </Typography>
  </Box>
);

type Endorsement = { name?: string; status?: string };

function Endorsements({ value }: { value: unknown }) {
  if (!Array.isArray(value) || value.length === 0) {
    return (
      <Typography variant="body2" className="text-text-secondary">
        None reported by Bridge yet.
      </Typography>
    );
  }
  return (
    <Box className="flex flex-row flex-wrap gap-2">
      {(value as Endorsement[]).map((e, i) => (
        <Chip
          key={e.name ?? i}
          size="small"
          variant="outlined"
          color={e.status === "approved" ? "success" : e.status === "revoked" ? "error" : "default"}
          label={`${e.name ?? "endorsement"}: ${e.status ?? "unknown"}`}
        />
      ))}
    </Box>
  );
}

function rejectionText(reason: unknown) {
  if (typeof reason === "string") return reason;
  if (reason && typeof reason === "object") {
    const r = reason as { reason?: string; developer_reason?: string; customer_reason?: string };
    return r.developer_reason ?? r.reason ?? r.customer_reason ?? JSON.stringify(reason);
  }
  return String(reason);
}

function KycLink({ customer }: { customer: Customer }) {
  const { enqueueSnackbar } = useSnackbar();
  const [regenerate, { loading }] = useMutation(REGENERATE_CUSTOMER_KYC_LINK);
  const started = !!customer.bridgeCustomerId || !!customer.kycLink;

  const onClick = async () => {
    try {
      await regenerate({ variables: { id: customer.id } });
      enqueueSnackbar("New KYC link ready to send", { variant: "success" });
    } catch (e) {
      enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  };

  return (
    <Box className="py-1.5">
      <CopyField label="Hosted KYC link" value={customer.kycLink} />
      {started ? (
        <Button size="small" variant="outlined" color="grey" loading={loading} onClick={onClick}>
          Regenerate KYC link
        </Button>
      ) : (
        <Typography variant="caption" className="text-text-secondary">
          The customer hasn't started verification yet.
        </Typography>
      )}
    </Box>
  );
}

function EmailRow({ customer }: { customer: Customer }) {
  const { isAdmin } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [changeEmail] = useMutation(UPDATE_CUSTOMER_EMAIL);
  const methods = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { email: customer.user?.email ?? "" },
  });

  const openDialog = () => {
    methods.reset({ email: customer.user?.email ?? "" });
    setOpen(true);
  };

  const onSubmit = methods.handleSubmit(async ({ email }) => {
    try {
      await changeEmail({ variables: { data: { id: customer.id, email } } });
      enqueueSnackbar("Email updated. We sent a verification code to the new address.", { variant: "success" });
      setOpen(false);
    } catch (e) {
      if (!applyServerErrors(e, methods.setError, ["email"])) enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  });

  return (
    <>
      <Row label="Email">
        {customer.user?.email ?? "—"}
        {customer.user && !customer.user.isEmailVerified && (
          <Chip size="small" color="warning" label="unverified" className="ms-2" />
        )}
        {isAdmin && customer.user && (
          <Button size="small" variant="text" className="ms-2" onClick={openDialog}>
            Change
          </Button>
        )}
      </Row>
      <Dialog
        open={open}
        onClose={methods.formState.isSubmitting ? undefined : () => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Form methods={methods} onSubmit={onSubmit}>
          <DialogTitle>Change email address?</DialogTitle>
          <DialogContent className="flex flex-col gap-4">
            <Alert severity="warning">
              The new address is used for sign-in right away and marked unverified. We email a verification code there
              and notify the previous address.
            </Alert>
            <RHFTextField name="email" label="New email" type="email" autoFocus autoComplete="off" />
            <FormErrorSummary />
          </DialogContent>
          <DialogActions>
            <Button
              variant="text"
              color="grey"
              onClick={() => setOpen(false)}
              disabled={methods.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" loading={methods.formState.isSubmitting}>
              Change email
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
    </>
  );
}

function TwoFactorRow({ customer }: { customer: Customer }) {
  const { isAdmin } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [reset, { loading }] = useMutation(RESET_CUSTOMER_TWO_FACTOR);
  const enabled = !!customer.user?.totpEnabled;

  const onConfirm = async () => {
    try {
      await reset({ variables: { customerId: customer.id } });
      enqueueSnackbar("Two-factor sign-in turned off. The customer was emailed.", { variant: "success" });
      setOpen(false);
    } catch (e) {
      enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  };

  return (
    <>
      <Row label="Two-factor sign-in">
        <Chip size="small" color={enabled ? "success" : "default"} label={enabled ? "On" : "Off"} />
        {isAdmin && enabled && (
          <Button size="small" variant="text" color="error" className="ms-2" onClick={() => setOpen(true)}>
            Reset
          </Button>
        )}
      </Row>
      <ConfirmDialog
        open={open}
        title="Turn off this customer's two-factor sign-in?"
        description="Only do this after confirming the customer's identity, for example when they lost their phone and their backup codes. They sign in with their password alone and can turn it on again from their profile."
        confirmLabel="Turn off"
        color="error"
        loading={loading}
        onConfirm={onConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

export function ProfileTab({ customer }: { customer: Customer }) {
  const reasons = Array.isArray(customer.rejectionReasons) ? customer.rejectionReasons : [];

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card className="h-full">
          <CardContent>
            <Typography variant="h6" component="h2" className="mb-2">
              Profile
            </Typography>
            <Row label="Name">{customer.user?.name ?? "—"}</Row>
            <EmailRow customer={customer} />
            <Row label="Account type">
              {customer.type === "business" ? "Business" : customer.type ? "Individual" : "—"}
            </Row>
            <Row label="Country">{[customer.region, customer.country].filter(Boolean).join(", ") || "—"}</Row>
            <Row label="Status">
              <StatusChip kind="customer" value={customer.status} />
            </Row>
            <Row label="Signed up">{fDateTime(customer.createdAt)}</Row>
            <Row label="Onboarded">{fDateTime(customer.onboardedAt)}</Row>
            {customer.suspendedAt && <Row label="Suspended">{fDateTime(customer.suspendedAt)}</Row>}
            <Row label="Last sign-in">{fDateTime(customer.user?.lastLoginAt)}</Row>
            <TwoFactorRow customer={customer} />
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card className="h-full">
          <CardContent>
            <Typography variant="h6" component="h2" className="mb-2">
              KYC (Bridge)
            </Typography>
            <CopyField label="Bridge customer ID" value={customer.bridgeCustomerId} />
            {customer.onboardingStep !== "Done" && <KycLink customer={customer} />}
            <Row label="KYC status">
              <StatusChip kind="kyc" value={customer.kycStatus} />
            </Row>
            <Row label="Terms of service">{customer.tosStatus === "approved" ? "Accepted" : customer.tosStatus}</Row>
            <Row label="Onboarding step">
              {ONBOARDING_STEP_LABELS[customer.onboardingStep] ?? customer.onboardingStep}
            </Row>
            <Typography variant="subtitle2" className="mt-3 mb-2">
              Endorsements
            </Typography>
            <Endorsements value={customer.endorsements} />
            {reasons.length > 0 && (
              <>
                <Typography variant="subtitle2" className="mt-3 mb-1">
                  Rejection reasons
                </Typography>
                <Box component="ul" className="text-error m-0 ps-5">
                  {reasons.map((r, i) => (
                    <li key={i}>
                      <Typography variant="body2">{rejectionText(r)}</Typography>
                    </li>
                  ))}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
      {customer.endorsements !== null && !Array.isArray(customer.endorsements) && (
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" className="mb-2">
                Raw endorsements
              </Typography>
              <JsonView value={customer.endorsements} />
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}
