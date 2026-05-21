import type { AuthenticatedPrincipal } from "@toppers/auth";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthenticatedPrincipal;
    }
  }
}

export {};
