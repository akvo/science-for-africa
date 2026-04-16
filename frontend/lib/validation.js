import { z } from "zod";

/**
 * Shared password validation schema for all auth-related forms.
 *
 * Criteria:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character
 */
export const getPasswordSchema = (t) =>
  z
    .string()
    .min(1, t("validation.password_required"))
    .min(8, t("validation.password_minLength"))
    .regex(/[A-Z]/, t("validation.password_uppercase"))
    .regex(/[a-z]/, t("validation.password_lowercase"))
    .regex(/[0-9]/, t("validation.password_number"))
    .regex(/[^A-Za-z0-9]/, t("validation.password_special"));
