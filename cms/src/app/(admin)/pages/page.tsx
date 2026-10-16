"use client";

import Link from "next/link";

import { PAGE_META } from "@/components/modules/PageEditor";
import { Badge, ErrorBox, Loading, PageHeader } from "@/components/ui/Layout";
import { formatDate, useResource } from "@/lib/hooks";
import type { PageSection } from "@/lib/types";

export default function PagesPage() {
  const { data, error, loading, reload } = useResource<Record<string, PageSection[]>>("/pages");

  return (
    <>
      <PageHeader
        title="Pages"
        description="Text and images of the website's fixed pages. Work categories and projects are edited under Our Work."
      />
      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && (
        <ul className="grid gap-4 md:grid-cols-2">
          {Object.entries(PAGE_META).map(([key, meta]) => {
            const sections = data[key] ?? [];
            const updated = sections.map((s) => s.updated_at).sort().at(-1);
            return (
              <li key={key}>
                <Link href={`/pages/${key}`} className="block h-full rounded-card border border-line bg-white p-5 transition-colors hover:border-brand">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-bold">{meta.title}</h2>
                    <Badge>{meta.path}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">{sections.map((s) => s.label).join(" · ") || "No sections"}</p>
                  <p className="mt-3 text-xs text-muted">Last edited {formatDate(updated)}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
