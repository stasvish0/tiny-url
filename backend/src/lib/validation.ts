import { z } from 'zod';

/** Max URL length (bytes) to avoid abuse and align with common limits. */
export const MAX_URL_LENGTH = 2048;

/** Minimum custom slug length (3 characters). */
export const MIN_SLUG_LENGTH = 3;

/** Maximum custom slug length (50 characters). */
export const MAX_SLUG_LENGTH = 50;

/** Reserved slugs that cannot be used (system endpoints and paths). */
export const RESERVED_SLUGS = ['api', 'health', 'admin', 'static', 'assets'] as const;

/**
 * Generic validation error with semantic error code.
 * Handlers should map to 400 + error code for API responses.
 */
export class ValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Convenience subclass for slug validation errors.
 * @deprecated Use ValidationError with 'INVALID_SLUG' code instead
 */
export class SlugValidationError extends ValidationError {
  constructor(message: string) {
    super('INVALID_SLUG', message);
    this.name = 'SlugValidationError';
    Object.setPrototypeOf(this, SlugValidationError.prototype);
  }
}

const allowedSchemes = ['http:', 'https:'] as const;

export const urlSchema = z
  .string()
  .min(1, 'URL is required')
  .max(MAX_URL_LENGTH, 'URL is too long')
  .url('Invalid URL format')
  .refine(
    (s) => {
      try {
        const u = new URL(s);
        return allowedSchemes.includes(u.protocol as (typeof allowedSchemes)[number]);
      } catch {
        return false;
      }
    },
    { message: 'URL must use http or https' }
  );

export type UrlSchemaOutput = z.infer<typeof urlSchema>;

/**
 * Validates a URL string. Returns the URL or throws ValidationError (code INVALID_URL)
 * with a clear message. Handlers should catch and return errorResponse(err.code, err.message, 400).
 */
export function validateUrl(url: string): string {
  const result = urlSchema.safeParse(url);
  if (result.success) return result.data;
  const first = result.error.flatten().formErrors[0] ?? result.error.message;
  throw new ValidationError('INVALID_URL', first);
}

/**
 * Custom slug type alias for documentation purposes.
 * Use `isValidSlug()` for runtime validation or `validateSlug()` for validation with error throwing.
 */
export type CustomSlug = string;

/**
 * Zod schema for validating custom slugs.
 *
 * Rules:
 * - Character set: a-z, A-Z, 0-9, hyphen only (no underscores, spaces, or special characters)
 * - Length: 3-50 characters
 * - Reserved words: api, health, admin, static, assets (case-sensitive)
 *
 * @example
 * ```typescript
 * const result = slugSchema.safeParse('my-link');
 * if (result.success) {
 *   console.log(result.data); // 'my-link'
 * }
 * ```
 */
export const slugSchema = z
  .string()
  .min(MIN_SLUG_LENGTH, `Slug must be at least ${MIN_SLUG_LENGTH} characters`)
  .max(MAX_SLUG_LENGTH, `Slug must be at most ${MAX_SLUG_LENGTH} characters`)
  .regex(/^[a-zA-Z0-9-]+$/, 'Only letters, numbers, and hyphens allowed')
  .refine((slug) => !RESERVED_SLUGS.includes(slug as (typeof RESERVED_SLUGS)[number]), {
    message: 'This slug is reserved',
  });

export type SlugSchemaOutput = z.infer<typeof slugSchema>;

/**
 * Validates a custom slug string.
 *
 * Rules:
 * - Character set: a-z, A-Z, 0-9, hyphen only
 * - Length: 3-50 characters
 * - Cannot be a reserved word (api, health, admin, static, assets)
 *
 * @param slug - The string to validate as a custom slug
 * @returns The validated slug string
 * @throws SlugValidationError with code INVALID_SLUG if validation fails
 *
 * @example
 * ```typescript
 * const slug = validateSlug('my-link'); // Returns 'my-link'
 * validateSlug('ab'); // Throws SlugValidationError (too short)
 * validateSlug('my_link'); // Throws SlugValidationError (invalid character)
 * validateSlug('api'); // Throws SlugValidationError (reserved word)
 * ```
 */
export function validateSlug(slug: string): CustomSlug {
  const result = slugSchema.safeParse(slug);
  if (result.success) return result.data;
  const first = result.error.flatten().formErrors[0] ?? result.error.message;
  throw new SlugValidationError(first);
}

/**
 * Type guard to check if a value is a valid custom slug at runtime.
 *
 * Validates:
 * - Value is a string
 * - Length is 3-50 characters
 * - Character set is a-z, A-Z, 0-9, hyphen only
 * - Not a reserved word
 *
 * @param value - The value to check
 * @returns true if value is a valid CustomSlug, false otherwise
 *
 * @example
 * ```typescript
 * if (isValidSlug('my-link')) {
 *   // TypeScript knows this is a CustomSlug (string)
 * }
 * isValidSlug('ab'); // false (too short)
 * isValidSlug(123); // false (not a string)
 * ```
 */
export function isValidSlug(value: unknown): value is CustomSlug {
  if (typeof value !== 'string') return false;
  if (value.length < MIN_SLUG_LENGTH || value.length > MAX_SLUG_LENGTH) return false;
  if (!/^[a-zA-Z0-9-]+$/.test(value)) return false;
  return !RESERVED_SLUGS.includes(value as (typeof RESERVED_SLUGS)[number]);
}
