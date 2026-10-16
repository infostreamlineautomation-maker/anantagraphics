import Link from "next/link";
import type { ReactNode } from "react";

import { getSettings } from "@/lib/api";

/** Policy page shell. The text is a starting point until the client supplies their final policy. */
export async function LegalPage({ title, children }: { title: string; children?: ReactNode }) {
  const { contact, brand } = await getSettings();
  return (
    <article className="container-site max-w-3xl pt-4 pb-16 md:pb-24">
      <h1 className="font-display text-section font-bold text-brand">{title}</h1>
      <div className="mt-6 space-y-4 font-sans text-body-lg text-ink-soft [&_h2]:pt-3 [&_h2]:font-medium [&_h2]:text-title [&_h2]:text-ink">
        {children}
        <p>
          Questions? Email{" "}
          <a href={`mailto:${contact.email}`} className="text-brand underline">
            {contact.email}
          </a>{" "}
          or <Link href="/contact" className="text-brand underline">contact {brand.name}</Link>.
        </p>
      </div>
    </article>
  );
}
