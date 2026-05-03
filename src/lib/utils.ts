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
  return formatDisplayValue(value);
}
