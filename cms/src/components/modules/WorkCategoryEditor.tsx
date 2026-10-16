"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { ImageField } from "@/components/media/ImageField";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Input, orNull, Textarea, Toggle } from "@/components/ui/Form";
import { ErrorBox, Loading, PageHeader, Panel } from "@/components/ui/Layout";
import { useConfirm } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { adminFetch } from "@/lib/api";
import { errorMessage, useResource, useUnsavedChanges } from "@/lib/hooks";
import { SITE_URL } from "@/lib/media";
import { PaletteInput } from "@/components/ui/PaletteInput";
import { TagInput } from "@/components/ui/TagInput";
import type { WorkCategory } from "@/lib/types";

import { SeoPanel } from "./SeoPanel";

type Draft = Pick<
  WorkCategory,
  | "name"
  | "slug"
  | "short_description"
  | "card_image"
  | "secondary_image"
  | "heading"
  | "intro"
  | "craft_tags"
  | "color_palette"
  | "is_active"
  | "meta_title"
  | "meta_description"
  | "og_image"
>;

const EMPTY: Draft = {
  name: "",
  slug: "",
  short_description: null,
  card_image: null,
  secondary_image: null,
  heading: null,
  intro: null,
  craft_tags: [],
  color_palette: [],
  is_active: true,
  meta_title: null,
  meta_description: null,
  og_image: null,
};

const pick = (c: WorkCategory): Draft => ({
  name: c.name,
  slug: c.slug,
  short_description: c.short_description,
  card_image: c.card_image,
  secondary_image: c.secondary_image,
  heading: c.heading,
  intro: c.intro,
  craft_tags: c.craft_tags || [],
  color_palette: c.color_palette || [],
  is_active: c.is_active,
  meta_title: c.meta_title,
  meta_description: c.meta_description,
  og_image: c.og_image,
});

export function WorkCategoryEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const { data, error, loading, reload } = useResource<WorkCategory>(isNew ? null : `/work-categories/${id}`);

  if (!isNew && error) return <ErrorBox message={error} onRetry={reload} />;
  if (!isNew && (loading || !data)) return <Loading />;
  // key resets the form when switching between categories
  return <CategoryForm key={data?.id ?? "new"} initial={data} />;
}

function CategoryForm({ initial }: { initial: WorkCategory | null }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [current, setCurrent] = useState(initial);
  const [draft, setDraft] = useState<Draft>(initial ? pick(initial) : EMPTY);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  useUnsavedChanges(dirty);

  const set = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  };

  async function save() {
    if (!draft.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const body = JSON.stringify({ ...draft, name: draft.name.trim(), slug: draft.slug.trim() || null });
      const saved = current
        ? await adminFetch<WorkCategory>(`/work-categories/${current.id}`, { method: "PATCH", body })
        : await adminFetch<WorkCategory>("/work-categories", { method: "POST", body });
      setDirty(false);
      setCurrent(saved);
      setDraft(pick(saved));
      toast.success(current ? "Category saved — the website updates within seconds" : "Category created");
      if (!current) router.replace(`/work-categories/${saved.id}`);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!current) return;
    const ok = await confirm({
      title: "Delete category?",
      message: (
        <>
          <strong>{current.name}</strong> will be removed from the website. Categories that still contain projects can’t be deleted.
        </>
      ),
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await adminFetch(`/work-categories/${current.id}`, { method: "DELETE" });
      setDirty(false);
      toast.success("Category deleted");
      router.push("/work-categories");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <PageHeader
        title={current ? current.name : "New category"}
        back={{ href: "/work-categories", label: "Work Categories" }}
        actions={
          <>
            {current && (
              <a href={`${SITE_URL}/our-work/${current.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-brand">
                View on site ↗
              </a>
            )}
            {current && (
              <Button variant="danger" onClick={remove}>
                Delete
              </Button>
            )}
            <Button type="submit" loading={saving} disabled={!dirty && !!current}>
              {current ? "Save changes" : "Create category"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel title="Card on Our Work">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name *" hint="Card title, e.g. “Packaging” (shown as “02 — Packaging”)">
                <Input value={draft.name} maxLength={120} required onChange={(e) => set({ name: e.target.value })} />
              </Field>
              <Field label="URL slug" hint={`Website address: /our-work/${draft.slug || "…"} · leave empty to generate from the name`}>
                <Input
                  value={draft.slug}
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  title="Lowercase letters, numbers and hyphens"
                  onChange={(e) => set({ slug: e.target.value.toLowerCase() })}
                />
              </Field>
              <Field label="Card text" className="md:col-span-2">
                <Textarea rows={2} value={draft.short_description ?? ""} maxLength={300} onChange={(e) => set({ short_description: orNull(e.target.value) })} />
              </Field>
            </div>
          </Panel>

          <Panel
            title="Work Card (3D Flip Specs)"
            description="Finishing details and color palette swatches displayed on the back of this category card when flipped on hover."
          >
            <div className="space-y-5">
              <Field
                label="Craft & Finishing Tags"
                hint="Press Enter after each tag (e.g. 'Soft-Touch Matte', 'Gold Foil Deboss', 'Rigid Boxboard', 'Precision Die-Cut')."
              >
                <TagInput
                  value={draft.craft_tags}
                  onChange={(craft_tags) => set({ craft_tags })}
                  placeholder="Type tag and press Enter"
                />
              </Field>

              <Field
                label="Color Palette Swatches"
                hint="Curated brand & material swatches displayed on the back face."
              >
                <PaletteInput
                  value={draft.color_palette}
                  onChange={(color_palette) => set({ color_palette })}
                />
              </Field>
            </div>
          </Panel>

          <Panel title="Category page" description="The header above this category's project cards.">
            <div className="space-y-4">
              <Field label="Heading" hint="Leave empty to use the name">
                <Input value={draft.heading ?? ""} maxLength={200} placeholder="Packaging Solutions" onChange={(e) => set({ heading: orNull(e.target.value) })} />
              </Field>
              <Field label="Intro text">
                <Textarea rows={3} value={draft.intro ?? ""} onChange={(e) => set({ intro: orNull(e.target.value) })} />
              </Field>
            </div>
          </Panel>

          <SeoPanel value={draft} onChange={set} fallbackTitle={draft.heading || draft.name || "Category name"} />
        </div>

        <div className="space-y-6">
          <Panel title="Visibility">
            <Toggle checked={draft.is_active} onChange={(is_active) => set({ is_active })} label={draft.is_active ? "Visible on website" : "Hidden from website"} />
            <p className="mt-2 text-xs text-muted">Hiding a category also hides its projects.</p>
          </Panel>
          <Panel title="Card images">
            <div className="space-y-5">
              <ImageField label="Primary card image" hint="Front of card. Portrait works best (about 6:7)." value={draft.card_image} onChange={(card_image) => set({ card_image })} aspect="aspect-[6/7]" />
              <ImageField label="Secondary card image" hint="Alternate photo of this work shown when flipped on hover." value={draft.secondary_image} onChange={(secondary_image) => set({ secondary_image })} aspect="aspect-[6/7]" />
            </div>
          </Panel>
          {current && (
            <LinkButton href={`/projects?category=${current.id}`} variant="secondary" className="w-full">
              Manage {current.project_count} project{current.project_count === 1 ? "" : "s"}
            </LinkButton>
          )}
        </div>
      </div>
    </form>
  );
}
