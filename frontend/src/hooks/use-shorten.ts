import { useState } from 'react';
import type { ShortenRequest, ShortenResponse, ApiResponse } from '@/types';
import { shortenUrl } from '@/lib/api';

interface UseShortenResult {
  shorten: (request: ShortenRequest) => Promise<void>;
  result: ShortenResponse | null;
  error: string | null;
  isLoading: boolean;
}

export function useShorten(): UseShortenResult {
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const shorten = async (request: ShortenRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response: ApiResponse<ShortenResponse> = await shortenUrl(request);
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { shorten, result, error, isLoading };
}
