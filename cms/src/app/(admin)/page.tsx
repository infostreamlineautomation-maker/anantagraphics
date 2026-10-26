"use client";

import Link from "next/link";

import { ENQUIRY_TYPE_LABELS, EnquiryStatusBadge } from "@/components/modules/enquiryLabels";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorBox, Loading, PageHeader, Panel } from "@/components/ui/Layout";
import { useAuth } from "@/lib/auth";
import { formatDate, useResource } from "@/lib/hooks";
import type { Dashboard } from "@/lib/types";

function Stat({ label, value, href, highlight }: { label: string; value: number; href: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-card border p-4 transition-colors hover:border-brand ${highlight ? "border-brand/40 bg-brand-tint" : "border-line bg-white"}`}
    >
      <p className={`font-display text-3xl font-bold ${highlight ? "text-brand" : "text-ink"}`}>{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const { admin } = useAuth();
  const { data, error, loading, reload } = useResource<Dashboard>("/dashboard");

  return (
    <>
      <PageHeader title="Dashboard" description={`Welcome back, ${admin?.full_name || admin?.email}.`} />
      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="New enquiries" value={data.enquiries_new} href="/enquiries?status=new" highlight={data.enquiries_new > 0} />
            <Stat label="All enquiries" value={data.enquiries_total} href="/enquiries" />
            <Stat label="Newsletter subscribers" value={data.subscribers} href="/newsletter" />
            <Stat label="Projects" value={data.projects} href="/projects" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Panel title="Latest enquiries" actions={<LinkButton href="/enquiries" variant="secondary" size="sm">View all</LinkButton>}>
              {data.latest_enquiries.length === 0 ? (
                <EmptyState title="No enquiries yet">Messages from the website’s contact form will appear here.</EmptyState>
              ) : (
                <ul className="divide-y divide-line">
                  {data.latest_enquiries.map((e) => (
                    <li key={e.id}>
                      <Link href={`/enquiries/${e.id}`} className="flex flex-wrap items-center gap-3 py-3 hover:text-brand">
                        <span className="min-w-0 flex-1">
                          <span className={e.status === "new" ? "font-semibold" : ""}>{e.name}</span>
                          <span className="block text-xs text-muted">
                            {ENQUIRY_TYPE_LABELS[e.type]}
                            {e.service ? ` · ${e.service}` : ""} · {formatDate(e.created_at)}
                          </span>
                        </span>
                        <EnquiryStatusBadge status={e.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Website content">
              <ul className="space-y-2 text-sm">
                {[
                  ["Work categories", data.work_categories, "/work-categories"],
                  ["Projects", data.projects, "/projects"],
                  ["Client logos", data.clients, "/clients"],
                  ["Images", data.media, "/media"],
                ].map(([label, count, href]) => (
                  <li key={href as string}>
                    <Link href={href as string} className="flex justify-between rounded-card px-2 py-1.5 hover:bg-cream hover:text-brand">
                      <span>{label}</span>
                      <span className="font-medium">{count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                <LinkButton href="/projects/new" size="sm">
                  New project
                </LinkButton>
                <LinkButton href="/pages" variant="secondary" size="sm">
                  Edit pages
                </LinkButton>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
