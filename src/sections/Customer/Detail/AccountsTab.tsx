import { useSnackbar } from "notistack";
import { useState } from "react";

import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";

import type { CustomerDetailQuery } from "@/__generated__/graphql";
import { useAuthContext } from "@/auth";
import ConfirmDialog from "@/components/ConfirmDialog";
import { CopyField } from "@/components/CopyButton";
import EmptyState from "@/components/EmptyState";
import StatusChip from "@/components/StatusChip";
import NiBuilding from "@/icons/nexture/ni-building";
import { DEACTIVATE_VIRTUAL_ACCOUNT } from "@/libs/Customer/useApollo";
import { chainLabel } from "@/utils/explorer";
import { fDate } from "@/utils/format-time";
import { errorMessage } from "@/utils/graphql";
import { useMutation } from "@apollo/client/react";

type VirtualAccount = NonNullable<CustomerDetailQuery["customer"]>["virtualAccounts"][number];

export function AccountsTab({ accounts }: { accounts: VirtualAccount[] }) {
  const { isAdmin } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [target, setTarget] = useState<VirtualAccount | null>(null);
  const [deactivate, { loading }] = useMutation(DEACTIVATE_VIRTUAL_ACCOUNT);

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={<NiBuilding size={40} />}
            title="No virtual accounts"
            description="Accounts are created once Bridge approves KYC."
          />
        </CardContent>
      </Card>
    );
  }

  const onConfirm = async () => {
    if (!target) return;
    try {
      await deactivate({ variables: { id: target.id } });
      enqueueSnackbar("Virtual account deactivated", { variant: "success" });
      setTarget(null);
    } catch (e) {
      enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  };

  return (
    <>
      <Grid container spacing={2.5}>
        {accounts.map((va) => {
          const di = va.depositInstructions;
          const active = va.status === "activated" || va.status === "active";
          return (
            <Grid key={va.id} size={{ xs: 12, md: 6 }}>
              <Card className="h-full">
                <CardContent>
                  <Box className="mb-2 flex flex-row items-center justify-between gap-2">
                    <Typography variant="h6" component="h2">
                      {va.sourceCurrency.toUpperCase()} account
                    </Typography>
                    <StatusChip kind="virtualAccount" value={va.status} />
                  </Box>
                  <Typography variant="body2" className="text-text-secondary mb-2">
                    {di.paymentRails.map((r) => r.toUpperCase()).join(", ")} → {va.destinationCurrency.toUpperCase()} on{" "}
                    {chainLabel(va.destinationChain)} · opened {fDate(va.createdAt)}
                    {va.deactivatedAt && ` · deactivated ${fDate(va.deactivatedAt)}`}
                  </Typography>
                  <CopyField label="Bridge virtual account ID" value={va.bridgeVirtualAccountId} />
                  <CopyField label="Bank" value={di.bankName} mono={false} />
                  {di.iban ? (
                    <>
                      <CopyField label="IBAN" value={di.iban} />
                      <CopyField label="BIC" value={di.bic} />
                    </>
                  ) : (
                    <>
                      <CopyField label="Account number" value={di.accountNumber} />
                      <CopyField label="Routing number" value={di.routingNumber} />
                    </>
                  )}
                  {isAdmin && active && (
                    <Button
                      color="error"
                      variant="outlined"
                      size="small"
                      className="mt-3"
                      onClick={() => setTarget(va)}
                    >
                      Deactivate
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <ConfirmDialog
        open={!!target}
        title={`Deactivate the ${target?.sourceCurrency.toUpperCase()} account?`}
        description="Bridge stops accepting deposits to these bank details. Money sent afterwards is returned to the sender. This cannot be undone from NxPay."
        confirmLabel="Deactivate"
        color="error"
        loading={loading}
        onConfirm={onConfirm}
        onClose={() => setTarget(null)}
      />
    </>
  );
}
