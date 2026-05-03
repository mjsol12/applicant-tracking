import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Search from "@/components/ui/search";
import { getLoggedInUser } from "@/lib/appwrite-server";
import { fetchJson } from "@/lib/fetch/fetch-json";
import {
  getInternalFetchContext,
  internalServerFetchInit,
} from "@/lib/fetch/internal-context";
import { type ApplicantResult, columns } from "./column";
import { DataTable } from "./data-table";
import { ApplicantStatusFilter } from "./status-filter";
import { TableSkeleton } from "@/components/ui/skeleton/table";

async function getData(params: {
  search?: string;
  status?: string;
  cursor?: string;
  direction?: string;
}): Promise<ApplicantResult> {
  const { origin, cookieHeader } = await getInternalFetchContext();

  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.cursor) qs.set("cursor", params.cursor);
  if (params.direction) qs.set("direction", params.direction);

  const query = qs.toString();
  const apiUrl = `${origin}/api/data/applicant${query ? `?${query}` : ""}`;

  return fetchJson<ApplicantResult>(
    apiUrl,
    internalServerFetchInit(cookieHeader),
    {
      fallbackMessage: "Failed to load applicants",
      onUnauthorized: () => redirect("/login"),
    },
  );
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
      <Suspense fallback={<TableSkeleton />}>
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
