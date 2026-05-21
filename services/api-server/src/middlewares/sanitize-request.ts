import type { NextFunction, Request, Response } from "express";
import { sanitizeInput } from "../lib/sanitize";

export function sanitizeRequest(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  request.body = sanitizeInput(request.body);
  request.params = sanitizeInput(request.params);
  Object.assign(request.query, sanitizeInput(request.query));
  next();
}
