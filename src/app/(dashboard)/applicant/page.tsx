import { DataTable } from "./data-table";
import { columns, type ApplicantResult } from "./column";
import { getLoggedInUser } from "@/lib/appwrite-server";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Search from "@/components/ui/search";

async function getData(search?: string): Promise<ApplicantResult> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const apiUrl = search
    ? `${proto}://${host}/api/data/applicant?search=${encodeURIComponent(search)}`
    : `${proto}://${host}/api/data/applicant`;

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
  searchParams: Promise<{ search?: string }>;
}) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const { search } = await searchParams;
  const data = await getData(search);

  console.log(data);

  return (
    <>
      <Suspense fallback={<div>Loading data...</div>}>
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between">
              <Search placeholder="Search applicants" />
              <Link href="/applicant/new" className="underline bg-blue-500 text-white px-4 py-2 rounded-md no-underline">
                  Add new applicant
              </Link>
            </div>
            <DataTable columns={columns} data={data} />
          </div>
      </Suspense>
    </>
    );
  }
