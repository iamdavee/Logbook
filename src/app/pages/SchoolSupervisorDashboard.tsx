import { useState } from "react";
import { Users, GraduationCap, CalendarCheck, ClipboardList, MapPin, X } from "lucide-react";
import { toast } from "sonner";

const students = [
  { id: 1, name: "David Adibite-Daniel", matric: "STU/2023/001", department: "Computer Science", company: "Tech Solutions Ltd", lastVisit: "2026-02-14" },
  { id: 2, name: "Chioma Nwankwo", matric: "STU/2023/015", department: "Computer Science", company: "DataVault Inc", lastVisit: "2026-02-21" },
  { id: 3, name: "Ibrahim Yusuf", matric: "STU/2023/042", department: "Electrical Eng.", company: "NetBridge Systems", lastVisit: "—" },
  { id: 4, name: "Fatima Bello", matric: "STU/2023/008", department: "Computer Science", company: "CloudPeak Africa", lastVisit: "2026-03-02" },
];

const visits = [
  { id: 1, student: "David Adibite-Daniel", date: "2026-04-05", company: "Tech Solutions Ltd, Lagos", status: "Scheduled" },
  { id: 2, student: "Ibrahim Yusuf", date: "2026-04-08", company: "NetBridge Systems, Abuja", status: "Scheduled" },
  { id: 3, student: "Fatima Bello", date: "2026-04-12", company: "CloudPeak Africa, Lagos", status: "Pending" },
];

export function SchoolSupervisorDashboard() {
  const [assessModal, setAssessModal] = useState<(typeof students)[0] | null>(null);
  const [score, setScore] = useState("");
  const [remark, setRemark] = useState("");

  const stats = [
    { label: "Supervised Students", value: students.length, icon: <Users size={22} />, color: "bg-blue-50 text-blue-600" },
    { label: "Scheduled Visits", value: visits.length, icon: <CalendarCheck size={22} />, color: "bg-indigo-50 text-indigo-600" },
    { label: "Assessments Completed", value: 8, icon: <ClipboardList size={22} />, color: "bg-emerald-50 text-emerald-600" },
    { label: "Departments", value: 2, icon: <GraduationCap size={22} />, color: "bg-amber-50 text-amber-600" },
  ];

  const handleSubmit = () => {
    if (!score) return;
    toast.success(`Assessment recorded for ${assessModal?.name}`);
    setAssessModal(null);
    setScore("");
    setRemark("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>School Supervisor Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Track student placements, schedule visits, and record assessments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border">
          <div className="px-6 py-4 border-b border-border"><h3>Assigned Students</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-6 py-3">Student</th>
                  <th className="text-left px-6 py-3">Department</th>
                  <th className="text-left px-6 py-3">Placement</th>
                  <th className="text-left px-6 py-3">Last Visit</th>
                  <th className="text-left px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">{s.name.charAt(0)}</div>
                        <div>
                          <p>{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.matric}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{s.department}</td>
                    <td className="px-6 py-3">{s.company}</td>
                    <td className="px-6 py-3 text-muted-foreground">{s.lastVisit}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => setAssessModal(s)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs hover:bg-primary/90 transition-colors"
                      >
                        <ClipboardList size={13} /> Assess
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <CalendarCheck size={18} className="text-muted-foreground" />
            <h3>Upcoming Visits</h3>
          </div>
          <div className="divide-y divide-border">
            {visits.map((v) => (
              <div key={v.id} className="px-6 py-4">
                <p className="text-sm">{v.student}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin size={12} /> {v.company}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{v.date}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    v.status === "Scheduled" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>{v.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {assessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setAssessModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3>Record Assessment</h3>
              <button onClick={() => setAssessModal(null)} className="p-1 rounded-lg hover:bg-muted"><X size={18} /></button>
            </div>
            <div className="space-y-3 mb-5">
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground w-20">Student:</span>
                <span>{assessModal.name}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground w-20">Department:</span>
                <span>{assessModal.department}</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1.5">Score (0 – 100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <div className="mb-5">
              <label className="block text-sm mb-1.5">Remark</label>
              <textarea
                rows={3}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Comments on the student's performance..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!score}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Submit Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
