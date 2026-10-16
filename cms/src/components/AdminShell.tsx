"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { adminFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/hooks";
import { SITE_URL } from "@/lib/media";

import { useToast } from "./ui/Toast";

const NAV: { label: string; href: string; superadmin?: boolean; group?: string }[] = [
  { label: "Dashboard", href: "/" },
  { label: "Work Categories", href: "/work-categories", group: "Our Work" },
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services", group: "Content" },
  { label: "Clients", href: "/clients" },
  { label: "Pages", href: "/pages" },
  { label: "FAQs", href: "/faqs" },
  { label: "Media Library", href: "/media" },
  { label: "Enquiries", href: "/enquiries", group: "Inbox" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Settings", href: "/settings", group: "Admin" },
  { label: "Users", href: "/users", superadmin: true },
  { label: "Audit Log", href: "/audit-logs", superadmin: true },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const items = NAV.filter((n) => !n.superadmin || admin?.role === "superadmin");

  // Edits refresh their own pages automatically; this is for "it still looks old" moments
  async function refreshSite() {
    setRefreshing(true);
    try {
      await adminFetch("/settings/publish", { method: "POST" });
      toast.success("Website refreshed — every page now shows the latest content");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[232px] overflow-y-auto bg-night text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4">
          <Link href="/" className="block rounded-card bg-white px-3 py-2.5">
            <Image src="/logo.png" alt="Ananta Graphics" width={900} height={239} preload className="h-auto w-full" />
          </Link>
          <p className="mt-2.5 text-center font-mono text-[0.6875rem] tracking-[0.2em] text-line uppercase">Content Manager</p>
        </div>

        <nav aria-label="CMS" className="px-3 pb-6">
          <ul className="flex flex-col gap-1">
            {items.map((n) => (
              <li key={n.href}>
                {n.group && <p className="mt-4 mb-1 px-3.5 font-mono text-[0.625rem] tracking-[0.18em] text-white/40 uppercase">{n.group}</p>}
                <Link
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={`block rounded-card px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive(n.href) ? "bg-brand text-white" : "text-line hover:bg-white/8"
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {menuOpen && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />}

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-line bg-white px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open menu" className="lg:hidden">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="hidden text-sm text-muted hover:text-brand sm:inline">
              View website ↗
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={refreshSite}
              disabled={refreshing}
              title="Make every website page show the latest content"
              className="hidden rounded-pill border border-line px-3 py-1 text-xs hover:border-brand hover:text-brand disabled:opacity-50 sm:inline"
            >
              {refreshing ? "Refreshing…" : "Refresh website"}
            </button>
            <Link href="/profile" className="hidden font-medium hover:text-brand md:inline" title="Your profile">
              {admin?.full_name || admin?.email}
            </Link>
            <button type="button" onClick={logout} className="rounded-pill border border-ink px-3 py-1 text-xs hover:bg-ink hover:text-white">
              Log out
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
