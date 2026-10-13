export const THEME_OPTIONS = {
  PURPLE: "theme-purple",
  BLUE: "theme-blue",
  GREEN: "theme-green",
  ORANGE: "theme-orange",
} as const;

export type ThemeVariant = (typeof THEME_OPTIONS)[keyof typeof THEME_OPTIONS];

export type ModeVariant = (typeof THEME_MODE_OPTIONS)[number];
export const THEME_MODE_OPTIONS = ["light", "dark", "system"] as const;

const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX || "nxpay";

export const LOCAL_STORAGE_KEYS = {
  themeColor: `${storagePrefix}-theme-color`,
  themeMode: `${storagePrefix}-theme-mode`,
  leftMenuType: `${storagePrefix}-left-menu-type`,
  contentType: `${storagePrefix}-content-type`,
  topNavType: `${storagePrefix}-top-nav-type`,
};
