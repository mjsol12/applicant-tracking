export const APPLICANT_STATUS = [
    "applied",
    "interview",
    "hired",
    "rejected",
  ] as const;
    
  
  export type ApplicantStatus = (typeof APPLICANT_STATUS)[number];