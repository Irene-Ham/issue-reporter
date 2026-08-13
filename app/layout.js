import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "CivicIssue - Report local issues",
  description: "Report broken streetlights, potholes, and other public issues, and track their resolution.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink-950">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-ink-900/10 py-6 text-center text-xs text-ink-500">
            CivicIssue - a community issue reporting demo
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
