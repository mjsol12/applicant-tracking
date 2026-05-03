
export const TABLE_NAME_APPLICANT = "applicant";

export const TABLE_ID_APPLICANT = "applicant";

export const API_URL_APPLICANT = "/api/data/applicant";

export type Applicant = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  status: ApplicantStatus | string;
  appliedRole: string;
  skills: string[];
  availableStartDate: string;
  expectedSalary: number;
  yearsOfExperience: number;
  $id: string;
  $sequence: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $databaseId: string;
  $tableId: string;
};

export const APPLICANT_STATUS = [
    "applied",
    "interview",
    "hired",
    "rejected",
  ] as const;
  
export type ApplicantStatus = (typeof APPLICANT_STATUS)[number];

export const APPLICANT_COLUMNS = [
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "appliedRole",
    header: "Applied Role",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "yearsOfExperience",
    header: "Years Exp",
  },
  {
    accessorKey: "expectedSalary",
    header: "Expected Salary",
  },
]