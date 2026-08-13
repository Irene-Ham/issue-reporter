"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "road", label: "Road" },
  { value: "electricity", label: "Electricity" },
  { value: "sanitation", label: "Sanitation" },
  { value: "water", label: "Water" },
  { value: "safety", label: "Safety" },
  { value: "other", label: "Other" },
];

export default function IssueForm({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "road",
    location: "",
    photo_url: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    if (form.description.trim().length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }
    if (form.location.trim().length < 3) {
      setError("Location must be at least 3 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not submit the report. Please try again.");
        return;
      }
      setForm({ title: "", description: "", category: "road", location: "", photo_url: "" });
      setOpen(false);
      onCreated?.(data.issue);
    } catch {
      setError("Network error - check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto rounded-lg bg-signal-500 px-5 py-2.5 font-medium text-ink-950 hover:bg-signal-400 transition-colors"
      >
        + Report an issue
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-ink-900/10 bg-white p-5 sm:p-6 space-y-4"
      noValidate
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-lg text-ink-900">Report an issue</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-ink-500 hover:text-ink-900 text-sm"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-ink-700 mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          minLength={3}
          maxLength={120}
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Broken streetlight on Ring Road"
          className="w-full rounded-lg border border-ink-900/15 px-3 py-2 text-sm focus:border-signal-500"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-ink-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full rounded-lg border border-ink-900/15 px-3 py-2 text-sm bg-white focus:border-signal-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-ink-700 mb-1">
            Location
          </label>
          <input
            id="location"
            type="text"
            required
            minLength={3}
            maxLength={200}
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="e.g. Near Legon main gate"
            className="w-full rounded-lg border border-ink-900/15 px-3 py-2 text-sm focus:border-signal-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-ink-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          required
          minLength={10}
          maxLength={2000}
          rows={3}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="What's going on, and how long has it been like this?"
          className="w-full rounded-lg border border-ink-900/15 px-3 py-2 text-sm focus:border-signal-500"
        />
      </div>

      <div>
        <label htmlFor="photo_url" className="block text-sm font-medium text-ink-700 mb-1">
          Photo URL (optional)
        </label>
        <input
          id="photo_url"
          type="url"
          value={form.photo_url}
          onChange={(e) => update("photo_url", e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-ink-900/15 px-3 py-2 text-sm focus:border-signal-500"
        />
        <p className="text-xs text-ink-400 mt-1">
          Link to an image. File upload isn't supported in this version.
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto rounded-lg bg-ink-900 px-5 py-2.5 font-medium text-paper hover:bg-ink-950 transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit report"}
      </button>
    </form>
  );
}
