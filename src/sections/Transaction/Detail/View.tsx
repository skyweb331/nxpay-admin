import { railLabel } from "../columns";
import { useSnackbar } from "notistack";
import { ReactNode, useState } from "react";
import { Link } from "react-router";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { Chain } from "@/__generated__/graphql";
import { useAuthContext } from "@/auth";
import ConfirmDialog from "@/components/ConfirmDialog";
import { CopyField } from "@/components/CopyButton";
import JsonView from "@/components/JsonView";
import ContentWrapper from "@/components/layout/containers/content-wrapper";
import LoadingScreen from "@/components/LoadingScreen";
import MoneyText from "@/components/MoneyText";
import StatusChip from "@/components/StatusChip";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiExternal from "@/icons/nexture/ni-external";
import { RETRY_PAYOUT, TRANSACTION_DETAIL } from "@/libs/Transaction/useApollo";
import { paths } from "@/routes/paths";
import { chainLabel } from "@/utils/explorer";
import { tierRangeLabel } from "@/utils/fee";
import { fDateTime, fPeriod, fRelative } from "@/utils/format-time";
import { errorMessage } from "@/utils/graphql";
import { bpsToPercent, formatMoney, formatToken } from "@/utils/money";
import { useMutation, useQuery } from "@apollo/client/react";

type Breakdown = {
  prevVolumeInCents?: string;
  usdEquivalentInCents?: string;
  feeUsdInCents?: string;
  capped?: boolean;
  lines?: {
    position: number;
    fromInCents: string;
    toInCents: string | null;
    rateBps: number;
    amountInCents: string;
    feeInCents: string;
  }[];
};

type Snapshot = { chain: Chain; address: string; type: string; label: string | null };

const SOURCE_LABELS: Record<string, string> = {
  bridge_va: "Bridge virtual account",
  bridge_transfer: "Bridge transfer",
  system: "NxPay",
  admin: "Staff",
};

const Row = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
  <Box className="flex flex-row items-baseline justify-between gap-4 py-1.5">
    <Typography variant="body2" className="text-text-secondary shrink-0">
      {label}
    </Typography>
    <Typography variant="body2" component="span" className="min-w-0 text-end break-all">
      {children}
    </Typography>
  </Box>
);

export default function TransactionDetailView({ id }: { id: string }) {
  const { isAdmin } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [confirmRetry, setConfirmRetry] = useState(false);
  const { data, loading, error } = useQuery(TRANSACTION_DETAIL, { variables: { id }, pollInterval: 15_000 });
  const [retry, { loading: retrying }] = useMutation(RETRY_PAYOUT, {
    refetchQueries: [TRANSACTION_DETAIL],
  });
  const tx = data?.transaction;

  if (loading && !tx) return <LoadingScreen inline />;
  if (!tx) {
    return (
      <ContentWrapper>
        <Alert severity="error">{error ? errorMessage(error) : "Transaction not found."}</Alert>
      </ContentWrapper>
    );
  }

  const breakdown = (tx.feeBreakdown ?? {}) as Breakdown;
  const snapshot = tx.destinationWalletSnapshot as Snapshot | null;
  const foreign = tx.currency !== "usd";

  const onRetry = async () => {
    try {
      await retry({ variables: { id: tx.id } });
      enqueueSnackbar("Payout retry queued", { variant: "success" });
      setConfirmRetry(false);
    } catch (e) {
      enqueueSnackbar(errorMessage(e), { variant: "error" });
    }
  };

  return (
    <ContentWrapper>
      {tx.state === "PayoutFailed" && (
        <Alert
          severity="error"
          className="mb-4"
          action={
            isAdmin && tx.canRetry ? (
              <Button color="error" variant="contained" size="small" onClick={() => setConfirmRetry(true)}>
                Retry payout
              </Button>
            ) : undefined
          }
        >
          <AlertTitle>Payout failed after {tx.attempts} attempts</AlertTitle>
          {tx.failureReason ?? "Bridge did not return a reason."}
          {tx.nextRetryAt && ` Next automatic retry ${fRelative(tx.nextRetryAt)}.`}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card className="mb-5">
            <CardContent>
              <Box className="mb-3 flex flex-row items-center justify-between gap-2">
                <Typography variant="h6" component="h2">
                  Deposit
                </Typography>
                <StatusChip kind="transaction" value={tx.state} />
              </Box>
              <Row label="Customer">
                <Link to={paths.customers.view(tx.customerId)} className="link-primary link-underline-hover">
                  {tx.customer?.user?.name ?? `Customer ${tx.customerId}`}
                </Link>{" "}
                <span className="text-text-secondary">{tx.customer?.user?.email}</span>
              </Row>
              <Row label="Rail">
                {railLabel(tx.rail)} · {tx.currency.toUpperCase()}
              </Row>
              <Row label="Amount received">
                <MoneyText cents={tx.grossAmountInCents} currency={tx.currency} variant="body2" />
              </Row>
              {tx.exchangeFeeInCents !== null && tx.exchangeFeeInCents !== undefined && (
                <Row label="Bridge exchange fee">
                  <MoneyText cents={tx.exchangeFeeInCents} currency={tx.currency} variant="body2" />
                </Row>
              )}
              {tx.creditedAmountInCents !== null && tx.creditedAmountInCents !== undefined && (
                <Row label="Credited to custodial wallet">
                  <MoneyText cents={tx.creditedAmountInCents} currency={tx.currency} token variant="body2" />
                </Row>
              )}
              <Row label="NxPay fee">
                <MoneyText cents={tx.feeInCents} currency={tx.currency} variant="body2" />
              </Row>
              <Row label="Payout">
                <MoneyText cents={tx.netAmountInCents} currency={tx.currency} token variant="body2" />
              </Row>
              {foreign && (
                <Row label="USD equivalent">
                  {formatMoney(tx.usdEquivalentInCents, "usd")} {tx.fxRate && `at ${tx.fxRate}`}
                </Row>
              )}
              <Row label="Billing month">{fPeriod(tx.periodKey)}</Row>
              <Row label="Received">{fDateTime(tx.fundsReceivedAt ?? tx.createdAt)}</Row>
              <Row label="Credited">{fDateTime(tx.creditedAt)}</Row>
              <Row label="Completed">{fDateTime(tx.completedAt)}</Row>
              <Row label="Payout attempts">{tx.attempts}</Row>
            </CardContent>
          </Card>

          <Card className="mb-5">
            <CardContent>
              <Typography variant="h6" component="h2" className="mb-2">
                Fee calculation
              </Typography>
              {!breakdown.lines?.length ? (
                <Typography variant="body2" className="text-text-secondary">
                  The fee is calculated when Bridge credits the custodial wallet.
                </Typography>
              ) : (
                <>
                  <Typography variant="body2" className="text-text-secondary mb-2">
                    Fee schedule effective {fPeriod(tx.feeSchedule?.effectivePeriod)}. Volume before this deposit:{" "}
                    {formatMoney(breakdown.prevVolumeInCents, "usd")}.
                    {breakdown.capped && " Fee was capped to keep the payout above the Bridge minimum."}
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tier</TableCell>
                        <TableCell align="right">Rate</TableCell>
                        <TableCell align="right">Portion (USD)</TableCell>
                        <TableCell align="right">Fee (USD)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {breakdown.lines.map((line) => (
                        <TableRow key={line.position}>
                          <TableCell>{tierRangeLabel(line)}</TableCell>
                          <TableCell align="right">{bpsToPercent(line.rateBps)}</TableCell>
                          <TableCell align="right">{formatMoney(line.amountInCents, "usd")}</TableCell>
                          <TableCell align="right">{formatMoney(line.feeInCents, "usd")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" className="mb-2">
                Events
              </Typography>
              {tx.events.length === 0 && (
                <Typography variant="body2" className="text-text-secondary">
                  No events recorded.
                </Typography>
              )}
              {tx.events.map((event) => (
                <Accordion key={event.id} disableGutters variant="outlined" className="mb-2 before:hidden">
                  <AccordionSummary expandIcon={<NiChevronDownSmall />}>
                    <Box className="flex w-full flex-row flex-wrap items-center gap-2 pe-2">
                      <Typography variant="body2" className="font-mono font-semibold">
                        {event.type}
                      </Typography>
                      <Chip size="small" variant="outlined" label={SOURCE_LABELS[event.source] ?? event.source} />
                      <Typography variant="caption" className="text-text-secondary ms-auto">
                        {fDateTime(event.createdAt)}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <JsonView value={event.payload} />
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card className="mb-5">
            <CardContent>
              <Typography variant="h6" component="h2" className="mb-2">
                Bridge references
              </Typography>
              <CopyField label="Deposit (activity) ID" value={tx.bridgeDepositId} />
              <CopyField label="Transfer ID" value={tx.bridgeTransferId} />
              <CopyField label="Virtual account ID" value={tx.virtualAccount?.bridgeVirtualAccountId} />
            </CardContent>
          </Card>

          <Card className="mb-5">
            <CardContent>
              <Typography variant="h6" component="h2" className="mb-2">
                Destination
              </Typography>
              {snapshot ? (
                <>
                  <Row label="Network">{chainLabel(snapshot.chain)}</Row>
                  <Row label="Wallet">
                    {snapshot.label ?? (snapshot.type === "Generated" ? "NxPay wallet" : "External wallet")}
                  </Row>
                  <CopyField label="Address" value={snapshot.address} />
                </>
              ) : (
                <Typography variant="body2" className="text-text-secondary">
                  Chosen when the payout is created.
                </Typography>
              )}
              {tx.txHash && <CopyField label="Transaction hash" value={tx.txHash} />}
              {tx.explorerUrl && (
                <Button
                  href={tx.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="outlined"
                  color="grey"
                  size="small"
                  endIcon={<NiExternal size="small" />}
                  className="mt-2"
                >
                  View on explorer
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" className="mb-2">
                Sender details
              </Typography>
              <JsonView value={tx.sourceDetails ?? {}} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirmRetry}
        title="Retry this payout?"
        description={`Sends ${formatToken(tx.netAmountInCents, tx.currency)} in a new Bridge transfer to ${
          snapshot ? "the destination wallet shown on this page" : "the customer's payout wallet"
        }. The fee stays as calculated.`}
        confirmLabel="Retry payout"
        loading={retrying}
        onConfirm={onRetry}
        onClose={() => setConfirmRetry(false)}
      />
    </ContentWrapper>
  );
}
