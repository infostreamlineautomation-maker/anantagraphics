import type { Metadata } from "next";

import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        When you send us a message or join our newsletter, we store the details you enter (name, email, phone,
        the service you’re interested in and your message) so we can reply and keep you updated.
      </p>
      <h2>How we use it</h2>
      <p>
        We use your details only to respond to your enquiry, prepare quotes and, if you joined the newsletter, send
        occasional updates. We don’t sell your information. You can ask us to update or delete it at any time.
      </p>
      <h2>Security</h2>
      <p>Your information is stored on secured servers and is only accessible to our team.</p>
    </LegalPage>
  );
}
