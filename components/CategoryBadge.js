const CATEGORY_CONFIG = {
  road: { label: "Road", className: "bg-ink-900/5 text-ink-700" },
  electricity: { label: "Electricity", className: "bg-signal-500/15 text-signal-500" },
  sanitation: { label: "Sanitation", className: "bg-route-500/15 text-route-500" },
  water: { label: "Water", className: "bg-blue-500/10 text-blue-700" },
  safety: { label: "Safety", className: "bg-red-500/10 text-red-600" },
  other: { label: "Other", className: "bg-purple-500/10 text-purple-700" },
};

export default function CategoryBadge({ category }) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export { CATEGORY_CONFIG };
