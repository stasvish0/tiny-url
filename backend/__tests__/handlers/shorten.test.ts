import { describe, it, expect, vi, beforeEach } from 'vitest';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { handler } from '../../src/handlers/shorten';
import * as dynamodb from '@aws-sdk/lib-dynamodb';

vi.mock('@aws-sdk/client-dynamodb');
vi.mock('@aws-sdk/lib-dynamodb');

describe('shorten handler', () => {
  const mockSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TABLE_NAME = 'test-table';

    mockSend.mockReset();
    vi.mocked(dynamodb.PutCommand as unknown as (input: unknown) => unknown).mockImplementation(
      (input: unknown) => ({ input })
    );
    vi.mocked(dynamodb.DynamoDBDocumentClient.from).mockReturnValue({
      send: mockSend,
    } as unknown as dynamodb.DynamoDBDocumentClient);
  });

  const createEvent = (body: Record<string, unknown>): APIGatewayProxyEventV2 => ({
    body: JSON.stringify(body),
    requestContext: {
      domainName: 'api.test.com',
    } as APIGatewayProxyEventV2['requestContext'],
  } as APIGatewayProxyEventV2);

  describe('Request validation', () => {
    it('returns 400 when URL is missing', async () => {
      const event = createEvent({});
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_REQUEST');
      expect(body.error.message).toContain('URL is required');
    });

    it('returns 400 when URL is not a string', async () => {
      const event = createEvent({ url: 123 });
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_REQUEST');
    });

    it('returns 400 when body is malformed JSON', async () => {
      const event = {
        body: 'invalid json',
        requestContext: {
          domainName: 'api.test.com',
        },
      } as APIGatewayProxyEventV2;

      const result = await handler(event);
      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe('INVALID_REQUEST');
      expect(body.error.message).toContain('Invalid JSON');
    });

    it('returns 400 when URL is invalid format', async () => {
      const event = createEvent({ url: 'not-a-valid-url' });
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe('INVALID_URL');
    });

    it('returns 400 when customSlug is not a string', async () => {
      const event = createEvent({ url: 'https://example.com', customSlug: 123 });
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe('INVALID_REQUEST');
      expect(body.error.message).toContain('customSlug must be a string');
    });

    it('returns 400 when custom slug is too short', async () => {
      const event = createEvent({ url: 'https://example.com', customSlug: 'ab' });
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe('INVALID_SLUG');
    });

    it('returns 400 when custom slug has invalid characters', async () => {
      const event = createEvent({ url: 'https://example.com', customSlug: 'my_slug' });
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe('INVALID_SLUG');
    });

    it('returns 400 when custom slug is reserved word', async () => {
      const event = createEvent({ url: 'https://example.com', customSlug: 'api' });
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe('INVALID_SLUG');
      expect(body.error.message).toContain('reserved');
    });
  });

  describe('Success cases', () => {
    it('creates short URL with generated code', async () => {
      mockSend.mockResolvedValueOnce({});

      const event = createEvent({ url: 'https://example.com/path' });
      const result = await handler(event);

      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data.shortUrl).toMatch(/^https:\/\/api\.test\.com\/[A-Za-z0-9_-]{7}$/);
      expect(body.data.shortCode).toHaveLength(7);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('treats empty string customSlug as not provided (generates code)', async () => {
      mockSend.mockResolvedValueOnce({});

      const event = createEvent({ url: 'https://example.com/path', customSlug: '' });
      const result = await handler(event);

      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data.shortUrl).toMatch(/^https:\/\/api\.test\.com\/[A-Za-z0-9_-]{7}$/);
      expect(body.data.shortCode).toHaveLength(7);
      expect(body.data.shortCode).not.toBe('');

      const putCommand = mockSend.mock.calls[0][0];
      expect(putCommand.input.Item.shortCode).toMatch(/^[A-Za-z0-9_-]{7}$/);
    });

    it('creates short URL with custom slug', async () => {
      mockSend.mockResolvedValueOnce({});

      const event = createEvent({ url: 'https://example.com', customSlug: 'my-link' });
      const result = await handler(event);

      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data.shortUrl).toBe('https://api.test.com/my-link');
      expect(body.data.shortCode).toBe('my-link');
      expect(mockSend).toHaveBeenCalledTimes(1);

      const putCommand = mockSend.mock.calls[0][0];
      expect(putCommand.input.Item.shortCode).toBe('my-link');
      expect(putCommand.input.Item.originalUrl).toBe('https://example.com');
      expect(putCommand.input.ConditionExpression).toBe('attribute_not_exists(shortCode)');
    });
  });

  describe('Collision handling', () => {
    it('returns 409 when custom slug is already taken', async () => {
      const error = new Error('ConditionalCheckFailedException');
      error.name = 'ConditionalCheckFailedException';
      mockSend.mockRejectedValueOnce(error);

      const event = createEvent({ url: 'https://example.com', customSlug: 'taken-slug' });
      const result = await handler(event);

      expect(result.statusCode).toBe(409);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('SLUG_TAKEN');
      expect(body.error.message).toContain('already in use');
    });

    it('retries with new code on generated code collision', async () => {
      const error = new Error('ConditionalCheckFailedException');
      error.name = 'ConditionalCheckFailedException';
      mockSend
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({});

      const event = createEvent({ url: 'https://example.com' });
      const result = await handler(event);

      expect(result.statusCode).toBe(201);
      expect(mockSend).toHaveBeenCalledTimes(3);
      const body = JSON.parse(result.body);
      expect(body.success).toBe(true);
      expect(body.data.shortCode).toHaveLength(7);
    });

    it('returns 500 when collision retry exhausted', async () => {
      const error = new Error('ConditionalCheckFailedException');
      error.name = 'ConditionalCheckFailedException';
      mockSend.mockRejectedValue(error);

      const event = createEvent({ url: 'https://example.com' });
      const result = await handler(event);

      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe('INTERNAL_ERROR');
      expect(body.error.message).toContain('Failed to generate unique code');
      expect(mockSend).toHaveBeenCalledTimes(5);
    });
  });

  describe('Error handling', () => {
    it('returns 500 on DynamoDB error (non-collision)', async () => {
      mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));

      const event = createEvent({ url: 'https://example.com' });
      const result = await handler(event);

      expect(result.statusCode).toBe(500);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe('INTERNAL_ERROR');
      expect(body.error.message).toBe('Something went wrong');
    });
  });

  describe('Integration - all validation libraries', () => {
    it('uses validateUrl from Story 2.1', async () => {
      const event = createEvent({ url: 'ftp://invalid-scheme.com' });
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe('INVALID_URL');
    });

    it('uses validateSlug from Story 2.3', async () => {
      const event = createEvent({ url: 'https://example.com', customSlug: 'health' });
      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      const body = JSON.parse(result.body);
      expect(body.error.code).toBe('INVALID_SLUG');
    });

    it('uses generateShortCode from Story 2.2', async () => {
      mockSend.mockResolvedValueOnce({});

      const event = createEvent({ url: 'https://example.com' });
      const result = await handler(event);

      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      expect(body.data.shortCode).toMatch(/^[A-Za-z0-9_-]{7}$/);
    });
  });
});
