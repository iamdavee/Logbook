import { useState } from "react";
import { useNavigate } from "react-router";
import { Upload, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

export function AddLogEntry() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Log entry submitted successfully!");
    setTimeout(() => navigate("/logbook"), 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-2xl border border-border p-6 lg:p-8">
        <h2 className="mb-6">New Logbook Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm mb-1.5">Date</label>
              <input type="date" defaultValue="2026-04-01" className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm mb-1.5">Company / Organization</label>
              <input type="text" placeholder="e.g. Tech Solutions Ltd" className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1.5">Task Performed</label>
            <textarea rows={4} placeholder="Describe the tasks you performed today..." className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" />
          </div>

          <div>
            <label className="block text-sm mb-1.5">Skills Learned</label>
            <textarea rows={3} placeholder="What new skills did you acquire?" className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" />
          </div>

          <div>
            <label className="block text-sm mb-1.5">Attachment (optional)</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
              <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 5MB</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitted} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {submitted ? <><Check size={16} /> Submitted</> : "Submit Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
