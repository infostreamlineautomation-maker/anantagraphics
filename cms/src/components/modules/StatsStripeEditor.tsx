"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Toggle } from "@/components/ui/Form";
import type { JsonObject, JsonValue } from "@/lib/types";

export type CounterItem = {
  id: string;
  value: string;
  label: string;
  enabled: boolean;
};

type Props = {
  value: JsonObject;
  onChange: (value: JsonObject) => void;
};

const DEFAULT_COUNTERS: CounterItem[] = [
  { id: "total", value: "10M+", label: "Total Pieces Crafted", enabled: true },
  { id: "cities", value: "25+", label: "Cities Covered", enabled: true },
  { id: "projects", value: "500+", label: "Projects Completed", enabled: true },
  { id: "clients", value: "150+", label: "Happy Clients", enabled: true },
];

const PRESETS = [
  { label: "Total Pieces Crafted", defaultValue: "10M+" },
  { label: "Cities Covered", defaultValue: "25+" },
  { label: "Projects Completed", defaultValue: "500+" },
  { label: "Happy Clients", defaultValue: "150+" },
  { label: "Years of Excellence", defaultValue: "15+" },
  { label: "Export Countries", defaultValue: "8+" },
];

function parseItems(value: JsonObject): CounterItem[] {
  if (Array.isArray(value.items) && value.items.length > 0) {
    return (value.items as JsonObject[]).map((raw, idx) => ({
      id: typeof raw.id === "string" ? raw.id : `counter_${idx}`,
      value: typeof raw.value === "string" ? raw.value : "",
      label: typeof raw.label === "string" ? raw.label : "",
      enabled: raw.enabled !== false,
    }));
  }

  // Fallback from legacy flat keys if items[] doesn't exist yet
  const totalVal = (value.total_value as string) || "10M+";
  const totalLbl = (value.total_label as string) || "Total Pieces Crafted";
  const citiesVal = (value.cities_value as string) || "25+";
  const citiesLbl = (value.cities_label as string) || "Cities Covered";
  const projectsVal = (value.projects_value as string) || "500+";
  const projectsLbl = (value.projects_label as string) || "Projects Completed";
  const clientsVal = (value.clients_value as string) || "150+";
  const clientsLbl = (value.clients_label as string) || "Happy Clients";

  return [
    { id: "total", value: totalVal, label: totalLbl, enabled: true },
    { id: "cities", value: citiesVal, label: citiesLbl, enabled: true },
    { id: "projects", value: projectsVal, label: projectsLbl, enabled: true },
    { id: "clients", value: clientsVal, label: clientsLbl, enabled: true },
  ];
}

export function StatsStripeEditor({ value, onChange }: Props) {
  const items = parseItems(value);

  const commit = (nextItems: CounterItem[]) => {
    // Keep legacy flat keys updated for full backwards compatibility
    const totalItem = nextItems.find((i) => i.id === "total" || i.label.toLowerCase().includes("total"));
    const citiesItem = nextItems.find((i) => i.id === "cities" || i.label.toLowerCase().includes("cit"));
    const projectsItem = nextItems.find((i) => i.id === "projects" || i.label.toLowerCase().includes("proj"));
    const clientsItem = nextItems.find((i) => i.id === "clients" || i.label.toLowerCase().includes("client"));

    onChange({
      ...value,
      items: nextItems as unknown as JsonValue[],
      total_value: totalItem ? totalItem.value : (value.total_value ?? "10M+"),
      total_label: totalItem ? totalItem.label : (value.total_label ?? "Total Pieces Crafted"),
      cities_value: citiesItem ? citiesItem.value : (value.cities_value ?? "25+"),
      cities_label: citiesItem ? citiesItem.label : (value.cities_label ?? "Cities Covered"),
      projects_value: projectsItem ? projectsItem.value : (value.projects_value ?? "500+"),
      projects_label: projectsItem ? projectsItem.label : (value.projects_label ?? "Projects Completed"),
      clients_value: clientsItem ? clientsItem.value : (value.clients_value ?? "150+"),
      clients_label: clientsItem ? clientsItem.label : (value.clients_label ?? "Happy Clients"),
    });
  };

  const updateItem = (index: number, patch: Partial<CounterItem>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    commit(next);
  };

  const toggleKeep = (index: number) => {
    const current = items[index];
    updateItem(index, { enabled: !current.enabled });
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    commit(next);
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    commit(next);
  };

  const addItem = (preset?: { label: string; defaultValue: string }) => {
    const newItem: CounterItem = {
      id: `counter_${Date.now()}`,
      label: preset ? preset.label : "Custom Metric",
      value: preset ? preset.defaultValue : "100+",
      enabled: true,
    };
    commit([...items, newItem]);
  };

  const activeItems = items.filter((i) => i.enabled);

  return (
    <div className="space-y-6">
      {/* Live Preview Box */}
      <div className="rounded-card border border-line bg-stone-50/80 p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 text-xs font-semibold text-muted tracking-wide uppercase">
          <span>Live Landing Page Stripe Preview</span>
          <span className="font-medium normal-case text-ink">
            {activeItems.length} of {items.length} counters kept active
          </span>
        </div>

        {activeItems.length > 0 ? (
          <div className="overflow-x-auto py-2">
            <div className="relative mx-auto rounded-xl md:rounded-2xl bg-brand px-5 py-3 md:py-3.5 shadow-[0_8px_24px_rgb(0_0_0/0.16)] text-white border border-white/20 min-w-[320px] max-w-2xl">
              <div
                className={`grid gap-2 text-center divide-white/20`}
                style={{
                  gridTemplateColumns: `repeat(${activeItems.length}, minmax(0, 1fr))`,
                }}
              >
                {activeItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`px-3 ${
                      idx !== 0 ? "border-l border-white/20" : ""
                    }`}
                  >
                    <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
                      {item.value || "—"}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-medium text-white/90 truncate mt-0.5">
                      {item.label || "Untitled Metric"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-line bg-white p-6 text-center text-sm text-muted">
            All counters are turned off. The floating stripe will not be visible on the landing page.
          </div>
        )}
      </div>

      {/* Preset helpers */}
      <div className="rounded-card border border-line/60 bg-cream/40 p-4">
        <div className="text-xs font-semibold uppercase text-muted tracking-wide mb-2">
          Quick-Add Standard Metrics
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => addItem(preset)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink transition-colors hover:border-brand hover:text-brand shadow-xs"
            >
              <span>+</span>
              <span>{preset.label}</span>
              <span className="text-muted text-[10px]">({preset.defaultValue})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Counter List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">
            Configured Counters ({items.length})
          </h3>
          <Button size="sm" variant="secondary" onClick={() => addItem()}>
            + Add Custom Counter
          </Button>
        </div>

        <ol className="space-y-4">
          {items.map((item, idx) => (
            <li
              key={item.id}
              className={`rounded-card border transition-colors p-4 sm:p-5 ${
                item.enabled
                  ? "border-line bg-white shadow-xs"
                  : "border-line/60 bg-stone-50/70 opacity-70"
              }`}
            >
              {/* Header row: Status, Keep Toggle, Move, Delete */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                      item.enabled
                        ? "bg-brand text-white"
                        : "bg-line text-muted"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-sm text-ink">
                    {item.label || `Counter ${idx + 1}`}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      item.enabled
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-stone-100 text-stone-500 border border-stone-200"
                    }`}
                  >
                    {item.enabled ? "Active on Stripe" : "Hidden"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Toggle
                    checked={item.enabled}
                    onChange={() => toggleKeep(idx)}
                    label={item.enabled ? "Keep counter" : "Don't keep"}
                  />

                  <div className="h-4 w-px bg-line" />

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, idx - 1)}
                      title="Move counter left"
                      className="px-2 py-1 text-xs rounded border border-line bg-white hover:bg-stone-50 disabled:opacity-30"
                    >
                      ▲ Left
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => moveItem(idx, idx + 1)}
                      title="Move counter right"
                      className="px-2 py-1 text-xs rounded border border-line bg-white hover:bg-stone-50 disabled:opacity-30"
                    >
                      ▼ Right
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      title="Delete counter"
                      className="ml-1 px-2 py-1 text-xs rounded border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Counter Input Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Counter Type / Metric Description"
                  hint="The label appearing below the number (e.g. Cities Covered, Projects Completed)."
                >
                  <Input
                    value={item.label}
                    onChange={(e) => updateItem(idx, { label: e.target.value })}
                    placeholder="e.g. Cities Covered"
                  />
                </Field>

                <Field
                  label="Counter Value / Target Number"
                  hint="The number or metric that counts up (e.g. 10M+, 500+, 25+, 150+)."
                >
                  <Input
                    value={item.value}
                    onChange={(e) => updateItem(idx, { value: e.target.value })}
                    placeholder="e.g. 25+ or 10M+"
                  />
                </Field>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
