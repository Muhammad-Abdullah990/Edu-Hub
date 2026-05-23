import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { ROLE_NAMES } from "@toppers/auth";
import type { AuthenticatedUser } from "@toppers/api-client";
import { Button, Input, PasswordInput } from "@toppers/ui";
import { useAuth } from "@/auth/AuthContext";

function defaultPortalPath(user: AuthenticatedUser): string {
  const roleNames = user.roles.map((role) => role.name);
  if (
    roleNames.includes(ROLE_NAMES.SUPER_ADMIN) ||
    roleNames.includes(ROLE_NAMES.ADMIN)
  ) {
    return "/admin";
  }
  if (roleNames.includes(ROLE_NAMES.TEACHER)) {
    return "/teacher";
  }
  if (roleNames.includes(ROLE_NAMES.STUDENT)) {
    return "/student";
  }
  return "/";
}

export default function LoginPage() {
  const auth = useAuth();
  const [location, navigate] = useLocation();
  const [email, setEmail] = useState("info@topperscoachingcenter.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nextPath = new URLSearchParams(location.split("?", 2)[1] ?? "").get("next") ?? "/";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const user = await auth.login(email, password);
      const destination =
        nextPath !== "/" && !nextPath.startsWith("/login")
          ? nextPath
          : defaultPortalPath(user);
      navigate(destination);
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to sign in with those credentials.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-20">
      <div className="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/60">
        <h1 className="text-3xl font-bold text-slate-900">Toppers Sign In</h1>
        <p className="mt-2 text-slate-600">
          Use your secure role-based account to continue.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <Input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <PasswordInput
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <Button
            className="h-12 w-full text-base"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
