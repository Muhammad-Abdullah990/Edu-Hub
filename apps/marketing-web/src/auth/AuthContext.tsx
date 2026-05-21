import {
  AUTH_COOKIE_NAMES,
  ROLE_NAMES,
  type PlatformRole,
} from "@toppers/auth";
import {
  authLogin,
  authLogout,
  authLogoutAll,
  authRefresh,
  setAuthTokenGetter,
  setCsrfTokenGetter,
  type AuthenticatedUser,
} from "@toppers/api-client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { readCookie } from "@/lib/cookie-utils";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthenticatedUser | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  hasRole: (...roles: PlatformRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const accessTokenRef = useRef<string | null>(null);
  const csrfTokenRef = useRef<string | null>(null);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    csrfTokenRef.current = csrfToken;
  }, [csrfToken]);

  useEffect(() => {
    setAuthTokenGetter(() => accessTokenRef.current);
    setCsrfTokenGetter(() => csrfTokenRef.current ?? readCookie(AUTH_COOKIE_NAMES.CSRF_TOKEN));

    return () => {
      setAuthTokenGetter(null);
      setCsrfTokenGetter(null);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const result = await authRefresh();
        if (cancelled) {
          return;
        }

        setAccessToken(result.accessToken);
        setCsrfToken(result.csrfToken);
        setUser(result.user);
        setStatus("authenticated");
      } catch {
        if (cancelled) {
          return;
        }

        setAccessToken(null);
        setCsrfToken(readCookie(AUTH_COOKIE_NAMES.CSRF_TOKEN));
        setUser(null);
        setStatus("anonymous");
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email: string, password: string) {
    const result = await authLogin({ email, password });
    setAccessToken(result.accessToken);
    setCsrfToken(result.csrfToken);
    setUser(result.user);
    setStatus("authenticated");
  }

  async function logout() {
    try {
      await authLogout();
    } finally {
      setAccessToken(null);
      setCsrfToken(null);
      setUser(null);
      setStatus("anonymous");
    }
  }

  async function logoutAll() {
    try {
      await authLogoutAll();
    } finally {
      setAccessToken(null);
      setCsrfToken(null);
      setUser(null);
      setStatus("anonymous");
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      login,
      logout,
      logoutAll,
      hasRole: (...roles) =>
        Boolean(user?.roles.some((role) => roles.includes(role.name as PlatformRole))),
    }),
    [accessToken, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export const AUTH_PORTAL_ROLES = {
  admin: [ROLE_NAMES.SUPER_ADMIN],
  teacher: [ROLE_NAMES.TEACHER, ROLE_NAMES.SUPER_ADMIN],
  student: [ROLE_NAMES.STUDENT],
} as const;
