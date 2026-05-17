import { Response } from 'express';
import { ApiResponse } from '../types';

export function sendSuccess<T>(
  res: Response, data: T, message = 'Success', statusCode = 200,
  pagination?: ApiResponse['pagination']
): Response {
  const response: ApiResponse<T> = { success: true, message, data };
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
}

export function sendError(res: Response, error: string, statusCode = 400): Response {
  return res.status(statusCode).json({ success: false, error } as ApiResponse);
}
