import type { ReactNode } from "react";

import { getSession } from "@/auth/utils";
import { CONFIG } from "@/config";
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { ApolloProvider } from "@apollo/client/react";

export const SESSION_EXPIRED_EVENT = "nxpay:session-expired";

const httpLink = new HttpLink({ uri: CONFIG.SERVER_URL });

const authLink = new SetContextLink(({ headers }) => {
  const token = getSession();
  return { headers: { ...headers, ...(token && { authorization: `Bearer ${token}` }) } };
});

const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error) && error.errors.some((e) => e.extensions?.code === "UNAUTHENTICATED")) {
    if (getSession()) window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
});

/** `*InCents` fields arrive as strings (BigInteger scalar) and are read back as bigint. */
const bigIntParsePolicy = (fields: string[]) => ({
  fields: Object.fromEntries(
    fields.map((field) => [
      field,
      {
        read(existing: string | bigint | null | undefined) {
          if (existing === null || existing === undefined) return existing;
          return typeof existing === "bigint" ? existing : BigInt(existing);
        },
      },
    ]),
  ),
});

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Transaction: bigIntParsePolicy([
        "grossAmountInCents",
        "usdEquivalentInCents",
        "exchangeFeeInCents",
        "creditedAmountInCents",
        "feeInCents",
        "netAmountInCents",
      ]),
      MonthlyVolume: bigIntParsePolicy(["volumeInCents", "feeInCents"]),
      FeeTier: bigIntParsePolicy(["fromInCents", "toInCents"]),
      FeeBreakdownLine: bigIntParsePolicy(["amountInCents", "feeInCents", "fromInCents", "toInCents"]),
      FeeQuote: bigIntParsePolicy([
        "amountInCents",
        "feeInCents",
        "feeUsdInCents",
        "netInCents",
        "prevVolumeInCents",
        "usdEquivalentInCents",
      ]),
      FeeProgress: bigIntParsePolicy(["volumeInCents", "feeInCents"]),
      FeeSettings: bigIntParsePolicy(["minimumPayoutInCents"]),
      DashboardStats: bigIntParsePolicy(["volumeInCents", "feesInCents"]),
      DailyVolume: bigIntParsePolicy(["volumeInCents"]),
      OnboardingStatus: { keyFields: [] },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: "cache-and-network" },
  },
});

export default function ApolloAppProvider({ children }: { children: ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
