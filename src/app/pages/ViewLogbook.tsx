import { useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { Plus, Pencil, Trash2, ChevronDown, X } from "lucide-react";

type Status = "approved" | "pending" | "rejected";
type Entry = { id: number; week: number; day: string; task: string; status: Status; comment: string };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const WEEKS = Array.from({ length: 12 }, (_, i) => i + 1);

const initialEntries: Entry[] = [
  { id: 1, week: 1, day: "Monday", task: "Orientation and introduction to company structure", status: "approved", comment: "Welcome aboard" },
  { id: 2, week: 1, day: "Tuesday", task: "Setup of development environment and tools", status: "approved", comment: "" },
  { id: 3, week: 1, day: "Wednesday", task: "Reading documentation for internal systems", status: "pending", comment: "" },
  { id: 4, week: 2, day: "Monday", task: "Database design and normalization for inventory module", status: "approved", comment: "Well documented" },
  { id: 5, week: 2, day: "Tuesday", task: "Implemented REST API endpoints for user management", status: "pending", comment: "" },
  { id: 6, week: 3, day: "Wednesday", task: "Frontend UI development for login and dashboard", status: "approved", comment: "Good progress" },
  { id: 7, week: 3, day: "Friday", task: "Network configuration and firewall setup", status: "rejected", comment: "Needs more detail" },
];

let nextId = 100;

export function ViewLogbook() {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [openWeek, setOpenWeek] = useState<number | null>(1);
  const [editor, setEditor] = useState<{ week: number; day: string; entry?: Entry } | null>(null);
  const [draft, setDraft] = useState("");

  const entryFor = (week: number, day: string) =>
    entries.find((e) => e.week === week && e.day === day);

  const weekCount = (week: number) => entries.filter((e) => e.week === week).length;

  const openAdd = (week: number, day: string) => {
    setEditor({ week, day });
    setDraft("");
  };

  const openEdit = (entry: Entry) => {
    setEditor({ week: entry.week, day: entry.day, entry });
    setDraft(entry.task);
  };

  const handleDelete = (id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSave = () => {
    if (!editor || !draft.trim()) return;
    if (editor.entry) {
      setEntries((prev) =>
        prev.map((e) => (e.id === editor.entry!.id ? { ...e, task: draft.trim() } : e))
      );
    } else {
      setEntries((prev) => [
        ...prev,
        { id: nextId++, week: editor.week, day: editor.day, task: draft.trim(), status: "pending", comment: "" },
      ]);
    }
    setEditor(null);
    setDraft("");
  };

  return (
    <div className="space-y-6">
      <h1>Logbook Entries</h1>

      <div className="space-y-3">
        {WEEKS.map((week) => {
          const isOpen = openWeek === week;
          const count = weekCount(week);
          return (
            <div key={week} className="bg-white rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => setOpenWeek(isOpen ? null : week)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors"
              >
                <div className="text-left">
                  <div className="text-sm">Week {week}</div>
                  <div className="text-xs text-muted-foreground">
                    {count} {count === 1 ? "entry" : "entries"} of 5
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-border divide-y divide-border">
                  {DAYS.map((day) => {
                    const entry = entryFor(week, day);
                    return (
                      <div key={day} className="px-6 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                        <div className="w-24 text-sm text-muted-foreground shrink-0">{day}</div>
                        <div className="flex-1 min-w-0">
                          {entry ? (
                            <div className="flex items-center gap-3">
                              <span className="text-sm truncate">{entry.task}</span>
                              <StatusBadge status={entry.status} />
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">No entry</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {entry ? (
                            <>
                              <button
                                onClick={() => openEdit(entry)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                title="Edit entry"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                title="Delete entry"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => openAdd(week, day)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-xs"
                            >
                              <Plus size={14} /> Add Entry
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editor && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEditor(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base">{editor.entry ? "Edit Entry" : "Add Entry"}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Week {editor.week} · {editor.day}
                </p>
              </div>
              <button
                onClick={() => setEditor(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X size={18} />
              </button>
            </div>
            <label className="block text-sm mb-1.5">Task Performed</label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              placeholder="Describe the task you completed..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
            />
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setEditor(null)}
                className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!draft.trim()}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {editor.entry ? "Save Changes" : "Add Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
