import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { CustomerWalletFragment } from "@/__generated__/graphql";
import { CopyButton } from "@/components/CopyButton";
import StatusChip from "@/components/StatusChip";
import { chainLabel, explorerAddressUrl, shortAddress } from "@/utils/explorer";
import { fDate } from "@/utils/format-time";

export function WalletsTab({ wallets }: { wallets: CustomerWalletFragment[] }) {
  return (
    <Card>
      <CardContent>
        <Alert severity="info" className="mb-4">
          Staff can see wallet addresses and key status only. Private keys are never available in the console.
        </Alert>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Wallet</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Key</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Added</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wallets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-text-secondary text-center">
                    No wallets
                  </TableCell>
                </TableRow>
              )}
              {wallets.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>
                    <Box className="flex flex-row items-center gap-2">
                      <Typography variant="body2" className="font-semibold">
                        {w.label ?? (w.type === "Generated" ? "NxPay wallet" : "External wallet")}
                      </Typography>
                      {w.isPayout && <Chip size="small" color="primary" label="Payout" />}
                    </Box>
                    <Typography variant="caption" className="text-text-secondary">
                      {chainLabel(w.chain)} · {w.type === "Generated" ? "generated" : "external"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box className="flex flex-row items-center gap-1">
                      <a
                        href={explorerAddressUrl(w.chain, w.address)}
                        target="_blank"
                        rel="noreferrer"
                        className="link-primary link-underline-hover font-mono text-sm"
                        title={w.address}
                      >
                        {shortAddress(w.address, 8)}
                      </a>
                      <CopyButton value={w.address} label="Copy address" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StatusChip kind="walletKey" value={w.keyStatus} />
                    {w.keyExportedAt && (
                      <Typography variant="caption" className="text-text-secondary block">
                        exported {fDate(w.keyExportedAt)}
                      </Typography>
                    )}
                    {w.keyRemovedAt && (
                      <Typography variant="caption" className="text-text-secondary block">
                        removed {fDate(w.keyRemovedAt)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusChip kind="wallet" value={w.status} />
                  </TableCell>
                  <TableCell>{fDate(w.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
