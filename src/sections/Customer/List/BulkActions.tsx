import { suspendSchema, type SuspendValues } from "../schema";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

import type { BulkSuspendCustomersMutation } from "@/__generated__/graphql";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Form, FormErrorSummary, RHFTextField } from "@/components/Form";
import { BULK_SUSPEND_CUSTOMERS, DELETE_CUSTOMERS } from "@/libs/Customer/useApollo";
import { applyServerErrors, errorMessage } from "@/utils/graphql";
import { useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";

type BulkCustomerResult = BulkSuspendCustomersMutation["bulkSuspendCustomers"];

const plural = (n: number) => `${n} customer${n === 1 ? "" : "s"}`;

/** Bar above the customer list once rows are selected (Admin only). */
export function BulkActions({ ids, onDone }: { ids: string[]; onDone: () => void }) {
  const { enqueueSnackbar } = useSnackbar();
  const [dialog, setDialog] = useState<"suspend" | "delete" | null>(null);
  const [outcome, setOutcome] = useState<{ action: string; result: BulkCustomerResult } | null>(null);

  const finish = (action: string, result: BulkCustomerResult) => {
    setDialog(null);
    if (result.skipped.length) setOutcome({ action, result });
    else enqueueSnackbar(`${action} ${plural(result.succeeded.length)}`, { variant: "success" });
    onDone();
  };

  return (
    <>
      {ids.length > 0 && (
        <Box className="bg-background-default mb-4 flex flex-wrap items-center gap-3 rounded-xl px-4 py-2">
          <Typography variant="body2" className="font-semibold">
            {plural(ids.length)} selected
          </Typography>
          <Box className="flex-1" />
          <Button variant="outlined" color="warning" size="small" onClick={() => setDialog("suspend")}>
            Suspend
          </Button>
          <Button variant="outlined" color="error" size="small" onClick={() => setDialog("delete")}>
            Delete
          </Button>
          <Button variant="text" color="grey" size="small" onClick={onDone}>
            Clear
          </Button>
        </Box>
      )}

      <BulkSuspendDialog
        ids={ids}
        open={dialog === "suspend"}
        onClose={() => setDialog(null)}
        onDone={(r) => finish("Suspended", r)}
      />
      <BulkDeleteDialog
        ids={ids}
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        onDone={(r) => finish("Deleted", r)}
      />
      <OutcomeDialog outcome={outcome} onClose={() => setOutcome(null)} />
    </>
  );
}

function BulkSuspendDialog({
  ids,
  open,
  onClose,
  onDone,
}: {
  ids: string[];
  open: boolean;
  onClose: () => void;
  onDone: (result: BulkCustomerResult) => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [suspend] = useMutation(BULK_SUSPEND_CUSTOMERS, { refetchQueries: ["Customers"] });
  const methods = useForm<SuspendValues>({ resolver: zodResolver(suspendSchema), defaultValues: { reason: "" } });

  const onSubmit = methods.handleSubmit(async ({ reason }) => {
    try {
      const { data } = await suspend({ variables: { data: { ids, reason } } });
      methods.reset();
      if (data) onDone(data.bulkSuspendCustomers);
    } catch (e) {
      if (!applyServerErrors(e, methods.setError, ["reason"])) enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  });

  return (
    <Dialog open={open} onClose={methods.formState.isSubmitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Suspend {plural(ids.length)}?</DialogTitle>
        <DialogContent className="flex flex-col gap-4">
          <Alert severity="warning">
            They can still sign in, but can no longer change wallets, export keys or open new accounts. Payouts for new
            deposits are held until you reactivate them. Already suspended customers are skipped.
          </Alert>
          <RHFTextField name="reason" label="Reason (kept in each audit log)" multiline rows={3} autoFocus />
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

function BulkDeleteDialog({
  ids,
  open,
  onClose,
  onDone,
}: {
  ids: string[];
  open: boolean;
  onClose: () => void;
  onDone: (result: BulkCustomerResult) => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const [remove, { loading }] = useMutation(DELETE_CUSTOMERS, { refetchQueries: ["Customers"] });

  const onConfirm = async () => {
    try {
      const { data } = await remove({ variables: { ids } });
      if (data) onDone(data.deleteCustomers);
    } catch (e) {
      enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  };

  return (
    <ConfirmDialog
      open={open}
      title={`Permanently delete ${plural(ids.length)}?`}
      description="Their account, profile, wallets and support tickets are removed and can't be restored. Customers with anything at Bridge, any transactions, or a wallet key we still hold are skipped."
      confirmLabel="Delete"
      color="error"
      loading={loading}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}

function OutcomeDialog({
  outcome,
  onClose,
}: {
  outcome: { action: string; result: BulkCustomerResult } | null;
  onClose: () => void;
}) {
  const skipped = outcome?.result.skipped ?? [];
  const done = outcome?.result.succeeded.length ?? 0;

  return (
    <Dialog open={!!outcome} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {outcome?.action} {plural(done)}, skipped {skipped.length}
      </DialogTitle>
      <DialogContent>
        <List dense disablePadding>
          {skipped.map((s) => (
            <ListItem key={s.id} disableGutters>
              <ListItemText primary={s.name ?? s.id} secondary={s.reason} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
