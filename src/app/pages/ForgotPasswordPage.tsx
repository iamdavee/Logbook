import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Mail } from "lucide-react";
import itfLogo from "../../imports/image.png";
import itfBuilding from "../../imports/image-1.png";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
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
          {!submitted ? (
            <>
              <h2 className="text-center text-xl mb-2">Forgot Password?</h2>
              <p className="text-center text-sm text-muted-foreground mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
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
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-4 flex items-center justify-center">
                <Mail size={24} />
              </div>
              <h2 className="text-xl mb-2">Check your inbox</h2>
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <span className="text-foreground">{email}</span>.
              </p>
            </div>
          )}

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
