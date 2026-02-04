import { nanoid } from 'nanoid';

/** Length of generated short codes (7 characters). */
export const SHORT_CODE_LENGTH = 7;

/**
 * Short code type alias for documentation purposes.
 * Use `isValidShortCode()` for runtime validation.
 */
export type ShortCode = string;

/**
 * Validates if a string is a valid short code.
 * Checks length and character set to match generated short codes.
 *
 * @param value - The string to validate
 * @returns true if the string is a valid short code format
 *
 * @example
 * ```typescript
 * isValidShortCode("aBc-123"); // true (7 chars, valid alphabet)
 * isValidShortCode("abc");     // false (too short)
 * isValidShortCode("abc@123"); // false (invalid character @)
 * ```
 */
export function isValidShortCode(value: unknown): value is ShortCode {
  if (typeof value !== 'string') return false;
  if (value.length !== SHORT_CODE_LENGTH) return false;
  return /^[A-Za-z0-9_-]+$/.test(value);
}

/**
 * Generates a unique short code using nanoid.
 * Uses default nanoid alphabet (A-Za-z0-9_-) for URL-safe codes.
 *
 * **Collision Probability:**
 * - Alphabet size: 64 characters (A-Za-z0-9_-)
 * - Code length: 7 characters
 * - Total combinations: 64^7 = 4,398,046,511,104 (~4.4 trillion)
 * - Collision probability with 1M codes: ~0.000011% (1 in 9 million)
 * - Collision probability with 10M codes: ~0.0011% (1 in 90,000)
 *
 * **Collision Handling:**
 * Collision handling is done by the caller (shorten handler) via DynamoDB conditional writes.
 * Recommended retry strategy: Up to 3 retries with exponential backoff.
 * If collision occurs after 3 retries, return user-facing error.
 *
 * @returns A 7-character URL-safe short code
 * @see https://zelark.github.io/nano-id-cc/ for collision calculator
 */
export function generateShortCode(): ShortCode {
  return nanoid(SHORT_CODE_LENGTH);
}
