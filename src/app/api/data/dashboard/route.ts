import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { createSessionClient } from "@/lib/appwrite-server";
import {
  getApplicantTableRef,
  getInterviewTableRef,
} from "@/lib/appwrite-env";
import { withErrorHandling } from "@/lib/withErrorHandling";
import { APPLICANT_STATUS } from "@/config/applicant";

type TableConfig = { databaseId: string; tableId: string };

function resolveApplicantTable(): TableConfig | NextResponse {
  const ref = getApplicantTableRef();
  if (!ref) {
    return NextResponse.json(
      {
        error:
          "Applicant table is not configured (database or table id missing).",
      },
      { status: 503 },
    );
  }
  return ref;
}

function resolveInterviewTable(): TableConfig | NextResponse {
  const ref = getInterviewTableRef();
  if (!ref) {
    return NextResponse.json(
      {
        error:
          "Interview table is not configured (database or table id missing).",
      },
      { status: 503 },
    );
  }
  return ref;
}

export const GET = withErrorHandling(async (_request: Request) => {
  const applicantTable = resolveApplicantTable();
  if (applicantTable instanceof NextResponse) return applicantTable;

  const interviewTable = resolveInterviewTable();
  if (interviewTable instanceof NextResponse) return interviewTable;

  const { tablesDB } = await createSessionClient();

  const [applicantsResult, recentApplicants, loadInterview, ...statusResults] =
    await Promise.all([
      tablesDB.listRows({
        databaseId: applicantTable.databaseId,
        tableId: applicantTable.tableId,
        queries: [Query.limit(5), Query.orderDesc("$createdAt")],
        ttl: 0,
      }),
      tablesDB.listRows({
        databaseId: applicantTable.databaseId,
        tableId: applicantTable.tableId,
        queries: [
          Query.equal("status", ["applied"]),
          Query.limit(5),
          Query.orderDesc("$createdAt"),
        ],
        ttl: 0,
      }),
      tablesDB.listRows({
        databaseId: interviewTable.databaseId,
        tableId: interviewTable.tableId,
        queries: [
          Query.equal("status", ["scheduled"]),
          Query.limit(5),
          Query.orderDesc("scheduledAt"),
        ],
        ttl: 0,
      }),
      ...APPLICANT_STATUS.map((status) =>
        tablesDB.listRows({
          databaseId: applicantTable.databaseId,
          tableId: applicantTable.tableId,
          queries: [Query.equal("status", [status]), Query.limit(1)],
          ttl: 0,
        }),
      ),
    ]);

  const applicantsPerStatus = APPLICANT_STATUS.reduce<Record<string, number>>(
    (acc, status, index) => {
      acc[status] = statusResults[index]?.total ?? 0;
      return acc;
    },
    {},
  );

  return NextResponse.json({
    totalApplicants: applicantsResult.total,
    applicantsPerStatus,
    recentApplicants: recentApplicants.rows,
    upcomingInterviews: loadInterview.rows,
  });
});
