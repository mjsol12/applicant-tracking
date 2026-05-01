# Login (Appwrite session)


## Local / demo sign-in

1. Open [http://localhost:3000/login](http://localhost:3000/login).
2. Use one of the demo accounts below (or your own Appwrite users).
3. Click **Sign in**.

The login page can **pre-fill** credentials for quick local testing. Do not rely on hard-coded passwords in production builds; use environment-specific users and remove or gate demo defaults if you ship a public demo.

## Demo accounts (template)

These are the **two** accounts referenced by the UI and docs. Create both in **Appwrite Console → Auth → Users** (or your signup flow) with **Email/Password** so sign-in succeeds.

| Role (label) | Email | Password (example) |
| --- | --- | --- |
| Admin (default) | `admin@atd.com` | `Rhx7wpWVn8Yv@AF` |
| Recruiter (alternate) | `interviewer@atd.com` | `interviewer` |


## Security notes

- **Never commit** production secrets; use `.env` locally and your host’s env in deployment.
- Demo passwords in source are only for local/template convenience.
- Session cookie is `httpOnly`, `sameSite: strict`, and `secure` in production.

## Related files

- `src/app/login/page.tsx` — sign-in form
- `src/app/api/auth/login/route.ts` — session creation + cookie
- `src/app/api/auth/logout/route.ts` — session end + cookie clear
