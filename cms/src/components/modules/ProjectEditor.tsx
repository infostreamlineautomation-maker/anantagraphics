"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { GalleryField } from "@/components/media/GalleryField";
import { ImageField } from "@/components/media/ImageField";
import { Button } from "@/components/ui/Button";
import { Field, Input, orNull, Select, Textarea, Toggle } from "@/components/ui/Form";
import { ErrorBox, Loading, PageHeader, Panel } from "@/components/ui/Layout";
import { useConfirm } from "@/components/ui/Modal";
import { PaletteInput } from "@/components/ui/PaletteInput";
import { TagInput } from "@/components/ui/TagInput";
import { useToast } from "@/components/ui/Toast";
import { adminFetch } from "@/lib/api";
import { errorMessage, useResource, useUnsavedChanges } from "@/lib/hooks";
import { SITE_URL } from "@/lib/media";
import type { Project, WorkCategory } from "@/lib/types";

import { SeoPanel } from "./SeoPanel";

type Draft = Omit<Project, "id" | "category_name" | "sequence" | "created_at" | "updated_at">;

const pick = (p: Project): Draft => ({
  category_id: p.category_id,
  title: p.title,
  slug: p.slug,
  short_description: p.short_description,
  cover_image: p.cover_image,
  secondary_image: p.secondary_image,
  description: p.description,
  intro_image: p.intro_image,
  client: p.client,
  project_type: p.project_type,
  services: p.services,
  craft_tags: p.craft_tags || [],
  color_palette: p.color_palette || [],
  gallery: p.gallery,
  is_featured: p.is_featured,
  is_active: p.is_active,
  meta_title: p.meta_title,
  meta_description: p.meta_description,
  og_image: p.og_image,
});

export function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const isNew = id === "new";
  const project = useResource<Project>(isNew ? null : `/projects/${id}`);
  const categories = useResource<WorkCategory[]>("/work-categories");

  const error = project.error || categories.error;
  if (error) return <ErrorBox message={error} onRetry={isNew ? categories.reload : project.reload} />;
  if ((!isNew && !project.data) || !categories.data) return <Loading />;
  if (categories.data.length === 0) return <ErrorBox message="Create a work category first — every project belongs to one." />;

  const preset = Number(params.get("category")) || categories.data[0].id;
  return <ProjectForm key={project.data?.id ?? "new"} initial={project.data} categories={categories.data} presetCategory={preset} />;
}

function ProjectForm({ initial, categories, presetCategory }: { initial: Project | null; categories: WorkCategory[]; presetCategory: number }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [current, setCurrent] = useState(initial);
  const [draft, setDraft] = useState<Draft>(
    initial
      ? pick(initial)
      : {
          category_id: presetCategory,
          title: "",
          slug: "",
          short_description: null,
          cover_image: null,
          secondary_image: null,
          description: null,
          intro_image: null,
          client: null,
          project_type: null,
          services: [],
          craft_tags: [],
          color_palette: [],
          gallery: [],
          is_featured: false,
          is_active: true,
          meta_title: null,
          meta_description: null,
          og_image: null,
        },
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  useUnsavedChanges(dirty);

  const set = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  };
  const category = categories.find((c) => c.id === draft.category_id);

  async function save() {
    if (!draft.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      const body = JSON.stringify({ ...draft, title: draft.title.trim(), slug: draft.slug.trim() || null });
      const saved = current
        ? await adminFetch<Project>(`/projects/${current.id}`, { method: "PATCH", body })
        : await adminFetch<Project>("/projects", { method: "POST", body });
      setDirty(false);
      setCurrent(saved);
      setDraft(pick(saved));
      toast.success(current ? "Project saved — the website updates within seconds" : "Project created");
      if (!current) router.replace(`/projects/${saved.id}`);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!current) return;
    const ok = await confirm({
      title: "Delete project?",
      message: (
        <>
          <strong>{current.title}</strong> and its page will be removed from the website. Its images stay in the Media Library.
        </>
      ),
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await adminFetch(`/projects/${current.id}`, { method: "DELETE" });
      setDirty(false);
      toast.success("Project deleted");
      router.push(`/projects?category=${current.category_id}`);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const liveCategory = categories.find((c) => c.id === current?.category_id);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <PageHeader
        title={current ? current.title : "New project"}
        back={{ href: `/projects?category=${current?.category_id ?? draft.category_id}`, label: "Projects" }}
        actions={
          <>
            {current && liveCategory && (
              <a
                href={`${SITE_URL}/our-work/${liveCategory.slug}/${current.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted hover:text-brand"
              >
                View on site ↗
              </a>
            )}
            {current && (
              <Button variant="danger" onClick={remove}>
                Delete
              </Button>
            )}
            <Button type="submit" loading={saving} disabled={!dirty && !!current}>
              {current ? "Save changes" : "Create project"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel title="Card on the category page">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title *">
                <Input value={draft.title} maxLength={160} required onChange={(e) => set({ title: e.target.value })} />
              </Field>
              <Field label="Category *">
                <Select value={draft.category_id} onChange={(e) => set({ category_id: Number(e.target.value) })}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="URL slug"
                className="md:col-span-2"
                hint={`Website address: /our-work/${category?.slug ?? "…"}/${draft.slug || "…"} · leave empty to generate from the title`}
              >
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
            description="Finishing details and color palette swatches displayed on the back of this project card when flipped on hover."
          >
            <div className="space-y-5">
              <Field
                label="Craft & Finishing Tags"
                hint="Press Enter after each tag (e.g. 'FSC Munken Pure 300gsm', 'Copper Hot Foil', 'Spot Gloss UV', 'Embossed Logotype')."
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

          <Panel title="Project page" description="Title, description and facts beside the intro image.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Description" className="md:col-span-2" hint="Leave empty to use the card text">
                <Textarea rows={4} value={draft.description ?? ""} onChange={(e) => set({ description: orNull(e.target.value) })} />
              </Field>
              <Field label="Client" hint="“Client: ABC Café”">
                <Input value={draft.client ?? ""} maxLength={160} onChange={(e) => set({ client: orNull(e.target.value) })} />
              </Field>
              <Field label="Project" hint="“Project: Paper Cup Design”">
                <Input value={draft.project_type ?? ""} maxLength={160} onChange={(e) => set({ project_type: orNull(e.target.value) })} />
              </Field>
              <Field label="Services" className="md:col-span-2" hint="Shown as “Graphic Design · Printing”. Press Enter after each.">
                <TagInput value={draft.services} onChange={(services) => set({ services })} placeholder="Graphic Design" />
              </Field>
            </div>
          </Panel>

          <Panel title="Gallery">
            <GalleryField
              label="Large images"
              hint="Full-width images down the project page, in this order. Wide images (about 2:1) look best."
              value={draft.gallery}
              onChange={(gallery) => set({ gallery })}
            />
          </Panel>

          <SeoPanel value={draft} onChange={set} fallbackTitle={draft.title || "Project title"} />
        </div>

        <div className="space-y-6">
          <Panel title="Visibility">
            <div className="space-y-3">
              <Toggle checked={draft.is_active} onChange={(is_active) => set({ is_active })} label={draft.is_active ? "Visible on website" : "Hidden from website"} />
              <Toggle checked={draft.is_featured} onChange={(is_featured) => set({ is_featured })} label="Feature in “Explore more projects”" />
              <p className="text-xs text-muted">Featured projects are shown first under other projects’ pages.</p>
            </div>
          </Panel>
          <Panel title="Images">
            <div className="space-y-5">
              <ImageField label="Primary card image" hint="Category grid and “Explore more”. Portrait, about 6:7." value={draft.cover_image} onChange={(cover_image) => set({ cover_image })} aspect="aspect-[6/7]" />
              <ImageField label="Secondary card image" hint="Alternate photo of this work shown when flipped on hover." value={draft.secondary_image} onChange={(secondary_image) => set({ secondary_image })} aspect="aspect-[6/7]" />
              <ImageField label="Intro image" hint="Beside the title on the project page. Leave empty to reuse the card image." value={draft.intro_image} onChange={(intro_image) => set({ intro_image })} />
            </div>
          </Panel>
        </div>
      </div>
    </form>
  );
}
