import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.").max(191);
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.")
  .refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), "Use at least one letter and one number.");
export const nameSchema = z.string().trim().min(2, "Enter your full name.").max(120);

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(128),
  /** "app" returns a bearer token for the mobile app instead of setting a cookie. */
  client: z.enum(["web", "app"]).default("web"),
});

export const forgotSchema = z.object({ email: emailSchema });
export const resetSchema = z.object({ token: z.string().min(10), password: passwordSchema });
export const acceptInviteSchema = z.object({ token: z.string().min(10), name: nameSchema, password: passwordSchema });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: passwordSchema });

export const profileSchema = z.object({
  name: nameSchema,
  bio: z.string().trim().max(500).optional().nullable(),
  avatarColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
    .nullable(),
});
