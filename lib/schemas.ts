import { z } from "zod";

// ── Login ──────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});
export type LoginSchema = z.infer<typeof loginSchema>;

// ── Register ───────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string()
    .min(1, "Phone is required")
    .regex(/^(01)[0-9]{9}$/, "Must be a valid Egyptian number (01xxxxxxxxx)"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[0-9]/, "Must include at least one number"),
  rePassword: z.string().min(1, "Please confirm your password"),
  terms: z.boolean().refine(v => v === true, "You must accept the Terms of Service"),
}).refine(d => d.password === d.rePassword, {
  message: "Passwords do not match",
  path: ["rePassword"],
});
export type RegisterSchema = z.infer<typeof registerSchema>;

// ── Forgot Password ────────────────────────────────────────────
export const forgotEmailSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});
export type ForgotEmailSchema = z.infer<typeof forgotEmailSchema>;

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Za-z]/, "Password must include at least one letter")
    .regex(/[0-9]/, "Password must include at least one number"),
  confirm: z.string().min(1, "Please confirm your password"),
}).refine(d => d.password === d.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

// ── Checkout shipping ──────────────────────────────────────────
export const shippingSchema = z.object({
  city: z.string().min(2, "City is required"),
  street: z.string().min(5, "Street address is required"),
  phone: z.string()
    .min(1, "Phone is required")
    .regex(/^(01)[0-9]{9}$/, "Must be a valid Egyptian number (01xxxxxxxxx)"),
});
export type ShippingSchema = z.infer<typeof shippingSchema>;

// ── Contact form ───────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
export type ContactSchema = z.infer<typeof contactSchema>;

// ── Change password ─────────────────────────────────────────────
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmNewPassword: z.string().min(1, "Please confirm your new password"),
}).refine(d => d.newPassword === d.confirmNewPassword, {
  message: "Passwords do not match",
  path: ["confirmNewPassword"],
}).refine(d => d.currentPassword !== d.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
