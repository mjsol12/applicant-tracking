import { APPLICANT_APPLIED_ROLE_ENUM, APPLICANT_STATUS_ENUM } from "@/config/applicant";
import { INTERVIEW_STATUS_ENUM } from "@/config/interview";
import { type ClassValue, clsx } from "clsx";
import { format, isValid, parse, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function addThousandsSeparator(num: number) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function numberToPercentage(num: number) {
  return `${num * 100}%`;
}

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function formatDateValue(value: unknown): string {
  if (value == null || value === "") return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export function formatCellDate(value: unknown): string {
  if (value == null || value === "") return "—";
  const s = String(value).trim();
  if (!s) return "—";

  const d = /^\d{4}-\d{2}-\d{2}$/.test(s)
    ? parse(s, "yyyy-MM-dd", new Date())
    : parseISO(s);

  if (!isValid(d)) return s;
  return format(d, "MMM d, yyyy");
}

export function formatDisplayValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function formatFieldValue(
  key: string,
  value: unknown,
  dateFields: ReadonlySet<string> = new Set([
    "$createdAt",
    "$updatedAt",
    "scheduledAt",
    "availableStartDate",
  ]),
): string {
  if (dateFields.has(key)) return formatDateValue(value);
  if (key === "status") return INTERVIEW_STATUS_ENUM[value as keyof typeof INTERVIEW_STATUS_ENUM] ?? APPLICANT_STATUS_ENUM[value as keyof typeof APPLICANT_STATUS_ENUM];
  if (key === "appliedRole") return APPLICANT_APPLIED_ROLE_ENUM[value as keyof typeof APPLICANT_APPLIED_ROLE_ENUM];
  return formatDisplayValue(value);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return EMAIL_RE.test(email);
}

export function countPhoneDigits(phone: string): number {
  return phone.replace(/\D/g, "").length;
}

export function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function parseSkills(raw: string): string[] {
  const value = raw.trim();
  if (!value) return [];

  if (value.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {
      // fall through
    }
  }

  return value
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function datetimeLocalToIso(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function formatDateInput(value: unknown): string {
  const s = String(value ?? "").trim();
  if (!s) return "";
  if (s.length >= 10 && s[4] === "-" && s[7] === "-") {
    return s.slice(0, 10);
  }
  if (s.includes("T")) {
    return s.slice(0, 10);
  }
  return s;
}

export function skillsToTextarea(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(String).join("\n");
  }
  return String(value ?? "");
}

export function isValidIsoDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00`);
  return !Number.isNaN(d.getTime());
}

export function formatCurrencyValue(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
