import Container from "@/components/container";
import { DataTable } from "./data-table";
import { columns, type ApplicantResult } from "./column";
import { createSessionClient, getLoggedInUser } from "@/lib/appwrite-server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function getData() {

  const { tablesDB } = await createSessionClient();

  const result = await tablesDB.listRows({
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
    tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID || "",
    queries: [],
    total: false,
    ttl: 0
  });
  
  return JSON.stringify({ rows: result.rows, total: result.total });

}

export default async function Home() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const data = await getData();

  return (
    <>
      <Suspense fallback={<div>Loading data...</div>}>
       <div class="py-4 px-4 ">
        <div className="py-4 laptop:col-span-2">
            <DataTable columns={columns} data={JSON.parse(data) as unknown as ApplicantResult} />
        </div>
       </div>
      </Suspense>
    </>
    );
  }
