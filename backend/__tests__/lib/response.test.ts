import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse } from '../../src/lib/response';

describe('response helpers', () => {
  describe('successResponse', () => {
    it('should return 200 status code by default', () => {
      const result = successResponse({ foo: 'bar' });
      expect(result.statusCode).toBe(200);
    });

    it('should return custom status code when provided', () => {
      const result = successResponse({ foo: 'bar' }, 201);
      expect(result.statusCode).toBe(201);
    });

    it('should return success true with data', () => {
      const data = { shortUrl: 'https://tiny.url/abc123' };
      const result = successResponse(data);
      const body = JSON.parse(result.body as string);
      
      expect(body).toEqual({
        success: true,
        data,
      });
    });

    it('should set Content-Type header to application/json', () => {
      const result = successResponse({});
      expect(result.headers).toHaveProperty('Content-Type', 'application/json');
    });
  });

  describe('errorResponse', () => {
    it('should return 400 status code by default', () => {
      const result = errorResponse('INVALID_URL', 'URL is invalid');
      expect(result.statusCode).toBe(400);
    });

    it('should return custom status code when provided', () => {
      const result = errorResponse('NOT_FOUND', 'Not found', 404);
      expect(result.statusCode).toBe(404);
    });

    it('should return success false with error code and message', () => {
      const result = errorResponse('SLUG_TAKEN', 'This slug is already taken');
      const body = JSON.parse(result.body as string);
      
      expect(body).toEqual({
        success: false,
        error: {
          code: 'SLUG_TAKEN',
          message: 'This slug is already taken',
        },
      });
    });

    it('should set Content-Type header to application/json', () => {
      const result = errorResponse('ERROR', 'Error');
      expect(result.headers).toHaveProperty('Content-Type', 'application/json');
    });
  });
});
