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
