"use client";

import Link from "next/link";
import { useState } from "react";

import { setMapsConsent, useMapsConsent } from "@/lib/consent";

type Props = { embedUrl: string; address: string; mapUrl: string };

/** Google Map that only loads (and lets Google set cookies) after the visitor agrees. */
export function MapEmbed({ embedUrl, address, mapUrl }: Props) {
  const remembered = useMapsConsent();
  const [once, setOnce] = useState(false);

  if (remembered || once) {
    return (
      <iframe
        src={embedUrl}
        title={`Map: ${address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-72 w-full rounded-media border-0 md:h-[22rem]"
      />
    );
  }

  return (
    <div className="flex h-72 w-full flex-col items-center justify-center gap-4 rounded-media border border-line bg-panel px-6 text-center md:h-[22rem]">
      <span aria-hidden className="text-3xl">📍</span>
      <p className="max-w-md font-sans text-body-lg text-ink">{address}</p>
      <p className="max-w-md font-sans text-small text-muted">
        The map is provided by Google Maps, which may set cookies when it loads.{" "}
        <Link href="/cookies" className="underline hover:text-brand">
          Cookie policy
        </Link>
      </p>
      <div className="flex flex-wrap justify-center gap-2.5">
        <button type="button" onClick={() => setOnce(true)} className="h-10 rounded-pill bg-brand px-6 font-sans text-sm text-white hover:bg-brand-strong">
          Show map
        </button>
        <button
          type="button"
          onClick={() => setMapsConsent(true)}
          className="h-10 rounded-pill border border-ink-soft px-6 font-sans text-sm text-ink hover:bg-white"
        >
          Always show maps
        </button>
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center px-3 font-sans text-sm text-ink underline hover:text-brand">
          Open in Google Maps ↗
        </a>
      </div>
    </div>
  );
}
