"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";

import type { Service } from "@/lib/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

type Props = {
  services: Pick<Service, "id" | "title">[];
  submitLabel?: string;
  type?: "contact" | "quote";
};

type FormValues = {
  name: string;
  phone: string;
  email: string;
  serviceId: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;
type FormTouched = Partial<Record<keyof FormValues, boolean>>;

type Status = { state: "idle" | "sending" | "sent" | "error"; message?: string };

const LABEL = "block font-sans text-body text-ink";
const BASE_FIELD =
  "mt-1.5 w-full rounded-lg border bg-panel px-3.5 py-2.5 font-sans text-base text-ink outline-none transition-all duration-200 placeholder:text-faint md:text-small";

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "throwawaymail.com",
  "yopmail.com",
  "sharklasers.com",
  "trashmail.com",
  "getairmail.com",
  "dispostable.com",
]);

export const COUNTRY_LIST = [
  { iso: "IN", code: "+91", name: "India" },
  { iso: "AE", code: "+971", name: "United Arab Emirates" },
  { iso: "US", code: "+1", name: "United States" },
  { iso: "GB", code: "+44", name: "United Kingdom" },
  { iso: "CA", code: "+1", name: "Canada" },
  { iso: "AU", code: "+61", name: "Australia" },
  { iso: "SG", code: "+65", name: "Singapore" },
  { iso: "SA", code: "+966", name: "Saudi Arabia" },
  { iso: "QA", code: "+974", name: "Qatar" },
  { iso: "OM", code: "+968", name: "Oman" },
  { iso: "KW", code: "+965", name: "Kuwait" },
  { iso: "BH", code: "+973", name: "Bahrain" },
  { iso: "DE", code: "+49", name: "Germany" },
  { iso: "FR", code: "+33", name: "France" },
  { iso: "IT", code: "+39", name: "Italy" },
  { iso: "ES", code: "+34", name: "Spain" },
  { iso: "NL", code: "+31", name: "Netherlands" },
  { iso: "CH", code: "+41", name: "Switzerland" },
  { iso: "NZ", code: "+64", name: "New Zealand" },
  { iso: "ZA", code: "+27", name: "South Africa" },
  { iso: "MY", code: "+60", name: "Malaysia" },
  { iso: "ID", code: "+62", name: "Indonesia" },
  { iso: "TH", code: "+66", name: "Thailand" },
  { iso: "PH", code: "+63", name: "Philippines" },
  { iso: "VN", code: "+84", name: "Vietnam" },
  { iso: "JP", code: "+81", name: "Japan" },
  { iso: "KR", code: "+82", name: "South Korea" },
  { iso: "CN", code: "+86", name: "China" },
  { iso: "HK", code: "+852", name: "Hong Kong" },
  { iso: "LK", code: "+94", name: "Sri Lanka" },
  { iso: "NP", code: "+977", name: "Nepal" },
  { iso: "BD", code: "+880", name: "Bangladesh" },
  { iso: "BR", code: "+55", name: "Brazil" },
  { iso: "MX", code: "+52", name: "Mexico" },
  { iso: "EG", code: "+20", name: "Egypt" },
  { iso: "NG", code: "+234", name: "Nigeria" },
  { iso: "KE", code: "+254", name: "Kenya" },
  { iso: "SE", code: "+46", name: "Sweden" },
  { iso: "NO", code: "+47", name: "Norway" },
  { iso: "IE", code: "+353", name: "Ireland" },
];

function validateName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your full name.";
  if (trimmed.length < 2) return "Name must be at least 2 characters.";
  if (trimmed.length > 80) return "Name cannot exceed 80 characters.";
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return "Name can only contain letters, spaces, and standard punctuation.";
  }
  return undefined;
}

function validatePhone(value: string, code: string): string | undefined {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Please enter your phone number.";
  if (code === "+91") {
    if (digits.length !== 10) {
      return `Phone number must be exactly 10 digits (${digits.length}/10 entered).`;
    }
    if (!/^[6-9]/.test(digits)) {
      return "Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.";
    }
  } else {
    if (digits.length < 7 || digits.length > 15) {
      return `Please enter a valid phone number (${digits.length} digits entered, expected 7-15).`;
    }
  }
  return undefined;
}

function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Please enter your email address.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return "Please enter a valid email address (e.g. name@company.com).";
  }
  const domain = trimmed.split("@")[1]?.toLowerCase() || "";
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return "Please use a permanent business or personal email address.";
  }
  return undefined;
}

function validateMessage(value: string, type: "contact" | "quote"): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return type === "quote"
      ? "Please share details about your requirement (quantity, sizes, timeline...)."
      : "Please enter your message.";
  }
  if (trimmed.length < 10) {
    return "Please enter at least 10 characters so we can understand your project.";
  }
  if (trimmed.length > 3000) {
    return "Message cannot exceed 3,000 characters.";
  }
  const urls = (trimmed.match(/https?:\/\/|www\./gi) || []).length;
  if (urls > 1) {
    return "To prevent spam, multiple links or URLs are not permitted.";
  }
  return undefined;
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="mt-1 flex items-center gap-1 font-sans text-xs font-medium text-brand">
      <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0-10a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 5zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
          clipRule="evenodd"
        />
      </svg>
      <span>{error}</span>
    </p>
  );
}

/** "Tell us about your project." Validated with +91 phone formatting and defense-in-depth anti-spam. */
export function ContactForm({ services, submitLabel = "Send Message", type = "contact" }: Props) {
  const pathname = usePathname();
  const formLoadedAt = useRef<number | null>(null);

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  const [country, setCountry] = useState({ iso: "IN", code: "+91" });

  const [values, setValues] = useState<FormValues>({
    name: "",
    phone: "",
    email: "",
    serviceId: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [status, setStatus] = useState<Status>({ state: "idle" });

  // Decoy honeypot states
  const [honeypotWebsite, setHoneypotWebsite] = useState("");
  const [honeypotCompanyUrl, setHoneypotCompanyUrl] = useState("");

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");

    if (country.code === "+91") {
      if (raw.startsWith("91") && raw.length > 10) {
        raw = raw.slice(2);
      } else if (raw.startsWith("0") && raw.length > 10) {
        raw = raw.slice(1);
      }
      raw = raw.slice(0, 10);

      let formatted = raw;
      if (raw.length > 5) {
        formatted = `${raw.slice(0, 5)} ${raw.slice(5)}`;
      }
      setValues((prev) => ({ ...prev, phone: formatted }));
    } else {
      raw = raw.slice(0, 15);
      setValues((prev) => ({ ...prev, phone: raw }));
    }

    if (touched.phone) {
      setErrors((prev) => ({ ...prev, phone: validatePhone(raw, country.code) }));
    }
  };

  const handleBlur = (field: keyof FormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let err: string | undefined;
    if (field === "name") err = validateName(values.name);
    if (field === "phone") err = validatePhone(values.phone, country.code);
    if (field === "email") err = validateEmail(values.email);
    if (field === "message") err = validateMessage(values.message, type);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleResetForm = () => {
    setCountry({ iso: "IN", code: "+91" });
    setValues({ name: "", phone: "", email: "", serviceId: "", message: "" });
    setErrors({});
    setTouched({});
    setStatus({ state: "idle" });
    formLoadedAt.current = Date.now();
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nameErr = validateName(values.name);
    const phoneErr = validatePhone(values.phone, country.code);
    const emailErr = validateEmail(values.email);
    const msgErr = validateMessage(values.message, type);

    const newErrors: FormErrors = {
      name: nameErr,
      phone: phoneErr,
      email: emailErr,
      message: msgErr,
    };
    setErrors(newErrors);
    setTouched({ name: true, phone: true, email: true, message: true, serviceId: true });

    if (nameErr || phoneErr || emailErr || msgErr) {
      return;
    }

    const elapsedMs = formLoadedAt.current ? Date.now() - formLoadedAt.current : undefined;
    const phoneDigits = values.phone.replace(/\D/g, "");
    const normalizedPhone = `${country.code} ${phoneDigits}`;
    const serviceIdNum = Number(values.serviceId);

    setStatus({ state: "sending" });
    try {
      const res = await fetch(`${API_URL}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          phone: normalizedPhone,
          service_id: Number.isInteger(serviceIdNum) && serviceIdNum > 0 ? serviceIdNum : undefined,
          message: values.message.trim(),
          source_page: pathname,
          website: honeypotWebsite.trim() || undefined,
          user_company_url: honeypotCompanyUrl.trim() || undefined,
          elapsed_ms: elapsedMs,
        }),
      });

      if (res.status === 429) throw new Error("Too many messages sent recently — please wait a minute and try again.");
      if (res.status === 422) throw new Error("Please check your details — one or more fields are invalid.");
      if (!res.ok) throw new Error("Something went wrong. Please try again or call us directly.");

      const body = (await res.json()) as { message: string };
      setStatus({ state: "sent", message: body.message });
    } catch (err) {
      const offline = err instanceof TypeError;
      setStatus({
        state: "error",
        message: offline ? "Could not reach the server. Please check your connection and try again." : (err as Error).message,
      });
    }
  }

  if (status.state === "sent") {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl bg-brand-tint p-6 font-sans text-ink border border-brand/20 shadow-xs md:p-8"
      >
        <div className="flex items-start gap-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white text-base font-bold shadow-xs">
            ✓
          </span>
          <div>
            <h3 className="font-sans text-h4 font-semibold text-brand-strong">Message Sent Successfully!</h3>
            <p className="mt-2 text-body text-ink-soft">
              {status.message || "Thank you for reaching out. Our team will review your requirement and get back to you within 24 hours."}
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={handleResetForm}
                className="text-small font-medium text-brand hover:text-brand-strong underline transition-colors"
              >
                Send another message
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const borderFor = (field: keyof FormValues) =>
    touched[field] && errors[field]
      ? "border-brand ring-2 ring-brand/10 bg-white"
      : "border-line focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
      {/* Full Name */}
      <label className={LABEL}>
        <span className="flex items-center justify-between">
          <span>
            Full Name <span className="text-brand">*</span>
          </span>
        </span>
        <input
          name="name"
          value={values.name}
          onChange={(e) => {
            const val = e.target.value;
            setValues((p) => ({ ...p, name: val }));
            if (touched.name) setErrors((p) => ({ ...p, name: validateName(val) }));
          }}
          onBlur={() => handleBlur("name")}
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          placeholder="e.g. Rajesh Sharma"
          aria-invalid={!!(touched.name && errors.name)}
          className={`${BASE_FIELD} ${borderFor("name")}`}
        />
        <FieldError error={touched.name ? errors.name : undefined} />
      </label>

      {/* Phone Number with selectable country code */}
      <label className={LABEL}>
        <span className="flex items-center justify-between">
          <span>
            Phone Number <span className="text-brand">*</span>
          </span>
          <span className="text-xs text-ink-soft">
            {country.code === "+91" ? "10-digit mobile" : "Mobile / phone"}
          </span>
        </span>
        <div
          className={`mt-1.5 flex items-stretch rounded-lg border bg-panel transition-all duration-200 overflow-hidden ${
            touched.phone && errors.phone
              ? "border-brand ring-2 ring-brand/10 bg-white"
              : "border-line focus-within:border-brand focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/10"
          }`}
        >
          {/* Interactive Country Code Selector */}
          <div
            title="Click to select country code"
            className="relative flex items-center shrink-0 border-r border-line bg-panel-tint/60 hover:bg-black/5 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 px-3 py-2.5 text-ink select-none font-sans text-small font-medium">
              <span className="font-semibold text-ink">{country.iso}</span>
              <span className="font-bold text-ink">{country.code}</span>
              <svg
                className="size-3 text-ink-soft transition-transform duration-200 group-hover:text-ink group-hover:translate-y-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <select
              aria-label="Country Dialing Code"
              value={`${country.iso}:${country.code}`}
              onChange={(e) => {
                const [iso, code] = e.target.value.split(":");
                setCountry({ iso, code });
                if (touched.phone) {
                  setErrors((p) => ({ ...p, phone: validatePhone(values.phone, code) }));
                }
              }}
              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
            >
              {COUNTRY_LIST.map((c) => (
                <option key={`${c.iso}-${c.code}`} value={`${c.iso}:${c.code}`}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <input
            type="tel"
            inputMode="numeric"
            name="phone"
            value={values.phone}
            onChange={handlePhoneChange}
            onBlur={() => handleBlur("phone")}
            placeholder={country.code === "+91" ? "98250 12345" : "Enter phone number"}
            autoComplete="tel-national"
            maxLength={country.code === "+91" ? 11 : 16}
            aria-invalid={!!(touched.phone && errors.phone)}
            className="w-full bg-transparent px-3.5 py-2.5 font-sans text-base text-ink outline-none placeholder:text-faint md:text-small"
          />
        </div>
        <FieldError error={touched.phone ? errors.phone : undefined} />
      </label>

      {/* Email Address */}
      <label className={LABEL}>
        <span className="flex items-center justify-between">
          <span>
            Email Address <span className="text-brand">*</span>
          </span>
        </span>
        <input
          name="email"
          type="email"
          value={values.email}
          onChange={(e) => {
            const val = e.target.value;
            setValues((p) => ({ ...p, email: val }));
            if (touched.email) setErrors((p) => ({ ...p, email: validateEmail(val) }));
          }}
          onBlur={() => handleBlur("email")}
          required
          maxLength={120}
          autoComplete="email"
          placeholder="name@company.com"
          aria-invalid={!!(touched.email && errors.email)}
          className={`${BASE_FIELD} ${borderFor("email")}`}
        />
        <FieldError error={touched.email ? errors.email : undefined} />
      </label>

      {/* Service Required */}
      <label className={LABEL}>
        <span className="flex items-center justify-between">
          <span>
            Service Required <span className="text-xs font-normal text-ink-soft">(Optional)</span>
          </span>
        </span>
        <select
          name="service_id"
          value={values.serviceId}
          onChange={(e) => setValues((p) => ({ ...p, serviceId: e.target.value }))}
          className={`${BASE_FIELD} border-line focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/10`}
        >
          <option value="">Select a Service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </label>

      {/* Your Message */}
      <label className={`${LABEL} sm:col-span-2`}>
        <div className="flex items-center justify-between">
          <span>
            Your Message <span className="text-brand">*</span>
          </span>
          <span className="text-xs text-ink-soft">{values.message.length}/3000</span>
        </div>
        <textarea
          name="message"
          rows={5}
          maxLength={3000}
          value={values.message}
          onChange={(e) => {
            const val = e.target.value;
            setValues((p) => ({ ...p, message: val }));
            if (touched.message) setErrors((p) => ({ ...p, message: validateMessage(val, type) }));
          }}
          onBlur={() => handleBlur("message")}
          placeholder={
            type === "quote"
              ? "Please share details about your requirement (quantity, sizes, material, delivery timeline...)"
              : "Tell us about your project or enquiry..."
          }
          aria-invalid={!!(touched.message && errors.message)}
          className={`${BASE_FIELD} resize-y ${borderFor("message")}`}
        />
        <FieldError error={touched.message ? errors.message : undefined} />
      </label>

      {/* Decoy honeypots: invisible to humans, auto-filled by automated spambots */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          opacity: 0,
          width: "1px",
          height: "1px",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <label htmlFor="website-decoy">Website URL</label>
        <input
          id="website-decoy"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypotWebsite}
          onChange={(e) => setHoneypotWebsite(e.target.value)}
        />
        <label htmlFor="company-url-decoy">Company URL</label>
        <input
          id="company-url-decoy"
          name="user_company_url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypotCompanyUrl}
          onChange={(e) => setHoneypotCompanyUrl(e.target.value)}
        />
      </div>

      <AnimatePresence>
        {status.state === "error" && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 rounded-lg bg-brand-tint px-4 py-3 font-sans text-small text-brand border border-brand/20 sm:col-span-2"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0-10a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 5zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                clipRule="evenodd"
              />
            </svg>
            <span>{status.message}</span>
          </motion.div>
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
