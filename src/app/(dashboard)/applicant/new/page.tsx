import { getLoggedInUser } from "@/lib/appwrite-server";
import { redirect } from "next/navigation";

import { ApplicantRouteDialog } from "../applicant-route-dialog";
import { NewApplicantForm } from "@/components/applicant-form";

export default async function NewApplicantPage() {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <ApplicantRouteDialog
      title="New applicant"
      description="Fill in the details below. Skills can be separated by commas or new lines."
    >
      <NewApplicantForm />
    </ApplicantRouteDialog>
  );
}
