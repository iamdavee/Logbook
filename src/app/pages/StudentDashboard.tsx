import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { StatusBadge } from "../components/StatusBadge";
import { BookOpen, CheckCircle, Clock, Plus, CalendarCheck, CalendarClock } from "lucide-react";

const recentEntries = [
  { id: 1, date: "2026-03-28", task: "Database design and normalization for inventory module", status: "approved" as const, comment: "Well documented" },
  { id: 2, date: "2026-03-27", task: "Implemented REST API endpoints for user management", status: "pending" as const, comment: "" },
  { id: 3, date: "2026-03-26", task: "Frontend UI development for login and dashboard pages", status: "approved" as const, comment: "Good progress" },
  { id: 4, date: "2026-03-25", task: "Network configuration and firewall setup", status: "rejected" as const, comment: "Needs more detail" },
  { id: 5, date: "2026-03-24", task: "Meeting with project manager for sprint planning", status: "approved" as const, comment: "Approved" },
];

const stats = [
  { label: "Days Completed", value: 36, icon: <CalendarCheck size={22} />, color: "bg-indigo-50 text-indigo-600" },
  { label: "Days Remaining", value: 24, icon: <CalendarClock size={22} />, color: "bg-rose-50 text-rose-600" },
  { label: "Total Entries", value: 24, icon: <BookOpen size={22} />, color: "bg-blue-50 text-blue-600" },
  { label: "Pending Reviews", value: 5, icon: <Clock size={22} />, color: "bg-amber-50 text-amber-600" },
  { label: "Approved Logs", value: 18, icon: <CheckCircle size={22} />, color: "bg-emerald-50 text-emerald-600" },
];

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1>Welcome back, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground text-sm mt-1">Pick up from where you left off.</p>
        </div>
        <button
          onClick={() => navigate("/logbook/new")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
        >
          <Plus size={22} />
          Add New Log
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-2xl">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-2xl border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3>Recent Log Entries</h3>
          <button onClick={() => navigate("/logbook")} className="text-sm text-primary hover:underline">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-6 py-3">Date</th>
                <th className="text-left px-6 py-3">Task Performed</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Comment</th>
              </tr>
            </thead>
            <tbody>
              {recentEntries.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap">{e.date}</td>
                  <td className="px-6 py-3 max-w-xs truncate">{e.task}</td>
                  <td className="px-6 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-6 py-3 text-muted-foreground">{e.comment || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
