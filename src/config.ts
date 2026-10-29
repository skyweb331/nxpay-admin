import packageJson from "../package.json";

import { ModeVariant, ThemeVariant } from "@/constants";
import { ContentType, MenuType, TopNavType } from "@/types/types";

const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nxpay-admin";

export const CONFIG = {
  APP_NAME: "NxPay Admin",
  VERSION: packageJson.version,
  SERVER_URL: import.meta.env.VITE_API_URL || "http://localhost:4000/graphql",
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN || "",
  /** Only a display hint; the backend decides what sandbox tools are allowed */
  SANDBOX: (import.meta.env.VITE_BRIDGE_ENV || "sandbox") === "sandbox",
  storageTokenKey: `${storagePrefix}-token`,
  redirectPath: "/dashboard",
  supportEmail: "support@nxpay.org",
};

export const DEFAULTS = {
  appRoot: "/dashboard",
  locale: "en",
  themeColor: "theme-purple" as ThemeVariant,
  themeMode: "system" as ModeVariant,
  contentType: ContentType.Boxed,
  topNavType: TopNavType.Full,
  leftMenuType: MenuType.Comfort,
  leftMenuWidth: {
    [MenuType.Minimal]: { primary: 60, secondary: 260 },
    [MenuType.Comfort]: { primary: 116, secondary: 260 },
    [MenuType.SingleLayer]: { primary: 280, secondary: 0 },
  },
  transitionDuration: 150,
  menuPrimaryBreakpoint: "md",
  menuSecondaryBreakpoint: "xl",
};
