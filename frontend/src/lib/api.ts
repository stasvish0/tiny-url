import type { ApiResponse, ShortenRequest, ShortenResponse } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function shortenUrl(request: ShortenRequest): Promise<ApiResponse<ShortenResponse>> {
  const response = await fetch(`${API_URL}/shorten`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: `Request failed with status ${response.status}`,
      },
    };
  }

  return response.json();
}

export async function checkHealth(): Promise<ApiResponse<{ status: string }>> {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: `Health check failed with status ${response.status}`,
      },
    };
  }

  return response.json();
}
