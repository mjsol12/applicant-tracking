export const TABLE_NAME_APPLICANT = "applicant";

export const TABLE_ID_APPLICANT = "applicant";

export const API_URL_APPLICANT = "/api/data/applicant";

export const APPLICANT_STATUS = [
    "applied",
    "interview",
    "hired",
    "rejected",
  ] as const;
  
export type ApplicantStatus = (typeof APPLICANT_STATUS)[number];