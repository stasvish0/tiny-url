import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShorten } from './use-shorten';
import * as api from '@/lib/api';
import type { ApiResponse, ShortenResponse } from '@/types';

vi.mock('@/lib/api');

const mockShortenUrl = vi.mocked(api.shortenUrl);

describe('useShorten', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return null result initially', () => {
      const { result } = renderHook(() => useShorten());
      expect(result.current.result).toBeNull();
    });

    it('should return null error initially', () => {
      const { result } = renderHook(() => useShorten());
      expect(result.current.error).toBeNull();
    });

    it('should return isLoading false initially', () => {
      const { result } = renderHook(() => useShorten());
      expect(result.current.isLoading).toBe(false);
    });

    it('should return shorten function', () => {
      const { result } = renderHook(() => useShorten());
      expect(typeof result.current.shorten).toBe('function');
    });
  });

  describe('successful shorten', () => {
    it('should set isLoading to true while request is in progress', async () => {
      let resolvePromise: (value: ApiResponse<ShortenResponse>) => void;
      const pendingPromise = new Promise<ApiResponse<ShortenResponse>>((resolve) => {
        resolvePromise = resolve;
      });
      mockShortenUrl.mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useShorten());

      act(() => {
        result.current.shorten({ url: 'https://example.com' });
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!({ success: true, data: { shortUrl: 'https://tiny.url/abc', shortCode: 'abc' } });
      });
    });

    it('should set result on successful API response', async () => {
      const mockResponse = {
        success: true as const,
        data: { shortUrl: 'https://tiny.url/abc', shortCode: 'abc' },
      };
      mockShortenUrl.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useShorten());

      await act(async () => {
        await result.current.shorten({ url: 'https://example.com' });
      });

      expect(result.current.result).toEqual({ shortUrl: 'https://tiny.url/abc', shortCode: 'abc' });
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should call shortenUrl with correct request', async () => {
      mockShortenUrl.mockResolvedValue({
        success: true,
        data: { shortUrl: 'https://tiny.url/abc', shortCode: 'abc' },
      });

      const { result } = renderHook(() => useShorten());

      await act(async () => {
        await result.current.shorten({ url: 'https://example.com', customSlug: 'my-slug' });
      });

      expect(mockShortenUrl).toHaveBeenCalledWith({ url: 'https://example.com', customSlug: 'my-slug' });
    });
  });

  describe('API error response', () => {
    it('should set error on API error response', async () => {
      const mockResponse = {
        success: false as const,
        error: { code: 'INVALID_URL', message: 'URL is invalid' },
      };
      mockShortenUrl.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useShorten());

      await act(async () => {
        await result.current.shorten({ url: 'invalid' });
      });

      expect(result.current.error).toBe('URL is invalid');
      expect(result.current.result).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('network error', () => {
    it('should set error on network failure', async () => {
      mockShortenUrl.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useShorten());

      await act(async () => {
        await result.current.shorten({ url: 'https://example.com' });
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.result).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle non-Error exceptions', async () => {
      mockShortenUrl.mockRejectedValue('Unknown error');

      const { result } = renderHook(() => useShorten());

      await act(async () => {
        await result.current.shorten({ url: 'https://example.com' });
      });

      expect(result.current.error).toBe('An unexpected error occurred');
    });
  });

  describe('state reset on new request', () => {
    it('should clear previous result when starting new request', async () => {
      mockShortenUrl.mockResolvedValueOnce({
        success: true,
        data: { shortUrl: 'https://tiny.url/abc', shortCode: 'abc' },
      });

      const { result } = renderHook(() => useShorten());

      await act(async () => {
        await result.current.shorten({ url: 'https://example.com' });
      });

      expect(result.current.result).not.toBeNull();

      let resolvePromise: (value: ApiResponse<ShortenResponse>) => void;
      const pendingPromise = new Promise<ApiResponse<ShortenResponse>>((resolve) => {
        resolvePromise = resolve;
      });
      mockShortenUrl.mockReturnValue(pendingPromise);

      act(() => {
        result.current.shorten({ url: 'https://another.com' });
      });

      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();

      await act(async () => {
        resolvePromise!({ success: true, data: { shortUrl: 'https://tiny.url/xyz', shortCode: 'xyz' } });
      });
    });

    it('should clear previous error when starting new request', async () => {
      mockShortenUrl.mockResolvedValueOnce({
        success: false,
        error: { code: 'ERROR', message: 'First error' },
      });

      const { result } = renderHook(() => useShorten());

      await act(async () => {
        await result.current.shorten({ url: 'invalid' });
      });

      expect(result.current.error).not.toBeNull();

      mockShortenUrl.mockResolvedValueOnce({
        success: true,
        data: { shortUrl: 'https://tiny.url/abc', shortCode: 'abc' },
      });

      await act(async () => {
        await result.current.shorten({ url: 'https://example.com' });
      });

      expect(result.current.error).toBeNull();
      expect(result.current.result).not.toBeNull();
    });
  });
});
