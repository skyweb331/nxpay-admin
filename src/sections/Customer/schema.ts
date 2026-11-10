import { z as zod } from "zod";

export const suspendSchema = zod.object({
  reason: zod
    .string()
    .trim()
    .min(3, "Say why the account is suspended (3 to 500 characters)")
    .max(500, "Reason must be 500 characters or fewer"),
});
export type SuspendValues = zod.infer<typeof suspendSchema>;

export const changeEmailSchema = zod.object({
  email: zod.string().trim().email("Enter a valid email address").max(254),
});
export type ChangeEmailValues = zod.infer<typeof changeEmailSchema>;

export const inviteCustomerSchema = zod
  .object({
    name: zod.string().trim().min(1, "Enter a name").max(120, "Name must be 120 characters or fewer"),
    email: zod.email("Enter a valid email address"),
    country: zod.string().regex(/^[A-Za-z]{2}$/, "Select a country"),
    region: zod
      .string()
      .regex(/^[A-Za-z]{2}$/)
      .nullable()
      .optional(),
  })
  .superRefine((values, ctx) => {
    if (values.country === "US" && !values.region) {
      ctx.addIssue({ code: "custom", path: ["region"], message: "Select a state" });
    }
  });
export type InviteCustomerValues = zod.infer<typeof inviteCustomerSchema>;
