import { useState } from "react";
import { Users, GraduationCap, UserCheck, BarChart3, Plus, X, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const initialStudents = [
  { id: 1, name: "David Adibite-Daniel", matric: "STU/2023/001", department: "Computer Science", status: "Active" },
  { id: 2, name: "Chioma Nwankwo", matric: "STU/2023/015", department: "Electrical Engineering", status: "Active" },
  { id: 3, name: "Ibrahim Yusuf", matric: "STU/2023/042", department: "Mechanical Engineering", status: "Active" },
  { id: 4, name: "Fatima Bello", matric: "STU/2023/008", department: "Computer Science", status: "Inactive" },
];

const supervisors = [
  { id: 1, name: "Dr. Chukwu Emeka", email: "emeka@university.edu", department: "Computer Science", students: 4 },
  { id: 2, name: "Engr. Amaka Obi", email: "amaka@university.edu", department: "Electrical Engineering", students: 3 },
];

export function AdminDashboard() {
  const [tab, setTab] = useState<"students" | "supervisors">("students");
  const [showAddModal, setShowAddModal] = useState(false);
  const [studentList, setStudentList] = useState(initialStudents);
  const [search, setSearch] = useState("");

  const stats = [
    { label: "Total Students", value: studentList.length, icon: <GraduationCap size={22} />, color: "bg-blue-50 text-blue-600" },
    { label: "Supervisors", value: supervisors.length, icon: <UserCheck size={22} />, color: "bg-purple-50 text-purple-600" },
    { label: "Active Users", value: studentList.filter((s) => s.status === "Active").length + supervisors.length, icon: <Users size={22} />, color: "bg-emerald-50 text-emerald-600" },
    { label: "Total Entries", value: 156, icon: <BarChart3 size={22} />, color: "bg-amber-50 text-amber-600" },
  ];

  const filtered = tab === "students"
    ? studentList.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : supervisors.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1>Admin Dashboard</h1>
        <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 text-sm">
          <Plus size={18} /> Add User
        </button>
      </div>

      {/* Stats */}
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

      {/* Tabs & Table */}
      <div className="bg-white rounded-2xl border border-border">
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex bg-muted rounded-xl p-1 w-fit">
            {(["students", "supervisors"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSearch(""); }}
                className={`px-4 py-1.5 rounded-lg text-sm capitalize transition-all ${tab === t ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {tab === "students" ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-6 py-3">Name</th>
                  <th className="text-left px-6 py-3">Matric No</th>
                  <th className="text-left px-6 py-3">Department</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(filtered as typeof studentList).map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">{s.name.charAt(0)}</div>
                      {s.name}
                    </td>
                    <td className="px-6 py-3">{s.matric}</td>
                    <td className="px-6 py-3">{s.department}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs ${s.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{s.status}</span>
                    </td>
                    <td className="px-6 py-3">
                      <button onClick={() => { setStudentList((p) => p.filter((x) => x.id !== s.id)); toast.success("User removed"); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left px-6 py-3">Name</th>
                  <th className="text-left px-6 py-3">Email</th>
                  <th className="text-left px-6 py-3">Department</th>
                  <th className="text-left px-6 py-3">Students</th>
                </tr>
              </thead>
              <tbody>
                {(filtered as typeof supervisors).map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs">{s.name.charAt(0)}</div>
                      {s.name}
                    </td>
                    <td className="px-6 py-3">{s.email}</td>
                    <td className="px-6 py-3">{s.department}</td>
                    <td className="px-6 py-3">{s.students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Add New User</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-muted"><X size={18} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); toast.success("User added successfully"); }} className="space-y-4">
              <div>
                <label className="block text-sm mb-1.5">Full Name</label>
                <input type="text" placeholder="Enter full name" className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm mb-1.5">Email / Matric No</label>
                <input type="text" placeholder="Enter email or matric number" className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm mb-1.5">Role</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                  <option>Student</option>
                  <option>Supervisor</option>
                  <option>Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1.5">Department</label>
                <input type="text" placeholder="e.g. Computer Science" className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
