"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const INPUT =
  "mt-1.5 w-full rounded-card border border-white/15 bg-white/5 px-3.5 py-2.5 text-base text-white outline-none transition-colors focus:border-accent md:text-sm";

export default function LoginPage() {
  const { admin, login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (admin) router.replace("/");
  }, [admin, router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");
    setSubmitting(true);
    try {
      await login(String(form.get("email") ?? "").trim(), String(form.get("password") ?? ""));
      router.replace("/");
    } catch (err) {
      const badCredentials = err instanceof ApiError && (err.status === 401 || err.status === 422);
      const limited = err instanceof ApiError && err.status === 429;
      setError(
        badCredentials ? "Invalid email or password." : limited ? "Too many attempts. Wait a minute and try again." : "Could not reach the server. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-brand p-10 text-white lg:flex">
        <div className="w-fit rounded-media bg-white px-5 py-3">
          <Image src="/logo.png" alt="Ananta Graphics" width={900} height={239} preload className="h-auto w-56" />
        </div>
        <div>
          <p className="font-display text-4xl leading-tight font-bold">Visual ideas, made to leave a mark.</p>
          <p className="mt-3 max-w-md font-serif text-lg text-white/85">Content manager for the Ananta Graphics website.</p>
        </div>
        <p className="font-mono text-xs tracking-widest text-white/70 uppercase">Ideas with passion and purpose</p>
      </section>

      <section className="flex flex-col items-center justify-center gap-6 bg-panel p-6">
        <Image src="/logo-badge.png" alt="" width={400} height={400} preload className="size-20 lg:hidden" />
        <form onSubmit={onSubmit} className="w-full max-w-sm rounded-media bg-night-soft p-7 text-white md:p-8">
          <h1 className="font-sans text-3xl font-medium text-accent">Sign in</h1>
          <p className="mt-2 font-alt text-sm text-line">Use your CMS account to continue.</p>

          <label className="mt-6 block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="username" required className={INPUT} />

          <label className="mt-5 block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className={`${INPUT} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute top-1/2 right-1.5 mt-[3px] flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-line hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12" />
                <circle cx="12" cy="12" r="3" />
                {showPassword && <path d="M4 4l16 16" />}
              </svg>
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-card bg-brand/25 px-4 py-2 text-sm text-white">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-7 w-full rounded-pill bg-brand py-2.5 text-base transition-colors hover:bg-brand-strong disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}
