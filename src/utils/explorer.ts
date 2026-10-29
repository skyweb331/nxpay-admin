import type { Chain } from "@/__generated__/graphql";
import { CONFIG } from "@/config";

export const chainLabel = (chain?: Chain | null) => (chain === "solana" ? "Solana" : chain === "base" ? "Base" : "—");

export function explorerAddressUrl(chain: Chain, address: string) {
  if (chain === "solana") {
    return `https://solscan.io/account/${address}${CONFIG.SANDBOX ? "?cluster=devnet" : ""}`;
  }
  return `https://${CONFIG.SANDBOX ? "sepolia." : ""}basescan.org/address/${address}`;
}

export const shortAddress = (address?: string | null, size = 6) =>
  !address ? "—" : address.length <= size * 2 + 3 ? address : `${address.slice(0, size)}…${address.slice(-size)}`;
