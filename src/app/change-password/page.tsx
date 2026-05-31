"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (!data) {
          router.push("/login");
        } else if (!data.force_password_change) {
          router.push("/dashboard");
        } else {
          setLoading(false);
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to change password");
        return;
      }
      setSuccess("Password changed successfully!");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError("An error occurred. Please try again.");
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900" style={{ color: 'var(--brand-violet, #6771ab)' }}>Change Password</h1>
            <p className="text-sm text-slate-600 mt-1">You are required to change your password before continuing.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700">Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoFocus
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-violet)] focus:border-transparent transition-all"
                placeholder="Enter current password" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-violet)] focus:border-transparent transition-all"
                placeholder="Enter new password (min 6 chars)" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-700">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-violet)] focus:border-transparent transition-all"
                placeholder="Confirm new password" />
            </div>
            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            {success && <p className="text-sm text-green-600 font-medium">{success}</p>}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-[var(--brand-violet,#6771ab)] py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-90 transition-all active:scale-[0.97] disabled:opacity-50">
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
