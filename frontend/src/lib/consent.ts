"use client";

import { useSyncExternalStore } from "react";

/**
 * Visitor's choice about embedded third-party content. The site itself sets no tracking or
 * advertising cookies; the only third party is the Google Map on the contact page, which loads
 * only after consent. Stored in this browser only (localStorage), never sent to our server.
 */
const KEY = "ag-consent-maps";
const EVENT = "ag-consent-change";

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "granted";
  } catch {
    return false; // storage blocked (private mode, settings): ask each time
  }
}

export function setMapsConsent(granted: boolean): void {
  try {
    if (granted) window.localStorage.setItem(KEY, "granted");
    else window.localStorage.removeItem(KEY);
  } catch {
    // storage blocked: the choice simply isn't remembered
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** `true` once the visitor allowed Google Maps. Always `false` during server rendering. */
export function useMapsConsent(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}
