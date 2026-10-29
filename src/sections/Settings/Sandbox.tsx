import { type SimulateDepositValues, simulateDepositSchema } from "./schema";

import { useSnackbar } from "notistack";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router";

import { Alert, Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";

import { Form, FormErrorSummary, RHFAmount, RHFAutocomplete, RHFRadioGroup } from "@/components/Form";
import ContentWrapper from "@/components/layout/containers/content-wrapper";
import StatusChip from "@/components/StatusChip";
import { SIMULATE_DEPOSIT } from "@/libs/Admin/useApollo";
import { useAppInfo } from "@/libs/AppInfo/useApollo";
import { CUSTOMERS } from "@/libs/Customer/useApollo";
import { paths } from "@/routes/paths";
import { applyServerErrors, errorMessage } from "@/utils/graphql";
import { centsToDecimal, formatMoney } from "@/utils/money";
import { useMutation, useQuery } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";

type Result = { id: string; reference: string; state: string; currency: string; grossAmountInCents: bigint };

export default function SandboxView() {
  const appInfo = useAppInfo();
  const { enqueueSnackbar } = useSnackbar();
  const [results, setResults] = useState<Result[]>([]);
  const customers = useQuery(CUSTOMERS, {
    variables: { filter: { status: "Active" }, sort: "createdAt", page: "1,200" },
  });
  const [simulate] = useMutation(SIMULATE_DEPOSIT);
  const methods = useForm<SimulateDepositValues>({
    resolver: zodResolver(simulateDepositSchema),
    defaultValues: { customerId: "", currency: "usd", amountInCents: null },
  });
  const currency = useWatch({ control: methods.control, name: "currency" });

  const options = useMemo(
    () =>
      (customers.data?.customers.customers ?? []).map((c) => ({
        value: c.id,
        label: `${c.user?.name ?? `Customer ${c.id}`} (${c.user?.email ?? "no email"})`,
      })),
    [customers.data],
  );

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      const { data } = await simulate({
        variables: {
          input: {
            customerId: values.customerId,
            currency: values.currency,
            amount: centsToDecimal(values.amountInCents!),
          },
        },
      });
      const tx = data?.simulateDeposit;
      if (!tx) {
        enqueueSnackbar("Bridge accepted the deposit, but no transaction was recorded. Check the backend logs.", {
          variant: "warning",
        });
        return;
      }
      setResults((prev) => [tx, ...prev].slice(0, 10));
      enqueueSnackbar(`Deposit ${tx.reference} created`, { variant: "success" });
      methods.resetField("amountInCents");
    } catch (e) {
      if (!applyServerErrors(e, methods.setError, ["customerId", "currency", "amountInCents"])) {
        enqueueSnackbar(errorMessage(e), { variant: "error" });
      }
    }
  });

  if (appInfo && !appInfo.sandbox) {
    return (
      <ContentWrapper>
        <Alert severity="info">Sandbox tools are only available when the backend uses the Bridge sandbox.</Alert>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2">
                Simulate a deposit
              </Typography>
              <Typography variant="body2" className="text-text-secondary mb-4">
                Creates a sandbox deposit to the customer&apos;s virtual account. It runs through the normal flow:
                conversion, fee calculation, and payout to their payout wallet.
              </Typography>
              <Form methods={methods} onSubmit={onSubmit} className="flex flex-col gap-4">
                <RHFAutocomplete name="customerId" label="Active customer" options={options} />
                <RHFRadioGroup
                  name="currency"
                  label="Currency"
                  row
                  options={[
                    { value: "usd", label: "USD (ACH)" },
                    { value: "eur", label: "EUR (SEPA)" },
                  ]}
                />
                <RHFAmount name="amountInCents" label="Amount" currency={currency} />
                <FormErrorSummary />
                <Box className="flex flex-row justify-end">
                  <Button type="submit" variant="contained" loading={methods.formState.isSubmitting}>
                    Simulate deposit
                  </Button>
                </Box>
              </Form>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" className="mb-2">
                This session
              </Typography>
              {results.length === 0 ? (
                <Typography variant="body2" className="text-text-secondary">
                  Simulated deposits appear here with a link to follow them.
                </Typography>
              ) : (
                results.map((tx) => (
                  <Box key={tx.id} className="flex flex-row items-center justify-between gap-2 py-1.5">
                    <Link
                      to={paths.transactions.view(tx.reference)}
                      className="link-primary link-underline-hover font-mono"
                    >
                      {tx.reference}
                    </Link>
                    <Typography variant="body2">{formatMoney(tx.grossAmountInCents, tx.currency)}</Typography>
                    <StatusChip kind="transaction" value={tx.state} />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ContentWrapper>
  );
}
