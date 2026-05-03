import { notFound, redirect } from "next/navigation";
import { EditApplicantForm } from "@/components/features/applicant/applicant-form";
import { ApplicantRouteDialog } from "@/app/(dashboard)/applicant/_shared/applicant-route-dialog";
import { loadApplicant } from "@/app/(dashboard)/applicant/_shared/load-applicant";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditApplicantPage({ params }: Props) {
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
