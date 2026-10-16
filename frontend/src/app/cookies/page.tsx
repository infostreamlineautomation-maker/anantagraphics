import type { Metadata } from "next";

import { CookieSettings } from "@/components/consent/CookieSettings";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = { title: "Cookie Policy", alternates: { canonical: "/cookies" } };

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy">
      <p>
        This website doesn’t use advertising or tracking cookies, and we don’t share your browsing with anyone.
      </p>
      <h2>Embedded maps</h2>
      <p>
        The contact page can show a Google Map. Google may set its own cookies when the map loads, so the map only
        appears after you choose to show it. You can change that choice below at any time.
      </p>
      <h2 id="settings" className="scroll-mt-8">
        Cookie settings
      </h2>
      <CookieSettings />
    </LegalPage>
  );
}
