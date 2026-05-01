import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getLoggedInUser } from "@/lib/appwrite-server";
import { Button } from "@/components/ui/button";

import { loadApplicant } from "../load-applicant";

type Props = {
  params: Promise<{ id: string }>;
};

function formatValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const FIELD_LABELS: Record<string, string> = {
  fullName: "Full Name",
  email: "Email",
  phone: "Phone",
  address: "Address",
  status: "Status",
  appliedRole: "Applied Role",
  skills: "Skills",
  availableStartDate: "Available Start Date",
  expectedSalary: "Expected Salary",
  yearsOfExperience: "Years of Experience",
  $createdAt: "Created At",
  $updatedAt: "Updated At",
  $id: "Applicant ID",
};

const DISPLAY_ORDER = [
  "fullName",
  "email",
  "phone",
  "address",
  "status",
  "appliedRole",
  "skills",
  "availableStartDate",
  "expectedSalary",
  "yearsOfExperience",
  "$createdAt",
  "$updatedAt",
  "$id",
];

export default async function ApplicantDetailsPage({ params }: Props) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const loaded = await loadApplicant(id);
  if (!loaded.ok) {
    if (loaded.reason === "unauthorized") redirect("/login");
    notFound();
  }

  const row = loaded.row as Record<string, unknown>;

  return (
    <section className="mx-auto w-full max-w-4xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Applicant Details</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/applicant">Back</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/applicant/${id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <dl className="divide-y">
          {DISPLAY_ORDER.map((key) => (
            <div key={key} className="grid grid-cols-1 gap-2 p-4 tablet:grid-cols-3">
              <dt className="text-sm font-medium text-muted-foreground">
                {FIELD_LABELS[key] ?? key}
              </dt>
              <dd className="tablet:col-span-2 break-words">
                {formatValue(row[key])}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
