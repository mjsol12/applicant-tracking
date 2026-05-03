export const TABLE_NAME_INTERVIEW = "interview";

export const TABLE_ID_INTERVIEW = "interview";

export const API_URL_INTERVIEW = "/api/data/interview";

export const INTERVIEW_STATUS = [
    "scheduled",
    "completed",
    "cancelled",
    "no_show",
  ] as const;
  
export type InterviewStatus = (typeof INTERVIEW_STATUS)[number];  