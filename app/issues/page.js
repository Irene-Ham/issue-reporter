"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import IssueForm from "@/components/IssueForm";
import IssueCard from "@/components/IssueCard";
import FilterBar from "@/components/FilterBar";

export default function IssuesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [issues, setIssues] = useState([]);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [mineOnly, setMineOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (mineOnly) params.set("mine", "1");

    try {
      const res = await fetch(`/api/issues?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load issues.");
        return;
      }
      setIssues(data.issues);
    } catch {
      setError("Network error - check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [status, category, mineOnly]);

  useEffect(() => {
    if (user) loadIssues();
  }, [user, loadIssues]);

  if (authLoading || !user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-950">
          {user.role === "staff" ? "All reports" : "Reported issues"}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {user.role === "staff"
            ? "Every issue reported by the community."
            : "Report a new issue or check the status of ones you've already sent in."}
        </p>
      </div>

      <IssueForm onCreated={loadIssues} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterBar
          status={status}
          category={category}
          onChange={({ status: s, category: c }) => {
            setStatus(s);
            setCategory(c);
          }}
        />
        {user.role === "resident" && (
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={mineOnly}
              onChange={(e) => setMineOnly(e.target.checked)}
              className="rounded border-ink-900/30"
            />
            My reports only
          </label>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink-500">Loading issues...</p>
      ) : issues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-900/15 p-8 text-center">
          <p className="text-ink-500 text-sm">No issues match these filters yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
