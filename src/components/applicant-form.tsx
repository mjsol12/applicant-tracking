"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APPLICANT_STATUS } from "@/types/enum";

const fieldClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

const SKILLS_PLACEHOLDER = "React, TypeScript\nSQL";

function parseSkills(raw: string): string[] {
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

function datetimeLocalToIso(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function formatDateInput(value: unknown): string {
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

function skillsToTextarea(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(String).join("\n");
  }
  return String(value ?? "");
}

function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

type ExtractResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string };

function extractApplicantPayload(
  fd: FormData,
  options: { statusFallback: string; includeOptionalCreatedAt: boolean },
): ExtractResult {
  const yearsOfExperience = Number(fd.get("yearsOfExperience"));
  const expectedSalary = Number(fd.get("expectedSalary"));
  if (!Number.isFinite(yearsOfExperience) || yearsOfExperience < 0) {
    return { ok: false, error: "Years of experience must be a valid number." };
  }
  if (!Number.isFinite(expectedSalary) || expectedSalary < 0) {
    return { ok: false, error: "Expected salary must be a valid number." };
  }

  const skillsRaw = String(fd.get("skills") ?? "");
  const skills = parseSkills(skillsRaw);

  const data: Record<string, unknown> = {
    fullName: String(fd.get("fullName") ?? "").trim(),
    email: String(fd.get("email") ?? "").trim(),
    phone: String(fd.get("phone") ?? "").trim(),
    appliedRole: String(fd.get("appliedRole") ?? "").trim(),
    yearsOfExperience,
    status: String(fd.get("status") ?? options.statusFallback),
    expectedSalary,
    availableStartDate: String(fd.get("availableStartDate") ?? "").trim(),
    skills,
    notes: String(fd.get("notes") ?? "").trim(),
  };

  if (!data.fullName || !data.email) {
    return { ok: false, error: "Full name and email are required." };
  }

  if (options.includeOptionalCreatedAt) {
    const createdAtLocal = String(fd.get("createdAt") ?? "");
    const createdAt = datetimeLocalToIso(createdAtLocal);
    if (createdAt) {
      data.createdAt = createdAt;
    }
  }

  return { ok: true, data };
}

type ApplicantFormProps =
  | { mode: "create" }
  | { mode: "edit"; rowId: string; initialRow: Record<string, unknown> };

function ApplicantForm(props: ApplicantFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = props.mode;
  const idPrefix = mode === "edit" ? "edit-" : "";
  const id = (suffix: string) => `${idPrefix}${suffix}`;

  const row = mode === "edit" ? props.initialRow : null;
  const formKey = mode === "edit" ? props.rowId : "create";

  const { statusValue, statusExtra } = useMemo(() => {
    if (mode === "edit" && row) {
      const sv = String(row.status ?? APPLICANT_STATUS[0]);
      const extra = !(APPLICANT_STATUS as readonly string[]).includes(sv)
        ? sv
        : null;
      return { statusValue: sv, statusExtra: extra };
    }
    return {
      statusValue: APPLICANT_STATUS[0],
      statusExtra: null as string | null,
    };
  }, [mode, row]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    const extracted = extractApplicantPayload(fd, {
      statusFallback: APPLICANT_STATUS[0],
      includeOptionalCreatedAt: mode === "create",
    });
    if (!extracted.ok) {
      setError(extracted.error);
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/data/applicant", {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body:
          mode === "create"
            ? JSON.stringify({ data: extracted.data })
            : JSON.stringify({
                rowId: props.rowId,
                data: extracted.data,
              }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? `Request failed (${res.status})`);
        return;
      }
      router.push("/applicant");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  const submitLabel =
    mode === "create"
      ? pending
        ? "Creating…"
        : "Create applicant"
      : pending
        ? "Saving…"
        : "Save changes";

  return (
    <form key={formKey} className="mt-6 max-w-xl space-y-4" onSubmit={onSubmit}>
      {error ? (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div>
        <label className={labelClass} htmlFor={id("fullName")}>
          Full name
        </label>
        <input
          required
          className={fieldClass}
          id={id("fullName")}
          name="fullName"
          type="text"
          autoComplete="name"
          defaultValue={row ? String(row.fullName ?? "") : ""}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor={id("email")}>
          Email
        </label>
        <input
          required
          className={fieldClass}
          id={id("email")}
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={row ? String(row.email ?? "") : ""}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor={id("phone")}>
          Phone
        </label>
        <input
          className={fieldClass}
          id={id("phone")}
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={row ? String(row.phone ?? "") : ""}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor={id("appliedRole")}>
          Applied role
        </label>
        <input
          className={fieldClass}
          id={id("appliedRole")}
          name="appliedRole"
          type="text"
          defaultValue={row ? String(row.appliedRole ?? "") : ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={id("yearsOfExperience")}>
            Years of experience
          </label>
          <input
            className={fieldClass}
            id={id("yearsOfExperience")}
            name="yearsOfExperience"
            type="number"
            min={0}
            step={1}
            defaultValue={row ? safeNumber(row.yearsOfExperience, 0) : 0}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={id("expectedSalary")}>
            Expected salary
          </label>
          <input
            className={fieldClass}
            id={id("expectedSalary")}
            name="expectedSalary"
            type="number"
            min={0}
            step={1}
            defaultValue={row ? safeNumber(row.expectedSalary, 0) : 0}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor={id("status")}>
          Status
        </label>
        <select
          className={cn(fieldClass, "h-10")}
          id={id("status")}
          name="status"
          defaultValue={statusValue}
        >
          {statusExtra ? (
            <option value={statusExtra}>{statusExtra}</option>
          ) : null}
          {APPLICANT_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor={id("availableStartDate")}>
          Available start date
        </label>
        <input
          className={fieldClass}
          id={id("availableStartDate")}
          name="availableStartDate"
          type="date"
          defaultValue={row ? formatDateInput(row.availableStartDate) : ""}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor={id("skills")}>
          Skills (comma or newline separated)
        </label>
        <textarea
          className={cn(fieldClass, "min-h-[100px] resize-y py-2")}
          id={id("skills")}
          name="skills"
          placeholder={SKILLS_PLACEHOLDER}
          defaultValue={row ? skillsToTextarea(row.skills) : ""}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor={id("notes")}>
          Notes
        </label>
        <textarea
          className={cn(fieldClass, "min-h-[80px] resize-y py-2")}
          id={id("notes")}
          name="notes"
          defaultValue={row ? String(row.notes ?? "") : ""}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button disabled={pending} type="submit">
          {submitLabel}
        </Button>
        <Button
          disabled={pending}
          type="button"
          variant="outline"
          onClick={() => router.push("/applicant")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function NewApplicantForm() {
  return <ApplicantForm mode="create" />;
}

export type EditApplicantFormProps = {
  rowId: string;
  row: Record<string, unknown>;
};

export function EditApplicantForm({ rowId, row }: EditApplicantFormProps) {
  return <ApplicantForm mode="edit" rowId={rowId} initialRow={row} />;
}
