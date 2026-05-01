import { getLoggedInUser } from "@/lib/appwrite-server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { NewApplicantForm } from "./new-applicant-form";

export default async function NewApplicantPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="px-6 py-4">
      <p className="mb-4">
        <Link href="/applicant" className="text-sm underline">
          Back to list
        </Link>
      </p>
      <h1 className="text-lg font-medium">New applicant</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Fill in the details below. Skills can be separated by commas or new
        lines.
      </p>
      <NewApplicantForm />
    </div>
  );
}
