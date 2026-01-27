import { describe, it, expect } from 'vitest';
import { validateUrl, validateSlug, urlSchema, slugSchema } from './validation';

describe('validation', () => {
  describe('urlSchema', () => {
    it('should accept valid HTTP URLs', () => {
      expect(urlSchema.safeParse('http://example.com').success).toBe(true);
      expect(urlSchema.safeParse('http://example.com/path').success).toBe(true);
      expect(urlSchema.safeParse('http://example.com/path?query=1').success).toBe(true);
    });

    it('should accept valid HTTPS URLs', () => {
      expect(urlSchema.safeParse('https://example.com').success).toBe(true);
      expect(urlSchema.safeParse('https://sub.example.com').success).toBe(true);
      expect(urlSchema.safeParse('https://example.com:8080/path').success).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(urlSchema.safeParse('not-a-url').success).toBe(false);
      expect(urlSchema.safeParse('example.com').success).toBe(false);
      expect(urlSchema.safeParse('').success).toBe(false);
    });

    it('should accept other valid URL schemes (ftp, etc.)', () => {
      expect(urlSchema.safeParse('ftp://example.com').success).toBe(true);
    });
  });

  describe('slugSchema', () => {
    it('should accept valid slugs', () => {
      expect(slugSchema.safeParse('abc').success).toBe(true);
      expect(slugSchema.safeParse('my-slug').success).toBe(true);
      expect(slugSchema.safeParse('slug123').success).toBe(true);
      expect(slugSchema.safeParse('a-b-c-1-2-3').success).toBe(true);
    });

    it('should reject slugs shorter than 3 characters', () => {
      const result = slugSchema.safeParse('ab');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('at least 3');
      }
    });

    it('should reject slugs longer than 50 characters', () => {
      const longSlug = 'a'.repeat(51);
      const result = slugSchema.safeParse(longSlug);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('at most 50');
      }
    });

    it('should accept slugs with uppercase letters', () => {
      expect(slugSchema.safeParse('MySlug').success).toBe(true);
      expect(slugSchema.safeParse('ABC123').success).toBe(true);
      expect(slugSchema.safeParse('Test-Slug').success).toBe(true);
    });

    it('should reject slugs with special characters', () => {
      expect(slugSchema.safeParse('my_slug').success).toBe(false);
      expect(slugSchema.safeParse('my.slug').success).toBe(false);
      expect(slugSchema.safeParse('my slug').success).toBe(false);
      expect(slugSchema.safeParse('my@slug').success).toBe(false);
    });

    it('should accept slugs at boundary lengths', () => {
      expect(slugSchema.safeParse('abc').success).toBe(true);
      expect(slugSchema.safeParse('a'.repeat(50)).success).toBe(true);
    });
  });

  describe('validateUrl', () => {
    it('should return valid: true for valid URLs', () => {
      const result = validateUrl('https://example.com');
      expect(result).toEqual({ valid: true });
    });

    it('should return valid: false with error message for invalid URLs', () => {
      const result = validateUrl('not-a-url');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('valid URL');
    });

    it('should return valid: false for empty string', () => {
      const result = validateUrl('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateSlug', () => {
    it('should return valid: true for valid slugs', () => {
      const result = validateSlug('my-custom-slug');
      expect(result).toEqual({ valid: true });
    });

    it('should return valid: false with error for too short slugs', () => {
      const result = validateSlug('ab');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 3');
    });

    it('should return valid: false with error for too long slugs', () => {
      const result = validateSlug('a'.repeat(51));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at most 50');
    });

    it('should return valid: false with error for invalid characters', () => {
      const result = validateSlug('Invalid_Slug!');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('letters');
    });
  });
});
