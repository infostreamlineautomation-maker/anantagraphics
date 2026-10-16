"use client";

import { useState } from "react";

import { Button, buttonClass } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Form";
import { Badge, EmptyState, ErrorBox, Loading, PageHeader, Pagination } from "@/components/ui/Layout";
import { useConfirm } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { adminFetch, ADMIN_API_URL } from "@/lib/api";
import { errorMessage, formatDate, useResource } from "@/lib/hooks";
import type { Page, Subscriber, SubscriberStatus } from "@/lib/types";

export default function NewsletterPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<SubscriberStatus | "">("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const toast = useToast();
  const confirm = useConfirm();

  const filters = new URLSearchParams();
  if (status) filters.set("status", status);
  if (query) filters.set("q", query);
  const qs = new URLSearchParams(filters);
  qs.set("page", String(page));
  qs.set("page_size", "50");
  const { data, setData, error, loading, reload } = useResource<Page<Subscriber>>(`/newsletter?${qs}`);

  async function toggle(s: Subscriber) {
    const next: SubscriberStatus = s.status === "subscribed" ? "unsubscribed" : "subscribed";
    try {
      const updated = await adminFetch<Subscriber>(`/newsletter/${s.id}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      setData((d) => (d ? { ...d, items: d.items.map((x) => (x.id === updated.id ? updated : x)) } : d));
      toast.success(`${s.email} marked ${next}`);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function remove(s: Subscriber) {
    const ok = await confirm({
      title: "Remove subscriber?",
      message: (
        <>
          <strong>{s.email}</strong> will be deleted. To keep a record that they opted out, mark them unsubscribed instead.
        </>
      ),
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    try {
      await adminFetch(`/newsletter/${s.id}`, { method: "DELETE" });
      setData((d) => (d ? { ...d, items: d.items.filter((x) => x.id !== s.id), total: d.total - 1 } : d));
      toast.success("Subscriber removed");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Newsletter"
        description="Email addresses from the footer “Join” form. Export them to send a campaign from any mailing tool."
        actions={
          // Plain link: the browser sends the session cookie and downloads the file
          <a href={`${ADMIN_API_URL}/newsletter/export.csv?${filters}`} className={buttonClass("secondary")}>
            Export CSV
          </a>
        }
      />

      <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as SubscriberStatus | "");
          }}
          aria-label="Status"
        >
          <option value="">All</option>
          <option value="subscribed">Subscribed</option>
          <option value="unsubscribed">Unsubscribed</option>
        </Select>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(search.trim());
          }}
        >
          <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email and press Enter" aria-label="Search subscribers" />
        </form>
      </div>

      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && data.items.length === 0 && <EmptyState title="No subscribers yet">Sign-ups from the website footer appear here.</EmptyState>}
      {data && data.items.length > 0 && (
        <div className="overflow-x-auto rounded-card border border-line bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-cream text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Signed up on</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((s) => (
                <tr key={s.id} className="hover:bg-cream">
                  <td className="px-4 py-3">
                    <a href={`mailto:${s.email}`} className="hover:text-brand">
                      {s.email}
                    </a>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-3 text-muted">{s.source_page || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={s.status === "subscribed" ? "green" : "grey"}>{s.status === "subscribed" ? "Subscribed" : "Unsubscribed"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => toggle(s)}>
                      {s.status === "subscribed" ? "Unsubscribe" : "Resubscribe"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(s)}>
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={setPage} />}
    </>
  );
}
