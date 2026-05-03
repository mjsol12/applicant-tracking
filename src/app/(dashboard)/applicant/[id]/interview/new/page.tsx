import { notFound, redirect } from "next/navigation";
import { NewInterviewForm } from "@/components/forms/interview-form";
import { getLoggedInUser } from "@/lib/appwrite-server";
import { ApplicantRouteDialog } from "../../../applicant-route-dialog";
import { loadApplicant } from "../../../load-applicant";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NewInterviewPage({ params }: Props) {
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
      title="Schedule Interview"
      description={`Schedule an interview for the applicant`}
      backHref={`/applicant/${id}`}
    >
      <NewInterviewForm applicantId={id} />
    </ApplicantRouteDialog>
  );
}
