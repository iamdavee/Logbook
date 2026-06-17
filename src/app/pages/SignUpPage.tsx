import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth, Role } from "../context/AuthContext";
import { Eye, EyeOff, Search, ChevronDown, Check } from "lucide-react";
import itfLogo from "../../imports/image.png";
import itfBuilding from "../../imports/image-1.png";

export function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [school, setSchool] = useState("");
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [supervisorType, setSupervisorType] = useState("");
  const [supTypeOpen, setSupTypeOpen] = useState(false);
  const supervisorTypes = ["Industry Based Supervisor", "School Based Supervisor"];
  const [error, setError] = useState("");

  const universities = [
    "University of Lagos",
    "University of Ibadan",
    "University of Nigeria, Nsukka",
    "Obafemi Awolowo University",
    "Ahmadu Bello University",
    "University of Benin",
    "Covenant University",
    "Babcock University",
    "Federal University of Technology, Akure",
    "Federal University of Technology, Minna",
    "Federal University of Technology, Owerri",
    "Lagos State University",
    "Bowen University",
    "Landmark University",
    "Pan-Atlantic University",
    "Afe Babalola University",
    "University of Port Harcourt",
    "University of Ilorin",
    "Bayero University, Kano",
    "Nnamdi Azikiwe University",
  ];
  const filteredSchools = universities.filter((u) =>
    u.toLowerCase().includes(schoolSearch.toLowerCase())
  );
  const { login } = useAuth();
  const navigate = useNavigate();

  const roles: { value: Role; label: string }[] = [
    { value: "student", label: "Student" },
    { value: "supervisor", label: "Supervisor" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (role === "student" && !school) {
      setError("Please select your school.");
      return;
    }
    if (role === "supervisor" && !supervisorType) {
      setError("Please select your supervisor type.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const supType =
      role === "supervisor"
        ? supervisorType === "School Based Supervisor"
          ? "school"
          : "industry"
        : undefined;
    login(email, password, role, supType);
    navigate("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${itfBuilding})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-black/50 to-indigo-900/70" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <img src={itfLogo} alt="Industrial Training Fund" className="w-20 h-20 object-contain mx-auto mb-4" />
          <h1 className="text-2xl text-white">SIWES E-Logbook</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-border p-8">
          <h2 className="text-center text-xl mb-6">Create an Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5">Role</label>
              <div className="flex bg-muted rounded-xl p-1">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                      role === r.value
                        ? `${r.value === "supervisor" ? "bg-red-600" : "bg-primary"} text-white shadow-sm`
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            {role === "student" && (
              <div>
                <label className="block text-sm mb-1.5">School</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSchoolOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm hover:border-primary/40 transition-colors"
                  >
                    <span className={school ? "" : "text-muted-foreground"}>
                      {school || "Select your university"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-muted-foreground transition-transform ${schoolOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {schoolOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setSchoolOpen(false)} />
                      <div className="absolute z-40 mt-2 w-full bg-white rounded-xl shadow-lg border border-border overflow-hidden">
                        <div className="relative p-2 border-b border-border">
                          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            autoFocus
                            type="text"
                            value={schoolSearch}
                            onChange={(e) => setSchoolSearch(e.target.value)}
                            placeholder="Search universities..."
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto">
                          {filteredSchools.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No matches</p>
                          ) : (
                            filteredSchools.map((u) => (
                              <button
                                key={u}
                                type="button"
                                onClick={() => {
                                  setSchool(u);
                                  setSchoolOpen(false);
                                  setSchoolSearch("");
                                }}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-muted text-left"
                              >
                                <span>{u}</span>
                                {school === u && <Check size={14} className="text-primary" />}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

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

            <div>
              <label className="block text-sm mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none pr-12"
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

            <div>
              <label className="block text-sm mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-white transition-colors shadow-lg ${
                role === "supervisor"
                  ? "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                  : "bg-primary hover:bg-primary/90 shadow-primary/20"
              }`}
            >
              Create Account
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
