import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/appwrite-server";
import {
  getInternalFetchContext,
  internalServerFetchInit,
} from "@/lib/fetch/internal-context";
import { formatDisplayValue, formatFieldValue } from "@/lib/utils";
import { loadApplicant } from "@/app/(dashboard)/applicant/_shared/load-applicant";
import { API_URL_INTERVIEW, type Interview, INTERVIEW_STATUS_ENUM } from "@/config/interview";
import { DISPLAY_ORDER_APPLICANT, VIEW_FIELD_LABELS_APPLICANT } from "@/config/applicant";

type Props = {
  params: Promise<{ id: string }>;
};

type InterviewListResult = {
  rows: Interview[];
  total: number;
};

const DATE_FIELDS = new Set([
  "$createdAt",
  "$updatedAt",
  "scheduledAt",
  "availableStartDate",
]);

async function getInterviewsByApplicant(
  applicantId: string,
): Promise<InterviewListResult> {
  const { origin, cookieHeader } = await getInternalFetchContext();

  const url = `${origin}${API_URL_INTERVIEW}?applicantId=${encodeURIComponent(applicantId)}&limit=20`;
  const res = await fetch(url, internalServerFetchInit(cookieHeader));

  if (res.status === 401) {
    return { rows: [], total: 0 };
  }
  if (!res.ok) {
    return { rows: [], total: 0 };
  }

  return (await res.json()) as InterviewListResult;
}

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
  const interviews = await getInterviewsByApplicant(id);

  return (
    <section className="mx-auto w-full space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Applicant Details</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/applicant">Back</Link>
          </Button>
          <Button asChild>
            <Link href={`/applicant/${id}/edit`} scroll={false}>
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 desktop:grid-cols-2">
        <div className="rounded-md border">
          <dl className="divide-y">
            {DISPLAY_ORDER_APPLICANT.map((key) => (
              <div
                key={key}
                className="grid grid-cols-1 gap-2 p-4 tablet:grid-cols-3"
              >
                <dt className="text-sm font-medium text-muted-foreground">
                  {VIEW_FIELD_LABELS_APPLICANT[key as keyof typeof VIEW_FIELD_LABELS_APPLICANT] ?? key}
                </dt>
                <dd className="break-words tablet:col-span-2">
                  {formatFieldValue(key, row[key], DATE_FIELDS)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-md border">
          <div className="flex items-center justify-between gap-3 border-b p-4">
            <div>
              <h2 className="text-base font-semibold">Related Interviews</h2>
              <p className="text-sm text-muted-foreground">
                Total: {interviews.total}
              </p>
            </div>
            <Button asChild size="sm">
              <Link
                href={`/applicant/${encodeURIComponent(id)}/interview/new`}
                scroll={false}
              >
                Schedule Interview
              </Link>
            </Button>
          </div>

          {interviews.rows.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No interviews assigned yet.
            </p>
          ) : (
            <ul className="divide-y">
              {interviews.rows.map((interview) => (
                <li key={interview.$id} className="space-y-1 p-4 text-sm">
                  <p>
                    <span className="font-medium">Interviewer:</span>{" "}
                    {formatDisplayValue(interview.interviewerId)}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    {INTERVIEW_STATUS_ENUM[interview.status as keyof typeof INTERVIEW_STATUS_ENUM] ?? formatDisplayValue(interview.status) }
                  </p>
                  <p>
                    <span className="font-medium">Scheduled At:</span>{" "}
                    {formatFieldValue(
                      "scheduledAt",
                      interview.scheduledAt,
                      DATE_FIELDS,
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Notes:</span>{" "}
                    {formatDisplayValue(interview.notes)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
