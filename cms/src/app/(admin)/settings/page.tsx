"use client";

import { useState } from "react";

import { ImageField } from "@/components/media/ImageField";
import { EmailPanel } from "@/components/modules/EmailPanel";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { ErrorBox, Loading, PageHeader, Panel } from "@/components/ui/Layout";
import { useToast } from "@/components/ui/Toast";
import { adminFetch } from "@/lib/api";
import { errorMessage, useResource, useUnsavedChanges } from "@/lib/hooks";
import type { Settings } from "@/lib/types";

type FieldDef = {
  key: string;
  label: string;
  kind?: "text" | "textarea" | "image" | "url" | "email" | "tel";
  hint?: string;
  placeholder?: string;
  validate?: (v: string) => string | null;
};

const httpsUrl = (v: string) => (!v || /^https:\/\/[^\s]+$/.test(v) ? null : "Must be a full https:// link");
// A bare "https://www.instagram.com/" sends visitors to Instagram's home page, not to Ananta Graphics
const profileUrl = (v: string) => {
  const invalid = httpsUrl(v);
  if (invalid || !v) return invalid;
  try {
    return new URL(v).pathname.replace(/\/+$/, "") ? null : "Link to your own page, e.g. https://www.instagram.com/yourpage";
  } catch {
    return "Must be a full https:// link";
  }
};
const phoneNumber = (v: string) => (!v || v.replace(/\D/g, "").length >= 10 ? null : "Enter the full number, e.g. +91 98765 43210");

const GROUPS: { key: keyof Settings; title: string; description: string; fields: FieldDef[] }[] = [
  {
    key: "brand",
    title: "Brand",
    description: "Logos used in the header, footer and when sharing links.",
    fields: [
      { key: "name", label: "Business name" },
      { key: "logo_badge", label: "Round badge (header)", kind: "image", hint: "Square image, shown in the middle of the red nav pill." },
      { key: "logo", label: "Full logo (footer)", kind: "image" },
      { key: "tagline", label: "Tagline", placeholder: "Ideas with passion and purpose" },
    ],
  },
  {
    key: "contact",
    title: "Contact details",
    description: "Shown in the footer, the Get In Touch card, the Contact page and the phone menu.",
    fields: [
      {
        key: "phone",
        label: "Phone",
        kind: "tel",
        placeholder: "+91 98765 43210",
        hint: "A 10-digit Indian number is shown on the website as +91 98765 43210.",
        validate: phoneNumber,
      },
      { key: "email", label: "Email", kind: "email" },
      { key: "address", label: "Office address", kind: "textarea" },
      {
        key: "map_url",
        label: "Address link",
        kind: "url",
        hint: "Opens when visitors tap the address (Google Maps → Share → Copy link).",
        validate: httpsUrl,
      },
      {
        key: "map_embed_url",
        label: "Google Maps embed (iframe code or URL)",
        kind: "textarea",
        hint: "From Google Maps: Share → Embed a map → Copy HTML (paste full <iframe> code or src URL here).",
      },
    ],
  },
  {
    key: "socials",
    title: "Social media",
    description: "Shown in the footer, the phone menu, the Contact page and the Get In Touch card. Icons only appear for networks with a link.",
    fields: [
      { key: "instagram", label: "Instagram", kind: "url", placeholder: "https://www.instagram.com/yourpage", validate: profileUrl },
      { key: "facebook", label: "Facebook", kind: "url", placeholder: "https://www.facebook.com/yourpage", validate: profileUrl },
      { key: "linkedin", label: "LinkedIn", kind: "url", placeholder: "https://www.linkedin.com/company/yourpage", validate: profileUrl },
      { key: "youtube", label: "YouTube", kind: "url", placeholder: "https://www.youtube.com/@yourchannel", validate: profileUrl },
    ],
  },
  {
    key: "footer",
    title: "Footer",
    description: "The big footer line, the newsletter text and the copyright.",
    fields: [
      { key: "tagline", label: "Footer headline", kind: "textarea" },
      { key: "newsletter_text", label: "Newsletter line", placeholder: "First access to launches, campaigns, and studio drops." },
      { key: "copyright", label: "Copyright line" },
    ],
  },
  {
    key: "seo",
    title: "Search engines",
    description: "Defaults for pages without their own title and description.",
    fields: [
      { key: "default_title", label: "Default page title" },
      { key: "default_description", label: "Default description", kind: "textarea", hint: "Ideally 120–160 characters." },
      { key: "og_image", label: "Default share image", kind: "image" },
    ],
  },
];

export default function SettingsPage() {
  const { data, error, loading, reload } = useResource<Settings>("/settings");
  return (
    <>
      <PageHeader title="Settings" description="Site-wide details. Each group saves separately." />
      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && (
        <div className="grid gap-6 xl:grid-cols-2">
          {GROUPS.map((g) => (
            <SettingsGroup key={g.key} group={g} initial={data[g.key] ?? {}} />
          ))}
          <EmailPanel />
        </div>
      )}
    </>
  );
}

function SettingsGroup({ group, initial }: { group: (typeof GROUPS)[number]; initial: Record<string, string> }) {
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  useUnsavedChanges(dirty);

  const errors = Object.fromEntries(group.fields.map((f) => [f.key, f.validate?.(values[f.key] ?? "") ?? null]));
  const invalid = Object.values(errors).some(Boolean);
  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));

  async function save() {
    setSaving(true);
    try {
      const updated = await adminFetch<Record<string, string>>(`/settings/${group.key}`, { method: "PUT", body: JSON.stringify({ value: values }) });
      setSaved(updated);
      setValues(updated);
      toast.success(`${group.title} saved`);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel
      title={group.title}
      description={group.description}
      actions={
        <Button size="sm" onClick={save} loading={saving} disabled={!dirty || invalid}>
          Save
        </Button>
      }
    >
      <div className="space-y-4">
        {group.fields.map((f) => {
          const value = values[f.key] ?? "";
          if (f.kind === "image") return <ImageField key={f.key} label={f.label} hint={f.hint} value={value || null} onChange={(url) => set(f.key, url ?? "")} />;
          return (
            <Field key={f.key} label={f.label} hint={f.hint} error={errors[f.key]}>
              {f.kind === "textarea" ? (
                <Textarea rows={3} value={value} onChange={(e) => set(f.key, e.target.value)} />
              ) : (
                <Input
                  type={f.kind === "email" ? "email" : f.kind === "tel" ? "tel" : f.kind === "url" ? "url" : "text"}
                  value={value}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.key, e.target.value.trimStart())}
                />
              )}
            </Field>
          );
        })}
      </div>
    </Panel>
  );
}
