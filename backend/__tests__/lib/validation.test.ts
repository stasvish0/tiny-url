import { describe, it, expect } from 'vitest';
import { urlSchema, validateUrl, ValidationError, MAX_URL_LENGTH } from '../../src/lib/validation';

describe('urlSchema', () => {
  it('accepts valid http URL', () => {
    const result = urlSchema.safeParse('http://example.com');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('http://example.com');
  });

  it('accepts valid https URL', () => {
    const result = urlSchema.safeParse('https://example.com/path?q=1');
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe('https://example.com/path?q=1');
  });

  it('rejects empty string', () => {
    const result = urlSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejects malformed URL (no scheme)', () => {
    const result = urlSchema.safeParse('example.com');
    expect(result.success).toBe(false);
  });

  it('rejects invalid scheme', () => {
    const result = urlSchema.safeParse('ftp://example.com');
    expect(result.success).toBe(false);
  });

  it('rejects URL over max length', () => {
    const long = 'https://example.com/' + 'a'.repeat(2048);
    const result = urlSchema.safeParse(long);
    expect(result.success).toBe(false);
  });

  it('accepts URL at exactly max length (2048 chars)', () => {
    const base = 'https://example.com/';
    const padding = 'a'.repeat(MAX_URL_LENGTH - base.length);
    const url = base + padding;
    const result = urlSchema.safeParse(url);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(url);
  });
});

describe('validateUrl', () => {
  it('returns URL string for valid http URL', () => {
    expect(validateUrl('http://example.com')).toBe('http://example.com');
  });

  it('returns URL string for valid https URL with path', () => {
    expect(validateUrl('https://example.com/foo/bar')).toBe('https://example.com/foo/bar');
  });

  it('throws ValidationError with code INVALID_URL for empty string', () => {
    expect(() => validateUrl('')).toThrow(ValidationError);
    try {
      validateUrl('');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ValidationError);
      const err = e as ValidationError;
      expect(err.code).toBe('INVALID_URL');
      expect(err.message).toBeDefined();
    }
  });

  it('throws ValidationError with code INVALID_URL for malformed URL', () => {
    try {
      validateUrl('not-a-url');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ValidationError);
      const err = e as ValidationError;
      expect(err.code).toBe('INVALID_URL');
      expect(err.message).toBeDefined();
    }
  });

  it('throws ValidationError with code INVALID_URL for invalid scheme', () => {
    try {
      validateUrl('ftp://example.com');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ValidationError);
      const err = e as ValidationError;
      expect(err.code).toBe('INVALID_URL');
      expect(err.message).toBeDefined();
    }
  });

  it('throws ValidationError with code INVALID_URL for URL over max length', () => {
    const long = 'https://example.com/' + 'a'.repeat(2048);
    try {
      validateUrl(long);
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ValidationError);
      const err = e as ValidationError;
      expect(err.code).toBe('INVALID_URL');
      expect(err.message).toBeDefined();
    }
  });

  it('throws ValidationError for non-string input (e.g. undefined)', () => {
    expect(() => validateUrl(undefined as unknown as string)).toThrow(ValidationError);
    try {
      validateUrl(undefined as unknown as string);
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ValidationError);
      const err = e as ValidationError;
      expect(err.code).toBe('INVALID_URL');
    }
  });
});
