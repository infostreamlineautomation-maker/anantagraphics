"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";

import type { Service } from "@/lib/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

type Props = {
  services: Pick<Service, "id" | "title">[];
  submitLabel?: string;
  type?: "contact" | "quote";
};

type Status = { state: "idle" | "sending" | "sent" | "error"; message?: string };

const LABEL = "block font-sans text-body text-ink";
const FIELD =
  "mt-1.5 w-full rounded-lg border border-line bg-panel px-3.5 py-2.5 font-sans text-base text-ink outline-none transition-all duration-200 placeholder:text-faint focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10 md:text-small";

/** "Tell us about your project." Posts to the public API; arrives in the CMS inbox. */
export function ContactForm({ services, submitLabel = "Send Message", type = "contact" }: Props) {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const value = (k: string) => String(data.get(k) ?? "").trim() || undefined;
    const serviceId = Number(value("service_id"));

    setStatus({ state: "sending" });
    try {
      const res = await fetch(`${API_URL}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: value("name"),
          email: value("email"),
          phone: value("phone"),
          service_id: Number.isInteger(serviceId) && serviceId > 0 ? serviceId : undefined,
          message: value("message"),
          source_page: pathname,
          website: value("website"),
        }),
      });
      if (res.status === 429) throw new Error("Too many messages in a short time — please try again in a minute.");
      if (res.status === 422) throw new Error("Please check your details — the email or phone number looks invalid.");
      if (!res.ok) throw new Error("Something went wrong. Please try again, or call or email us directly.");
      const body = (await res.json()) as { message: string };
      form.reset();
      setStatus({ state: "sent", message: body.message });
    } catch (err) {
      const offline = err instanceof TypeError; // fetch failed: network down or API unreachable
      setStatus({
        state: "error",
        message: offline ? "We couldn’t send your message. Check your connection and try again." : (err as Error).message,
      });
    }
  }

  if (status.state === "sent") {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-lg bg-brand-tint p-6 font-sans text-body-lg text-ink border border-brand/20 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-7 items-center justify-center rounded-full bg-brand text-white text-sm font-bold">✓</span>
          <p className="font-medium text-brand-strong">Message sent.</p>
        </div>
        <p className="mt-2 text-body text-ink-soft">{status.message}</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
      <label className={LABEL}>
        Full Name
        <input name="name" required minLength={2} maxLength={150} autoComplete="name" placeholder="Enter Your Name*" className={FIELD} />
      </label>
      <label className={LABEL}>
        Phone Number
        {/* No `pattern`: browsers compile it in unicode-sets mode, where this class is invalid; the API validates */}
        <input name="phone" type="tel" inputMode="tel" maxLength={40} autoComplete="tel" placeholder="Enter Your Phone Number" className={FIELD} />
      </label>
      <label className={LABEL}>
        Email Address
        <input name="email" type="email" required maxLength={255} autoComplete="email" placeholder="Enter Your Email*" className={FIELD} />
      </label>
      <label className={LABEL}>
        Service Required
        <select name="service_id" defaultValue="" className={FIELD}>
          <option value="">Select a Service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </label>
      <label className={`${LABEL} sm:col-span-2`}>
        Your Message
        <textarea
          name="message"
          rows={6}
          maxLength={5000}
          placeholder={type === "quote" ? "What would you like a quote for? Quantities, sizes, timeline…" : "Tell us about your project"}
          className={`${FIELD} resize-y`}
        />
      </label>

      {/* Honeypot: hidden from people, filled by bots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <AnimatePresence>
        {status.state === "error" && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-lg bg-brand-tint px-4 py-3 font-sans text-small text-brand border border-brand/20 sm:col-span-2"
          >
            {status.message}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="sm:col-span-2">
        <motion.button
          type="submit"
          disabled={status.state === "sending"}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="h-11 w-full rounded-pill bg-brand px-9 font-sans text-[0.9375rem] font-medium text-white shadow-xs transition-colors hover:bg-brand-strong hover:shadow-md disabled:opacity-60 sm:w-auto"
        >
          {status.state === "sending" ? "Sending…" : submitLabel}
        </motion.button>
      </div>
    </form>
  );
}

/** Reads ?type=quote (from "Request Quote" buttons). Render inside <Suspense> with a plain <ContactForm> fallback. */
export function ContactFormFromUrl(props: Omit<Props, "type">) {
  const type = useSearchParams().get("type") === "quote" ? "quote" : "contact";
  return <ContactForm {...props} type={type} />;
}
