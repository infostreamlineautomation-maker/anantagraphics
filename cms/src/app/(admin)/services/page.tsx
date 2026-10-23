"use client";

import Image from "next/image";
import { useState } from "react";

import { ImageField } from "@/components/media/ImageField";
import { type ItemFormProps, ListManager, saveItem } from "@/components/modules/ListManager";
import { Button } from "@/components/ui/Button";
import { Field, Input, orNull, Textarea, Toggle } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";
import { errorMessage } from "@/lib/hooks";
import { mediaUrl } from "@/lib/media";
import type { Service } from "@/lib/types";

export default function ServicesPage() {
  return (
    <ListManager<Service>
      title="Services"
      description="Cards in the home page “Services We Provide” carousel, and the “Service required” options on the contact form. Drag to reorder."
      path="/services"
      noun="service"
      label={(s) => s.title}
      emptyText="Add the services you offer, e.g. Designing & Printing."
      Form={ServiceForm}
      summary={(s) => (
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-card bg-cream">
            {s.image && <Image src={mediaUrl(s.image)} alt="" fill sizes="56px" className="object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="font-medium">
              {s.client_name ? `${s.client_name} — ` : ""}
              {s.title}
            </p>
            <p className="line-clamp-1 text-sm text-muted">{s.description || "No description"}</p>
          </div>
        </div>
      )}
    />
  );
}

function ServiceForm({ item, onCancel, onSaved }: ItemFormProps<Service>) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [clientName, setClientName] = useState(item?.client_name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [image, setImage] = useState<string | null>(item?.image ?? null);
  const [link, setLink] = useState(item?.link ?? "");
  const [isActive, setIsActive] = useState(item?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function save() {
    if (!title.trim()) return toast.error("Enter a title");
    setSaving(true);
    try {
      const saved = await saveItem("/services", item, {
        title: title.trim(),
        client_name: orNull(clientName.trim()),
        description: orNull(description),
        image,
        link: orNull(link.trim()),
        is_active: isActive,
      });
      toast.success(item ? "Service saved" : "Service added");
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
        <Field label="Service Title *" hint="e.g. Designing & Printing, Packaging Solutions">
          <Input value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </Field>
        <Field label="Client Name" hint="e.g. Kalamandir Jewellers, Mahalaxmi Juice">
          <Input value={clientName} maxLength={120} placeholder="Client name" onChange={(e) => setClientName(e.target.value)} />
        </Field>
        <Field label="Description (2 lines)" hint="Shown on the expanded red card.">
          <Textarea rows={3} value={description} maxLength={1000} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Link" hint="Where “View Project Work” goes, e.g. /our-work/packaging">
          <Input value={link} placeholder="/our-work" onChange={(e) => setLink(e.target.value)} />
        </Field>
      </div>
      <ImageField label="Image" value={image} onChange={setImage} aspect="aspect-[4/5]" />
      <div className="flex flex-wrap items-center justify-between gap-4 md:col-span-2">
        <Toggle checked={isActive} onChange={setIsActive} label={isActive ? "Shown on website" : "Hidden"} />
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            {item ? "Save" : "Add service"}
          </Button>
        </div>
      </div>
    </div>
  );
}
