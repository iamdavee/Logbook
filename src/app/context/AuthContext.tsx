import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Role = "student" | "supervisor" | "admin" | "itf_official";
export type SupervisorType = "industry" | "school";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  supervisorType?: SupervisorType;
  avatar?: string;
  matric_number?: string;
  department?: string;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role: Role, supervisorType?: SupervisorType) => Promise<void>;
  logout: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost/logbook-api";

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function backendRoleToFrontend(backendRole: string): { role: Role; supervisorType?: SupervisorType } {
  if (backendRole === "industry_supervisor") return { role: "supervisor", supervisorType: "industry" };
  if (backendRole === "school_coordinator")  return { role: "supervisor", supervisorType: "school" };
  if (backendRole === "admin")               return { role: "admin" };
  if (backendRole === "itf_official")        return { role: "itf_official" };
  return { role: "student" };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    if (saved && savedUser) {
      try {
        setToken(saved);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, _role: Role, supervisorType?: SupervisorType) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    const { token: jwt, user: apiUser } = data;
    const { role, supervisorType: detectedSupType } = backendRoleToFrontend(apiUser.role);

    const mappedUser: User = {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      role,
      supervisorType: supervisorType ?? detectedSupType,
      avatar: apiUser.avatar,
      matric_number: apiUser.matric_number,
      department: apiUser.department,
      company: apiUser.company,
    };

    localStorage.setItem("auth_token", jwt);
    localStorage.setItem("auth_user", JSON.stringify(mappedUser));
    setToken(jwt);
    setUser(mappedUser);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
