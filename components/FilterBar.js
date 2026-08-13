"use client";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "reported", label: "Reported" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All categories" },
  { value: "road", label: "Road" },
  { value: "electricity", label: "Electricity" },
  { value: "sanitation", label: "Sanitation" },
  { value: "water", label: "Water" },
  { value: "safety", label: "Safety" },
  { value: "other", label: "Other" },
];

export default function FilterBar({ status, category, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      <label className="sr-only" htmlFor="filter-status">Filter by status</label>
      <select
        id="filter-status"
        value={status}
        onChange={(e) => onChange({ status: e.target.value, category })}
        className="rounded-lg border border-ink-900/15 bg-white px-3 py-2 text-sm focus:border-signal-500"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <label className="sr-only" htmlFor="filter-category">Filter by category</label>
      <select
        id="filter-category"
        value={category}
        onChange={(e) => onChange({ status, category: e.target.value })}
        className="rounded-lg border border-ink-900/15 bg-white px-3 py-2 text-sm focus:border-signal-500"
      >
        {CATEGORY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
