import { createBrowserRouter, Navigate } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { StudentDashboard } from "./pages/StudentDashboard";
import { SupervisorDashboard } from "./pages/SupervisorDashboard";
import { SchoolSupervisorDashboard } from "./pages/SchoolSupervisorDashboard";
import { ITFDashboard } from "./pages/ITFDashboard";
import { ReviewsPage } from "./pages/ReviewsPage";
import { StudentsPage } from "./pages/StudentsPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AddLogEntry } from "./pages/AddLogEntry";
import { ViewLogbook } from "./pages/ViewLogbook";
import { SettingsPage } from "./pages/SettingsPage";
import { PreviewIndex } from "./pages/PreviewIndex";
import { PreviewWrapper } from "./components/PreviewWrapper";
import { useAuth } from "./context/AuthContext";
import { ReactNode } from "react";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function DashboardRouter() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === "supervisor") {
    return user.supervisorType === "school" ? <SchoolSupervisorDashboard /> : <SupervisorDashboard />;
  }
  if (user.role === "admin") return <AdminDashboard />;
  if (user.role === "itf_official") return <ITFDashboard />;
  return <StudentDashboard />;
}

export const router = createBrowserRouter([
  { path: "/", element: <PublicRoute><LoginPage /></PublicRoute> },
  { path: "/signup", element: <PublicRoute><SignUpPage /></PublicRoute> },
  { path: "/forgot-password", Component: ForgotPasswordPage },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout><DashboardRouter /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/logbook",
    element: (
      <ProtectedRoute>
        <DashboardLayout><ViewLogbook /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/logbook/new",
    element: (
      <ProtectedRoute>
        <DashboardLayout><AddLogEntry /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/reviews",
    element: (
      <ProtectedRoute>
        <DashboardLayout><ReviewsPage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/students",
    element: (
      <ProtectedRoute>
        <DashboardLayout><StudentsPage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute>
        <DashboardLayout><AdminDashboard /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <DashboardLayout><SettingsPage /></DashboardLayout>
      </ProtectedRoute>
    ),
  },
  { path: "/preview", Component: PreviewIndex },
  { path: "/preview/login", element: <PreviewWrapper withLayout={false}><LoginPage /></PreviewWrapper> },
  { path: "/preview/student", element: <PreviewWrapper role="student"><StudentDashboard /></PreviewWrapper> },
  { path: "/preview/add-entry", element: <PreviewWrapper role="student"><AddLogEntry /></PreviewWrapper> },
  { path: "/preview/logbook", element: <PreviewWrapper role="student"><ViewLogbook /></PreviewWrapper> },
  { path: "/preview/supervisor-industry", element: <PreviewWrapper role="supervisor"><SupervisorDashboard /></PreviewWrapper> },
  { path: "/preview/supervisor-school", element: <PreviewWrapper role="supervisor"><SchoolSupervisorDashboard /></PreviewWrapper> },
  { path: "/preview/admin", element: <PreviewWrapper role="admin"><AdminDashboard /></PreviewWrapper> },
  { path: "/preview/settings", element: <PreviewWrapper role="student"><SettingsPage /></PreviewWrapper> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
