import { Response } from "express";

export interface ErrorResponse {
  error: string;
  code: string;
  message: string;
}

export const sendError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
) => {
  const errorResponse: ErrorResponse = {
    error: code,
    code,
    message,
  };
  return res.status(statusCode).json(errorResponse);
};

export const logError = (context: string, error: any) => {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : "";
  console.error(`[${timestamp}] ${context}: ${errorMessage}${stack ? "\n" + stack : ""}`);
};
