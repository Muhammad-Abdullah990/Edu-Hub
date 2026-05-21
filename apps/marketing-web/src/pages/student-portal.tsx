import { Button } from "@toppers/ui";
import { useAuth } from "@/auth/AuthContext";

export default function StudentPortalPage() {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-20">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Student Portal
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">
          Welcome, {auth.user?.name}
        </h1>
        <p className="mt-4 text-slate-600">
          This route now requires an authenticated student account and is ready
          for future dashboard modules.
        </p>
        <Button className="mt-8" onClick={() => void auth.logout()}>
          Logout
        </Button>
      </div>
    </div>
  );
}
