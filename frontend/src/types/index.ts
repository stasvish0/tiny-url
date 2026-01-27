export interface ShortenRequest {
  url: string;
  customSlug?: string;
}

export interface ShortenResponse {
  shortUrl: string;
  shortCode: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
