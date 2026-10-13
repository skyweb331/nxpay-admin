const ROOTS = {
  AUTH: "/auth",
};

const entity = (root: string) => ({
  root,
  view: (id: number | string) => `${root}/${id}`,
  match: `${root}/:id`,
});

/** Keep in sync with the links in nxpay-backend email templates (staff invite, password reset). */
export const paths = {
  auth: {
    signIn: `${ROOTS.AUTH}/sign-in`,
    forgotPassword: `${ROOTS.AUTH}/forgot-password`,
    resetPassword: `${ROOTS.AUTH}/reset-password`,
  },

  dashboard: "/dashboard",
  customers: entity("/customers"),
  transactions: entity("/transactions"),
  failedPayouts: "/payouts/failed",
  fees: {
    root: "/fees",
    new: "/fees/new",
    edit: (id: number | string) => `/fees/${id}/edit`,
    editMatch: "/fees/:id/edit",
  },
  support: entity("/support"),
  staff: "/staff",
  logs: "/logs",
  auditLogs: "/logs/audit",
  webhooks: "/logs/webhooks",
  settings: "/settings",
  sandbox: "/sandbox",
};
