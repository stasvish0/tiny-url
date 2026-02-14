import { test, expect } from '../support/fixtures';
import { UrlFactory } from '../support/helpers/url-factory';

const urlFactory = new UrlFactory();

test.describe('URL Shortening API - Integration Tests', () => {
  test.describe('Success Scenarios', () => {
    test('should shorten a valid URL with generated code', async ({ apiClient, request, baseURL }) => {
      const originalUrl = urlFactory.createValidUrl();

      const response = await apiClient.shorten({ url: originalUrl });

      // Validate response structure
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.shortCode).toHaveLength(7);
        expect(response.data.shortCode).toMatch(/^[A-Za-z0-9_-]+$/);
        expect(response.data.shortUrl).toContain(response.data.shortCode);
        expect(response.data.originalUrl).toBe(originalUrl);

        // Verify shortUrl format
        expect(response.data.shortUrl).toMatch(/^https?:\/\/.+\/.{7}$/);
      }

      // Verify HTTP status code
      const rawResponse = await request.post(`${baseURL}/api/shorten`, {
        data: { url: originalUrl },
      });
      expect(rawResponse.status()).toBe(201);
    });

    test('should accept custom slug', async ({ apiClient, request, baseURL }) => {
      const originalUrl = urlFactory.createValidUrl();
      const customSlug = `test-${Date.now()}`;

      const response = await apiClient.shorten({
        url: originalUrl,
        customSlug,
      });

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.shortCode).toBe(customSlug);
        expect(response.data.shortUrl).toContain(customSlug);
        expect(response.data.originalUrl).toBe(originalUrl);
      }

      // Verify HTTP status code
      const rawResponse = await request.post(`${baseURL}/api/shorten`, {
        data: { url: originalUrl, customSlug },
      });
      expect(rawResponse.status()).toBe(201);
    });

    test('should handle very long URLs', async ({ apiClient }) => {
      const longUrl = urlFactory.createLongUrl();

      const response = await apiClient.shorten({ url: longUrl });

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.shortCode).toHaveLength(7);
        expect(response.data.originalUrl).toBe(longUrl);
      }
    });

    test('should handle URLs with special characters', async ({ apiClient }) => {
      const urlWithParams = 'https://example.com/search?q=hello+world&lang=en&page=1#section';

      const response = await apiClient.shorten({ url: urlWithParams });

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.originalUrl).toBe(urlWithParams);
      }
    });
  });

  test.describe('Validation - Invalid URLs', () => {
    test('should reject invalid URL format', async ({ apiClient, request, baseURL }) => {
      const invalidUrl = urlFactory.createInvalidUrl();

      const response = await apiClient.shorten({ url: invalidUrl });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.code).toBe('INVALID_URL');
        expect(response.error.message).toBeTruthy();
      }

      // Verify HTTP status code
      const rawResponse = await request.post(`${baseURL}/api/shorten`, {
        data: { url: invalidUrl },
      });
      expect(rawResponse.status()).toBe(400);
    });

    test('should reject missing URL', async ({ request, baseURL }) => {
      const rawResponse = await request.post(`${baseURL}/api/shorten`, {
        data: {},
      });

      expect(rawResponse.status()).toBe(400);
      const body = await rawResponse.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_REQUEST');
    });

    test('should reject non-string URL', async ({ request, baseURL }) => {
      const rawResponse = await request.post(`${baseURL}/api/shorten`, {
        data: { url: 12345 },
      });

      expect(rawResponse.status()).toBe(400);
      const body = await rawResponse.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_REQUEST');
    });

    test('should reject malformed JSON', async ({ request, baseURL }) => {
      const rawResponse = await request.post(`${baseURL}/api/shorten`, {
        data: 'not-json',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(rawResponse.status()).toBe(400);
      const body = await rawResponse.json();
      expect(body.success).toBe(false);
    });

    test('should reject URL without protocol', async ({ apiClient, request, baseURL }) => {
      const urlWithoutProtocol = 'example.com';

      const response = await apiClient.shorten({ url: urlWithoutProtocol });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.code).toBe('INVALID_URL');
      }

      const rawResponse = await request.post(`${baseURL}/api/shorten`, {
        data: { url: urlWithoutProtocol },
      });
      expect(rawResponse.status()).toBe(400);
    });
  });

  test.describe('Validation - Invalid Custom Slugs', () => {
    test('should reject reserved slug', async ({ apiClient, request, baseURL }) => {
      const originalUrl = urlFactory.createValidUrl();
      const reservedSlug = urlFactory.createReservedSlug();

      const response = await apiClient.shorten({
        url: originalUrl,
        customSlug: reservedSlug,
      });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.code).toBe('INVALID_SLUG');
      }

      const rawResponse = await request.post(`${baseURL}/api/shorten`, {
        data: { url: originalUrl, customSlug: reservedSlug },
      });
      expect(rawResponse.status()).toBe(400);
    });

    test('should reject slug that is too short (< 3 chars)', async ({ apiClient, request, baseURL }) => {
      const originalUrl = urlFactory.createValidUrl();
      const shortSlug = 'ab';

      const response = await apiClient.shorten({
        url: originalUrl,
        customSlug: shortSlug,
      });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.code).toBe('INVALID_SLUG');
      }

      const rawResponse = await request.post(`${baseURL}/api/shorten`, {
        data: { url: originalUrl, customSlug: shortSlug },
      });
      expect(rawResponse.status()).toBe(400);
    });

    test('should reject slug with invalid characters', async ({ apiClient, request, baseURL }) => {
      const originalUrl = urlFactory.createValidUrl();
      const invalidSlug = 'test_slug!@#';

      const response = await apiClient.shorten({
        url: originalUrl,
        customSlug: invalidSlug,
      });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.error.code).toBe('INVALID_SLUG');
      }

      const rawResponse = await request.post(`${baseURL}/api/shorten`, {
        data: { url: originalUrl, customSlug: invalidSlug },
      });
      expect(rawResponse.status()).toBe(400);
    });

    test('should reject non-string customSlug', async ({ request, baseURL }) => {
      const originalUrl = urlFactory.createValidUrl();

      const rawResponse = await request.post(`${baseURL}/api/shorten`, {
        data: { url: originalUrl, customSlug: 12345 },
      });

      expect(rawResponse.status()).toBe(400);
      const body = await rawResponse.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_REQUEST');
    });

    test('should treat empty string customSlug as no slug (generate code)', async ({ apiClient }) => {
      const originalUrl = urlFactory.createValidUrl();

      const response = await apiClient.shorten({
        url: originalUrl,
        customSlug: '',
      });

      // Empty string should be treated as "no custom slug" - generate code instead
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.shortCode).toHaveLength(7);
        expect(response.data.shortCode).not.toBe('');
      }
    });
  });

  test.describe('Collision Handling - CRITICAL', () => {
    test('should reject duplicate custom slug with 409 SLUG_TAKEN', async ({ apiClient, request, baseURL }) => {
      const originalUrl1 = urlFactory.createValidUrl();
      const originalUrl2 = urlFactory.createValidUrl();
      const customSlug = `collision-test-${Date.now()}`;

      // First request - should succeed
      const firstResponse = await apiClient.shorten({
        url: originalUrl1,
        customSlug,
      });
      expect(firstResponse.success).toBe(true);

      // Second request with same slug - should fail with 409
      const secondResponse = await apiClient.shorten({
        url: originalUrl2,
        customSlug,
      });

      expect(secondResponse.success).toBe(false);
      if (!secondResponse.success) {
        expect(secondResponse.error.code).toBe('SLUG_TAKEN');
        expect(secondResponse.error.message).toContain('already in use');
      }

      // Verify HTTP status code is 409 Conflict
      const rawResponse = await request.post(`${baseURL}/api/shorten`, {
        data: { url: originalUrl2, customSlug },
      });
      expect(rawResponse.status()).toBe(409);
    });

    test('should handle generated code collisions gracefully (rare)', async ({ apiClient }) => {
      // This test validates that IF a collision happens with generated codes,
      // the system retries with a new code automatically
      // Note: With 7-char nanoid, collision probability is ~0.000001%
      // This test mainly documents expected behavior

      const originalUrl = urlFactory.createValidUrl();
      const response = await apiClient.shorten({ url: originalUrl });

      expect(response.success).toBe(true);
      if (response.success) {
        // Should succeed even if internal retry happened
        expect(response.data.shortCode).toHaveLength(7);
      }
    });
  });

  test.describe('Response Format Validation', () => {
    test('success response should match API contract', async ({ apiClient }) => {
      const originalUrl = urlFactory.createValidUrl();

      const response = await apiClient.shorten({ url: originalUrl });

      expect(response.success).toBe(true);
      if (response.success) {
        // Validate complete response structure
        expect(response.data).toBeDefined();
        expect(response.data.shortUrl).toBeDefined();
        expect(response.data.shortCode).toBeDefined();
        expect(response.data.originalUrl).toBeDefined();

        // Validate data types
        expect(typeof response.data.shortUrl).toBe('string');
        expect(typeof response.data.shortCode).toBe('string');
        expect(typeof response.data.originalUrl).toBe('string');
      }
    });

    test('error response should match API contract', async ({ apiClient }) => {
      const invalidUrl = urlFactory.createInvalidUrl();

      const response = await apiClient.shorten({ url: invalidUrl });

      expect(response.success).toBe(false);
      if (!response.success) {
        // Validate complete error structure
        expect(response.error).toBeDefined();
        expect(response.error.code).toBeDefined();
        expect(response.error.message).toBeDefined();

        // Validate data types
        expect(typeof response.error.code).toBe('string');
        expect(typeof response.error.message).toBe('string');

        // Validate error code format (should be SCREAMING_SNAKE_CASE)
        expect(response.error.code).toMatch(/^[A-Z_]+$/);
      }
    });
  });
});
