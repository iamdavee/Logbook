import { useState } from "react";
import { Search, Mail, Building2 } from "lucide-react";

const students = [
  { id: 1, name: "David Adibite-Daniel", matric: "STU/2023/001", department: "Computer Science", company: "Tech Solutions Ltd", email: "davidadibitedaniel@gmail.com", pending: 3, approved: 18 },
  { id: 2, name: "Chioma Nwankwo", matric: "STU/2023/015", department: "Computer Science", company: "DataVault Inc", email: "chioma.n@university.edu.ng", pending: 1, approved: 22 },
  { id: 3, name: "Ibrahim Yusuf", matric: "STU/2023/042", department: "Electrical Eng.", company: "NetBridge Systems", email: "ibrahim.y@university.edu.ng", pending: 0, approved: 15 },
  { id: 4, name: "Fatima Bello", matric: "STU/2023/008", department: "Computer Science", company: "CloudPeak Africa", email: "fatima.b@university.edu.ng", pending: 2, approved: 20 },
  { id: 5, name: "Emeka Obi", matric: "STU/2023/031", department: "Mechanical Eng.", company: "Apex Manufacturing", email: "emeka.o@university.edu.ng", pending: 4, approved: 9 },
];

export function StudentsPage() {
  const [search, setSearch] = useState("");
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.matric.toLowerCase().includes(search.toLowerCase()) ||
      s.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1>My Students</h1>
        <p className="text-sm text-muted-foreground mt-1">All students assigned to you for Industrial Training Supervision</p>
      </div>

      <div className="bg-white rounded-2xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, matric or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((s) => (
            <div key={s.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.matric} · {s.department}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Building2 size={12} /> {s.company}</span>
                    <span className="inline-flex items-center gap-1"><Mail size={12} /> {s.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {s.pending > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs">
                    {s.pending} pending
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs">
                  {s.approved} approved
                </span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-6 py-10 text-center text-muted-foreground text-sm">No students found</p>
          )}
        </div>
      </div>
    </div>
  );
}
