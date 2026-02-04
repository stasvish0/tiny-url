import { z } from 'zod';

/** Max URL length (bytes) to avoid abuse and align with common limits. */
export const MAX_URL_LENGTH = 2048;

/** Error thrown on validation failure; handlers map to 400 + INVALID_URL. */
export class ValidationError extends Error {
  readonly code = 'INVALID_URL' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
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
  throw new ValidationError(first);
}
