import { suspendSchema, type SuspendValues } from "../schema";
import { AccountsTab } from "./AccountsTab";
import { ProfileTab } from "./ProfileTab";
import { VolumesTab } from "./VolumesTab";
import { WalletsTab } from "./WalletsTab";

import { useSnackbar } from "notistack";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router";

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from "@mui/material";

import { useAuthContext } from "@/auth";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Form, FormErrorSummary, RHFTextField } from "@/components/Form";
import ContentWrapper from "@/components/layout/containers/content-wrapper";
import LoadingScreen from "@/components/LoadingScreen";
import PageHeader from "@/components/PageHeader";
import { CUSTOMER_DETAIL, REACTIVATE_CUSTOMER, SUSPEND_CUSTOMER } from "@/libs/Customer/useApollo";
import { paths } from "@/routes/paths";
import AuditLogListView from "@/sections/AuditLog/List/View";
import TransactionListView from "@/sections/Transaction/List/View";
import { fDateTime } from "@/utils/format-time";
import { applyServerErrors, errorMessage } from "@/utils/graphql";
import { useMutation, useQuery } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";

const TABS = [
  { value: "profile", label: "Profile & KYC" },
  { value: "accounts", label: "Virtual accounts" },
  { value: "wallets", label: "Wallets" },
  { value: "volumes", label: "Monthly volume" },
  { value: "transactions", label: "Transactions" },
  { value: "audit", label: "Audit history", adminOnly: true },
] as const;

type TabValue = (typeof TABS)[number]["value"];

function SuspendDialog({ id, open, onClose }: { id: string; open: boolean; onClose: () => void }) {
  const { enqueueSnackbar } = useSnackbar();
  const [suspend] = useMutation(SUSPEND_CUSTOMER);
  const methods = useForm<SuspendValues>({ resolver: zodResolver(suspendSchema), defaultValues: { reason: "" } });

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      await suspend({ variables: { data: { id, reason: values.reason } } });
      enqueueSnackbar("Customer suspended", { variant: "success" });
      methods.reset();
      onClose();
    } catch (e) {
      if (!applyServerErrors(e, methods.setError, ["reason"])) enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  });

  return (
    <Dialog open={open} onClose={methods.formState.isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Suspend this customer?</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <Alert severity="warning">
            The customer can still sign in, but can no longer change wallets, export keys or open new accounts. Deposits
            still arrive at Bridge; their payouts are held in Failed payouts until you reactivate the customer and retry
            them.
          </Alert>
          <RHFTextField name="reason" label="Reason (kept in the audit log)" multiline rows={3} autoFocus />
          <FormErrorSummary />
        </DialogContent>
        <DialogActions>
          <Button variant="text" color="grey" onClick={onClose} disabled={methods.formState.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="error" loading={methods.formState.isSubmitting}>
            Suspend
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

export default function CustomerDetailView({ id }: { id: string }) {
  const { isAdmin } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);
  const { data, loading, error } = useQuery(CUSTOMER_DETAIL, { variables: { id } });
  const [reactivate, reactivateState] = useMutation(REACTIVATE_CUSTOMER);

  const tabs = TABS.filter((t) => !("adminOnly" in t) || isAdmin);
  const requested = searchParams.get("tab");
  const tab: TabValue = tabs.find((t) => t.value === requested)?.value ?? "profile";
  const customer = data?.customer;
  const name = customer?.user?.name ?? `Customer ${id}`;

  const onReactivate = async () => {
    try {
      await reactivate({ variables: { id } });
      enqueueSnackbar("Customer reactivated", { variant: "success" });
      setReactivateOpen(false);
    } catch (e) {
      enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  };

  const header = (
    <PageHeader
      title={name}
      crumbs={[{ label: "Customers", href: paths.customers.root }, { label: name }]}
      actions={
        isAdmin && customer ? (
          customer.status === "Suspended" ? (
            <Button variant="contained" onClick={() => setReactivateOpen(true)}>
              Reactivate
            </Button>
          ) : (
            <Button variant="outlined" color="error" onClick={() => setSuspendOpen(true)}>
              Suspend
            </Button>
          )
        ) : undefined
      }
    />
  );

  if (loading && !customer) return <LoadingScreen inline />;
  if (!customer) {
    return (
      <>
        {header}
        <ContentWrapper>
          <Alert severity="error">{error ? errorMessage(error) : "Customer not found."}</Alert>
        </ContentWrapper>
      </>
    );
  }

  return (
    <>
      {header}
      <ContentWrapper>
        {customer.status === "Suspended" && (
          <Alert severity="error" className="mb-4">
            Suspended {fDateTime(customer.suspendedAt)}. The reason is in the audit history.
          </Alert>
        )}
        <Box className="mb-4">
          <Tabs
            value={tab}
            variant="scrollable"
            onChange={(_e, value: TabValue) => setSearchParams({ tab: value }, { replace: true })}
          >
            {tabs.map((t) => (
              <Tab key={t.value} value={t.value} label={t.label} />
            ))}
          </Tabs>
        </Box>

        {tab === "profile" && <ProfileTab customer={customer} />}
        {tab === "accounts" && <AccountsTab accounts={customer.virtualAccounts} />}
        {tab === "wallets" && <WalletsTab wallets={customer.wallets} />}
        {tab === "volumes" && <VolumesTab customerId={customer.id} />}
        {tab === "transactions" && (
          <TransactionListView
            scope={{ customerId: customer.id }}
            hidden={["customerId"]}
            emptyTitle="No deposits yet"
            emptyDescription="Deposits to this customer's virtual accounts show up here."
          />
        )}
        {tab === "audit" && (
          <AuditLogListView
            scope={{
              OR: [
                { entity: "Customer", entityId: String(customer.id) },
                ...(customer.user ? [{ entity: "User", entityId: String(customer.user.id) }] : []),
              ],
            }}
          />
        )}
      </ContentWrapper>

      <SuspendDialog id={customer.id} open={suspendOpen} onClose={() => setSuspendOpen(false)} />
      <ConfirmDialog
        open={reactivateOpen}
        title="Reactivate this customer?"
        description="Their account works normally again. Payouts held during the suspension stay in Failed payouts until you retry them."
        confirmLabel="Reactivate"
        loading={reactivateState.loading}
        onConfirm={onReactivate}
        onClose={() => setReactivateOpen(false)}
      />
    </>
  );
}
