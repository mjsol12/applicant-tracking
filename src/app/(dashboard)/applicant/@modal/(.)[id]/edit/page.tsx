import { notFound, redirect } from "next/navigation";
import { EditApplicantForm } from "@/components/forms/applicant-form";
import { getLoggedInUser } from "@/lib/appwrite-server";
import { ApplicantRouteDialog } from "@/app/(dashboard)/applicant/_shared/applicant-route-dialog";
import { loadApplicant } from "@/app/(dashboard)/applicant/_shared/load-applicant";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function InterceptEditApplicantPage({ params }: Props) {
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
    <ApplicantRouteDialog closeMode="back" title="Edit Applicant">
      <EditApplicantForm
        rowId={id}
        row={loaded.row}
        afterSubmitNavigate="back"
      />
    </ApplicantRouteDialog>
  );
}
