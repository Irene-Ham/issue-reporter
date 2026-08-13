"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not log in.");
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
      <h1 className="font-display text-2xl font-semibold text-ink-950">Log in</h1>
      <p className="mt-1 text-sm text-ink-500">Welcome back.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {error && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
            {error}
          </div>
        )}
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
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="w-full rounded-lg border border-ink-900/15 px-3 py-2 text-sm focus:border-signal-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-ink-900 px-5 py-2.5 font-medium text-paper hover:bg-ink-950 transition-colors disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-5 text-sm text-ink-500">
        No account?{" "}
        <Link href="/register" className="text-ink-900 font-medium underline underline-offset-2">
          Sign up
        </Link>
      </p>
    </div>
  );
}
