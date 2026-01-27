import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { successResponse, errorResponse } from '../lib/response';
import { HealthResponse } from '../types';

export const handler: APIGatewayProxyHandlerV2 = async () => {
  try {
    const data: HealthResponse = { status: 'ok' };
    return successResponse(data);
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }));
    return errorResponse('INTERNAL_ERROR', 'Something went wrong', 500);
  }
};
