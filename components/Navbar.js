"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-ink-900/10 bg-paper/90 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-signal-500 text-ink-950 font-display font-bold text-sm">
            CI
          </span>
          <span className="font-display font-semibold text-ink-900 tracking-tight">
            CivicIssue
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          {!loading && user && (
            <>
              <Link
                href="/issues"
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/issues"
                    ? "bg-ink-900 text-paper"
                    : "text-ink-700 hover:bg-ink-900/5"
                }`}
              >
                {user.role === "staff" ? "All Reports" : "My Reports"}
              </Link>
              {user.role === "staff" && (
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    pathname === "/dashboard"
                      ? "bg-ink-900 text-paper"
                      : "text-ink-700 hover:bg-ink-900/5"
                  }`}
                >
                  Dashboard
                </Link>
              )}
              <span className="hidden sm:inline text-ink-400 px-2">|</span>
              <span className="hidden sm:inline text-ink-500 px-1">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md text-ink-700 hover:bg-ink-900/5 transition-colors"
              >
                Log out
              </button>
            </>
          )}
          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-md text-ink-700 hover:bg-ink-900/5 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-md bg-signal-500 text-ink-950 font-medium hover:bg-signal-400 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
