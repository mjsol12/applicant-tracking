export const TABLE_NAME_INTERVIEW = "interview";

export const TABLE_ID_INTERVIEW = "interview";

export const API_URL_INTERVIEW = "/api/data/interview";

export type Interview = {
  $id: string;
  interviewerId?: string;
  status?: string;
  scheduledAt?: string;
  notes?: string;
  $createdAt?: string;
};


export const INTERVIEW_STATUS = [
    "scheduled",
    "in_progress",
    "completed",
    "cancelled",
    "no_show",
  ] as const;

  export const INTERVIEW_STATUS_ENUM = {
    "scheduled": "Scheduled",
    "in_progress": "In Progress",
    "completed": "Completed",
    "cancelled": "Cancelled",
    "no_show": "No Show",
  } as const;
  
export type InterviewStatus = (typeof INTERVIEW_STATUS)[number];  