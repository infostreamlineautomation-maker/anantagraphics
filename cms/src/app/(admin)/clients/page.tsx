"use client";

import Image from "next/image";
import { useState } from "react";

import { ImageField } from "@/components/media/ImageField";
import { type ItemFormProps, ListManager, saveItem } from "@/components/modules/ListManager";
import { Button } from "@/components/ui/Button";
import { Field, Input, orNull, Toggle } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { errorMessage } from "@/lib/hooks";
import { mediaUrl } from "@/lib/media";
import type { Client } from "@/lib/types";

export default function ClientsPage() {
  return (
    <ListManager<Client>
      title="Clients"
      description="Logos in “Our Clients” on the Home and About pages. Drag to reorder."
      path="/clients"
      noun="client"
      label={(c) => c.name}
      emptyText="Add client logos (PNG or JPG on a white background works best)."
      Form={ClientForm}
      summary={(c) => (
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-24 shrink-0 overflow-hidden rounded-card border border-line bg-white">
            <Image src={mediaUrl(c.logo)} alt="" fill sizes="96px" className="object-contain p-1" />
          </div>
          <div className="min-w-0">
            <p className="font-medium">{c.name}</p>
            {c.website && <p className="truncate text-sm text-muted">{c.website}</p>}
          </div>
        </div>
      )}
    />
  );
}

function ClientForm({ item, onCancel, onSaved }: ItemFormProps<Client>) {
  const [name, setName] = useState(item?.name ?? "");
  const [logo, setLogo] = useState<string | null>(item?.logo ?? null);
  const [website, setWebsite] = useState(item?.website ?? "");
  const [isActive, setIsActive] = useState(item?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function save() {
    if (!name.trim()) return toast.error("Enter the client's name");
    if (!logo) return toast.error("Choose a logo");
    setSaving(true);
    try {
      const saved = await saveItem("/clients", item, { name: name.trim(), logo, website: orNull(website.trim()), is_active: isActive });
      toast.success(item ? "Client saved" : "Client added");
      onSaved(saved);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="space-y-4">
        <Field label="Name *" hint="Used as the logo's alt text.">
          <Input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field label="Website" hint="Optional. Makes the logo a link (https://…).">
          <Input type="url" value={website} placeholder="https://" onChange={(e) => setWebsite(e.target.value)} />
        </Field>
      </div>
      <ImageField label="Logo *" value={logo} onChange={setLogo} aspect="aspect-[16/10]" />
      <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-2">
        <Toggle checked={isActive} onChange={setIsActive} label={isActive ? "Shown on website" : "Hidden"} />
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            {item ? "Save" : "Add client"}
          </Button>
        </div>
      </div>
    </div>
  );
}
