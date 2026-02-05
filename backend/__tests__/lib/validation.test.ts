import { describe, it, expect } from 'vitest';
import {
  urlSchema,
  validateUrl,
  ValidationError,
  SlugValidationError,
  MAX_URL_LENGTH,
  slugSchema,
  validateSlug,
  isValidSlug,
  MIN_SLUG_LENGTH,
  MAX_SLUG_LENGTH,
  RESERVED_SLUGS,
  CustomSlug,
} from '../../src/lib/validation';

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
      if (e instanceof ValidationError) {
        expect(e.code).toBe('INVALID_URL');
        expect(e.message).toBeDefined();
      }
    }
  });

  it('throws ValidationError with code INVALID_URL for malformed URL', () => {
    try {
      validateUrl('not-a-url');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ValidationError);
      if (e instanceof ValidationError) {
        expect(e.code).toBe('INVALID_URL');
        expect(e.message).toBeDefined();
      }
    }
  });

  it('throws ValidationError with code INVALID_URL for invalid scheme', () => {
    try {
      validateUrl('ftp://example.com');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ValidationError);
      if (e instanceof ValidationError) {
        expect(e.code).toBe('INVALID_URL');
        expect(e.message).toBeDefined();
      }
    }
  });

  it('throws ValidationError with code INVALID_URL for URL over max length', () => {
    const long = 'https://example.com/' + 'a'.repeat(2048);
    try {
      validateUrl(long);
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ValidationError);
      if (e instanceof ValidationError) {
        expect(e.code).toBe('INVALID_URL');
        expect(e.message).toBeDefined();
      }
    }
  });

  it('throws ValidationError for non-string input (e.g. undefined)', () => {
    expect(() => validateUrl(undefined as unknown as string)).toThrow(ValidationError);
    try {
      validateUrl(undefined as unknown as string);
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(ValidationError);
      if (e instanceof ValidationError) {
        expect(e.code).toBe('INVALID_URL');
      }
    }
  });
});

describe('Slug Validation Constants', () => {
  it('MIN_SLUG_LENGTH should be 3', () => {
    expect(MIN_SLUG_LENGTH).toBe(3);
  });

  it('MAX_SLUG_LENGTH should be 50', () => {
    expect(MAX_SLUG_LENGTH).toBe(50);
  });

  it('RESERVED_SLUGS should contain exactly 5 reserved words', () => {
    expect(RESERVED_SLUGS).toEqual(['api', 'health', 'admin', 'static', 'assets']);
    expect(RESERVED_SLUGS.length).toBe(5);
  });
});

describe('slugSchema', () => {
  describe('valid slugs', () => {
    it('accepts simple alphanumeric slug', () => {
      const result = slugSchema.safeParse('mylink');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe('mylink');
    });

    it('accepts slug with hyphens', () => {
      const result = slugSchema.safeParse('my-link');
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe('my-link');
    });

    it('accepts slug with multiple hyphens', () => {
      const result = slugSchema.safeParse('super-long-slug');
      expect(result.success).toBe(true);
    });

    it('accepts slug at minimum length (3 chars)', () => {
      const result = slugSchema.safeParse('abc');
      expect(result.success).toBe(true);
    });

    it('accepts slug at maximum length (50 chars)', () => {
      const slug = 'a'.repeat(50);
      const result = slugSchema.safeParse(slug);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data).toBe(slug);
    });

    it('accepts uppercase slug', () => {
      const result = slugSchema.safeParse('LINK');
      expect(result.success).toBe(true);
    });

    it('accepts mixed case slug', () => {
      const result = slugSchema.safeParse('MyLink');
      expect(result.success).toBe(true);
    });

    it('accepts slug starting with number', () => {
      const result = slugSchema.safeParse('1link-test');
      expect(result.success).toBe(true);
    });

    it('accepts slug ending with number', () => {
      const result = slugSchema.safeParse('link123');
      expect(result.success).toBe(true);
    });

    it('accepts slug with all hyphens (minimum length)', () => {
      const result = slugSchema.safeParse('---');
      expect(result.success).toBe(true);
    });

    it('accepts slug with all numbers', () => {
      const result = slugSchema.safeParse('123456');
      expect(result.success).toBe(true);
    });
  });

  describe('invalid format', () => {
    it('rejects slug with underscore', () => {
      const result = slugSchema.safeParse('my_link');
      expect(result.success).toBe(false);
    });

    it('rejects slug with space', () => {
      const result = slugSchema.safeParse('my link');
      expect(result.success).toBe(false);
    });

    it('rejects slug with exclamation mark', () => {
      const result = slugSchema.safeParse('my!link');
      expect(result.success).toBe(false);
    });

    it('rejects slug with at sign', () => {
      const result = slugSchema.safeParse('my@link');
      expect(result.success).toBe(false);
    });

    it('rejects slug with hash', () => {
      const result = slugSchema.safeParse('my#link');
      expect(result.success).toBe(false);
    });

    it('rejects slug with forward slash', () => {
      const result = slugSchema.safeParse('my/link');
      expect(result.success).toBe(false);
    });

    it('rejects slug with backslash', () => {
      const result = slugSchema.safeParse('my\\link');
      expect(result.success).toBe(false);
    });

    it('rejects slug with dot', () => {
      const result = slugSchema.safeParse('my.link');
      expect(result.success).toBe(false);
    });

    it('rejects slug with unicode characters', () => {
      const result = slugSchema.safeParse('myλink');
      expect(result.success).toBe(false);
    });
  });

  describe('length violations', () => {
    it('rejects empty string', () => {
      const result = slugSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('rejects slug that is too short (2 chars)', () => {
      const result = slugSchema.safeParse('ab');
      expect(result.success).toBe(false);
    });

    it('rejects slug that is too long (51 chars)', () => {
      const slug = 'a'.repeat(51);
      const result = slugSchema.safeParse(slug);
      expect(result.success).toBe(false);
    });
  });

  describe('reserved words', () => {
    it('rejects reserved slug: api', () => {
      const result = slugSchema.safeParse('api');
      expect(result.success).toBe(false);
    });

    it('rejects reserved slug: health', () => {
      const result = slugSchema.safeParse('health');
      expect(result.success).toBe(false);
    });

    it('rejects reserved slug: admin', () => {
      const result = slugSchema.safeParse('admin');
      expect(result.success).toBe(false);
    });

    it('rejects reserved slug: static', () => {
      const result = slugSchema.safeParse('static');
      expect(result.success).toBe(false);
    });

    it('rejects reserved slug: assets', () => {
      const result = slugSchema.safeParse('assets');
      expect(result.success).toBe(false);
    });

    it('accepts uppercase reserved word (case-sensitive)', () => {
      const result = slugSchema.safeParse('API');
      expect(result.success).toBe(true);
    });

    it('accepts mixed case reserved word (case-sensitive)', () => {
      const result = slugSchema.safeParse('Admin');
      expect(result.success).toBe(true);
    });
  });
});

describe('validateSlug', () => {
  describe('valid cases', () => {
    it('returns slug string for valid simple slug', () => {
      expect(validateSlug('mylink')).toBe('mylink');
    });

    it('returns slug string for valid slug with hyphens', () => {
      expect(validateSlug('my-link')).toBe('my-link');
    });

    it('returns slug string for minimum length slug', () => {
      expect(validateSlug('abc')).toBe('abc');
    });

    it('returns slug string for maximum length slug', () => {
      const slug = 'a'.repeat(50);
      expect(validateSlug(slug)).toBe(slug);
    });
  });

  describe('invalid cases', () => {
    it('throws SlugValidationError for slug with underscore', () => {
      expect(() => validateSlug('my_link')).toThrow(SlugValidationError);
      try {
        validateSlug('my_link');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(SlugValidationError);
        if (e instanceof SlugValidationError) {
          expect(e.code).toBe('INVALID_SLUG');
          expect(e.message).toBeDefined();
        }
      }
    });

    it('throws SlugValidationError for slug that is too short', () => {
      expect(() => validateSlug('ab')).toThrow(SlugValidationError);
      try {
        validateSlug('ab');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(SlugValidationError);
        if (e instanceof SlugValidationError) {
          expect(e.code).toBe('INVALID_SLUG');
        }
      }
    });

    it('throws SlugValidationError for slug that is too long', () => {
      const slug = 'a'.repeat(51);
      expect(() => validateSlug(slug)).toThrow(SlugValidationError);
      try {
        validateSlug(slug);
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(SlugValidationError);
        if (e instanceof SlugValidationError) {
          expect(e.code).toBe('INVALID_SLUG');
        }
      }
    });

    it('throws SlugValidationError for reserved slug: api', () => {
      expect(() => validateSlug('api')).toThrow(SlugValidationError);
      try {
        validateSlug('api');
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(SlugValidationError);
        if (e instanceof SlugValidationError) {
          expect(e.code).toBe('INVALID_SLUG');
          expect(e.message).toContain('reserved');
        }
      }
    });

    it('throws SlugValidationError for reserved slug: admin', () => {
      expect(() => validateSlug('admin')).toThrow(SlugValidationError);
    });

    it('throws SlugValidationError for non-string input', () => {
      expect(() => validateSlug(undefined as unknown as string)).toThrow(SlugValidationError);
      try {
        validateSlug(undefined as unknown as string);
      } catch (e: unknown) {
        expect(e).toBeInstanceOf(SlugValidationError);
        if (e instanceof SlugValidationError) {
          expect(e.code).toBe('INVALID_SLUG');
        }
      }
    });
  });
});

describe('isValidSlug', () => {
  describe('valid slugs', () => {
    it('returns true for valid simple slug', () => {
      expect(isValidSlug('mylink')).toBe(true);
    });

    it('returns true for slug with hyphens', () => {
      expect(isValidSlug('my-link')).toBe(true);
    });

    it('returns true for minimum length slug', () => {
      expect(isValidSlug('abc')).toBe(true);
    });

    it('returns true for maximum length slug', () => {
      const slug = 'a'.repeat(50);
      expect(isValidSlug(slug)).toBe(true);
    });

    it('returns true for mixed case slug', () => {
      expect(isValidSlug('MyLink')).toBe(true);
    });
  });

  describe('invalid slugs', () => {
    it('returns false for slug with underscore', () => {
      expect(isValidSlug('my_link')).toBe(false);
    });

    it('returns false for slug with space', () => {
      expect(isValidSlug('my link')).toBe(false);
    });

    it('returns false for slug that is too short', () => {
      expect(isValidSlug('ab')).toBe(false);
    });

    it('returns false for slug that is too long', () => {
      const slug = 'a'.repeat(51);
      expect(isValidSlug(slug)).toBe(false);
    });

    it('returns false for reserved slug: api', () => {
      expect(isValidSlug('api')).toBe(false);
    });

    it('returns false for reserved slug: health', () => {
      expect(isValidSlug('health')).toBe(false);
    });

    it('returns false for non-string input: null', () => {
      expect(isValidSlug(null)).toBe(false);
    });

    it('returns false for non-string input: undefined', () => {
      expect(isValidSlug(undefined)).toBe(false);
    });

    it('returns false for non-string input: number', () => {
      expect(isValidSlug(123)).toBe(false);
    });

    it('returns false for non-string input: object', () => {
      expect(isValidSlug({})).toBe(false);
    });

    it('returns false for non-string input: array', () => {
      expect(isValidSlug([])).toBe(false);
    });
  });

  describe('validates generated slugs', () => {
    it('validates multiple valid slugs in sequence', () => {
      const validSlugs = ['link1', 'test-slug', 'MyLink', '123', 'a-b-c'];
      validSlugs.forEach((slug) => {
        expect(isValidSlug(slug)).toBe(true);
      });
    });
  });
});

describe('CustomSlug type', () => {
  it('should be assignable from validateSlug return value', () => {
    const slug: CustomSlug = validateSlug('my-link');
    expect(typeof slug).toBe('string');
  });
});
