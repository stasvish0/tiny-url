import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shortenUrl, checkHealth } from './api';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch as typeof fetch;

describe('api', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('shortenUrl', () => {
    it('should call fetch with correct URL and options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { shortUrl: 'https://tiny.url/abc', shortCode: 'abc' } }),
      });

      await shortenUrl({ url: 'https://example.com' });

      expect(mockFetch).toHaveBeenCalledWith('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      });
    });

    it('should include customSlug in request body when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { shortUrl: 'https://tiny.url/my-slug', shortCode: 'my-slug' } }),
      });

      await shortenUrl({ url: 'https://example.com', customSlug: 'my-slug' });

      expect(mockFetch).toHaveBeenCalledWith('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com', customSlug: 'my-slug' }),
      });
    });

    it('should return success response when API returns 200', async () => {
      const mockResponse = { success: true, data: { shortUrl: 'https://tiny.url/abc', shortCode: 'abc' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await shortenUrl({ url: 'https://example.com' });

      expect(result).toEqual(mockResponse);
    });

    it('should return error response when API returns 4xx', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const result = await shortenUrl({ url: 'invalid' });

      expect(result).toEqual({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Request failed with status 400',
        },
      });
    });

    it('should return error response when API returns 5xx', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await shortenUrl({ url: 'https://example.com' });

      expect(result).toEqual({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Request failed with status 500',
        },
      });
    });
  });

  describe('checkHealth', () => {
    it('should call fetch with correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { status: 'ok' } }),
      });

      await checkHealth();

      expect(mockFetch).toHaveBeenCalledWith('/api/health');
    });

    it('should return success response when API is healthy', async () => {
      const mockResponse = { success: true, data: { status: 'ok' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await checkHealth();

      expect(result).toEqual(mockResponse);
    });

    it('should return error response when health check fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
      });

      const result = await checkHealth();

      expect(result).toEqual({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Health check failed with status 503',
        },
      });
    });
  });
});
