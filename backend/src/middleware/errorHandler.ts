import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

// 404 handler for unmatched routes.
export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
};

// Central error handler to ensure consistent JSON error responses.
// It also unwraps Zod validation errors into a structured format.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "ValidationError",
      details: err.flatten(),
    });
  }

  if (err instanceof Error) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({
      error: "InternalServerError",
      message: err.message,
    });
  }

  return res.status(500).json({
    error: "UnknownError",
  });
};
