export type AppwriteTableRef = { databaseId: string; tableId: string };

function trim(value: string | undefined): string {
  return value?.trim() ?? "";
}

function requireEnv(name: string, value: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/** Endpoint + project for Appwrite clients (session and admin). */
export function getAppwriteClientConfig() {
  return {
    endpoint: requireEnv(
      "NEXT_PUBLIC_APPWRITE_ENDPOINT",
      trim(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT),
    ),
    projectId: requireEnv(
      "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
      trim(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID),
    ),
  };
}

/**
 * Server API key for admin / server-side Appwrite usage.
 * `NEXT_SECRET_KEY` is still read for backward compatibility.
 */
export function getAppwriteServerApiKey(): string {    
  return requireEnv(
    "NEXT_SECRET_KEY",
    trim(process.env.NEXT_SECRET_KEY),
  );
}

export function getApplicantTableRef(): AppwriteTableRef | null {
  const databaseId = trim(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
  const tableId = trim(
    process.env.NEXT_PUBLIC_APPWRITE_APPLICANT_COLLECTION_ID,
  );
  if (!databaseId || !tableId) return null;
  return { databaseId, tableId };
}

export function getInterviewTableRef(): AppwriteTableRef | null {
  const databaseId = trim(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
  const tableId = trim(
    process.env.NEXT_PUBLIC_APPWRITE_INTERVIEW_COLLECTION_ID,
  );
  if (!databaseId || !tableId) return null;
  return { databaseId, tableId };
}
