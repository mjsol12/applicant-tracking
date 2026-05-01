import { getLoggedInUser } from "@/lib/appwrite-server";
import Link from "next/link";
import { redirect } from "next/navigation";

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
        Placeholder: add applicant form will go here.
      </p>
    </div>
  );
}
