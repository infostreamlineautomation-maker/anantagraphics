"use client";

import Image from "next/image";
import Link from "next/link";

import { LinkButton } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Form";
import { Badge, EmptyState, ErrorBox, Loading, PageHeader } from "@/components/ui/Layout";
import { SortableList } from "@/components/ui/SortableList";
import { useToast } from "@/components/ui/Toast";
import { adminFetch } from "@/lib/api";
import { errorMessage, useResource } from "@/lib/hooks";
import { mediaUrl } from "@/lib/media";
import type { WorkCategory } from "@/lib/types";

export default function WorkCategoriesPage() {
  const { data, setData, error, loading, reload } = useResource<WorkCategory[]>("/work-categories");
  const toast = useToast();

  async function reorder(next: WorkCategory[]) {
    const previous = data;
    setData(next);
    try {
      await adminFetch("/work-categories/reorder", { method: "PUT", body: JSON.stringify({ ids: next.map((c) => c.id) }) });
      toast.success("Order saved — card numbers (01, 02…) follow this order");
    } catch (e) {
      setData(previous);
      toast.error(errorMessage(e));
    }
  }

  async function setActive(c: WorkCategory, is_active: boolean) {
    try {
      const updated = await adminFetch<WorkCategory>(`/work-categories/${c.id}`, { method: "PATCH", body: JSON.stringify({ is_active }) });
      setData((list) => list?.map((x) => (x.id === updated.id ? updated : x)) ?? null);
      toast.success(`${c.name} is now ${is_active ? "visible" : "hidden"}`);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <>
      <PageHeader
        title="Work Categories"
        description="The cards on the Our Work page. Drag to change their order."
        actions={<LinkButton href="/work-categories/new">New category</LinkButton>}
      />
      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && data.length === 0 && <EmptyState title="No categories yet">Create your first one, e.g. Packaging.</EmptyState>}
      {data && data.length > 0 && (
        <SortableList
          items={data}
          getKey={(c) => c.id}
          onReorder={reorder}
          renderItem={(c, i) => (
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-card bg-cream">
                {c.card_image && <Image src={mediaUrl(c.card_image)} alt="" fill sizes="56px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/work-categories/${c.id}`} className="font-medium hover:text-brand">
                  {String(i + 1).padStart(2, "0")} — {c.name}
                </Link>
                <p className="truncate text-sm text-muted">
                  /our-work/{c.slug} · {c.project_count} project{c.project_count === 1 ? "" : "s"}
                </p>
              </div>
              {!c.is_active && <Badge>Hidden</Badge>}
              <Toggle checked={c.is_active} onChange={(v) => setActive(c, v)} label="Visible" />
              <LinkButton href={`/projects?category=${c.id}`} variant="ghost" size="sm">
                Projects
              </LinkButton>
              <LinkButton href={`/work-categories/${c.id}`} variant="secondary" size="sm">
                Edit
              </LinkButton>
            </div>
          )}
        />
      )}
    </>
  );
}
