import { test, expect } from '../support/fixtures';
import { UrlFactory } from '../support/helpers/url-factory';

const urlFactory = new UrlFactory();

test.describe('URL Shortening API', () => {
  test('should shorten a valid URL', async ({ apiClient }) => {
    const originalUrl = urlFactory.createValidUrl();

    const response = await apiClient.shorten({ url: originalUrl });

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data.shortCode).toHaveLength(7);
      expect(response.data.shortUrl).toContain(response.data.shortCode);
    }
  });

  test('should accept custom slug', async ({ apiClient }) => {
    const originalUrl = urlFactory.createValidUrl();
    const customSlug = urlFactory.createCustomSlug();

    const response = await apiClient.shorten({
      url: originalUrl,
      customSlug,
    });

    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.data.shortCode).toBe(customSlug);
    }
  });

  test('should reject invalid URL', async ({ apiClient }) => {
    const invalidUrl = urlFactory.createInvalidUrl();

    const response = await apiClient.shorten({ url: invalidUrl });

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error.code).toBe('INVALID_URL');
    }
  });

  test('should reject reserved slug', async ({ apiClient }) => {
    const originalUrl = urlFactory.createValidUrl();
    const reservedSlug = urlFactory.createReservedSlug();

    const response = await apiClient.shorten({
      url: originalUrl,
      customSlug: reservedSlug,
    });

    expect(response.success).toBe(false);
  });
});
