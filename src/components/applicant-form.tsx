"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APPLICANT_STATUS } from "@/types/enum";
import { useRouter } from "next/navigation";
import { useState } from "react";

const fieldClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

function parseSkills(raw: string): string[] {
  const value = raw.trim();
  if (!value) return [];

  // Allow JSON input like ["React","TypeScript"].
  if (value.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((s) => String(s).trim())
          .filter(Boolean);
      }
    } catch {
      // Fall back to comma/newline parsing below.
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

export function NewApplicantForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    const yearsOfExperience = Number(fd.get("yearsOfExperience"));
    const expectedSalary = Number(fd.get("expectedSalary"));
    if (!Number.isFinite(yearsOfExperience) || yearsOfExperience < 0) {
      setError("Years of experience must be a valid number.");
      return;
    }
    if (!Number.isFinite(expectedSalary) || expectedSalary < 0) {
      setError("Expected salary must be a valid number.");
      return;
    }

    const skillsRaw = String(fd.get("skills") ?? "");
    const skills = parseSkills(skillsRaw);
    const createdAtLocal = String(fd.get("createdAt") ?? "");
    const createdAt = datetimeLocalToIso(createdAtLocal);

    const data: Record<string, unknown> = {
      fullName: String(fd.get("fullName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      appliedRole: String(fd.get("appliedRole") ?? "").trim(),
      yearsOfExperience,
      status: String(fd.get("status") ?? "pending"),
      expectedSalary,
      availableStartDate: String(fd.get("availableStartDate") ?? "").trim(),
      skills,
      notes: String(fd.get("notes") ?? "").trim(),
    };

    if (createdAt) {
      data.createdAt = createdAt;
    }

    if (!data.fullName || !data.email) {
      setError("Full name and email are required.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/data/applicant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ data }),
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

  return (
    <form className="mt-6 max-w-xl space-y-4" onSubmit={onSubmit}>
      {error ? (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div>
        <label className={labelClass} htmlFor="fullName">
          Full name
        </label>
        <input
          required
          className={fieldClass}
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="email">
          Email
        </label>
        <input
          required
          className={fieldClass}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="phone">
          Phone
        </label>
        <input
          className={fieldClass}
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="appliedRole">
          Applied role
        </label>
        <input
          className={fieldClass}
          id="appliedRole"
          name="appliedRole"
          type="text"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="yearsOfExperience">
            Years of experience
          </label>
          <input
            className={fieldClass}
            id="yearsOfExperience"
            name="yearsOfExperience"
            type="number"
            min={0}
            step={1}
            defaultValue={0}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="expectedSalary">
            Expected salary
          </label>
          <input
            className={fieldClass}
            id="expectedSalary"
            name="expectedSalary"
            type="number"
            min={0}
            step={1}
            defaultValue={0}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="status">
          Status
        </label>
        <select
          className={cn(fieldClass, "h-10")}
          id="status"
          name="status"
          defaultValue="pending"
        >
          {APPLICANT_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="availableStartDate">
          Available start date
        </label>
        <input
          className={fieldClass}
          id="availableStartDate"
          name="availableStartDate"
          type="date"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="skills">
          Skills (comma or newline separated)
        </label>
        <textarea
          className={cn(fieldClass, "min-h-[100px] resize-y py-2")}
          id="skills"
          name="skills"
          placeholder="React, TypeScript&#10;SQL"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="notes">
          Notes
        </label>
        <textarea
          className={cn(fieldClass, "min-h-[80px] resize-y py-2")}
          id="notes"
          name="notes"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button disabled={pending} type="submit">
          {pending ? "Creating…" : "Create applicant"}
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
