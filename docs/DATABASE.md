# Database Setup (Appwrite)

This project uses **Appwrite TablesDB** for server-side CRUD through Next.js route handlers under `src/app/api/data`.

## Environment Variables

Set these in `.env` (also mirrored in `.env.example`):

- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`
- `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
- `NEXT_PUBLIC_APPWRITE_APPLICANT_COLLECTION_ID`
- `NEXT_PUBLIC_APPWRITE_INTERVIEW_COLLECTION_ID`
- `NEXT_SECRET_KEY` (server key used by `createAdminClient`)

Reads and validation helpers live in `src/lib/appwrite-env.ts`. Routes use `createSessionClient()` from `src/lib/appwrite-server.ts`, so calls are made in the authenticated user session.

## Tables

### Applicant table

Configured by:

- `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
- `NEXT_PUBLIC_APPWRITE_APPLICANT_COLLECTION_ID`

Expected fields used by routes/UI:

- `fullName` (string, searchable)
- `email` (string)
- `phone` (string)
- `address` (string)
- `status` (string; expected values align with `APPLICANT_STATUS` in `src/config/applicant.ts`)
- `appliedRole` (string)
- `skills` (string array)
- `availableStartDate` (date/string)
- `expectedSalary` (number)
- `yearsOfExperience` (number)
- system fields: `$id`, `$createdAt`, `$updatedAt`

### Interview table

Configured by:

- `NEXT_PUBLIC_APPWRITE_DATABASE_ID`
- `NEXT_PUBLIC_APPWRITE_INTERVIEW_COLLECTION_ID`

Expected fields used by routes/UI:

- `applicantId` (string; links to applicant `$id`)
- `interviewerId` (string)
- `status` (string; one of `scheduled|completed|cancelled|no_show`)
- `scheduledAt` (datetime string/ISO)
- `notes` (string)
- system fields: `$id`, `$createdAt`, `$updatedAt`

## Required Indexes / Queryability

The following fields must be queryable/indexed in Appwrite, because they are filtered/sorted/searched in routes:

- Applicant:
  - `fullName` (search in `/api/data/applicant`)
  - `status` (filters in `/api/data/dashboard`)
  - `$createdAt` (sort descending)
- Interview:
  - `applicantId` (filter in `/api/data/interview`)
  - `interviewerId` (filter in `/api/data/interview`)
  - `status` (filter in `/api/data/interview` and `/api/data/dashboard`)
  - `notes` (search in `/api/data/interview`)
  - `scheduledAt` (sort in `/api/data/dashboard`)
  - `$createdAt` (sort in `/api/data/interview`)

If an index is missing, Appwrite will return query errors when hitting those APIs.

## API Route to Table Mapping

### `GET|POST|PUT|DELETE /api/data/applicant`

File: `src/app/api/data/applicant/route.ts`

- `GET` list:
  - search: `search` -> `Query.search("fullName", search)`
  - filter: `status` -> `Query.equal("status", [status])` (must be one of `APPLICANT_STATUS`)
  - pagination: `cursor` + `direction` (`next` uses `cursorAfter`, otherwise `cursorBefore`)
    - backwards compatible aliases: `direct`, `diretion` (same meaning as `direction`)
  - default sort: `Query.orderDesc("$createdAt")`
  - default limit: `10`
- `GET ?rowId=...`: fetch single applicant row
- `POST`: create applicant row (`rowId` optional)
- `PUT`: update applicant row by `rowId`
- `DELETE`: delete applicant row by query/body `rowId`

### `GET|POST /api/data/interview`

File: `src/app/api/data/interview/route.ts`

- `GET` list filters:
  - `applicantId`
  - `interviewerId`
  - `status` (validated against `INTERVIEW_STATUS`)
  - `search` -> `Query.search("notes", search)`
  - pagination: `cursor` + `direct|direction|diretion`
  - default sort: `Query.orderDesc("$createdAt")`
  - default limit: `10`
- `GET ?rowId=...`: fetch single interview row
- `POST`: create interview row with required `applicantId`, `interviewerId`, `status`

### `GET /api/data/dashboard`

File: `src/app/api/data/dashboard/route.ts`

Aggregates for dashboard in one request:

- `totalApplicants`: from applicant list `total`
- `recentApplicants`: applicant rows (recent subset)
- `applicantsPerStatus`: counts by `APPLICANT_STATUS`
- `upcomingInterviews`: interview rows filtered by `status = scheduled`

## Notes

- Dashboard and applicant pages use internal server fetches with forwarded cookies (`cache: "no-store"`), so data is always fresh.
- `applicantId` in interview rows is treated as a reference but there is currently no server-side join; UI may display raw IDs unless enriched.
- Do not skip Appwrite table permissions. Even when fields and indexes are correct, routes can still fail if table/row permissions are wrong. Check **`read` / `create` / `update` / `delete`** access for the logged-in session role first. This took a while to spot during setup because the failures can look random.
- Deployment note (Appwrite + GitHub integration): routes can work locally but fail to render in live preview if server session forwarding, table permissions, or queryable indexes differ in the deployed environment. If preview pages do not render, investigate API status codes first (especially `401`/`400`) before changing UI code.
