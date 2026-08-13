import Link from "next/link";
import StatusBadge from "./StatusBadge";
import CategoryBadge from "./CategoryBadge";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr + "Z").getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function IssueCard({ issue }) {
  return (
    <Link
      href={`/issues/${issue.id}`}
      className="block rounded-xl border border-ink-900/10 bg-white p-4 sm:p-5 hover:border-signal-500/50 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-semibold text-ink-900 leading-snug">{issue.title}</h3>
        <StatusBadge status={issue.status} />
      </div>
      <p className="mt-1.5 text-sm text-ink-700 line-clamp-2">{issue.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-500">
        <CategoryBadge category={issue.category} />
        <span aria-hidden="true">.</span>
        <span>{issue.location}</span>
        <span aria-hidden="true">.</span>
        <span>reported by {issue.reporter_name}</span>
        <span aria-hidden="true">.</span>
        <span>{timeAgo(issue.created_at)}</span>
      </div>
    </Link>
  );
}
