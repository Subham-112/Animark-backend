import { logger } from "../config/logger";
import { config as manualConfig } from "../config/config";
import { Request, Response, NextFunction } from "express";

/**
 * Parse MongoDB duplicate key error to extract field name and value
 */
const parseDuplicateKeyError = (
  err: any,
): { field: string; value: string } | null => {
  if (err.code !== 11000 && err.name !== "MongoServerError") {
    return null;
  }

  // Extract field name from keyPattern or keyValue
  if (err.keyPattern) {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue?.[field] || "unknown";
    return { field, value };
  }

  // Fallback: parse from error message
  const match = err.message?.match(
    /index: (\w+)_\d+ dup key: \{ (\w+): "(.+)" \}/,
  );
  if (match) {
    return { field: match[2], value: match[3] };
  }

  return null;
};

/**
 * Get user-friendly message for duplicate key errors
 */
const getDuplicateKeyMessage = (field: string, value: string): string => {
  const fieldMessages: Record<string, string> = {
    email: `An account with the email "${value}" already exists. Please login or use a different email.`,
    phone: `An account with the phone number "${value}" already exists. Please login or use a different phone number.`,
    fcmToken: "This device is already registered with another account.",
  };

  return (
    fieldMessages[field] ||
    `A record with this ${field} already exists. Please use a different value.`
  );
};

/**
 * Handle Mongoose validation errors
 */
const parseValidationError = (err: any): string | null => {
  if (err.name !== "ValidationError" || !err.errors) {
    return null;
  }

  const messages = Object.values(err.errors).map((e: any) => e.message);
  return messages.join(". ");
};

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // If headers already sent, delegate to Express default error handler
  if (res.headersSent) {
    next(err);
    return;
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  // Handle MongoDB duplicate key error (E11000)
  if (err.code === 11000 || err.name === "MongoServerError") {
    const duplicateInfo = parseDuplicateKeyError(err);
    if (duplicateInfo) {
      statusCode = 409;
      message = getDuplicateKeyMessage(
        duplicateInfo.field,
        duplicateInfo.value,
      );
    }
  }

  // Handle Mongoose validation errors
  const validationMessage = parseValidationError(err);
  if (validationMessage) {
    statusCode = 400;
    message = validationMessage;
  }

  // Handle CastError (invalid ObjectId, etc.)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Log detailed error info with request path and method
  logger.error(
    `[${new Date().toISOString()}] Error on ${req.method} ${
      req.originalUrl
    } - Status: ${statusCode} - Message: ${message}`,
    { stack: err.stack },
  );

  res.status(statusCode).json({
    success: false,
    message,
    // Include stack trace only in development for debugging
    ...(manualConfig.env === "development" && { stack: err.stack }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};
