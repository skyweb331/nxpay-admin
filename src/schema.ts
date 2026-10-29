import bs58 from "bs58";
import { getAddress, isAddress } from "viem";
import { z as zod } from "zod";

import type { Chain } from "@/__generated__/graphql";

/** limelite helper: runs a schema inside superRefine so object-level refines always run. */
export function zodAlwaysRefine<T extends zod.ZodTypeAny>(zodType: T) {
  return zod.any().superRefine(async (value, ctx) => {
    const res = await zodType.safeParseAsync(value);
    if (!res.success) {
      res.error.issues.forEach((issue) => ctx.addIssue({ ...issue, code: "custom" } as never));
    }
  }) as unknown as T;
}

export const requiredString = (message = "The field is required") => zod.string().trim().min(1, message);

export const emailSchema = zod
  .string()
  .trim()
  .min(1, "The field is required")
  .max(254)
  .pipe(zod.email({ error: "Enter a valid email" }));

/** Same rules as nxpay-backend SignUpInput / ResetPasswordInput */
export const newPasswordSchema = zod
  .string()
  .min(10, "Password must be at least 10 characters")
  .max(128, "Password is too long")
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Password must contain at least one letter and one number");

export const otpSchema = zod.string().regex(/^\d{6}$/, "Enter the 6-digit code");

export type { Chain };

/** Mirrors nxpay-backend `normalizeAddress`. */
export function walletAddressError(chain: Chain, address: string): string | null {
  const value = address.trim();
  if (!value) return "Enter a wallet address";
  if (chain === "base") {
    if (!isAddress(value, { strict: false })) return "Enter a valid Base (EVM) address";
    if (/^0x0{40}$/i.test(value)) return "The zero address can't receive funds";
    // Mixed case must be a valid EIP-55 checksum
    if (
      value !== value.toLowerCase() &&
      value.slice(2) !== value.slice(2).toUpperCase() &&
      getAddress(value) !== value
    ) {
      return "Address checksum is invalid. Copy it again from your wallet";
    }
    return null;
  }
  try {
    return bs58.decode(value).length === 32 ? null : "Enter a valid Solana address";
  } catch {
    return "Enter a valid Solana address";
  }
}

export const chainSchema = zod.enum(["base", "solana"]);
