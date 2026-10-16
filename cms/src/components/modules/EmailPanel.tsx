"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Field, Input, Toggle } from "@/components/ui/Form";
import { Badge, ErrorBox, Loading, Panel } from "@/components/ui/Layout";
import { useToast } from "@/components/ui/Toast";
import { adminFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { errorMessage, useResource } from "@/lib/hooks";

type EmailStatus = {
  configured: boolean;
  host: string;
  port: number;
  ssl: boolean;
  user: string;
  has_password: boolean;
  from_email: string;
  notify_to: string;
  sender: string | null;
  recipients: string[];
};

export function EmailPanel() {
  const { admin } = useAuth();
  const { data, error, loading, reload } = useResource<EmailStatus>("/settings/email");

  const [host, setHost] = useState("");
  const [port, setPort] = useState(465);
  const [ssl, setSsl] = useState(true);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [notifyTo, setNotifyTo] = useState("");

  const [saving, setSaving] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (data) {
      setHost(data.host || "");
      setPort(data.port || 465);
      setSsl(data.ssl ?? true);
      setUser(data.user || "");
      setFromEmail(data.from_email || "");
      setNotifyTo(data.notify_to || "");
      if (!testTo && admin?.email) {
        setTestTo(admin.email);
      }
    }
  }, [data, admin]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      await adminFetch<EmailStatus>("/settings/email", {
        method: "PUT",
        body: JSON.stringify({
          host: host.trim(),
          port: Number(port) || 465,
          ssl: Boolean(ssl),
          user: user.trim(),
          password: password ? password : null,
          from_email: fromEmail.trim(),
          notify_to: notifyTo.trim(),
        }),
      });
      setPassword("");
      toast.success("SMTP settings saved successfully");
      await reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    setSending(true);
    setResult(null);
    try {
      const res = await adminFetch<{ to: string }>("/settings/email/test", {
        method: "POST",
        body: JSON.stringify({ to: testTo.trim() || null }),
      });
      setResult({ ok: true, message: `Test email sent to ${res.to}. Check that inbox (and spam folder).` });
      toast.success("Test email sent");
    } catch (err) {
      setResult({ ok: false, message: errorMessage(err) });
    } finally {
      setSending(false);
    }
  }

  return (
    <Panel
      title="Email notifications & SMTP"
      description="Configure your mail server so new quote requests and contact messages from visitors are automatically emailed to your team."
      actions={
        data && (
          <Badge tone={data.configured ? "green" : "amber"}>
            {data.configured ? "SMTP Configured" : "Not Set Up (Optional)"}
          </Badge>
        )
      }
    >
      {error && <ErrorBox message={error} onRetry={reload} />}
      {loading && !data && <Loading />}

      {data && (
        <div className="space-y-6">
          <form onSubmit={saveSettings} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SMTP Host" hint="e.g. smtp.gmail.com, smtp.hostinger.com, or mail.yourdomain.com">
                <Input
                  type="text"
                  placeholder="smtp.example.com"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Port" hint="Standard: 465 (SSL) or 587 (TLS)">
                  <Input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                  />
                </Field>

                <div className="flex flex-col justify-end pb-2">
                  <Toggle
                    label="Use SSL / TLS"
                    checked={ssl}
                    onChange={(val) => {
                      setSsl(val);
                      if (val && port === 587) setPort(465);
                      if (!val && port === 465) setPort(587);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="SMTP Username" hint="Usually your full email address">
                <Input
                  type="text"
                  placeholder="alerts@yourdomain.com"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
              </Field>

              <Field
                label="SMTP Password"
                hint={data.has_password ? "Password saved. Enter a new password only to change it." : "Enter your mailbox or app password"}
              >
                <Input
                  type="password"
                  placeholder={data.has_password ? "•••••••• (Saved)" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Sender Address (From)"
                hint="e.g. Ananta Graphics <alerts@yourdomain.com>"
              >
                <Input
                  type="text"
                  placeholder="Ananta Graphics <alerts@yourdomain.com>"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                />
              </Field>

              <Field
                label="Alert Recipients (To)"
                hint="Comma-separated emails to receive enquiry alerts"
              >
                <Input
                  type="text"
                  placeholder="info@yourdomain.com, sales@yourdomain.com"
                  value={notifyTo}
                  onChange={(e) => setNotifyTo(e.target.value)}
                />
              </Field>
            </div>

            <div className="flex items-center justify-between border-t border-line pt-4">
              <p className="text-xs text-muted">
                Tip: Enquiries are always safely logged in the CMS regardless of SMTP status.
              </p>
              <Button type="submit" loading={saving}>
                Save SMTP Settings
              </Button>
            </div>
          </form>

          {/* Test Email Section */}
          <div className="rounded-card border border-line bg-surface/50 p-4 space-y-3">
            <h4 className="text-sm font-medium">Send Test Email</h4>
            <p className="text-xs text-muted">
              Verify your mail server connectivity and make sure outgoing alerts land in your inbox.
            </p>
            <div className="flex flex-wrap items-end gap-3 pt-1">
              <Field label="Send test email to" className="min-w-64 flex-1">
                <Input
                  type="email"
                  placeholder="you@yourdomain.com"
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                />
              </Field>
              <Button
                variant="secondary"
                onClick={sendTest}
                loading={sending}
                disabled={!data.configured}
              >
                Send Test Email
              </Button>
            </div>

            {result && (
              <p
                role={result.ok ? "status" : "alert"}
                className={`rounded-card px-3 py-2 text-xs ${
                  result.ok ? "bg-emerald-50 text-emerald-800" : "bg-brand-tint text-brand"
                }`}
              >
                {result.message}
              </p>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}
