import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-500/15 text-signal-500 text-xs font-medium px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-500" />
          Reported -> In Progress -> Resolved
        </span>
        <h1 className="mt-5 font-display text-4xl sm:text-5xl font-semibold tracking-tight text-ink-950 leading-[1.1]">
          Report what's broken.<br />Track what gets fixed.
        </h1>
        <p className="mt-5 text-ink-700 text-lg leading-relaxed">
          A broken streetlight, a pothole, an overflowing bin - CivicIssue gives
          residents a direct line to report local problems, and gives staff a
          shared queue to work through them, with every status change logged.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-signal-500 px-5 py-2.5 font-medium text-ink-950 hover:bg-signal-400 transition-colors"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-ink-900/15 px-5 py-2.5 font-medium text-ink-900 hover:bg-ink-900/5 transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>

      <div className="mt-16 grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-ink-900/10 bg-white p-5">
          <div className="h-1.5 w-1.5 rounded-full bg-signal-500 mb-3" />
          <h2 className="font-display font-semibold text-ink-900">Reported</h2>
          <p className="mt-1 text-sm text-ink-500">A resident submits an issue with a category, location, and description.</p>
        </div>
        <div className="rounded-xl border border-ink-900/10 bg-white p-5">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mb-3" />
          <h2 className="font-display font-semibold text-ink-900">In Progress</h2>
          <p className="mt-1 text-sm text-ink-500">Staff pick it up and start working the fix.</p>
        </div>
        <div className="rounded-xl border border-ink-900/10 bg-white p-5">
          <div className="h-1.5 w-1.5 rounded-full bg-route-500 mb-3" />
          <h2 className="font-display font-semibold text-ink-900">Resolved</h2>
          <p className="mt-1 text-sm text-ink-500">Staff close it out with a note on what was done.</p>
        </div>
      </div>
    </div>
  );
}
