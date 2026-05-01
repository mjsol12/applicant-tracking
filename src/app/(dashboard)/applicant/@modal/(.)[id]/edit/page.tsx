import { ApplicantRouteDialog } from "../../../applicant-route-dialog";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function InterceptEditApplicantPage({ params }: Props) {
  const { id } = await params;

  return (
    <ApplicantRouteDialog
      closeMode="back"
      title="Edit applicant"
      description={`Applicant id: ${id}`}
    >
      <p className="text-sm text-muted-foreground">
        Placeholder: edit applicant form will go here.
      </p>
    </ApplicantRouteDialog>
  );
}
