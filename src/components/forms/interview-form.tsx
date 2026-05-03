"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INTERVIEW_STATUS, API_URL_INTERVIEW } from "@/config/interview";

const fieldClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

function datetimeLocalToIso(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

type NewInterviewFormProps = {
  applicantId?: string;
};

export function NewInterviewForm({ applicantId = "" }: NewInterviewFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const nextApplicantId = String(fd.get("applicantId") ?? "").trim();
    const interviewerId = String(fd.get("interviewerId") ?? "").trim();
    const status = String(fd.get("status") ?? INTERVIEW_STATUS[0]).trim();
    const notes = String(fd.get("notes") ?? "").trim();
    const scheduledAtLocal = String(fd.get("scheduledAt") ?? "");
    const scheduledAt = datetimeLocalToIso(scheduledAtLocal);

    if (!nextApplicantId) {
      setError("Applicant ID is required.");
      return;
    }

    if (!interviewerId) {
      setError("Interviewer ID is required.");
      return;
    }

    if (!(INTERVIEW_STATUS as readonly string[]).includes(status)) {
      setError(`Status must be one of: ${INTERVIEW_STATUS.join(", ")}`);
      return;
    }

    const data: Record<string, unknown> = {
      applicantId: nextApplicantId,
      interviewerId,
      status,
      notes,
    };
    if (scheduledAt) {
      data.scheduledAt = scheduledAt;
    }

    setPending(true);
    try {
      const res = await fetch(API_URL_INTERVIEW, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ data }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? `Request failed (${res.status})`);
        return;
      }

      router.push(`/applicant/${encodeURIComponent(nextApplicantId)}`);
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

      <div hidden={true}>
        <label className={labelClass} htmlFor="applicantId">
          Applicant ID
        </label>
        <input
          required
          className={fieldClass}
          id="applicantId"
          name="applicantId"
          type="text"
          defaultValue={applicantId}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="interviewerId">
          Interviewer
        </label>
        <input
          required
          className={fieldClass}
          id="interviewerId"
          name="interviewerId"
          type="text"
          placeholder="Name Only Temporary"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="status">
          Status
        </label>
        <select
          className={cn(fieldClass, "h-10")}
          id="status"
          name="status"
          defaultValue={INTERVIEW_STATUS[0]}
        >
          {INTERVIEW_STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="scheduledAt">
          Scheduled at
        </label>
        <input
          className={fieldClass}
          id="scheduledAt"
          name="scheduledAt"
          type="datetime-local"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="notes">
          Notes
        </label>
        <textarea
          className={cn(fieldClass, "min-h-[90px] resize-y py-2")}
          id="notes"
          name="notes"
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button disabled={pending} type="submit">
          {pending ? "Creating..." : "Create interview"}
        </Button>
        <Button
          disabled={pending}
          type="button"
          variant="outline"
          onClick={() => {
            if (applicantId) {
              router.push(`/applicant/${encodeURIComponent(applicantId)}`);
              return;
            }
            router.push("/applicant");
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
