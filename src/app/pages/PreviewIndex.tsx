import { Link } from "react-router";
import { LayoutDashboard, FileText, PlusCircle, BookOpen, Users, UserCog, Settings, LogIn } from "lucide-react";

const pages = [
  { path: "/preview/login", title: "Login Page", desc: "Role-based authentication screen", icon: LogIn, role: null },
  { path: "/preview/student", title: "Student Dashboard", desc: "Summary cards & recent log entries", icon: LayoutDashboard, role: "student" },
  { path: "/preview/add-entry", title: "Add Log Entry", desc: "Form for new logbook entry", icon: PlusCircle, role: "student" },
  { path: "/preview/logbook", title: "View Logbook", desc: "Searchable table of entries", icon: BookOpen, role: "student" },
  { path: "/preview/supervisor-industry", title: "Industry Supervisor Dashboard", desc: "Review & approve student log entries", icon: Users, role: "supervisor" },
  { path: "/preview/supervisor-school", title: "School Supervisor Dashboard", desc: "Visits, assessments & student tracking", icon: Users, role: "supervisor" },
  { path: "/preview/admin", title: "Admin Dashboard", desc: "User management interface", icon: UserCog, role: "admin" },
  { path: "/preview/settings", title: "Settings", desc: "Profile & preferences", icon: Settings, role: "student" },
];

export function PreviewIndex() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">SIWES E-Logbook — Page Previews</h1>
          <p className="text-slate-600">Browse each individual screen in isolation.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pages.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.path}
                to={p.path}
                className="group bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition">
                    <Icon size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="text-slate-900 mb-1">{p.title}</div>
                    <div className="text-slate-500">{p.desc}</div>
                    {p.role && (
                      <div className="mt-2 inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                        {p.role}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
