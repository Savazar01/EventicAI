# Savazar Eventic AI Platform — Project Context

## Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui (Base UI React), `tw-animate-css`
- **Database**: SQLite via `better-sqlite3` (file: `prisma/dev.db`)
- **Drag & Drop**: @dnd-kit
- **Icons**: lucide-react
- **Infrastructure** Docker Desktop (node 22 - alpine), docker-compose (port 3078)

## Architecture

### Data Model
Event → Activity (self-referential parent_activity_id for sub-activities) → Guest / Vendor / EventLocation
Settings (key-value), TeamMember

### Key App Files
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Dashboard — event list, create/edit dialogs, location management |
| `src/app/events/[id]/page.tsx` | Kanban board + activity detail drawer |
| `src/app/admin/page.tsx` | Admin: brand settings, LLM config, team members |
| `src/app/layout.tsx` | Root layout — reads Settings DB table, renders header/footer dynamically |
| `src/lib/migrate.ts` | Schema migration (runs at Docker build + locally) |
| `src/lib/db.ts` | better-sqlite3 singleton |

### API Routes
| Route | Purpose |
|-------|---------|
| `GET/POST /api/events` | List / create events |
| `GET/PUT/DELETE /api/events/[id]` | Single event CRUD |
| `GET/POST/PUT/DELETE /api/event-locations` | Event locations CRUD |
| `GET/POST/PUT /api/activities` | Activities (with sub-activity auto-completion) |
| `GET/POST /api/guests` | Guest CRUD per activity |
| `GET/POST /api/activities/[id]/vendors` | Vendor CRUD per activity |
| `GET/POST/DELETE /api/team-members` | Team member CRUD |
| `GET/POST /api/admin` | Settings read/write |

## Design System
See `DESIGN.md` for complete Material 3 palette. Key tokens:
- Primary: `#6771ab` (violet)
- Cream surface: `#fefce8`
- All buttons, active tabs, labels: violet

Knowledge Graph Integration

# Savazar Eventic AI Platform — Project Context

## Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui (Base UI React), `tw-animate-css`
- **Database**: SQLite via `better-sqlite3` (file: `prisma/dev.db`)
- **Drag & Drop**: @dnd-kit
- **Icons**: lucide-react
- **Infrastructure** Docker Desktop (node 22 - alpine), docker-compose (port 3078)

## Architecture Overview

### Data Model
Event → Activity (self-referential parent_activity_id for sub-activities) → Guest / Vendor / EventLocation
Settings (key-value), TeamMember

### Key Architectural Patterns & Rules
*   **Utility Layer**: All robust, reusable logic resides in `src/lib/`. Key utilities include:
    *   `src/lib/api-handler.ts`: Centralized API middleware for error handling.
    *   `src/lib/seed.ts`: Handles all database seeding and is now fully idempotent.

### Operational Guidelines (Self-Healing & Idempotency)
*   The entire platform is designed to be self-healing and idempotent. When suggesting new code, always prioritize patterns that ensure predictable state management (e.g., using upsert/transactional logic over simple inserts). This maintains our 'Production-Ready' standard across all deployments.

### Key App Files
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Dashboard — event list, create/edit dialogs, location management |
| `src/app/events/[id]/page.tsx` | Kanban board + activity detail drawer |
| `src/app/admin/page.tsx` | Admin: brand settings, LLM config, team members |
| `src/app/layout.tsx` | Root layout — reads Settings DB table, renders header/footer dynamically |
| `src/lib/migrate.ts` | Schema migration (runs at Docker build + locally) |
| `src/lib/db.ts` | better-sqlite3 singleton |

### API Routes
| Route | Purpose |
|-------|---------|
| `GET/POST /api/events` | List / create events |
| `GET/POST/PUT/DELETE /api/events/[id]` | Single event CRUD |
| `GET/POST/PUT /api/event-locations` | Event locations CRUD |
| `GET/POST/PUT /api/activities` | Activities (with sub-activity auto-completion) |
| `GET/POST /api/guests` | Guest CRUD per activity |
| `GET/POST /api/activities/[id]/vendors` | Vendor CRUD per activity |
| `GET/POST/DELETE /api/team-members` | Team member CRUD |
| `GET/POST /api/admin` | Settings read/write |

## Design System
See `DESIGN.md` for complete Material 3 palette. Key tokens:
- Primary: `#6771ab` (violet)
- Cream surface: `#fefce8`
- All buttons, active tabs, labels: violet

Knowledge Graph Integration

*   Always prioritize the local knowledge graph (at `graphify-out/`) when answering architecture, dependency, or structural questions.
*   Use the `/graphify` tool before scanning raw files to maintain token efficiency and ensure accuracy.
*   **Maintenance Rule**: After significant code changes (new files, refactoring), run `graphify . --no-semantic` in the terminal to update the AST mapping and keep the graph current.

1. **Route params are Promises**: Always `await params` in route handlers: `{ params }: { params: Promise<{ id: string }> }`
2. **No `@apply` in CSS**: Tailwind v4 doesn't support `@apply` from `@import "tailwindcss"`. Use plain CSS or inline classes.
3. **Layout must be dynamic**: Any layout reading DB at render time must have `export const dynamic = 'force-dynamic'`
4. **Use `bg-[#hex]` classes** instead of CSS variables for consistency (Tailwind v4)
5. **Migration is non-destructive**: `src/lib/migrate.ts` uses `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ADD COLUMN` fallbacks — safe to run on every startup, never drops tables or deletes data
6. **DB connection**: Use `import db from "@/lib/db"` — singleton from `better-sqlite3`
7. **DB file path**: `prisma/dev.db`; Docker volume `./prisma:/app/prisma` persists data across restarts

## Build & Deploy
```bash
# Local dev
npm run dev

# Build + Docker
docker-compose build
docker-compose down
docker-compose up -d

# Migration (runs inside Docker build, also run locally after schema changes)
npx tsx src/lib/migrate.ts
```

## Testing
- Playwright in `tests/`
- Base URL: `http://localhost:3078`
- Command: `npm test`

## Next Steps / Roadmap
- Phase 3: AI Chat Interface, WhatsApp/Email Integration, Calendar/Event Canvas View
- Team member assignment to activities (UI already has dropdown)
- WhatsApp integration via Evolution API
- Always use `export const dynamic = 'force-dynamic'` in layouts that read DB at render time (admin settings must reflect immediately)
- Route handler params are Promises in Next.js 16: `{ params }: { params: Promise<{ id: string }> }` — always `await params`
- Use direct `bg-[#hex]` Tailwind classes rather than `@apply` (Tailwind v4 limitation)
- `src/app/globals.css` has `.kanban-card` with plain CSS (no `@apply`)
- Schema migration drops and recreates all tables on each run (dev mode)
- Docker volume mounts `./prisma:/app/prisma` for DB persistence

## Build & Deploy
```bash
# Local dev
npm run dev

# Build + Docker
docker-compose build
docker-compose down
docker-compose up -d

# Migration (runs inside Docker build, also run locally after schema changes)
npx tsx src/lib/migrate.ts
```

## Testing
- Playwright in `tests/`
- Base URL: `http://localhost:3078`
- Command: `npm test`

## Next Steps / Roadmap
- Phase 3: AI Chat Interface, WhatsApp/Email Integration, Calendar/Event Canvas View
- Team member assignment to activities (UI already has dropdown)
- WhatsApp integration via Evolution API
