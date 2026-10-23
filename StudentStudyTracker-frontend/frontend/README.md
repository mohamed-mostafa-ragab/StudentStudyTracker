# Student Study Tracker — Angular client

Modern, mobile-first, bilingual (Arabic RTL / English LTR) client for the Student Study Tracker API.

- **Angular 21** — standalone components, signals, new control flow, lazy-loaded routes, `OnPush` everywhere.
- **No UI framework** — a small hand-written CSS design system (`src/styles.css`) with light/dark themes and logical properties, so RTL/LTR flips for free.
- **Custom i18n** — runtime language switching (no rebuild per language) via `I18nService` + the `t` pipe.

## Run

```bash
npm install
npm start              # http://localhost:4200
npm run build          # production build -> dist/frontend
```

The API address lives in `src/environments/`:

| File | Used by | Default |
|---|---|---|
| `environment.development.ts` | `npm start` / `ng build --configuration development` | `https://localhost:7177` |
| `environment.ts` | production build | **set your deployed API URL** |

The API must allow the client origin in `Cors:AllowedOrigins` (default `http://localhost:4200`) and its HTTPS dev certificate must be trusted (`dotnet dev-certs https --trust`).

## Structure

```
src/app/
├── core/            # services: auth, api, i18n, theme, toast, confirm, error mapping · interceptor · guards · models
├── i18n/            # ar.ts / en.ts dictionaries
├── layout/          # app shell (sidebar on desktop, bottom nav on mobile)
├── shared/          # icon, progress ring, status badge, modal, toast & confirm hosts
└── features/
    ├── auth/        # login, register
    ├── dashboard/   # progress, subjects, overdue, reviews, week summary
    ├── learn/       # year levels → subjects → chapters (accordion with per-lesson tracking)
    ├── plan/        # weekly plan + add/edit dialog
    ├── settings/    # language, theme, change password, sign out
    └── admin/       # one page for the whole curriculum tree (years → subjects → chapters → lessons)
```

## How it talks to the API

- `AuthService` stores the session (token, expiry, roles) in `localStorage`; guards (`authGuard`, `guestGuard`, `studentGuard`, `adminGuard`) protect routes. These are for UX only — **the API enforces every permission**.
- `authInterceptor` adds `Authorization: Bearer …`, and on a `401` clears the session and redirects to login.
- `ErrorService` turns the API's `{ "message": … }` errors into translated messages.
- Dates use the API's `yyyy-MM-dd` format; weeks run **Saturday → Friday** (same rule as the backend).

## Add a language

1. Copy `src/app/i18n/en.ts` to `xx.ts` and translate the values (keep the keys).
2. Register it in `I18nService` (`DICTS`, the `Lang` type) and add a switcher entry; set `dir` for RTL languages.

## Notes

- Student pages call student-only endpoints; the admin sees only the curriculum manager and settings.
- After registering, students are signed in immediately (the API returns a token on register).
