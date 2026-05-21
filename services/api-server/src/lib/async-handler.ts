import type { NextFunction, Request, Response } from "express";

export function asyncHandler(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<unknown>,
) {
  return function wrapped(
    request: Request,
    response: Response,
    next: NextFunction,
  ) {
    void handler(request, response, next).catch(next);
  };
}
