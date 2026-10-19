/**
 * Display + dial forms of the CMS phone number. Indian 10-digit numbers get the +91 code and
 * the usual 5-5 grouping ("+91 77336 51240"); numbers that already carry a country code are kept.
 */
export function formatPhone(phone?: string | null): string {
  const raw = (phone ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith("+") && !raw.startsWith("+91")) return raw;
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : raw;
}

/** tel: link for the same number. */
export function phoneHref(phone?: string | null): string {
  return `tel:${formatPhone(phone).replace(/[^\d+]/g, "")}`;
}
