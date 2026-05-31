"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      if (data.force_password_change) {
        window.location.href = "/change-password";
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900" style={{ color: 'var(--brand-violet, #6771ab)' }}>Savazar</h1>
            <p className="text-sm text-slate-600 mt-1">Agentic Events & Projects Platform</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700">Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} autoFocus
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-violet)] focus:border-transparent transition-all"
                placeholder="Enter your username" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-violet)] focus:border-transparent transition-all"
                placeholder="Enter your password" />
            </div>
            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-[var(--brand-violet,#6771ab)] py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-90 transition-all active:scale-[0.97] disabled:opacity-50">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
