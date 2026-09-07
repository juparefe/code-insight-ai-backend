import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { errorHandler } from './error-handler.js';
import { AppError } from './app-error.js';

function buildResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as Response['status'];
  res.json = jest.fn().mockReturnValue(res) as unknown as Response['json'];
  return res;
}

const req = {} as Request;
const next: NextFunction = jest.fn();

describe('errorHandler', () => {
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('GIVEN an AppError WHEN the handler runs THEN it responds with the error status code and code', () => {
    const res = buildResponse();

    errorHandler(new AppError(404, 'Missing', 'NOT_FOUND'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'Missing' },
    });
  });

  it('GIVEN an AppError without a code WHEN the handler runs THEN it responds with code APPLICATION_ERROR', () => {
    const res = buildResponse();

    errorHandler(new AppError(400, 'Bad'), req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'APPLICATION_ERROR', message: 'Bad' },
    });
  });

  it('GIVEN a ZodError WHEN the handler runs THEN it responds with 400 VALIDATION_ERROR and the issue details', () => {
    const res = buildResponse();
    const parsed = z.object({ url: z.string() }).safeParse({ url: 123 });
    const zodError = (parsed as { error: z.ZodError }).error;

    errorHandler(zodError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: zodError.issues,
      },
    });
  });

  it('GIVEN an unknown error WHEN the handler runs THEN it responds with 500 INTERNAL_SERVER_ERROR', () => {
    const res = buildResponse();

    errorHandler(new Error('boom'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  });

  it('GIVEN any error WHEN the handler runs THEN it does not call next()', () => {
    const res = buildResponse();

    errorHandler(new Error('boom'), req, res, next);

    expect(next).not.toHaveBeenCalled();
  });
});
