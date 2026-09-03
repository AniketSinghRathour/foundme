
This document is the single source of truth for the backend's architecture.
Every decision below was deliberately made across a long planning
conversation — treat this as final, not a draft to re-litigate. If
something isn't covered here, flag it as a genuine open question rather
than assuming a default.

---

## 1. System context (how this backend fits the whole app)

Three independent projects live in one GitHub repo, with **no workspace
tooling** linking them (no npm/pnpm workspaces, no monorepo build system).
Each has its own `package.json`, own `node_modules`, installed and run
separately.

```
project-root/
├── backend/     ← THIS project. Express 5 + TypeScript.
├── frontend/    ← Next.js. Calls this backend over HTTP.
└── lambda/      ← Fully independent. Own Prisma schema (trimmed:
                   Photo + Face only). Own deploy process (manual,
                   not via this backend). Indexes photos automatically
                   via S3 → SQS → Lambda, writes directly to the same
                   Postgres database this backend uses. This backend
                   does NOT trigger or manage Lambda — they're
                   connected only through the shared database and S3
                   bucket, never by direct API calls between them.
```

**No `shared/` folder** — see §10. Each project (`backend/`, `frontend/`,
`lambda/`) defines its own schemas/types independently, even where that
means near-duplicate definitions across projects. This is a deliberate
tradeoff, not an oversight.

**Critical constraint**: Lambda and this backend both write to overlapping
tables (`Photo`, `Face`). Lambda's `schema.prisma` is a deliberately
trimmed duplicate of the relevant models. If you ever change the shape of
`Photo` or `Face` here, the Lambda project's schema must be updated to
match by hand — nothing enforces this automatically. This is a known,
accepted tradeoff, not an oversight.

---

## 2. Tech stack (all versions/choices are final, not defaults to accept blindly)

| Piece | Choice | Notes |
|---|---|---|
| Runtime | Node.js, TypeScript | |
| Web framework | **Express 5** | Not 4. Must be pinned explicitly in `package.json` (`"express": "^5.x"`) — do not let a bare `npm install express` land on whatever's tagged latest without confirming it resolves to 5.x. |
| Validation | **Zod v4** | Not v3. Pin explicitly (`"zod": "^4.x"`). v4 changed some API surface (e.g. `z.email()` vs `.email()`) — don't write code assuming v3 patterns. |
| ORM | Prisma | Full schema here (not trimmed like Lambda's). |
| Database | PostgreSQL via Neon | Same Neon project/database the Lambda already writes to. |
| Auth | **Better-Auth**, not Clerk | Chosen deliberately over Clerk for architectural consistency (self-owned, no external managed dependency) — do not substitute Clerk. |
| Auth providers | Email/password **+ Google OAuth** | Google sign-in is a real, required feature, not optional. See §6. |
| Frontend | Next.js | Separate project, calls this backend over HTTP. Backend does NOT contain Next.js API routes, server actions calling Prisma directly, or any frontend rendering. |

---

## 3. Full folder structure (final)

```
backend/
├── src/
│   ├── app/
│   │   ├── common/
│   │   │   ├── middleware/
│   │   │   │   ├── validate.ts        (generic Zod validation middleware)
│   │   │   │   └── errorHandler.ts    (formats errors — see §5)
│   │   │   ├── utils/
│   │   │   │   ├── ApiError.ts
│   │   │   │   └── ApiResponse.ts
│   │   │   └── config/
│   │   │       ├── env.ts             (single source of validated env — see §4)
│   │   │       ├── prisma.ts
│   │   │       ├── s3.ts
│   │   │       └── rekognition.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts       (mounts Better-Auth's handler)
│   │   │   │   ├── auth.config.ts       (Better-Auth instance: providers,
│   │   │   │   │                          Google OAuth, DB adapter)
│   │   │   │   └── auth.middleware.ts   (session verification — imported
│   │   │   │                             by OTHER modules' routes)
│   │   │   ├── events/
│   │   │   │   ├── event.routes.ts
│   │   │   │   ├── event.controller.ts  (shapes response inline, no DTO file)
│   │   │   │   ├── event.service.ts     (calls Prisma directly, no repository)
│   │   │   │   └── event.schema.ts
│   │   │   ├── photos/
│   │   │   │   ├── photo.routes.ts
│   │   │   │   ├── photo.controller.ts
│   │   │   │   ├── photo.service.ts
│   │   │   │   └── photo.schema.ts
│   │   │   ├── search/
│   │   │   │   ├── search.routes.ts
│   │   │   │   ├── search.controller.ts
│   │   │   │   ├── search.service.ts
│   │   │   │   ├── search.schema.ts
│   │   │   │   └── search.middleware.ts   (placeholder for rate-limiting —
│   │   │   │                                see §9, not built yet)
│   │   │   └── webhooks/
│   │   │       ├── webhook.routes.ts     (needs RAW body — see §8)
│   │   │       └── webhook.controller.ts
│   │   └── app.ts                          (createApplication(): builds
│   │                                         Express app, mounts all module
│   │                                         routers + common middleware)
│   └── server.ts                             (createServer + listen — entry point)
├── prisma/
│   └── schema.prisma                          (see §6 — Better-Auth models +
│                                                 domain models, generated
│                                                 in that order)
├── package.json
├── tsconfig.json
└── .env                                        (single file, gitignored, no
                                                   .env.local/.env.production
                                                   variants — see §4)
```

---

## 4. Environment variables — `env.ts` is the single source

`common/config/env.ts` parses `process.env` through **one flat Zod
schema**, once, at import time. Every other config file (`prisma.ts`,
`s3.ts`, `rekognition.ts`, `modules/auth/auth.config.ts`) imports the
validated `env` object from here — **none of them read `process.env`
directly.**

Rule: `env.ts` has zero imports from sibling config files. Everything
else imports FROM it. Never the reverse (avoid circular imports).

Required variables (consolidate as the schema, mark genuinely-required
fields with no default — a missing `DATABASE_URL` should crash the app at
boot, not silently proceed):

```
DATABASE_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
BETTER_AUTH_SECRET          (session signing secret — Better-Auth requires this)
BETTER_AUTH_URL              (this backend's own base URL, for OAuth callback construction)
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
S3_BUCKET_NAME
PORT                          (optional, default 8080)
```

`dotenv` (or equivalent) must be imported and loaded at the very top of
`server.ts`, BEFORE `env.ts` is ever imported/executed — otherwise
`process.env` will be empty when Zod tries to parse it.

Production: no `.env` file is ever deployed. Real values are injected
directly by whatever hosts this backend, via its own env var settings —
same pattern already used for the Lambda project.

---

## 5. Error handling — no asyncHandler, Express 5 native behavior

**Do not add `asyncHandler.ts` or `express-async-errors`.** This was
explicitly removed after being mistakenly reintroduced during planning —
do not re-add it. Express 5 automatically forwards errors thrown inside
`async` route handlers (including rejected promises) to error-handling
middleware. Controllers just `throw ApiError.notFound(...)` etc. directly;
no wrapping needed.

`ApiError` and `ApiResponse` both live in `common/utils/` (together, not
split across an `errors/` folder — that separate folder was considered and
rejected).

`ApiError` shape: extends `Error`, carries `statusCode`, `message`,
optional `errors[]` array, static factory methods (`.badRequest()`,
`.unauthorized()`, `.forbidden()`, `.notFound()`, `.conflict()`,
`.internal()`).

`ApiResponse` shape: static methods (`.ok()`, `.created()`, `.noContent()`)
that call `res.status(...).json({ success, message, data })` — Express
style (`res` passed in, not returned), since this is Express, not Next.js.

`errorHandler.ts` (in `common/middleware/`, registered **last** in
`app.ts`): does NOT catch errors (Express 5 does that automatically) —
only FORMATS whatever error arrives. If it's an `ApiError`, format using
its fields. Otherwise, treat as unexpected: log it, return a generic 500,
never leak internal details to the client.

---

## 6. Auth — Better-Auth, Google OAuth, and what this means for the schema

Better-Auth is its own module (`modules/auth/`), not scattered across
`common/`. It requires its own database tables (users, sessions, accounts,
verification tokens — exact model names depend on Better-Auth's current
CLI output).

**Build sequence, do not reverse this order:**
1. Run Better-Auth's schema-generation step first (its CLI, against an
   otherwise-empty `schema.prisma`) — this produces the auth-related
   models Better-Auth requires.
2. THEN add the domain models (`Event`, `Photo`, `Face`, `Match` if ever
   needed) into the same `schema.prisma`, on top of what Better-Auth
   generated.
3. Do not hand-write your domain models first and try to graft
   Better-Auth's models on afterward — this risks naming collisions and
   fighting Better-Auth's expected shape.

**Important structural consequence**: because identity now lives in this
backend's own Postgres (via Better-Auth's generated `User` model, or
equivalent), `Event.ownerId` should be a **real foreign key relation** to
that model — not a loose external ID string (which would have been the
case under a Clerk-based design, where identity lives outside your
database entirely). This is a genuine difference from earlier drafts of
this plan that assumed Clerk — Better-Auth pulls identity into your own
schema.

**Google OAuth, concretely:**
- Requires a Google Cloud Console OAuth app (client ID + secret), set up
  outside this codebase, with the callback URL registered as
  `{BETTER_AUTH_URL}/api/auth/callback/google` (or whatever path
  Better-Auth's current convention specifies — verify against Better-Auth's
  docs at implementation time, don't assume this exact path is still
  correct without checking).
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` come from `env.ts`, wired
  into Better-Auth's social-provider config in `auth.config.ts`.
- This is a config-level addition to Better-Auth's setup, not custom OAuth
  code written by hand.
- Frontend needs a corresponding "Sign in with Google" trigger using
  Better-Auth's client-side social sign-in method — this is a two-sided
  feature (backend config + frontend trigger), not backend-only. Test this
  flow specifically and early, since it's the auth path most likely to
  expose a CORS/cookie misconfiguration first (see §9).

`auth.middleware.ts` (session verification) is imported by OTHER modules'
routes that need to require a logged-in user (e.g. `event.routes.ts`).
This is an intentional, expected cross-module import — auth is the one
module nearly everything else legitimately depends on. It is not a
violation of module isolation.

---

## 7. Modules — what exists and why

Five modules. Do not add a `users` module unless a genuine need for
app-specific user data beyond what Better-Auth's model provides emerges —
until then, Better-Auth's own generated model is sufficient.

- **`auth`** — see §6.
- **`events`** — create event (also triggers Rekognition `CreateCollection`
  — this call happens in `event.service.ts`), get event, list a
  photographer's events, get event status (polled by the frontend's
  upload-progress UI).
- **`photos`** — generate presigned S3 upload URLs (batched — one request
  for many files, not one request per file), create corresponding
  `pending` `Photo` rows. Possibly list photos in an event for the
  photographer's gallery view.
- **`search`** — the attendee-facing selfie search endpoint. Calls
  Rekognition `SearchFacesByImage`, looks up matching `Face` rows in
  Postgres, returns preview URLs. **No caching** — calls Rekognition fresh
  on every request, deliberately, for simplicity (see §9).
- **`webhooks`** — receives Better-Auth's own webhook events (and
  potentially future ones, e.g. Stripe if payments are ever added). Needs
  raw body handling (see §8). No service/service or schema files unless
  genuinely needed — likely just routes + controller forwarding to
  Better-Auth's handler.

**No repository layer, no DTO layer** — both deliberately dropped.
Services call Prisma directly. Controllers shape response objects inline
as plain object literals; if the exact same shape is reused more than once
within one module's controller file, extract a small local function
inside that file — do not create a separate `*.dto.ts` file for this.

**Per-module `*.schema.ts`**: local Zod schemas only. No `shared/` folder
exists in this project (see §10) — each module's schemas are
self-contained, even if a similar shape happens to also be defined
independently in `frontend/`.

**Per-module `*.middleware.ts`** (optional, only where needed): for
logic specific to that module's routes that wouldn't make sense applied
elsewhere (e.g. `search.middleware.ts` eventually holding rate-limiting
specific to the search endpoint). Generic, cross-cutting concerns
(validation, error formatting) stay in `common/middleware/`.

---

## 8. `app.ts` — mounting order and the webhook raw-body requirement

`app.ts` (in `src/app/`) exports `createApplication()`, which:
1. Creates the Express app
2. Configures CORS — **wide open for now** (no origin restriction). This
   is a deliberate, temporary choice for the build phase — flag as a
   required hardening step before any real/public usage, especially since
   Better-Auth's cookie-based sessions make loose CORS a genuine exposure,
   not just a style preference.
3. Mounts the webhook route BEFORE the global JSON body parser, scoped
   with `express.raw({ type: "application/json" })` instead of
   `express.json()` — webhook signature verification needs the raw,
   unparsed body. Concretely:
   `app.use("/webhooks", express.raw({ type: "application/json" }), webhookRouter)`
   registered ahead of the general `app.use(express.json())` call for
   everything else.
4. Applies `express.json()` globally for all other routes
5. Mounts each module's router (`/api/events`, `/api/photos`,
   `/api/search`, `/api/auth`)
6. Registers `errorHandler` **last**, after all routes

`server.ts` (at `src/`, one level above `app/`) imports `createApplication`
from `./app/app.ts`, wraps it with Node's `createServer`, and calls
`.listen(env.PORT, ...)`. This file also loads `dotenv` first, before
anything else runs.

---

## 9. Explicitly deferred — do NOT build these yet, and do not treat their
absence as an oversight to silently "fix"

- **Logging** (structured/otherwise) — not built yet. Deferred
  deliberately.
- **Rate limiting** — `search.routes.ts` is currently unprotected against
  abuse. `search.middleware.ts` exists as a placeholder location for this,
  but nothing is implemented there yet. Do not launch with real, public
  users before this is addressed.
- **Search result caching** (`Match` table) — deliberately not built.
  `search.service.ts` calls Rekognition fresh every time. No `Match` model
  needed in the schema unless this decision is revisited.
- **CORS lockdown** — currently wide open, deliberately, for the build
  phase only.
- **Repository layer, DTO layer** — deliberately dropped, see §7.
- **`.env.local`/`.env.production` variants** — deliberately using one
  plain `.env`, with production values injected by the host platform
  directly.

If asked to "review the plan for gaps," these six items are known,
intentional gaps — not things to silently add without being asked.

---

## 10. `shared/` folder — not used

Decision reversed from an earlier draft of this plan: **no `shared/`
folder for schemas.** Sharing Zod schemas between `frontend/` and
`backend/` without workspace tooling adds more complexity (path
resolution across two independently-installed projects, keeping both in
sync manually) than it saves. Each project defines what it needs
independently, even where that means near-duplicate schemas or enums
(e.g. a `PhotoStatus` set of values) existing in both `backend/` and
`frontend/`.

If the frontend needs to know valid values for something like photo
status, define it locally in the frontend too — do not reach across to
`backend/` for it, and do not create a `shared/` folder to solve this.
Accept the small duplication as the simpler tradeoff, consistent with the
overall "no monorepo tooling" decision already made for this project.

---

## 11. Known process notes (context for whoever continues this)

This plan went through several rounds of correction during initial
planning — worth knowing the specific mistakes that were caught and fixed,
so they aren't reintroduced:
- `asyncHandler` was added, removed (Express 5 makes it unnecessary), then
  accidentally reintroduced once, then removed again. It should not exist
  anywhere in this codebase.
- Auth was initially split awkwardly across `common/config/auth.ts` and
  `common/middleware/auth.ts` before being consolidated into its own
  `modules/auth/` — if you see auth-related config outside
  `modules/auth/`, that's stale and should be moved.
- Google OAuth as a requirement was stated early, dropped from an
  intermediate plan revision, and had to be explicitly re-added — treat it
  as a firm, permanent requirement, not optional scope.

---

## 12. Suggested build order

1. `common/config/env.ts` + `.env` — get validated config working first,
   since everything else depends on it
2. Better-Auth schema generation → merge into `prisma/schema.prisma` →
   add domain models → `prisma generate` / push to Neon
3. `modules/auth/` — Better-Auth instance config, routes, middleware.
   Get email/password working, then layer in Google OAuth.
4. `common/utils/ApiError.ts` + `ApiResponse.ts`, `common/middleware/errorHandler.ts`
5. `app.ts` + `server.ts` — minimal, just health check + auth mounted,
   confirm the server boots and auth works end-to-end before adding
   domain modules
6. `modules/events/` — including the Rekognition `CreateCollection` call
7. `modules/photos/` — presigned URL batching
8. `modules/search/` — the attendee-facing search endpoint
9. `modules/webhooks/` — raw body handling, Better-Auth webhook consumption
10. Only after all of the above works end-to-end: revisit §9's deferred
    list deliberately, one item at a time, starting with rate limiting on
    `search.routes.ts` before any real usage.
