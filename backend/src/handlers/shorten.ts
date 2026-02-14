import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { validateUrl, validateSlug, ValidationError, SlugValidationError } from '../lib/validation';
import { generateShortCode } from '../lib/shortcode';
import { successResponse, errorResponse } from '../lib/response';

// Maximum retry attempts for collision resolution when generating random short codes
// Balances collision handling vs Lambda timeout (probability of 5 collisions: extremely low with 7-char nanoid codes)
const MAX_RETRIES = 5;

let dynamoClient: DynamoDBDocumentClient | null = null;

const getDynamoClient = () => {
  if (!dynamoClient) {
    dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  }
  return dynamoClient;
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const tableName = process.env.TABLE_NAME;
    if (!tableName) {
      console.error(JSON.stringify({
        level: 'error',
        message: 'TABLE_NAME environment variable is not configured',
        timestamp: new Date().toISOString(),
      }));
      return errorResponse('INTERNAL_ERROR', 'Server misconfiguration', 500);
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return errorResponse('INVALID_REQUEST', 'Invalid JSON in request body', 400);
    }

    const { url, customSlug } = body;

    if (!url || typeof url !== 'string') {
      return errorResponse('INVALID_REQUEST', 'URL is required and must be a string', 400);
    }

    const validatedUrl = validateUrl(url);

    if (customSlug !== undefined && typeof customSlug !== 'string') {
      return errorResponse('INVALID_REQUEST', 'customSlug must be a string', 400);
    }

    if (customSlug !== undefined && customSlug !== '') {
      validateSlug(customSlug);
    }

    const domain = event.requestContext.domainName;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const shortCode = (customSlug && customSlug !== '') ? customSlug : generateShortCode();

      try {
        await getDynamoClient().send(new PutCommand({
          TableName: tableName,
          Item: {
            shortCode,
            originalUrl: validatedUrl,
            createdAt: Date.now(),
          },
          ConditionExpression: 'attribute_not_exists(shortCode)',
        }));

        const shortUrl = `https://${domain}/${shortCode}`;

        console.log(JSON.stringify({
          level: 'info',
          message: 'URL shortened successfully',
          timestamp: new Date().toISOString(),
          shortCode,
          originalUrl: validatedUrl.length > 100 ? validatedUrl.substring(0, 100) + '...' : validatedUrl,
        }));

        return successResponse({ shortUrl, shortCode, originalUrl: validatedUrl }, 201);
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'name' in error && error.name === 'ConditionalCheckFailedException') {
          if (customSlug !== undefined && customSlug !== '') {
            return errorResponse('SLUG_TAKEN', 'This custom slug is already in use', 409);
          }
          continue;
        }
        throw error;
      }
    }

    return errorResponse('INTERNAL_ERROR', 'Failed to generate unique code after multiple attempts', 500);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof SlugValidationError) {
      return errorResponse(error.code, error.message, 400);
    }

    console.error(JSON.stringify({
      level: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
    }));

    return errorResponse('INTERNAL_ERROR', 'Something went wrong', 500);
  }
};
