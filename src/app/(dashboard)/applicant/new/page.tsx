import { redirect } from "next/navigation";
import { NewApplicantForm } from "@/components/forms/applicant-form";
import { getLoggedInUser } from "@/lib/appwrite-server";
import { ApplicantRouteDialog } from "../applicant-route-dialog";

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
