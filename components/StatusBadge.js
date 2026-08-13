const STATUS_CONFIG = {
  reported: { label: "Reported", dot: "bg-signal-500", text: "text-ink-900" },
  in_progress: { label: "In Progress", dot: "bg-blue-500", text: "text-ink-900" },
  resolved: { label: "Resolved", dot: "bg-route-500", text: "text-ink-900" },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.reported;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-ink-900/10 bg-white px-2.5 py-1 text-xs font-medium ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}
