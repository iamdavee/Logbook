import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth, Role } from "../context/AuthContext";
import { Eye, EyeOff, ChevronDown, Check } from "lucide-react";
import itfLogo from "../../imports/image.png";
import itfBuilding from "../../imports/image-1.png";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [supervisorType, setSupervisorType] = useState("");
  const [supTypeOpen, setSupTypeOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supervisorTypes = ["Industry Based Supervisor", "School Based Supervisor"];
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (role === "supervisor" && !supervisorType) {
      setError("Please select your supervisor type.");
      return;
    }

    const supType =
      role === "supervisor"
        ? supervisorType === "School Based Supervisor"
          ? "school"
          : "industry"
        : undefined;

    setLoading(true);
    try {
      await login(email.trim(), password, role, supType);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: Role; label: string }[] = [
    { value: "student", label: "Student" },
    { value: "supervisor", label: "Supervisor" },
  ];

  const roleColors: Record<Role, { active: string; button: string; shadow: string }> = {
    student: { active: "bg-blue-600", button: "bg-blue-600 hover:bg-blue-700", shadow: "shadow-blue-600/20" },
    supervisor: { active: "bg-red-600", button: "bg-red-600 hover:bg-red-700", shadow: "shadow-red-600/20" },
    admin: { active: "bg-purple-600", button: "bg-purple-600 hover:bg-purple-700", shadow: "shadow-purple-600/20" },
  };
  const c = roleColors[role];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${itfBuilding})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-black/50 to-indigo-900/70" />
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={itfLogo} alt="Industrial Training Fund" className="w-20 h-20 object-contain mx-auto mb-4" />
          <h1 className="text-2xl text-white">SIWES E-Logbook</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-border p-8">
          <h2 className="text-center text-xl mb-6">Welcome Back!</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role Selector */}
            <div className="flex bg-muted rounded-xl p-1">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => { setRole(r.value); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                    role === r.value
                      ? `${c.active} text-white shadow-sm`
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm mb-1.5">
                Email Address
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {role === "supervisor" && (
              <div>
                <label className="block text-sm mb-1.5">Supervisor Type</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSupTypeOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm hover:border-primary/40 transition-colors"
                  >
                    <span className={supervisorType ? "" : "text-muted-foreground"}>
                      {supervisorType || "Select supervisor type"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-muted-foreground transition-transform ${supTypeOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {supTypeOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setSupTypeOpen(false)} />
                      <div className="absolute z-40 mt-2 w-full bg-white rounded-xl shadow-lg border border-border overflow-hidden">
                        {supervisorTypes.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setSupervisorType(t);
                              setSupTypeOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted text-left"
                          >
                            <span>{t}</span>
                            {supervisorType === t && <Check size={14} className="text-primary" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded appearance-none bg-white border border-border checked:bg-primary checked:border-primary relative checked:after:content-['✓'] checked:after:text-white checked:after:text-xs checked:after:absolute checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center cursor-pointer"
                />
                <span className="text-muted-foreground text-sm">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline text-sm">Forgot password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl ${c.button} text-white transition-colors shadow-lg ${c.shadow} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
