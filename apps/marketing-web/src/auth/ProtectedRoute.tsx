import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import type { PlatformRole } from "@toppers/auth";
import { Button } from "@toppers/ui";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({
  roles,
  children,
}: {
  roles: readonly PlatformRole[];
  children: ReactNode;
}) {
  const auth = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (auth.status === "anonymous") {
      navigate(`/login?next=${encodeURIComponent(location)}`);
    }
  }, [auth.status, location, navigate]);

  if (auth.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Validating your session...
      </div>
    );
  }

  if (auth.status === "anonymous") {
    return null;
  }

  if (!auth.hasRole(...roles)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Access restricted</h1>
          <p className="mt-3 text-slate-600">
            Your account does not have permission to open this portal.
          </p>
          <Button className="mt-6" onClick={() => navigate("/")}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
