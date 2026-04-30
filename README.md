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

NOTE: this keys are generated and provided by appwrite.
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
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
src/
├── app/               # App Router pages
├── components/        # UI and chart components
├── config/            # Config files
├── data/              # Mock/sample data
├── hooks/             # Custom React hooks
├── lib/               # Utilities and Appwrite client
├── style/             # Global styles
└── types/             # Type definitions
```

## Deployment

- Deployed under Appwrite Deployments.
- Ensure all `NEXT_PUBLIC_APPWRITE_*` variables are set in your deployment environment.
- This project is dependency-managed with `pnpm` (`pnpm-lock.yaml`), so use pnpm in CI/build where possible.

## License

MIT. See `LICENSE`.
