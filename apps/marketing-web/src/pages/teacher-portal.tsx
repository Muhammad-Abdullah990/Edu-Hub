import { Button } from "@toppers/ui";
import { useAuth } from "@/auth/AuthContext";

export default function TeacherPortalPage() {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-20">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Teacher Portal
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">
          Welcome, {auth.user?.name}
        </h1>
        <p className="mt-4 text-slate-600">
          This protected teacher route is ready for attendance and performance
          modules to plug into the RBAC foundation.
        </p>
        <Button className="mt-8" onClick={() => void auth.logout()}>
          Logout
        </Button>
      </div>
    </div>
  );
}
