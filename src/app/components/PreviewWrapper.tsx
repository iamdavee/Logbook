import { ReactNode, useEffect } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useAuth, Role } from "../context/AuthContext";
import { DashboardLayout } from "./DashboardLayout";

interface Props {
  role?: Role;
  withLayout?: boolean;
  children: ReactNode;
}

export function PreviewWrapper({ role, withLayout = true, children }: Props) {
  const { user, login } = useAuth();

  useEffect(() => {
    if (role && (!user || user.role !== role)) {
      login("preview@siwes.edu", "preview", role);
    }
  }, [role, user, login]);

  if (role && (!user || user.role !== role)) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading preview…</div>;
  }

  return (
    <div className="relative">
      <Link
        to="/preview"
        className="fixed top-4 left-4 z-50 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 text-slate-700"
      >
        <ArrowLeft size={16} /> Previews
      </Link>
      {withLayout ? <DashboardLayout>{children}</DashboardLayout> : children}
    </div>
  );
}
