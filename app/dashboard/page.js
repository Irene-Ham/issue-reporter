"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import CategoryBadge from "@/components/CategoryBadge";
import FilterBar from "@/components/FilterBar";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [issues, setIssues] = useState([]);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user && user.role !== "staff") {
      router.push("/issues");
    }
  }, [authLoading, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (category) params.set("category", category);
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
  }, [status, category]);

  useEffect(() => {
    if (user?.role === "staff") load();
  }, [user, load]);

  if (authLoading || !user || user.role !== "staff") return null;

  const counts = {
    reported: issues.filter((i) => i.status === "reported").length,
    in_progress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-950">Staff dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">Triage and update issues reported by the community.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-ink-900/10 bg-white p-4">
          <p className="text-2xl font-display font-semibold text-ink-950">{counts.reported}</p>
          <p className="text-xs text-ink-500 mt-0.5">Reported</p>
        </div>
        <div className="rounded-xl border border-ink-900/10 bg-white p-4">
          <p className="text-2xl font-display font-semibold text-ink-950">{counts.in_progress}</p>
          <p className="text-xs text-ink-500 mt-0.5">In Progress</p>
        </div>
        <div className="rounded-xl border border-ink-900/10 bg-white p-4">
          <p className="text-2xl font-display font-semibold text-ink-950">{counts.resolved}</p>
          <p className="text-xs text-ink-500 mt-0.5">Resolved</p>
        </div>
      </div>

      <FilterBar
        status={status}
        category={category}
        onChange={({ status: s, category: c }) => {
          setStatus(s);
          setCategory(c);
        }}
      />

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink-500">Loading...</p>
      ) : issues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-900/15 p-8 text-center">
          <p className="text-ink-500 text-sm">No issues match these filters.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-ink-900/10 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-900/10 text-left text-xs text-ink-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Issue</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Reported by</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id} className="border-b border-ink-900/5 last:border-0 hover:bg-ink-900/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/issues/${issue.id}`} className="font-medium text-ink-900 hover:underline">
                      {issue.title}
                    </Link>
                    <p className="text-xs text-ink-500 mt-0.5">{issue.location}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <CategoryBadge category={issue.category} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-ink-700">{issue.reporter_name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={issue.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
