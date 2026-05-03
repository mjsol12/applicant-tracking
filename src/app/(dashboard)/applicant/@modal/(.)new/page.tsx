import { NewApplicantForm } from "@/components/features/applicant/applicant-form";
import { ApplicantRouteDialog } from "@/app/(dashboard)/applicant/_shared/applicant-route-dialog";

export default function InterceptNewApplicantPage() {
  return (
    <ApplicantRouteDialog
      closeMode="back"
      title="New applicant"
      description="Fill in the details below. Skills can be separated by commas or new lines."
    >
      <NewApplicantForm afterSubmitNavigate="back" />
    </ApplicantRouteDialog>
  );
}
