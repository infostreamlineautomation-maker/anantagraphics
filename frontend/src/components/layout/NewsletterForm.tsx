"use client";

import { usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

type Status = "idle" | "sending" | "done" | "error";

/** Footer "Email | Join". Posts to the public API; subscribers show up in the CMS. */
export function NewsletterForm() {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch(`${API}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? "").trim(),
          website: String(data.get("website") ?? ""), // honeypot: real visitors leave it empty
          source_page: pathname,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus("done");
      setMessage("Thanks — you’re on the list.");
    } catch {
      setStatus("error");
      setMessage("Couldn’t subscribe right now. Please try again later.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 md:mt-4">
      <div className="flex max-w-xl gap-2 md:gap-3">
        <label htmlFor="newsletter-email" className="sr-only">
          Email
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          className="h-11 min-w-0 flex-1 rounded-pill border border-ink-soft bg-white px-5 font-footer text-base text-ink outline-none placeholder:text-faint focus:border-brand md:h-12 md:px-6"
        />
        {/* Honeypot, hidden from people and screen readers */}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-11 shrink-0 rounded-pill bg-brand px-7 font-footer text-base font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60 md:h-12 md:px-9"
        >
          {status === "sending" ? "…" : "Join"}
        </button>
      </div>
      <p role="status" className={`mt-2 min-h-5 font-footer text-small ${status === "error" ? "text-brand" : "text-muted"}`}>
        {message}
      </p>
    </form>
  );
}
