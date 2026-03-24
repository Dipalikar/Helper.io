import { z } from "zod";

export const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .trim()
    .toLowerCase(),

  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces")
    .trim(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const signIpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .trim()
    .toLowerCase(),

    password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const signInSchema = z.object({
  username: z.string().min(1, "Username is required").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

// Sanitize Full name
export function sanitizeFullName(name) {
  return name
    .trim()
    .replace(/[^a-zA-Z\s]/g, "") // letters + spaces only
    .replace(/\s+/g, " ") // collapse multiple spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
}

// Sanitize Username
export function sanitizeUsername(username) {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "") // remove invalid chars
    .replace(/_+/g, "_"); // convert multiple __ to _
}

// Sanitize password
export function sanitizePassword(password) {
  return password.trim(); // remove accidental spaces
}

export function sanitizeSignUpData(data) {
  return {
    username: sanitizeUsername(data.username),
    full_name: sanitizeFullName(data.full_name),
    password: sanitizePassword(data.password),
  };
}

export function sanitizeSignIpData(data) {
  return {
    username: sanitizeUsername(data.username),
    password: sanitizePassword(data.password),
  };
}
