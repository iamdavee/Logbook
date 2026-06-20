import { useState } from "react";
import { MessageSquare, X, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { StatusBadge } from "../components/StatusBadge";

const initialReviews = [
  { id: 1, student: "David Adibite-Daniel", date: "2026-03-28", task: "Implemented REST API endpoints for user management", status: "pending" as const },
  { id: 2, student: "Chioma Nwankwo", date: "2026-03-27", task: "Designed responsive UI components for dashboard", status: "pending" as const },
  { id: 3, student: "Fatima Bello", date: "2026-03-28", task: "Database migration and schema optimization", status: "pending" as const },
  { id: 4, student: "David Adibite-Daniel", date: "2026-03-26", task: "Unit testing for payment gateway integration", status: "pending" as const },
  { id: 5, student: "Ibrahim Yusuf", date: "2026-03-25", task: "Setup of router and switch configurations", status: "pending" as const },
];

const allEntries = [
  ...initialReviews,
  { id: 6, student: "Chioma Nwankwo", date: "2026-03-24", task: "Frontend dashboard wireframing", status: "approved" as const },
  { id: 7, student: "Ibrahim Yusuf", date: "2026-03-23", task: "Network topology documentation", status: "approved" as const },
];

export function ReviewsPage() {
  const { user } = useAuth();
  const isITF = user?.role === "itf_official";

  const [reviews, setReviews] = useState(initialReviews);
  const [approvedCount, setApprovedCount] = useState(12);
  const [rejectedCount, setRejectedCount] = useState(3);
  const [reviewModal, setReviewModal] = useState<typeof initialReviews[0] | null>(null);
  const [comment, setComment] = useState("");

  const handleAction = (id: number, action: "approved" | "rejected") => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    if (action === "approved") setApprovedCount((n) => n + 1);
    else setRejectedCount((n) => n + 1);
    setReviewModal(null);
    setComment("");
    toast.success(`Entry ${action} successfully`);
  };

  const handleRemark = () => {
    if (!comment.trim()) return;
    setReviewModal(null);
    setComment("");
    toast.success("Remark submitted successfully");
  };

  const closeModal = () => { setReviewModal(null); setComment(""); };

  // ITF officials see all entries (not just pending) — read-only with remark action
  if (isITF) {
    return (
      <div className="space-y-6">
        <div>
          <h1>Log Entries</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View all logbook entries for your assigned students and submit remarks
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border">
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
                {allEntries.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3">{r.student}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{r.date}</td>
                    <td className="px-6 py-3 max-w-xs truncate">{r.task}</td>
                    <td className="px-6 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => setReviewModal(r)}
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

        {reviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3>Submit Remark</h3>
                <button onClick={closeModal} className="p-1 rounded-lg hover:bg-muted"><X size={18} /></button>
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
                <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
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

  // Supervisors and admin: approve / reject flow
  return (
    <div className="space-y-6">
      <div>
        <h1>Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and approve daily logbook entries from your students</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
            <CheckCircle size={22} />
          </div>
          <div>
            <p className="text-2xl">{approvedCount}</p>
            <p className="text-sm text-muted-foreground">Approved reviews</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-2xl">{reviews.length}</p>
            <p className="text-sm text-muted-foreground">Entries awaiting review</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 text-red-600">
            <XCircle size={22} />
          </div>
          <div>
            <p className="text-2xl">{rejectedCount}</p>
            <p className="text-sm text-muted-foreground">Rejected reviews</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border">
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
                    <button
                      onClick={() => setReviewModal(r)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs hover:bg-primary/90 transition-colors"
                    >
                      <MessageSquare size={13} /> Review
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">No pending reviews</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3>Review Entry</h3>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-muted"><X size={18} /></button>
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
