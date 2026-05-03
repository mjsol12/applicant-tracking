import { notFound, redirect } from "next/navigation";
import { NewInterviewForm } from "@/components/features/interview/interview-form";
import { getLoggedInUser } from "@/lib/appwrite-server";
import { ApplicantRouteDialog } from "@/app/(dashboard)/applicant/_shared/applicant-route-dialog";
import { loadApplicant } from "@/app/(dashboard)/applicant/_shared/load-applicant";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function InterceptNewInterviewPage({ params }: Props) {
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
    <ApplicantRouteDialog
      closeMode="back"
      title="New interview"
      description={`Assign interview for applicant: ${id}`}
      backHref={`/applicant/${id}`}
    >
      <NewInterviewForm applicantId={id} />
    </ApplicantRouteDialog>
  );
}
