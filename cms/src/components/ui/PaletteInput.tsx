"use client";

import { useState } from "react";

const PRESETS = ["#BB1E23", "#EE3050", "#D4AF37", "#4A5A72", "#1C1C24", "#F5F2EB", "#00A3E0", "#D97724"];

/** Interactive Color Swatches Input with color picker and brand presets */
export function PaletteInput({
  value = [],
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [newColor, setNewColor] = useState("#BB1E23");

  const addColor = (hex: string) => {
    const formatted = hex.toUpperCase().trim();
    if (formatted && !value.includes(formatted)) {
      onChange([...value, formatted]);
    }
  };

  const removeColor = (hex: string) => {
    onChange(value.filter((c) => c !== hex));
  };

  return (
    <div className="space-y-3">
      {/* Current Swatches */}
      <div className="flex flex-wrap items-center gap-2">
        {value.map((hex) => (
          <div
            key={hex}
            className="flex items-center gap-1.5 rounded-full border border-line bg-white py-1 pr-2.5 pl-1.5 shadow-xs"
          >
            <span
              className="size-5 rounded-full border border-black/10 shadow-inner"
              style={{ backgroundColor: hex }}
            />
            <span className="font-mono text-xs font-medium text-ink">{hex}</span>
            <button
              type="button"
              onClick={() => removeColor(hex)}
              className="ml-1 text-muted hover:text-brand font-bold text-xs leading-none"
              title={`Remove ${hex}`}
            >
              ×
            </button>
          </div>
        ))}

        {/* Add custom color */}
        <div className="flex items-center gap-1.5 rounded-full border border-dashed border-line bg-panel py-0.5 pr-2 pl-1">
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="size-6 cursor-pointer border-0 bg-transparent p-0 rounded-full"
            title="Pick color"
          />
          <button
            type="button"
            onClick={() => addColor(newColor)}
            className="text-xs font-medium text-ink hover:text-brand px-1"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center gap-1.5 pt-1">
        <span className="text-[0.6875rem] text-muted font-medium">Quick presets:</span>
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => addColor(p)}
            className="size-4.5 rounded-full border border-black/15 transition-transform hover:scale-125 focus:outline-none"
            style={{ backgroundColor: p }}
            title={`Add ${p}`}
          />
        ))}
      </div>
    </div>
  );
}
