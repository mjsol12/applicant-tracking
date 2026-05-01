import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Search from "@/components/ui/search";
import { getLoggedInUser } from "@/lib/appwrite-server";
import { type ApplicantResult, columns } from "./column";
import { DataTable } from "./data-table";
import { ApplicantStatusFilter } from "./status-filter";

function ApplicantTableSkeleton() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-36 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="rounded-md border">
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

async function getData(params: {
  search?: string;
  status?: string;
  cursor?: string;
  direction?: string;
}): Promise<ApplicantResult> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.cursor) qs.set("cursor", params.cursor);
  if (params.direction) qs.set("direction", params.direction);

  const query = qs.toString();
  const apiUrl = `${proto}://${host}/api/data/applicant${query ? `?${query}` : ""}`;

  const res = await fetch(apiUrl, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: "no-store",
  });

  if (res.status === 401) {
    redirect("/login");
  }

  if (!res.ok) {
    throw new Error("Failed to load applicants");
  }

  return (await res.json()) as ApplicantResult;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    cursor?: string;
    direction?: string;
  }>;
}) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const { search, status, cursor, direction } = await searchParams;
  const data = await getData({ search, status, cursor, direction });

  return (
    <>
      <Suspense fallback={<ApplicantTableSkeleton />}>
        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-4">
              <Search placeholder="Search applicants" />
              <ApplicantStatusFilter />
            </div>
            <Link
              href="/applicant/new"
              className="rounded-md bg-blue-500 px-4 py-2 text-white underline no-underline"
            >
              Add new applicant
            </Link>
          </div>
          <DataTable columns={columns} data={data} />
        </div>
      </Suspense>
    </>
  );
}
