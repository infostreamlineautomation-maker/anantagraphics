"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { Badge, ErrorBox, Loading, Panel } from "@/components/ui/Layout";
import { useToast } from "@/components/ui/Toast";
import { adminFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { errorMessage, useResource } from "@/lib/hooks";

type EmailStatus = { configured: boolean; host: string | null; port: number; ssl: boolean; sender: string | null; recipients: string[] };

/** Read-only view of the SMTP setup (it lives in backend/.env) plus a "send test email" check. */
export function EmailPanel() {
  const { admin } = useAuth();
  const { data, error, loading, reload } = useResource<EmailStatus>("/settings/email");
  const [to, setTo] = useState(admin?.email ?? "");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const toast = useToast();

  async function sendTest() {
    setSending(true);
    setResult(null);
    try {
      const res = await adminFetch<{ to: string }>("/settings/email/test", { method: "POST", body: JSON.stringify({ to: to.trim() || null }) });
      setResult({ ok: true, message: `Sent to ${res.to}. Check that inbox (and spam).` });
      toast.success("Test email sent");
    } catch (e) {
      setResult({ ok: false, message: errorMessage(e) });
    } finally {
      setSending(false);
    }
  }

  return (
    <Panel
      title="Email notifications"
      description="New enquiries are emailed to your team. The mailbox is set in the server file backend/.env (SMTP_* and ENQUIRY_NOTIFY_TO)."
      actions={data && <Badge tone={data.configured ? "green" : "amber"}>{data.configured ? "Set up" : "Not set up"}</Badge>}
    >
      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading && !data && <Loading />}
      {data && (
        <div className="space-y-4 text-sm">
          <dl className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-1.5">
            <dt className="text-muted">Mail server</dt>
            <dd>{data.host ? `${data.host}:${data.port} · SSL ${data.ssl ? "on" : "off"}` : "—"}</dd>
            <dt className="text-muted">Sent from</dt>
            <dd className="break-all">{data.sender ?? "—"}</dd>
            <dt className="text-muted">Alerts go to</dt>
            <dd className="break-all">
              {data.recipients.length ? data.recipients.join(", ") : <span className="text-brand">Nobody yet — set ENQUIRY_NOTIFY_TO</span>}
            </dd>
          </dl>
          {!data.configured && (
            <p className="rounded-card bg-cream px-3 py-2 text-xs text-muted">
              Enquiries are still saved here in the CMS; only the email alert is skipped until the mailbox is set up.
            </p>
          )}
          <div className="flex flex-wrap items-end gap-3 border-t border-line pt-4">
            <Field label="Send a test email to" className="min-w-56 flex-1">
              <Input type="email" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
            <Button onClick={sendTest} loading={sending} disabled={!data.configured}>
              Send test email
            </Button>
          </div>
          {result && (
            <p role={result.ok ? "status" : "alert"} className={`rounded-card px-3 py-2 text-xs ${result.ok ? "bg-emerald-50 text-emerald-800" : "bg-brand-tint text-brand"}`}>
              {result.message}
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}
