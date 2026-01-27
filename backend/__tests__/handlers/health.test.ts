import { describe, it, expect } from 'vitest';
import type { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { handler } from '../../src/handlers/health';

const mockEvent: Partial<APIGatewayProxyEventV2> = {
  requestContext: {
    accountId: '123456789012',
    apiId: 'api-id',
    domainName: 'localhost',
    domainPrefix: 'localhost',
    http: {
      method: 'GET',
      path: '/api/health',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'test',
    },
    requestId: 'test-request-id',
    routeKey: 'GET /api/health',
    stage: 'dev',
    time: new Date().toISOString(),
    timeEpoch: Date.now(),
  },
  headers: {},
  isBase64Encoded: false,
  rawPath: '/api/health',
  rawQueryString: '',
};

const mockContext: Partial<Context> = {
  awsRequestId: 'test-request-id',
  functionName: 'HealthFunction',
  functionVersion: '$LATEST',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:HealthFunction',
  memoryLimitInMB: '256',
  logGroupName: '/aws/lambda/HealthFunction',
  logStreamName: 'test-stream',
  getRemainingTimeInMillis: () => 10000,
  done: () => {},
  fail: () => {},
  succeed: () => {},
  callbackWaitsForEmptyEventLoop: true,
};

describe('health handler', () => {
  it('should return 200 status code', async () => {
    const result = await handler(
      mockEvent as APIGatewayProxyEventV2,
      mockContext as Context
    );
    
    expect(result).toHaveProperty('statusCode', 200);
  });

  it('should return success response with ok status', async () => {
    const result = await handler(
      mockEvent as APIGatewayProxyEventV2,
      mockContext as Context
    );
    
    const body = JSON.parse(result.body as string);
    expect(body).toEqual({
      success: true,
      data: { status: 'ok' },
    });
  });

  it('should return Content-Type header as application/json', async () => {
    const result = await handler(
      mockEvent as APIGatewayProxyEventV2,
      mockContext as Context
    );
    
    expect(result.headers).toHaveProperty('Content-Type', 'application/json');
  });
});
