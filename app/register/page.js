"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "resident" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not create account.");
        return;
      }
      await refresh();
      router.push(data.user.role === "staff" ? "/dashboard" : "/issues");
    } catch {
      setError("Network error - check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 sm:px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-ink-950">Create an account</h1>
      <p className="mt-1 text-sm text-ink-500">Report issues or manage them as staff.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-1">Name</label>
          <input
            id="name"
            type="text"
            required
            minLength={2}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded-lg border border-ink-900/15 px-3 py-2 text-sm focus:border-signal-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full rounded-lg border border-ink-900/15 px-3 py-2 text-sm focus:border-signal-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full rounded-lg border border-ink-900/15 px-3 py-2 text-sm focus:border-signal-500"
          />
          <p className="text-xs text-ink-400 mt-1">At least 8 characters.</p>
        </div>
        <div>
          <span className="block text-sm font-medium text-ink-700 mb-1">I am a</span>
          <div className="flex gap-2">
            {[
              { value: "resident", label: "Resident" },
              { value: "staff", label: "Staff" },
            ].map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setForm((f) => ({ ...f, role: opt.value }))}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  form.role === opt.value
                    ? "border-signal-500 bg-signal-500/10 text-ink-900"
                    : "border-ink-900/15 text-ink-500 hover:bg-ink-900/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-400 mt-1">
            Staff accounts can update issue status and add resolution notes.
          </p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-ink-900 px-5 py-2.5 font-medium text-paper hover:bg-ink-950 transition-colors disabled:opacity-50"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="text-ink-900 font-medium underline underline-offset-2">
          Log in
        </Link>
      </p>
    </div>
  );
}
