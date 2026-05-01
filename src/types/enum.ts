export const APPLICANT_STATUS = [
  "applied",
  "interview",
  "hired",
  "rejected",
] as const;

export const INTERVIEW_STATUS = [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type ApplicantStatus = (typeof APPLICANT_STATUS)[number];
export type InterviewStatus = (typeof INTERVIEW_STATUS)[number];
