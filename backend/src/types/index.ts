export interface UrlMapping {
  shortCode: string;
  originalUrl: string;
  createdAt: number;
}

export interface ShortenRequest {
  url: string;
  customSlug?: string;
}

export interface ShortenResponse {
  shortUrl: string;
  shortCode: string;
}

export interface HealthResponse {
  status: 'ok';
}
