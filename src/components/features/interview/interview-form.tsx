"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormField } from "@/components/composites/form-field";
import { Button } from "@/components/ui/button";
import { Input, inputClassName } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { INTERVIEW_STATUS, API_URL_INTERVIEW } from "@/config/interview";

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

      <FormField id="applicantId" label="Applicant ID" hideLabel className="hidden">
        <Input
          required
          id="applicantId"
          name="applicantId"
          type="text"
          defaultValue={applicantId}
        />
      </FormField>

      <FormField id="interviewerId" label="Interviewer">
        <Input
          required
          id="interviewerId"
          name="interviewerId"
          type="text"
          placeholder="Name Only Temporary"
        />
      </FormField>

      <FormField id="status" label="Status">
        <select
          className={cn(inputClassName, "h-10")}
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
      </FormField>

      <FormField id="scheduledAt" label="Scheduled at">
        <Input id="scheduledAt" name="scheduledAt" type="datetime-local" />
      </FormField>

      <FormField id="notes" label="Notes">
        <Textarea className="min-h-[90px] py-2" id="notes" name="notes" required />
      </FormField>

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
