import type { AuthContextValue, Me } from "../types";
import { getSession, getTimeToLive, setSession } from "../utils";
import { AuthContext } from "./AuthContext";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { gql } from "@/__generated__/gql";
import { SESSION_EXPIRED_EVENT } from "@/ApolloProvider";
import { paths } from "@/routes/paths";
import { useApolloClient, useLazyQuery } from "@apollo/client/react";

const FETCH_ME = gql(`
  query FetchMe {
    me {
      id
      name
      email
      role
      totpEnabled
      lastLoginAt
    }
  }
`);

const STAFF_ROLES = new Set(["Admin", "Support"]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const { enqueueSnackbar } = useSnackbar();
  const [token, setToken] = useState<string | null>(() => {
    const stored = getSession();
    return stored && getTimeToLive(stored) > 0 ? stored : null;
  });
  const [user, setUser] = useState<Me | null>(null);
  const [checked, setChecked] = useState(!token);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [fetchMe] = useLazyQuery(FETCH_ME, { fetchPolicy: "network-only" });

  const clear = useCallback(async () => {
    setSession(null);
    setToken(null);
    setUser(null);
    setChecked(true);
    await client.clearStore();
  }, [client]);

  const expire = useCallback(async () => {
    await clear();
    enqueueSnackbar("Your session has expired. Please sign in again.", { variant: "warning" });
    window.location.assign(`${paths.auth.signIn}?returnTo=${encodeURIComponent(window.location.pathname)}`);
  }, [clear, enqueueSnackbar]);

  /** A customer token (e.g. pasted from the other app) never gets into the console. */
  const accept = useCallback(
    async (me: Me | undefined, failed: boolean) => {
      if (me && STAFF_ROLES.has(me.role)) {
        setUser(me);
      } else if (me || failed) {
        if (me) enqueueSnackbar("This console is for NxPay staff only.", { variant: "error" });
        await clear();
      }
      setChecked(true);
    },
    [clear, enqueueSnackbar],
  );

  const loadMe = useCallback(async () => {
    const result = await fetchMe();
    await accept(result.data?.me, !!result.error);
  }, [fetchMe, accept]);

  // Load the profile whenever the token changes
  useEffect(() => {
    if (!token) return;
    let active = true;
    fetchMe().then(async (result) => {
      if (active) await accept(result.data?.me, !!result.error);
    });
    return () => {
      active = false;
    };
  }, [token, fetchMe, accept]);

  // Expire exactly when the JWT does
  useEffect(() => {
    clearTimeout(timer.current);
    if (!token) return;
    timer.current = setTimeout(() => void expire(), getTimeToLive(token));
    return () => clearTimeout(timer.current);
  }, [token, expire]);

  // Any UNAUTHENTICATED response from the API
  useEffect(() => {
    const onExpired = () => void expire();
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [expire]);

  const signIn = useCallback(async (newToken: string) => {
    setSession(newToken);
    setChecked(false);
    setToken(newToken);
  }, []);

  const signOut = useCallback(async () => {
    await clear();
    enqueueSnackbar("Signed out", { variant: "success" });
  }, [clear, enqueueSnackbar]);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isAdmin: user?.role === "Admin",
      loading: !checked,
      isAuthenticated: !!token && !!user,
      signIn,
      signOut,
      refetch: loadMe,
    }),
    [user, token, checked, signIn, signOut, loadMe],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
