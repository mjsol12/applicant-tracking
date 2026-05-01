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
NEXT_PUBLIC_APPWRITE_PROJECT_ID = ""
NEXT_PUBLIC_APPWRITE_PROJECT_NAME = ""
NEXT_PUBLIC_APPWRITE_ENDPOINT = ""
NEXT_PUBLIC_APPWRITE_DATABASE_ID = ""
NEXT_PUBLIC_APPWRITE_APPLICANT_COLLECTION_ID = ""
NEXT_PUBLIC_APPWRITE_INTERVIEW_COLLECTION_ID = ""
NEXT_SECRET_APPWRITE_API_KEY = ""
NEXT_SECRET_KEY = ""
```

4. Start dev server:

```bash
pnpm dev
```

5. Open `http://localhost:3000`

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
└── DATABASE.md                # Appwrite DB setup + route mapping
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
├── lib/                       # Appwrite client, errors, shared utils
└── types/                     # Shared enums/types
```

## Database

See [Database setup and route mapping](./docs/DATABASE.md).

## Deployment

- Deployed under Appwrite Deployments.
- Ensure all `NEXT_PUBLIC_APPWRITE_*` variables are set in your deployment environment.
- This project is dependency-managed with `pnpm` (`pnpm-lock.yaml`), so use pnpm in CI/build where possible.

## License

MIT. See `LICENSE`.
