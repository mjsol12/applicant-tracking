import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Search from "@/components/composites/search";
import { getLoggedInUser } from "@/lib/appwrite-server";
import { fetchJson } from "@/lib/fetch/fetch-json";
import {
  getInternalFetchContext,
  internalServerFetchInit,
} from "@/lib/fetch/internal-context";
import { API_URL_APPLICANT } from "@/config/applicant";
import { TableSkeleton } from "@/components/features/skeleton/table";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ApplicantStatusFilter } from "./status-filter";
import { DataTable } from "./data-table";
import type { Result } from "@/config/search-results";
import type { Applicant } from "@/config/applicant";
import { columns } from "./column";

async function getData(params: {
  search?: string;
  status?: string;
  cursor?: string;
  direction?: string;
}): Promise<Result<Applicant>> {
  const { origin, cookieHeader } = await getInternalFetchContext();

  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);
  if (params.cursor) qs.set("cursor", params.cursor);
  if (params.direction) qs.set("direction", params.direction);

  const query = qs.toString();
  const apiUrl = `${origin}${API_URL_APPLICANT}${query ? `?${query}` : ""}`;

  return fetchJson<Result<Applicant>>(
    apiUrl,
    internalServerFetchInit(cookieHeader),
    {
      fallbackMessage: "Failed to load applicants",
      onUnauthorized: () => redirect("/login"),
    },
  );
}

export default async function ApplicantListPage({
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
        <Container
          size="full"
          query={true}
          className="flex h-full flex-col gap-4"
        >
          <Container
            size="flush"
            query={true}
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <Container
              size="flush"
              className="flex min-w-0 flex-1 flex-nowrap items-center gap-4"
            >
              <Search placeholder="Search applicants" />
              <ApplicantStatusFilter />
            </Container>
            <Link
              href="/applicant/new"
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              New Applicant
            </Link>
          </Container>
          <DataTable columns={columns} data={data} />
        </Container>
      </Suspense>
    </>
  );
}
