
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
  
export const APPLICANT_STATUS_ENUM = {
  "applied": "Applied",
  "interview": "Interview",
  "hired": "Hired",
  "rejected": "Rejected",
} as const;
  
export type ApplicantStatus = (typeof APPLICANT_STATUS)[number];


export const DISPLAY_ORDER_APPLICANT = [
  "fullName",
  "email",
  "phone",
  "address",
  "status",
  "appliedRole",
  "skills",
  "availableStartDate",
  "expectedSalary",
  "yearsOfExperience",
  "$createdAt",
  "$updatedAt",
];

export const VIEW_FIELD_LABELS_APPLICANT: Record<string, string> = {
  fullName: "Full Name",
  email: "Email",
  phone: "Phone",
  address: "Address",
  status: "Status",
  appliedRole: "Applied Role",
  skills: "Skills",
  availableStartDate: "Available Start Date",
  expectedSalary: "Expected Salary",
  yearsOfExperience: "Years of Experience",
  $createdAt: "Created At",
  $updatedAt: "Updated At",
};

export const APPLICANT_COLUMNS = [
  {
    accessorKey: "fullName",
    header: "Full Name",
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
]

export const APPLICANT_APPLIED_ROLE = [
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "UI/UX Designer",
  "DevOps Engineer",
  "System Administrator",
  "Network Engineer",
  "Data Scientist",
] as const;

export const APPLICANT_APPLIED_ROLE_ENUM = {
  "frontend_developer": "Frontend Developer",
  "backend_developer": "Backend Developer",
  "fullstack_developer": "Full Stack Developer",
  "mobile_developer": "Mobile Developer",
  "ui_ux_designer": "UI/UX Designer",
  "devops_engineer": "DevOps Engineer",
  "system_administrator": "System Administator",
  "network_engineer": "Network Engineer",
  "data_scientist": "Data Scientist",
} as const;