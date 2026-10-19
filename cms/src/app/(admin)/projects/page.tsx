"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { LinkButton } from "@/components/ui/Button";
import { Input, Select, Toggle } from "@/components/ui/Form";
import { Badge, EmptyState, ErrorBox, Loading, PageHeader } from "@/components/ui/Layout";
import { SortableList } from "@/components/ui/SortableList";
import { useToast } from "@/components/ui/Toast";
import { adminFetch } from "@/lib/api";
import { errorMessage, useResource } from "@/lib/hooks";
import { mediaUrl } from "@/lib/media";
import type { Page, Project, WorkCategory } from "@/lib/types";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProjectList />
    </Suspense>
  );
}

function ProjectList() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const categoryId = params.get("category") ?? "";
  const q = params.get("q") ?? "";
  const [search, setSearch] = useState(q);

  const categories = useResource<WorkCategory[]>("/work-categories");
  const qs = new URLSearchParams({ page_size: "200" });
  if (categoryId) qs.set("category_id", categoryId);
  if (q) qs.set("q", q);
  const { data, setData, error, loading, reload } = useResource<Page<Project>>(`/projects?${qs}`);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next}`);
  };

  // Order only means something inside one category, and only for the full (unsearched) list
  const sortable = !!categoryId && !q;
  const newHref = `/projects/new${categoryId ? `?category=${categoryId}` : ""}`;

  async function reorder(items: Project[]) {
    const previous = data;
    setData((d) => (d ? { ...d, items } : d));
    try {
      await adminFetch(`/projects/reorder?category_id=${categoryId}`, { method: "PUT", body: JSON.stringify({ ids: items.map((p) => p.id) }) });
      toast.success("Order saved");
    } catch (e) {
      setData(previous);
      toast.error(errorMessage(e));
    }
  }

  async function patch(p: Project, body: Partial<Project>, message: string) {
    try {
      const updated = await adminFetch<Project>(`/projects/${p.id}`, { method: "PATCH", body: JSON.stringify(body) });
      setData((d) => (d ? { ...d, items: d.items.map((x) => (x.id === updated.id ? updated : x)) } : d));
      toast.success(message);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Projects"
        description="Portfolio projects shown on each category page. Pick a category to drag them into order."
        actions={<LinkButton href={newHref}>New project</LinkButton>}
      />

      <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Select value={categoryId} onChange={(e) => setParam("category", e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {categories.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.project_count})
            </option>
          ))}
        </Select>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam("q", search.trim());
          }}
        >
          <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, slug or client and press Enter" aria-label="Search projects" />
        </form>
      </div>

      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && data.items.length === 0 && (
        <EmptyState title="No projects here">{q ? "Try a different search." : "Add the first project for this category."}</EmptyState>
      )}
      {data && data.items.length > 0 && (
        <SortableList
          items={data.items}
          getKey={(p) => p.id}
          onReorder={reorder}
          disabled={!sortable}
          renderItem={(p) => (
            // Phones: image + title on one line, controls wrap below; wider screens: one row
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="flex min-w-0 basis-full items-center gap-3 sm:basis-0 sm:flex-1 sm:gap-4">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-card bg-cream">
                  {p.cover_image && <Image src={mediaUrl(p.cover_image)} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/projects/${p.id}`} className="font-medium hover:text-brand">
                    {p.title}
                  </Link>
                  <p className="truncate text-sm text-muted">
                    {p.category_name}
                    {p.client ? ` · ${p.client}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {p.is_featured && <Badge tone="blue">In “Explore more”</Badge>}
                {!p.is_active && <Badge>Hidden</Badge>}
                <Toggle checked={p.is_active} onChange={(v) => patch(p, { is_active: v }, `${p.title} is now ${v ? "visible" : "hidden"}`)} label="Visible" />
                <LinkButton href={`/projects/${p.id}`} variant="secondary" size="sm">
                  Edit
                </LinkButton>
              </div>
            </div>
          )}
        />
      )}
    </>
  );
}
