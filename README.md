# Applicant Tracking Dashboard

Next.js dashboard template using VisActor charts, Tailwind UI, and Appwrite integration for API/database checks in the ticket page.

[Live Demo](https://applicant-tracking.appwrite.network/)

## Stack

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- VisActor (`@visactor/vchart`, `@visactor/react-vchart`)
- Appwrite JavaScript SDK

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Create local env file:

```bash
cp .env.example .env
```

3. Add Appwrite variables to `.env`:

NOTE: this keys are generated and provided from appwrite.

GENERATE: COPY MY KEY [DOCS ENV](https://docs.google.com/document/d/15P_qzQ8g0w8pMYJ_U7_CCE7xK1m9cbTMXnfyu4gv_YU/edit?usp=sharing), This is not proper way on giving keys but tokens has expiration so this good for testing.

IF you want to access my appwrite, let me know I'll give you credentails.

```env
NEXT_PUBLIC_APPWRITE_PROJECT_ID=""
NEXT_PUBLIC_APPWRITE_PROJECT_NAME=""
NEXT_PUBLIC_APPWRITE_ENDPOINT=""
NEXT_PUBLIC_APPWRITE_DATABASE_ID=""
NEXT_PUBLIC_APPWRITE_APPLICANT_COLLECTION_ID=""
NEXT_PUBLIC_APPWRITE_INTERVIEW_COLLECTION_ID=""
NEXT_SECRET_KEY=""
```

4. Start dev server:

```bash
pnpm dev
```

5. Open `http://localhost:3000`

6. Sign in:

- Open `http://localhost:3000/login`
- The email/password fields are **pre-filled for demo/local use**, so you can usually just click **Sign in**.

See [Login notes (demo defaults + security)](./docs/LOGIN.md).

## Scripts

- `pnpm dev` - Run development server
- `pnpm build` - Build production app
- `pnpm start` - Run production server
- `pnpm lint` - Run lint checks

## Appwrite Notes

- Appwrite client setup lives in `src/lib/appwrite.ts`.
- Ticket test call lives in `src/app/ticket/page.tsx` (`sendPing` + `fetchDB`).
- The fetch uses `databases.listCollections(...)` with `NEXT_PUBLIC_APPWRITE_DATABASE_ID`.

## Project Structure

```text
docs/
├── DATABASE.md                # Appwrite DB setup + route mapping
├── LOGIN.md                   # Login flow, demo accounts, security notes
public/                        # Static assets (icons, images, placeholders)
src/
├── app/
│   ├── (dashboard)/           # Protected dashboard/applicant routes
│   ├── api/
│   │   ├── auth/              # Login/logout route handlers
│   │   └── data/              # Applicant/interview/dashboard APIs
│   ├── login/                 # Login page
│   └── layout.tsx             # App root layout
├── components/
│   ├── nav/                   # Top/side navigation components
│   ├── ui/                    # Reusable UI primitives
│   ├── applicant-form.tsx
│   └── interview-form.tsx
├── lib/                       # Appwrite env/server clients, errors, utils
└── types/                     # Shared enums/types
```
## Deployment

- Deployed under Appwrite Deployments.
- Ensure all `NEXT_PUBLIC_APPWRITE_*` variables are set in your deployment environment, plus `NEXT_SECRET_KEY` for any code path using the admin server client.
- This project is dependency-managed with `pnpm` (`pnpm-lock.yaml`), so use pnpm in CI/build where possible.


See also:

- [Database setup and route mapping](./docs/DATABASE.md)
- [Login notes (demo defaults + security)](./docs/LOGIN.md)
- [Challenges while building this](./docs/CHALLENGES.md)

## API integration (Appwrite)

The app talks to Appwrite through Next.js route handlers under `src/app/api`.

- **Auth**: session is stored in an HTTP-only cookie and reused by server routes via `createSessionClient()` in `src/lib/appwrite-server.ts`.
- **Data access**: applicants and interviews are read and written with Appwrite TablesDB (`listRows`, `getRow`, `createRow`, `updateRow`, `deleteRow`) from `src/app/api/data/*`.
- **Queries**: list endpoints support search, filters, sorting, and cursor pagination where implemented (see `docs/DATABASE.md` for field-level details).
- **CRUD**: full create, read, update, and delete flows are exposed for applicants; interviews support create and list/read patterns used by the UI.

## License

MIT. See `LICENSE`.
