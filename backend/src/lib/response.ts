import { APIGatewayProxyResultV2 } from 'aws-lambda';

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

export const successResponse = <T>(data: T, statusCode = 200): APIGatewayProxyResultV2 => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      success: true,
      data,
    } as ApiSuccessResponse<T>),
  };
};

export const errorResponse = (
  code: string,
  message: string,
  statusCode = 400
): APIGatewayProxyResultV2 => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      success: false,
      error: {
        code,
        message,
      },
    } as ApiErrorResponse),
  };
};
