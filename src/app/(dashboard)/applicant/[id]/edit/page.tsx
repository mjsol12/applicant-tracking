import { getLoggedInUser } from "@/lib/appwrite-server";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditApplicantPage({ params }: Props) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <div className="px-6 py-4">
      <p className="mb-4">
        <Link href="/applicant" className="text-sm underline">
          Back to list
        </Link>
      </p>
      <h1 className="text-lg font-medium">Edit applicant</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Applicant id: {id}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Placeholder: edit applicant form will go here.
      </p>
    </div>
  );
}
