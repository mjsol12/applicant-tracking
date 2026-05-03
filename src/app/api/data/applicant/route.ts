import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { createSessionClient } from "@/lib/appwrite-server";
import { isPlainObject } from "@/lib/utils";
import { withErrorHandling } from "@/lib/withErrorHandling";
import { APPLICANT_STATUS, type ApplicantStatus } from "@/config/applicant";

type ApplicantTable = { databaseId: string; tableId: string };

function resolveApplicantTable(): ApplicantTable | NextResponse {
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
  const tableId =
    process.env.NEXT_PUBLIC_APPWRITE_APPLICANT_COLLECTION_ID || "";
  if (!databaseId || !tableId) {
    return NextResponse.json(
      {
        error:
          "Applicant table is not configured (database or table id missing).",
      },
      { status: 503 },
    );
  }
  return { databaseId, tableId };
}

async function getTablesDB() {
  return (await createSessionClient()).tablesDB;
}

/**
 * GET /api/data/applicant — list rows (same defaults as before: total off, ttl 0).
 * GET /api/data/applicant?rowId=… — single row.
 * Optional: queries=[...] as JSON array (Appwrite Query strings), total=true|false, ttl=number
 */

export const GET = withErrorHandling(async (request: Request) => {
  const table = resolveApplicantTable();
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

  const search = url.searchParams.get("search");
  if (search) {
    queries.push(Query.search("fullName", search));
  }

  const status = url.searchParams.get("status");
  if (status) {
    if (!APPLICANT_STATUS.includes(status as ApplicantStatus)) {
      return NextResponse.json(
        { error: `status must be one of: ${APPLICANT_STATUS.join(", ")}` },
        { status: 400 },
      );
    }
    queries.push(Query.equal("status", [status]));
  }

  queries.push(Query.limit(10));
  queries.push(Query.orderDesc("$createdAt"));

  const paginationDirection =
    url.searchParams.get("direction") ??
    url.searchParams.get("direct") ??
    url.searchParams.get("diretion");
  const cursor = url.searchParams.get("cursor");

  if (cursor) {
    if (paginationDirection === "next") {
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

  const previousCursor = cursor ? result.rows[0].$id : null;

  return NextResponse.json({
    rows: result.rows,
    total: result.total,
    previousCursor,
    nextCursor,
  });
});

/**
 * POST /api/data/applicant
 * Body: { data: Record<string, unknown>, rowId?: string }
 * If rowId is omitted, Appwrite generates a unique id.
 */
export const POST = withErrorHandling(async (request: Request) => {
  const table = resolveApplicantTable();
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
  if (!isPlainObject(data)) {
    return NextResponse.json(
      { error: "data must be a non-array object" },
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
    data,
  });

  return NextResponse.json(row, { status: 201 });
});

/**
 * PUT /api/data/applicant
 * Body: { rowId: string, data: Record<string, unknown> }
 */
export const PUT = withErrorHandling(async (request: Request) => {
  const table = resolveApplicantTable();
  if (table instanceof NextResponse) return table;

  const body: unknown = await request.json().catch(() => null);
  if (!isPlainObject(body)) {
    return NextResponse.json({ error: "Expected JSON body" }, { status: 400 });
  }
  const { rowId, data } = body as { rowId?: unknown; data?: unknown };
  if (typeof rowId !== "string" || !rowId.trim()) {
    return NextResponse.json({ error: "rowId is required" }, { status: 400 });
  }
  if (!isPlainObject(data)) {
    return NextResponse.json(
      { error: "data must be a non-array object" },
      { status: 400 },
    );
  }

  const tablesDB = await getTablesDB();
  const row = await tablesDB.updateRow({
    databaseId: table.databaseId,
    tableId: table.tableId,
    rowId: rowId.trim(),
    data,
  });

  return NextResponse.json(row);
});

/**
 * DELETE /api/data/applicant?rowId=…
 * or DELETE with JSON body: { rowId: string }
 */
export const DELETE = withErrorHandling(async (request: Request) => {
  const table = resolveApplicantTable();
  if (table instanceof NextResponse) return table;

  const url = new URL(request.url);
  let rowId = url.searchParams.get("rowId");

  if (
    !rowId &&
    request.headers.get("content-type")?.includes("application/json")
  ) {
    const body: unknown = await request.json().catch(() => null);
    if (isPlainObject(body) && typeof body.rowId === "string") {
      rowId = body.rowId;
    }
  }

  if (!rowId?.trim()) {
    return NextResponse.json(
      { error: "rowId is required (query ?rowId= or JSON body)" },
      { status: 400 },
    );
  }

  const tablesDB = await getTablesDB();
  await tablesDB.deleteRow({
    databaseId: table.databaseId,
    tableId: table.tableId,
    rowId: rowId.trim(),
  });

  return NextResponse.json({ ok: true });
});
