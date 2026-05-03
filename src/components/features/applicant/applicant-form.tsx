"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/composites/form-field";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isValidEmail, countPhoneDigits, safeNumber, parseSkills, isValidIsoDateOnly, datetimeLocalToIso, formatDateInput, skillsToTextarea } from "@/lib/utils";
import { APPLICANT_STATUS, API_URL_APPLICANT, APPLICANT_APPLIED_ROLE, APPLICANT_APPLIED_ROLE_ENUM } from "@/config/applicant";

const SKILLS_PLACEHOLDER = "React, TypeScript\nSQL";

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
  if (!Number.isInteger(yearsOfExperience)) {
    return { ok: false, error: "Years of experience must be a whole number." };
  }
  if (yearsOfExperience > 80) {
    return { ok: false, error: "Years of experience looks too large." };
  }
  if (!Number.isFinite(expectedSalary) || expectedSalary < 0) {
    return { ok: false, error: "Expected salary must be a valid number." };
  }
  if (!Number.isInteger(expectedSalary)) {
    return { ok: false, error: "Expected salary must be a whole number." };
  }
  if (expectedSalary > 1_000_000_000) {
    return { ok: false, error: "Expected salary looks too large." };
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
  };

  const fullName = String(data.fullName ?? "").trim();
  const email = String(data.email ?? "").trim();
  const phone = String(data.phone ?? "").trim();
  const appliedRole = String(data.appliedRole ?? "").trim();
  const availableStartDate = String(data.availableStartDate ?? "").trim();

  if (!fullName || !email) {
    return { ok: false, error: "Full name and email are required." };
  }
  if (fullName.length < 2) {
    return { ok: false, error: "Full name must be at least 2 characters." };
  }
  if (fullName.length > 120) {
    return { ok: false, error: "Full name must be at most 120 characters." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: "Email must be a valid email address." };
  }
  if (email.length > 254) {
    return { ok: false, error: "Email is too long." };
  }

  if (phone) {
    const digits = countPhoneDigits(phone);
    if (digits < 11 || digits > 15) {
      return {
        ok: false,
        error: "Phone must include at least 11 digits (and at most 15).",
      };
    }
  }

  if (!appliedRole) {
    return { ok: false, error: "Applied role is required." };
  }
  if (appliedRole.length > 120) {
    return { ok: false, error: "Applied role must be at most 120 characters." };
  }

  const status = String(data.status);
  if (!status) {
    return { ok: false, error: "Status is required." };
  }
  if (!(APPLICANT_STATUS as readonly string[]).includes(status)) {
    return {
      ok: false,
      error: `Status must be one of: ${APPLICANT_STATUS.join(", ")}`,
    };
  }
  if (availableStartDate) {
    if (!isValidIsoDateOnly(availableStartDate)) {
      return { ok: false, error: "Available start date must be a valid date." };
    }
  }

  data.fullName = fullName;
  data.email = email;
  data.phone = phone;
  data.appliedRole = appliedRole;
  data.availableStartDate = availableStartDate;

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
  | { mode: "create"; afterSubmitNavigate?: "replace" | "back" }
  | {
      mode: "edit";
      rowId: string;
      initialRow: Record<string, unknown>;
      afterSubmitNavigate?: "replace" | "back";
    };

function ApplicantForm(props: ApplicantFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = props.mode;
  const afterSubmitNavigate = props.afterSubmitNavigate ?? "replace";
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
      const res = await fetch(API_URL_APPLICANT, {
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
      if (afterSubmitNavigate === "back") {
        router.back();
      } else {
        router.replace("/applicant");
      }
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
        ? "Creating..."
        : "Create Applicant"
      : pending
        ? "Saving..."
        : "Save Changes";

  return (
    <form key={formKey} className="mt-6 max-w-xl space-y-4" onSubmit={onSubmit}>
      {error ? (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Container size="flush" className="grid gap-4 sm:grid-cols-2">
        <FormField id={id("fullName")} label="Full name">
          <Input
            required
            id={id("fullName")}
            name="fullName"
            type="text"
            minLength={2}
            maxLength={120}
            autoComplete="name"
            defaultValue={row ? String(row.fullName ?? "") : ""}
          />
        </FormField>

        <FormField id={id("email")} label="Email">
          <Input
            required
            id={id("email")}
            name="email"
            type="email"
            maxLength={254}
            autoComplete="email"
            defaultValue={row ? String(row.email ?? "") : ""}
          />
        </FormField>

        <FormField
          id={id("phone")}
          label="Phone"
          hint="Optional. If provided, include at least 11 digits."
        >
          <Input
            id={id("phone")}
            name="phone"
            type="tel"
            maxLength={40}
            inputMode="tel"
            autoComplete="tel"
            defaultValue={row ? String(row.phone ?? "") : ""}
          />
        </FormField>

        <FormField id={id("appliedRole")} label="Applied Role">
          <Select id={id("appliedRole")} name="appliedRole" defaultValue={row ? String(row.appliedRole ?? "") : ""}>
            {statusExtra ? <option value={statusExtra}>{statusExtra}</option> : null}
            {APPLICANT_APPLIED_ROLE.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
        </Select>
        </FormField>
      </Container>

      <Container size="flush" className="grid gap-4 sm:grid-cols-2">
        <FormField id={id("yearsOfExperience")} label="Years of experience">
          <Input
            id={id("yearsOfExperience")}
            name="yearsOfExperience"
            type="number"
            min={0}
            max={80}
            step={1}
            defaultValue={row ? safeNumber(row.yearsOfExperience, 0) : 0}
          />
        </FormField>
        <FormField id={id("expectedSalary")} label="Expected salary">
          <Input
            id={id("expectedSalary")}
            name="expectedSalary"
            type="number"
            min={0}
            max={1_000_000_000}
            step={1}
            defaultValue={row ? safeNumber(row.expectedSalary, 0) : 0}
          />
        </FormField>
      </Container>

      <FormField id={id("status")} label="Status">
        <Select id={id("status")} name="status" defaultValue={statusValue}>
          {statusExtra ? <option value={statusExtra}>{statusExtra}</option> : null}
          {APPLICANT_STATUS.map((s) => (
            <option key={s} value={s}>
              {APPLICANT_APPLIED_ROLE_ENUM[s as keyof typeof APPLICANT_APPLIED_ROLE_ENUM] ?? s}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField id={id("availableStartDate")} label="Available Start Date">
        <Input
          id={id("availableStartDate")}
          name="availableStartDate"
          type="date"
          defaultValue={row ? formatDateInput(row.availableStartDate) : ""}
        />
      </FormField>

      <FormField id={id("skills")} label="Skills (comma or newline separated)">
        <Textarea
          className="min-h-[100px] py-2"
          id={id("skills")}
          name="skills"
          placeholder={SKILLS_PLACEHOLDER}
          defaultValue={row ? skillsToTextarea(row.skills) : ""}
        />
      </FormField>

      <Container size="flush" className="flex gap-3 pt-2">
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
      </Container>
    </form>
  );
}

export function NewApplicantForm(props: {
  afterSubmitNavigate?: "replace" | "back";
}) {
  return (
    <ApplicantForm
      mode="create"
      afterSubmitNavigate={props.afterSubmitNavigate}
    />
  );
}

export type EditApplicantFormProps = {
  rowId: string;
  row: Record<string, unknown>;
  afterSubmitNavigate?: "replace" | "back";
};

export function EditApplicantForm({
  rowId,
  row,
  afterSubmitNavigate,
}: EditApplicantFormProps) {
  return (
    <ApplicantForm
      mode="edit"
      rowId={rowId}
      initialRow={row}
      afterSubmitNavigate={afterSubmitNavigate}
    />
  );
}
