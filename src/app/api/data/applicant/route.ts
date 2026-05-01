import { AppwriteException, ID, Query } from "node-appwrite";
import { NextResponse } from "next/server";

import { createSessionClient } from "@/lib/appwrite-server";

type ApplicantTable = { databaseId: string; tableId: string };

function resolveApplicantTable(): ApplicantTable | NextResponse {
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
  const tableId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || "";
  if (!databaseId || !tableId) {
    return NextResponse.json(
      { error: "Applicant table is not configured (database or table id missing)." },
      { status: 503 }
    );
  }
  return { databaseId, tableId };
}

async function getTablesDB() {
  return (await createSessionClient()).tablesDB;
}

function handleError(error: unknown) {
  if (error instanceof AppwriteException) {
    const status =
      error.code >= 400 && error.code < 600 ? error.code : 500;
    return NextResponse.json(
      { error: error.message, type: error.type },
      { status }
    );
  }
  if (error instanceof Error && error.message === "No session") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * GET /api/data/applicant — list rows (same defaults as before: total off, ttl 0).
 * GET /api/data/applicant?rowId=… — single row.
 * Optional: queries=[...] as JSON array (Appwrite Query strings), total=true|false, ttl=number
 */
export async function GET(request: Request) {
  const table = resolveApplicantTable();
  if (table instanceof NextResponse) return table;

  try {
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

    queries.push(Query.limit(10));
    queries.push(Query.orderDesc("$createdAt"));


    const direction = url.searchParams.get("diretion");
    const cursor = url.searchParams.get("cursor");

    if (cursor) {
      if (direction === 'next') {
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
      return NextResponse.json({ rows: [], total: 0, previusCursor: null , nextCursor: null});
    }

    const nextCursor = result.rows[result.rows.length - 1].$id;

    return NextResponse.json({ rows: result.rows, total: result.total, previusCursor: cursor , nextCursor: nextCursor});
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/data/applicant
 * Body: { data: Record<string, unknown>, rowId?: string }
 * If rowId is omitted, Appwrite generates a unique id.
 */
export async function POST(request: Request) {
  const table = resolveApplicantTable();
  if (table instanceof NextResponse) return table;

  try {
    const body: unknown = await request.json().catch(() => null);
    if (!isPlainObject(body) || !("data" in body)) {
      return NextResponse.json(
        { error: "Expected JSON body with a data object" },
        { status: 400 }
      );
    }
    const { data, rowId } = body as {
      data: unknown;
      rowId?: unknown;
    };
    if (!isPlainObject(data)) {
      return NextResponse.json(
        { error: "data must be a non-array object" },
        { status: 400 }
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
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/data/applicant
 * Body: { rowId: string, data: Record<string, unknown> }
 */
export async function PUT(request: Request) {
  const table = resolveApplicantTable();
  if (table instanceof NextResponse) return table;

  try {
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
        { status: 400 }
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
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/data/applicant?rowId=…
 * or DELETE with JSON body: { rowId: string }
 */
export async function DELETE(request: Request) {
  const table = resolveApplicantTable();
  if (table instanceof NextResponse) return table;

  try {
    const url = new URL(request.url);
    let rowId = url.searchParams.get("rowId");

    if (!rowId && request.headers.get("content-type")?.includes("application/json")) {
      const body: unknown = await request.json().catch(() => null);
      if (isPlainObject(body) && typeof body.rowId === "string") {
        rowId = body.rowId;
      }
    }

    if (!rowId?.trim()) {
      return NextResponse.json(
        { error: "rowId is required (query ?rowId= or JSON body)" },
        { status: 400 }
      );
    }

    const tablesDB = await getTablesDB();
    await tablesDB.deleteRow({
      databaseId: table.databaseId,
      tableId: table.tableId,
      rowId: rowId.trim(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
