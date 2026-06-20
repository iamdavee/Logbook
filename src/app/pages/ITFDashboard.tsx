import { useState } from "react";
import { Users, BookOpen, MessageSquare, X } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { toast } from "sonner";

const students = [
  { id: 1, name: "David Adibite-Daniel", matric: "STU/2023/001", company: "Tech Solutions Ltd", entries: 24 },
  { id: 2, name: "Chioma Nwankwo", matric: "STU/2023/015", company: "DataVault Inc", entries: 23 },
  { id: 3, name: "Ibrahim Yusuf", matric: "STU/2023/042", company: "NetBridge Systems", entries: 15 },
  { id: 4, name: "Fatima Bello", matric: "STU/2023/008", company: "CloudPeak Africa", entries: 22 },
];

const recentEntries = [
  { id: 1, student: "David Adibite-Daniel", date: "2026-03-28", task: "Implemented REST API endpoints for user management", status: "approved" as const },
  { id: 2, student: "Chioma Nwankwo", date: "2026-03-27", task: "Designed responsive UI components for dashboard", status: "approved" as const },
  { id: 3, student: "Fatima Bello", date: "2026-03-28", task: "Database migration and schema optimization", status: "pending" as const },
  { id: 4, student: "Ibrahim Yusuf", date: "2026-03-26", task: "Setup of router and switch configurations", status: "approved" as const },
  { id: 5, student: "David Adibite-Daniel", date: "2026-03-25", task: "Unit testing for payment gateway integration", status: "rejected" as const },
];

export function ITFDashboard() {
  const [remarkModal, setRemarkModal] = useState<typeof recentEntries[0] | null>(null);
  const [comment, setComment] = useState("");

  const handleRemark = () => {
    if (!comment.trim()) return;
    setRemarkModal(null);
    setComment("");
    toast.success("Remark submitted successfully");
  };

  const stats = [
    { label: "Total Students", value: students.length, icon: <Users size={22} />, color: "bg-blue-50 text-blue-600" },
    { label: "Total Entries", value: 84, icon: <BookOpen size={22} />, color: "bg-indigo-50 text-indigo-600" },
    { label: "Notes This Week", value: 3, icon: <MessageSquare size={22} />, color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1>ITF Official Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor student industrial training progress and submit remarks
        </p>
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
        {/* Assigned Students */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border">
          <div className="px-6 py-4 border-b border-border"><h3>Assigned Students</h3></div>
          <div className="divide-y divide-border">
            {students.map((s) => (
              <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.matric} · {s.company}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
                  {s.entries} entries
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-white rounded-2xl border border-border">
          <div className="px-6 py-4 border-b border-border"><h3>Your Access</h3></div>
          <div className="p-6 space-y-4 text-sm text-muted-foreground">
            <p>You have <strong className="text-foreground">read-only</strong> access to all log entries for your assigned students.</p>
            <p>You can add remarks on any entry. Remarks are recorded as <em className="text-foreground">noted</em> and do not affect entry approval status.</p>
            <p>Use the <strong className="text-foreground">Students</strong> tab to browse all assigned students and their full logbooks.</p>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-2xl border border-border">
        <div className="px-6 py-4 border-b border-border"><h3>Recent Entries</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-6 py-3">Student</th>
                <th className="text-left px-6 py-3">Date</th>
                <th className="text-left px-6 py-3">Task</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentEntries.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-3">{r.student}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{r.date}</td>
                  <td className="px-6 py-3 max-w-xs truncate">{r.task}</td>
                  <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => setRemarkModal(r)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors"
                    >
                      <MessageSquare size={13} /> Add Remark
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Remark Modal */}
      {remarkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setRemarkModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3>Submit Remark</h3>
              <button
                onClick={() => { setRemarkModal(null); setComment(""); }}
                className="p-1 rounded-lg hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 mb-5">
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground w-20">Student:</span>
                <span>{remarkModal.student}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground w-20">Date:</span>
                <span>{remarkModal.date}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Task:</span>
                <p className="mt-1 p-3 bg-muted rounded-xl">{remarkModal.task}</p>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm mb-1.5">Remark</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your observation or feedback..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setRemarkModal(null); setComment(""); }}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemark}
                disabled={!comment.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Remark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
