import { useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { Users, Clock, CheckCircle, Bell, X, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const students = [
  { id: 1, name: "David Adibite-Daniel", matric: "STU/2023/001", company: "Tech Solutions Ltd", pending: 3 },
  { id: 2, name: "Chioma Nwankwo", matric: "STU/2023/015", company: "DataVault Inc", pending: 1 },
  { id: 3, name: "Ibrahim Yusuf", matric: "STU/2023/042", company: "NetBridge Systems", pending: 0 },
  { id: 4, name: "Fatima Bello", matric: "STU/2023/008", company: "CloudPeak Africa", pending: 2 },
];

const pendingReviews = [
  { id: 1, student: "David Adibite-Daniel", date: "2026-03-28", task: "Implemented REST API endpoints for user management", status: "pending" as const },
  { id: 2, student: "Chioma Nwankwo", date: "2026-03-27", task: "Designed responsive UI components for dashboard", status: "pending" as const },
  { id: 3, student: "Fatima Bello", date: "2026-03-28", task: "Database migration and schema optimization", status: "pending" as const },
  { id: 4, student: "David Adibite-Daniel", date: "2026-03-26", task: "Unit testing for payment gateway integration", status: "pending" as const },
];

const notifications = [
  { id: 1, text: "David submitted a new log entry", time: "2 hours ago" },
  { id: 2, text: "Chioma submitted a new log entry", time: "5 hours ago" },
  { id: 3, text: "Fatima submitted 2 new log entries", time: "1 day ago" },
];

export function SupervisorDashboard() {
  const [reviewModal, setReviewModal] = useState<typeof pendingReviews[0] | null>(null);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState(pendingReviews);

  const handleAction = (id: number, action: "approved" | "rejected") => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setReviewModal(null);
    setComment("");
    toast.success(`Entry ${action} successfully`);
  };

  const stats = [
    { label: "Total Students", value: students.length, icon: <Users size={22} />, color: "bg-blue-50 text-blue-600" },
    { label: "Pending Reviews", value: reviews.length, icon: <Clock size={22} />, color: "bg-amber-50 text-amber-600" },
    { label: "Approved This Week", value: 12, icon: <CheckCircle size={22} />, color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>Industry Supervisor Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and approve daily logbook entries from your students</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border">
          <div className="px-6 py-4 border-b border-border"><h3>My Students</h3></div>
          <div className="divide-y divide-border">
            {students.map((s) => (
              <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">{s.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.matric} &middot; {s.company}</p>
                  </div>
                </div>
                {s.pending > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">{s.pending} pending</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Bell size={18} className="text-muted-foreground" />
            <h3>Notifications</h3>
          </div>
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <div key={n.id} className="px-6 py-4">
                <p className="text-sm">{n.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Reviews */}
      <div className="bg-white rounded-2xl border border-border">
        <div className="px-6 py-4 border-b border-border"><h3>Pending Reviews</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-6 py-3">Student</th>
                <th className="text-left px-6 py-3">Date</th>
                <th className="text-left px-6 py-3">Task</th>
                <th className="text-left px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-3">{r.student}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{r.date}</td>
                  <td className="px-6 py-3 max-w-xs truncate">{r.task}</td>
                  <td className="px-6 py-3">
                    <button onClick={() => setReviewModal(r)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs hover:bg-primary/90 transition-colors">
                      <MessageSquare size={13} /> Review
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No pending reviews</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Review Entry</h3>
              <button onClick={() => { setReviewModal(null); setComment(""); }} className="p-1 rounded-lg hover:bg-muted"><X size={18} /></button>
            </div>
            <div className="space-y-3 mb-5">
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground w-20">Student:</span>
                <span>{reviewModal.student}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground w-20">Date:</span>
                <span>{reviewModal.date}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Task:</span>
                <p className="mt-1 p-3 bg-muted rounded-xl">{reviewModal.task}</p>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm mb-1.5">Comment</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your feedback..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleAction(reviewModal.id, "rejected")} className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors">
                Reject
              </button>
              <button onClick={() => handleAction(reviewModal.id, "approved")} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-colors shadow-md">
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
