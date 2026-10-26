import type { Metadata } from "next";

import { LegalPage } from "@/components/ui/LegalPage";

export const instant = false;
export const metadata: Metadata = { title: "Cookie Policy", alternates: { canonical: "/cookies" } };

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy">
      <p>
        This website doesn’t use advertising or tracking cookies, and we don’t share your browsing with anyone.
      </p>
      <h2>Maps and social links</h2>
      <p>
        Our address and social media icons link to Google Maps, Instagram, Facebook, LinkedIn and YouTube. Those sites
        open in a new tab and follow their own cookie policies; nothing from them is loaded on this website until you
        click.
      </p>
    </LegalPage>
  );
}
