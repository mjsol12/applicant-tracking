import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { getInterviewTableRef } from "@/lib/appwrite-env";
import { createSessionClient } from "@/lib/appwrite-server";
import { isPlainObject } from "@/lib/utils";
import { withErrorHandling } from "@/lib/withErrorHandling";
import { INTERVIEW_STATUS, type InterviewStatus } from "@/config/interview";

type InterviewTable = { databaseId: string; tableId: string };

function resolveInterviewTable(): InterviewTable | NextResponse {
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

async function getTablesDB() {
  return (await createSessionClient()).tablesDB;
}

function requireAssignmentFields(data: unknown): string | null {
  if (!isPlainObject(data)) return "data must be a non-array object";
  const applicantId = data.applicantId;
  const interviewerId = data.interviewerId;
  const status = data.status;
  if (typeof applicantId !== "string" || !applicantId.trim()) {
    return "data.applicantId is required";
  }
  if (typeof interviewerId !== "string" || !interviewerId.trim()) {
    return "data.interviewerId is required";
  }
  if (
    typeof status !== "string" ||
    !INTERVIEW_STATUS.includes(status as InterviewStatus)
  ) {
    return `data.status is required and must be one of: ${INTERVIEW_STATUS.join(", ")}`;
  }
  return null;
}

export const GET = withErrorHandling(async (request: Request) => {
  const table = resolveInterviewTable();
  if (table instanceof NextResponse) return table;

  const tablesDB = await getTablesDB();
  const url = new URL(request.url);
  const rowId = url.searchParams.get("rowId");

  if (rowId) {
    const row = await tablesDB.getRow({
      databaseId: table.databaseId,
      tableId: table.tableId,
      rowId,
    });
    return NextResponse.json(row);
  }

  const queries: string[] = [];

  const applicantId = url.searchParams.get("applicantId");
  if (applicantId) {
    queries.push(Query.equal("applicantId", [applicantId]));
  }

  const interviewerId = url.searchParams.get("interviewerId");
  if (interviewerId) {
    queries.push(Query.equal("interviewerId", [interviewerId]));
  }

  const status = url.searchParams.get("status");
  if (status) {
    if (!INTERVIEW_STATUS.includes(status as InterviewStatus)) {
      return NextResponse.json(
        { error: `status must be one of: ${INTERVIEW_STATUS.join(", ")}` },
        { status: 400 },
      );
    }
    queries.push(Query.equal("status", [status]));
  }

  const search = url.searchParams.get("search");
  if (search) {
    queries.push(Query.search("notes", search));
  }

  const limitRaw = url.searchParams.get("limit");
  const limit = limitRaw === null ? 10 : Number(limitRaw);
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10;
  queries.push(Query.limit(safeLimit));
  queries.push(Query.orderDesc("$createdAt"));

  const direction =
    url.searchParams.get("direct") ??
    url.searchParams.get("direction");
  const cursor = url.searchParams.get("cursor");

  if (cursor) {
    if (direction === "next") {
      queries.push(Query.cursorAfter(cursor));
    } else {
      queries.push(Query.cursorBefore(cursor));
    }
  }

  const ttlRaw = url.searchParams.get("ttl");
  const ttl = ttlRaw === null ? 0 : Number(ttlRaw);
  const safeTtl = Number.isFinite(ttl) ? ttl : 0;

  const result = await tablesDB.listRows({
    databaseId: table.databaseId,
    tableId: table.tableId,
    queries,
    ttl: safeTtl,
  });

  if (result.total === 0) {
    return NextResponse.json({
      rows: [],
      total: 0,
      previousCursor: null,
      nextCursor: null,
    });
  }

  const nextCursor = result.rows[result.rows.length - 1].$id;
  const previousCursor = result.rows[0].$id;

  return NextResponse.json({
    rows: result.rows,
    total: result.total,
    previousCursor,
    nextCursor,
  });
});

export const POST = withErrorHandling(async (request: Request) => {
  const table = resolveInterviewTable();
  if (table instanceof NextResponse) return table;

  const body: unknown = await request.json().catch(() => null);
  if (!isPlainObject(body) || !("data" in body)) {
    return NextResponse.json(
      { error: "Expected JSON body with a data object" },
      { status: 400 },
    );
  }

  const { data, rowId } = body as {
    data: unknown;
    rowId?: unknown;
  };

  const assignmentValidationError = requireAssignmentFields(data);
  if (assignmentValidationError) {
    return NextResponse.json(
      { error: assignmentValidationError },
      { status: 400 },
    );
  }

  const id =
    typeof rowId === "string" && rowId.trim().length > 0
      ? rowId.trim()
      : ID.unique();

  const tablesDB = await getTablesDB();
  const row = await tablesDB.createRow({
    databaseId: table.databaseId,
    tableId: table.tableId,
    rowId: id,
    data: data as Record<string, unknown>,
  });

  return NextResponse.json(row, { status: 201 });
});
