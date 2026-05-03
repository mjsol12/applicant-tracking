export const INTERVIEW_STATUS = [
    "scheduled",
    "completed",
    "cancelled",
    "no_show",
  ] as const;
  
export type InterviewStatus = (typeof INTERVIEW_STATUS)[number];  