"use client";

import { setMapsConsent, useMapsConsent } from "@/lib/consent";

/** "Cookie Settings" (footer link → /cookies#settings): the one optional item is Google Maps. */
export function CookieSettings() {
  const maps = useMapsConsent();

  return (
    <div className="divide-y divide-line rounded-media border border-line bg-white">
      <div className="flex items-start justify-between gap-4 p-4 md:p-5">
        <div>
          <p className="font-medium text-ink">Essential</p>
          <p className="mt-1 text-small text-muted">Needed for the website to work. No tracking or advertising cookies are used.</p>
        </div>
        <span className="shrink-0 rounded-pill bg-panel px-3 py-1 text-small text-muted">Always on</span>
      </div>
      <div className="flex items-start justify-between gap-4 p-4 md:p-5">
        <div>
          <p className="font-medium text-ink">Google Maps</p>
          <p className="mt-1 text-small text-muted">Shows the map on the contact page. Google may set its own cookies when the map loads.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={maps}
          aria-label="Allow Google Maps"
          onClick={() => setMapsConsent(!maps)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${maps ? "bg-brand" : "bg-line"}`}
        >
          <span className={`absolute top-0.5 left-0 size-5 rounded-full bg-white shadow transition-transform ${maps ? "translate-x-5.5" : "translate-x-0.5"}`} />
        </button>
      </div>
      <p role="status" className="p-4 text-small text-muted md:px-5">
        {maps ? "Maps are allowed in this browser." : "Maps load only when you choose “Show map”."} Your choice is stored only in this browser.
      </p>
    </div>
  );
}
