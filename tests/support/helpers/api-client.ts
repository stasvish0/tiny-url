import { APIRequestContext } from '@playwright/test';

export interface ShortenRequest {
  url: string;
  customSlug?: string;
}

export interface ShortenResponse {
  success: true;
  data: {
    shortUrl: string;
    shortCode: string;
    originalUrl: string;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = T | ErrorResponse;

export class ApiClient {
  private baseUrl: string;

  constructor(private request: APIRequestContext) {
    this.baseUrl = process.env.API_URL || 'http://localhost:3000';
  }

  async shorten(data: ShortenRequest): Promise<ApiResponse<ShortenResponse>> {
    const response = await this.request.post(`${this.baseUrl}/api/shorten`, {
      data,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  }

  async health(): Promise<{ success: true; data: { status: string } }> {
    const response = await this.request.get(`${this.baseUrl}/api/health`);
    return response.json();
  }

  async getRedirectLocation(shortCode: string): Promise<string | null> {
    const response = await this.request.get(`${this.baseUrl}/${shortCode}`, {
      maxRedirects: 0,
    });
    return response.headers()['location'] || null;
  }
}
