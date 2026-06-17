import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth, Role } from "../context/AuthContext";
import {
  LayoutDashboard, BookOpen, ClipboardCheck, Users, Settings,
  LogOut, Menu, X, Bell, ChevronDown,
} from "lucide-react";
import itfLogo from "../../imports/image.png";

const navItems: Record<Role, { label: string; icon: ReactNode; path: string }[]> = {
  student: [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { label: "Logbook", icon: <BookOpen size={20} />, path: "/logbook" },
    { label: "Add Entry", icon: <ClipboardCheck size={20} />, path: "/logbook/new" },
    { label: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ],
  supervisor: [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { label: "Reviews", icon: <ClipboardCheck size={20} />, path: "/reviews" },
    { label: "Students", icon: <Users size={20} />, path: "/students" },
    { label: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ],
  admin: [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { label: "Users", icon: <Users size={20} />, path: "/users" },
    { label: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ],
};

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Entry approved", body: "Your Week 2 Monday entry was approved.", time: "2h ago", read: false },
    { id: 2, title: "New comment from supervisor", body: "Dr. Chukwu left a comment on your last entry.", time: "5h ago", read: false },
    { id: 3, title: "Reminder", body: "Don't forget to submit this week's entries.", time: "1d ago", read: true },
  ]);
  const unread = notifications.filter((n) => !n.read).length;

  if (!user) return null;

  const items = navItems[user.role];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-200 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <img src={itfLogo} alt="Industrial Training Fund" className="w-10 h-10 object-contain" />
          <div>
            <p className="text-sm text-primary">SIWES</p>
            <p className="text-xs text-muted-foreground">E-Logbook</p>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-accent">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Bell size={20} className="text-muted-foreground" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-border z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <p className="text-sm">Notifications</p>
                      {unread > 0 && (
                        <button
                          onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                          className="text-xs text-primary hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() =>
                              setNotifications((prev) =>
                                prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
                              )
                            }
                            className={`w-full text-left px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${
                              !n.read ? "bg-blue-50/40" : ""
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                              <div className={`flex-1 ${n.read ? "pl-4" : ""}`}>
                                <p className="text-sm">{n.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                                <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:block text-sm">{user.name}</span>
                <ChevronDown size={16} className="text-muted-foreground" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border py-2 z-50">
                  <p className="px-4 py-1 text-xs text-muted-foreground capitalize">{user.role}</p>
                  <p className="px-4 py-1 text-sm">{user.email}</p>
                  <hr className="my-2 border-border" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
