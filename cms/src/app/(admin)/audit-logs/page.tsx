"use client";

import { useState } from "react";

import { Select } from "@/components/ui/Form";
import { Badge, EmptyState, ErrorBox, Loading, PageHeader, Pagination } from "@/components/ui/Layout";
import { useAuth } from "@/lib/auth";
import { formatDate, useResource } from "@/lib/hooks";
import type { AuditEntry, Page } from "@/lib/types";

// Entity names recorded by the admin API (backend/app/routers/admin), in plain words
const ENTITIES: Record<string, string> = {
  work_category: "Work categories",
  project: "Projects",
  service: "Services",
  client: "Clients",
  faq: "FAQs",
  page_section: "Page content",
  settings: "Settings",
  media: "Media library",
  enquiry: "Enquiries",
  subscriber: "Newsletter",
  user: "Users",
  site: "Website refresh",
  auth: "Sign-ins",
};
const ACTIONS: Record<string, { label: string; tone: "green" | "red" | "amber" | "blue" | "grey" }> = {
  create: { label: "Added", tone: "green" },
  upload: { label: "Uploaded", tone: "green" },
  update: { label: "Edited", tone: "amber" },
  delete: { label: "Deleted", tone: "red" },
  reorder: { label: "Reordered", tone: "blue" },
  publish: { label: "Refreshed", tone: "blue" },
  login: { label: "Signed in", tone: "grey" },
  logout: { label: "Signed out", tone: "grey" },
};
// Filter: "" = all changes without sign-ins (default), "*" = everything, otherwise one entity
const ALL = "*";

const fieldLabel = (field: string) => field.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "(empty)";
  return typeof value === "string" ? value : JSON.stringify(value);
}

export default function AuditLogPage() {
  const { admin } = useAuth();
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const qs = new URLSearchParams({ page: String(page), page_size: "50" });
  if (filter && filter !== ALL) qs.set("entity", filter);
  if (!filter) qs.set("hide_logins", "true");
  const { data, error, loading, reload } = useResource<Page<AuditEntry>>(admin?.role === "superadmin" ? `/audit-logs?${qs}` : null);

  if (admin?.role !== "superadmin") return <ErrorBox message="Only admins can see the audit log." />;

  return (
    <>
      <PageHeader
        title="Audit Log"
        description="Who changed what in the CMS, newest first."
        actions={
          <Select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Show"
          >
            <option value="">All changes (without sign-ins)</option>
            <option value={ALL}>Everything, including sign-ins</option>
            {Object.entries(ENTITIES).map(([key, label]) => (
              <option key={key} value={key}>
                Only {label.toLowerCase()}
              </option>
            ))}
          </Select>
        }
      />
      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && data.items.length === 0 && <EmptyState title="Nothing logged yet" />}
      {data && data.items.length > 0 && (
        <ul className="divide-y divide-line rounded-card border border-line bg-white">
          {data.items.map((entry) => {
            const action = ACTIONS[entry.action] ?? { label: entry.action, tone: "grey" as const };
            const changes = entry.changes ? Object.entries(entry.changes) : [];
            return (
              <li key={entry.id} className="px-4 py-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 pt-px">
                    <Badge tone={action.tone}>{action.label}</Badge>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium break-words">{entry.summary}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      by {entry.admin_email ?? "the system"} · {formatDate(entry.created_at)}
                    </p>
                    {(changes.length > 0 || entry.ip_address) && (
                      <details className="mt-1.5">
                        <summary className="cursor-pointer text-xs text-brand hover:underline">
                          {changes.length > 0 ? `See what changed (${changes.length})` : "Details"}
                        </summary>
                        <dl className="mt-2 space-y-1.5 rounded-card bg-cream p-3 text-xs">
                          {changes.map(([field, value]) => (
                            <div key={field} className="break-words">
                              <dt className="font-semibold">{fieldLabel(field)}</dt>
                              <dd className="text-muted">
                                {Array.isArray(value) && value.length === 2 ? (
                                  <>
                                    <span className="line-through">{formatValue(value[0])}</span> → <span className="text-ink">{formatValue(value[1])}</span>
                                  </>
                                ) : (
                                  formatValue(value)
                                )}
                              </dd>
                            </div>
                          ))}
                          {entry.ip_address && (
                            <div>
                              <dt className="font-semibold">IP address</dt>
                              <dd className="text-muted">{entry.ip_address}</dd>
                            </div>
                          )}
                        </dl>
                      </details>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {data && <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={setPage} />}
    </>
  );
}
