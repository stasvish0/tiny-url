import { test, expect } from '../support/fixtures';
import { UrlFactory } from '../support/helpers/url-factory';

const urlFactory = new UrlFactory();

test.describe('URL Redirect API', () => {
  test('should redirect to original URL', async ({ apiClient }) => {
    const originalUrl = urlFactory.createValidUrl();

    const shortenResponse = await apiClient.shorten({ url: originalUrl });
    expect(shortenResponse.success).toBe(true);

    if (shortenResponse.success) {
      const location = await apiClient.getRedirectLocation(shortenResponse.data.shortCode);
      expect(location).toBe(originalUrl);
    }
  });

  test('should return 404 for non-existent short code', async ({ request }) => {
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const response = await request.get(`${baseUrl}/nonexistent123`, {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(404);
  });
});
