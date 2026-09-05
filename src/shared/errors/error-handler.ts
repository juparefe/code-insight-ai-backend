import type { NextFunction, Request, Response } from 'express';
import { AppError } from './app-error.js';
import { ZodError } from 'zod';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code ?? 'APPLICATION_ERROR',
        message: error.message,
      },
    });

    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.issues,
      },
    });
    return;
  }
  console.error(error);

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}