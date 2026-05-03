import Link from "next/link";
import { redirect } from "next/navigation";
import { getLoggedInUser } from "@/lib/appwrite-server";
import { fetchJson } from "@/lib/fetch/fetch-json";
import {
  getInternalFetchContext,
  internalServerFetchInit,
} from "@/lib/fetch/internal-context";
import { formatFieldValue } from "@/lib/utils";
import { Container } from "@/components/ui/container";

type ApplicantStatus = "applied" | "interview" | "hired" | "rejected";

type RowLike = {
  $id: string;
  fullName?: string;
  appliedRole?: string;
  status?: string;
  scheduledAt?: string;
  applicantId?: string;
  interviewerId?: string;
};

type DashboardData = {
  totalApplicants: number;
  applicantsPerStatus: Record<ApplicantStatus, number>;
  recentApplicants: RowLike[];
  upcomingInterviews: RowLike[];
};

const statusLabelMap: Record<ApplicantStatus, string> = {
  applied: "Applied",
  interview: "Interview",
  hired: "Hired",
  rejected: "Rejected",
};

async function getDashboardData(): Promise<DashboardData> {
  const { origin, cookieHeader } = await getInternalFetchContext();

  return fetchJson<DashboardData>(
    `${origin}/api/data/dashboard`,
    internalServerFetchInit(cookieHeader),
    {
      fallbackMessage: "Failed to load dashboard data",
      onUnauthorized: () => redirect("/login"),
    },
  );
}

export default async function DashboardPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const dashboardData = await getDashboardData();
  const DATE_FIELDS = new Set(["scheduledAt"]);

  return (
    <Container size="full" query={true} className="space-y-6 px-4 py-4">
      <h1 className="text-lg font-medium">Dashboard</h1>

      <Container className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Container size="full" className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Total applicants</p>
          <p className="mt-2 text-2xl font-semibold">
            {dashboardData.totalApplicants}
          </p>
        </Container>

        {Object.entries(dashboardData.applicantsPerStatus).map(
          ([status, count]) => (
            <Container key={status} className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">
                {statusLabelMap[status as ApplicantStatus]}
              </p>
              <p className="mt-2 text-2xl font-semibold">{count}</p>
            </Container>
          ),
        )}
      </Container>

      <Container className="grid gap-4 lg:grid-cols-2">
        <Container className="rounded-md border p-4">
          <h2 className="text-base font-medium">Recent applicants</h2>
          <ul className="mt-3 space-y-3">
            {dashboardData.recentApplicants.map((applicant) => (
              <li
                key={applicant.$id}
                className="rounded-md border transition-colors hover:bg-muted/40"
              >
                <Link
                  href={`/applicant/${encodeURIComponent(applicant.$id)}`}
                  className="flex items-center justify-between px-3 py-2"
                >
                  <Container>
                    <p className="text-sm font-medium">
                      {applicant.fullName ?? "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {applicant.appliedRole ?? "N/A"}
                    </p>
                  </Container>
                  <p className="text-xs text-muted-foreground">
                    {applicant.status ?? "N/A"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>

        <Container className="rounded-md border p-4">
          <h2 className="text-base font-medium">Upcoming interviews</h2>
          <ul className="mt-3 space-y-3">
            {dashboardData.upcomingInterviews.map((interview) => (
              <li
                key={interview.$id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <Container>
                  <p className="text-sm font-medium">
                    {interview.applicantId ?? "Unknown applicant"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {interview.status ?? "N/A"}
                  </p>
                </Container>
                <Container className="text-right text-xs text-muted-foreground">
                  <p>
                    {formatFieldValue(
                      "scheduledAt",
                      interview.scheduledAt,
                      DATE_FIELDS,
                    )}
                  </p>
                </Container>
              </li>
            ))}
          </ul>
        </Container>
      </Container>
    </Container>
  );
}
