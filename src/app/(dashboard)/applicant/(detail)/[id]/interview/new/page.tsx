import { notFound, redirect } from "next/navigation";
import { NewInterviewForm } from "@/components/forms/interview-form";
import { ApplicantRouteDialog } from "@/app/(dashboard)/applicant/_shared/applicant-route-dialog";
import { loadApplicant } from "@/app/(dashboard)/applicant/_shared/load-applicant";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NewInterviewPage({ params }: Props) {
  const { id } = await params;
  const loaded = await loadApplicant(id);
  if (!loaded.ok) {
    if (loaded.reason === "unauthorized") redirect("/login");
    notFound();
  }

  return (
    <ApplicantRouteDialog
      title="Schedule Interview"
      description={`Schedule an interview for the applicant`}
      backHref={`/applicant/${id}`}
    >
      <NewInterviewForm applicantId={id} />
    </ApplicantRouteDialog>
  );
}
