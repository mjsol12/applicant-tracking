import { notFound, redirect } from "next/navigation";
import { EditApplicantForm } from "@/components/forms/applicant-form";
import { getLoggedInUser } from "@/lib/appwrite-server";
import { ApplicantRouteDialog } from "../../applicant-route-dialog";
import { loadApplicant } from "../../load-applicant";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditApplicantPage({ params }: Props) {
  const user = await getLoggedInUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const loaded = await loadApplicant(id);
  if (!loaded.ok) {
    if (loaded.reason === "unauthorized") redirect("/login");
    notFound();
  }

  return (
    <ApplicantRouteDialog title="Edit Applicant">
      <EditApplicantForm rowId={id} row={loaded.row} />
    </ApplicantRouteDialog>
  );
}
