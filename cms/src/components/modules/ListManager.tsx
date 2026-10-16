"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Badge, EmptyState, ErrorBox, Loading, PageHeader, Panel } from "@/components/ui/Layout";
import { useConfirm } from "@/components/ui/Modal";
import { SortableList } from "@/components/ui/SortableList";
import { useToast } from "@/components/ui/Toast";
import { adminFetch } from "@/lib/api";
import { errorMessage, useResource } from "@/lib/hooks";

type Item = { id: number; is_active: boolean };

export type ItemFormProps<T> = {
  item?: T;
  onCancel: () => void;
  onSaved: (item: T) => void;
};

type Props<T extends Item> = {
  title: string;
  description: ReactNode;
  path: string;              // "/services"
  noun: string;              // "service"
  label: (item: T) => string;
  summary: (item: T) => ReactNode;
  Form: (props: ItemFormProps<T>) => ReactNode;
  emptyText: string;
};

/** Sortable list with inline add/edit forms, shared by Services, Clients and FAQs. */
export function ListManager<T extends Item>({ title, description, path, noun, label, summary, Form, emptyText }: Props<T>) {
  const { data, setData, error, loading, reload } = useResource<T[]>(path);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  async function reorder(items: T[]) {
    const previous = data;
    setData(items);
    try {
      await adminFetch(`${path}/reorder`, { method: "PUT", body: JSON.stringify({ ids: items.map((i) => i.id) }) });
      toast.success("Order saved");
    } catch (e) {
      setData(previous);
      toast.error(errorMessage(e));
    }
  }

  async function remove(item: T) {
    const ok = await confirm({ title: `Delete ${noun}?`, message: <strong>{label(item)}</strong>, confirmLabel: "Delete", danger: true });
    if (!ok) return;
    try {
      await adminFetch(`${path}/${item.id}`, { method: "DELETE" });
      setData((list) => list?.filter((x) => x.id !== item.id) ?? null);
      toast.success(`${noun.charAt(0).toUpperCase() + noun.slice(1)} deleted`);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const onSaved = (item: T, created: boolean) => {
    setData((list) => (created ? [...(list ?? []), item] : (list?.map((x) => (x.id === item.id ? item : x)) ?? null)));
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Button onClick={() => setEditing("new")} disabled={editing === "new"}>
            New {noun}
          </Button>
        }
      />

      {editing === "new" && (
        <Panel title={`New ${noun}`} className="mb-5">
          <Form onCancel={() => setEditing(null)} onSaved={(i) => onSaved(i, true)} />
        </Panel>
      )}

      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && data.length === 0 && editing !== "new" && <EmptyState title={`No ${noun}s yet`}>{emptyText}</EmptyState>}
      {data && data.length > 0 && (
        <SortableList
          items={data}
          getKey={(i) => i.id}
          onReorder={reorder}
          disabled={editing !== null}
          renderItem={(item) =>
            editing === item.id ? (
              <Form item={item} onCancel={() => setEditing(null)} onSaved={(i) => onSaved(i, false)} />
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-0 flex-1">{summary(item)}</div>
                {!item.is_active && <Badge>Hidden</Badge>}
                <Button size="sm" variant="secondary" onClick={() => setEditing(item.id)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(item)}>
                  Delete
                </Button>
              </div>
            )
          }
        />
      )}
    </>
  );
}

/** Save handler shared by the inline forms: POST for new items, PATCH for existing ones. */
export async function saveItem<T extends { id: number }>(path: string, item: T | undefined, body: object): Promise<T> {
  const json = JSON.stringify(body);
  return item
    ? adminFetch<T>(`${path}/${item.id}`, { method: "PATCH", body: json })
    : adminFetch<T>(path, { method: "POST", body: json });
}
