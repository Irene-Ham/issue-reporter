"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import CategoryBadge from "@/components/CategoryBadge";

const NEXT_STATUS = {
  reported: "in_progress",
  in_progress: "resolved",
  resolved: null,
};

const NEXT_STATUS_LABEL = {
  in_progress: "Move to In Progress",
  resolved: "Mark Resolved",
};

function formatDate(dateStr) {
  return new Date(dateStr + "Z").toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function IssueDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();

  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/issues/${params.id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not load this issue.");
        return;
      }
      setIssue(data.issue);
      setHistory(data.history);
    } catch {
      setError("Network error - check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  async function handleAdvance() {
    const nextStatus = NEXT_STATUS[issue.status];
    if (!nextStatus) return;
    setUpdating(true);
    setError("");
    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_status: nextStatus, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update status.");
        return;
      }
      setNote("");
      await load();
    } catch {
      setError("Network error - check your connection and try again.");
    } finally {
      setUpdating(false);
    }
  }

  if (authLoading || !user || loading) {
    return <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 text-sm text-ink-500">Loading...</div>;
  }

  if (error && !issue) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
          {error}
        </div>
        <Link href="/issues" className="mt-4 inline-block text-sm text-ink-700 underline underline-offset-2">
          Back to issues
        </Link>
      </div>
    );
  }

  const nextStatus = NEXT_STATUS[issue.status];

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 space-y-6">
      <Link href="/issues" className="text-sm text-ink-500 hover:text-ink-900">
        ← Back to issues
      </Link>

      <div className="rounded-xl border border-ink-900/10 bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-xl font-semibold text-ink-950">{issue.title}</h1>
          <StatusBadge status={issue.status} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-500">
          <CategoryBadge category={issue.category} />
          <span aria-hidden="true">.</span>
          <span>{issue.location}</span>
          <span aria-hidden="true">.</span>
          <span>reported by {issue.reporter_name}</span>
          <span aria-hidden="true">.</span>
          <span>{formatDate(issue.created_at)}</span>
        </div>
        <p className="mt-4 text-sm text-ink-700 leading-relaxed">{issue.description}</p>
        {issue.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={issue.photo_url}
            alt={`Photo submitted for: ${issue.title}`}
            className="mt-4 rounded-lg border border-ink-900/10 max-h-80 object-cover w-full"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
      </div>

      <div className="rounded-xl border border-ink-900/10 bg-white p-5 sm:p-6">
        <h2 className="font-display font-semibold text-ink-900 mb-4">Status history</h2>
        <ol className="relative border-l border-ink-900/10 pl-5 space-y-5">
          <li className="relative">
            <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-signal-500" />
            <p className="text-sm font-medium text-ink-900">Reported</p>
            <p className="text-xs text-ink-500">{formatDate(issue.created_at)} by {issue.reporter_name}</p>
          </li>
          {history.map((h) => (
            <li key={h.id} className="relative">
              <span
                className={`absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full ${
                  h.new_status === "resolved" ? "bg-route-500" : "bg-blue-500"
                }`}
              />
              <p className="text-sm font-medium text-ink-900">
                {h.new_status === "in_progress" ? "Moved to In Progress" : "Resolved"}
              </p>
              <p className="text-xs text-ink-500">{formatDate(h.timestamp)} by {h.updated_by_name}</p>
              {h.note && <p className="mt-1 text-sm text-ink-700">{h.note}</p>}
            </li>
          ))}
        </ol>
      </div>

      {user.role === "staff" && nextStatus && (
        <div className="rounded-xl border border-ink-900/10 bg-white p-5 sm:p-6 space-y-3">
          <h2 className="font-display font-semibold text-ink-900">Update status</h2>
          {error && (
            <div role="alert" className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}
          <label htmlFor="note" className="block text-sm font-medium text-ink-700">
            Note {nextStatus === "resolved" && <span className="text-ink-400 font-normal">(what was done)</span>}
          </label>
          <textarea
            id="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            placeholder="Optional note for this status change"
            className="w-full rounded-lg border border-ink-900/15 px-3 py-2 text-sm focus:border-signal-500"
          />
          <button
            onClick={handleAdvance}
            disabled={updating}
            className="rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-950 transition-colors disabled:opacity-50"
          >
            {updating ? "Updating..." : NEXT_STATUS_LABEL[nextStatus]}
          </button>
        </div>
      )}
    </div>
  );
}