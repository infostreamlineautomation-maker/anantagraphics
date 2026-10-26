import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/Button";

export const instant = false;
export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="container-site py-20 text-center md:py-28">
      <p className="font-display text-hero font-bold text-brand">404</p>
      <h1 className="mt-2 font-sans text-h4 font-medium">We couldn’t find that page</h1>
      <p className="mt-3 font-serif text-body-lg text-muted">It may have moved, or the link may be out of date.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/our-work" arrow>
          See our work
        </ButtonLink>
        <ButtonLink href="/contact" variant="dark">
          Contact us
        </ButtonLink>
      </div>
    </div>
  );
}
