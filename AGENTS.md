# Savazar Eventic AI Platform — Developer Guidance & Context

This is the primary developer context and rule reference file for the Eventic AI Platform.

---

## Technical Stack & Configuration
* **Framework**: Next.js 16 (App Router, Turbopack)
* **Styling**: Tailwind CSS v4, shadcn/ui (Base UI React), `tw-animate-css`
* **Database**: PostgreSQL (Docker container: `pgvector/pgvector:pg17` on host port `5536`, container port `5432`)
* **ORM**: Prisma Client (with `@prisma/adapter-pg` pool adapter)
* **DB Connection**: Use `import prisma from "@/lib/prisma"` (Prisma client singleton)
* **Infrastructure**: Docker Desktop, docker-compose
* **Ports**: Port `3078` (Docker container mapping) / Port `3000` (Local Node dev server)
* **Design Tokens**: Primary violet `#6771ab`, cream surface variant `#fefce8` (see `DESIGN.md` for full specs)

---

## Architecture Overview

### Data Model
* **Event**: Base project entity.
* **Activity**: Tasks or phases linked to an Event. Supports nesting via self-referential `parent_activity_id` for sub-activities.
* **Guest / Vendor / EventLocation**: Resource and management tables linked to activities/events.
* **Settings**: Global key-value store for app title, brand colors, custom logo path, etc.
* **TeamMember**: Platform users and role configuration (`savadmin`, `event_manager`, `event_user`).

### Key Architectural Patterns & Rules
* **Utility Layer**: All robust, reusable logic resides in `src/lib/`. Key utilities include:
  * `src/lib/api-handler.ts`: Centralized API middleware for error handling.
  * `src/lib/migrate.ts`: Handles all database seeding and migration. Fully idempotent.

### Operational Guidelines (Self-Healing & Idempotency)
* The entire platform is designed to be self-healing and idempotent. When suggesting new code, always prioritize patterns that ensure predictable state management (e.g., using Prisma upsert/transactional logic over simple inserts). This maintains our 'Production-Ready' standard across all deployments.

---

## Key Files & Directories

| File / Directory | Purpose |
|------------------|---------|
| `src/app/page.tsx` | Dashboard — displays event lists, location dialogs, and event management |
| `src/app/events/[id]/page.tsx` | Kanban Board & Activity detail drawer panel |
| `src/app/admin/page.tsx` | Admin panel — brand settings, logo setup, and team member management |
| `src/app/layout.tsx` | Root layout — reads Settings table from DB, renders header/footer dynamically |
| `src/lib/prisma.ts` | Prisma Client database connection singleton |
| `src/lib/migrate.ts` | Schema migration & seeding script |
| `src/lib/api-handler.ts` | Centralized API error handling wrapper |
| `tests/` | Playwright E2E integration tests |

---

## API Routes Reference

| Route | Purpose |
|-------|---------|
| `GET / POST /api/events` | List or create events |
| `GET / PUT / DELETE /api/events/[id]` | Event CRUD |
| `GET / POST / PUT / DELETE /api/event-locations` | Event locations CRUD |
| `GET / POST / PUT / DELETE /api/activities` | Activities CRUD (including sub-activities) |
| `GET / POST /api/guests` | Guest list CRUD |
| `GET / POST /api/activities/[id]/vendors` | Vendor list CRUD per activity |
| `GET / POST / DELETE /api/team-members` | Team member management CRUD |
| `GET / POST /api/admin` | Settings configurations read/write |

---

## Development Standards & Coding Rules

1. **Route params are Promises**: Next.js 16 requires route params to be treated as Promises. Always `await params` in route handlers:
   ```ts
   // Example:
   export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
     ...
   }
   ```
2. **No `@apply` in CSS**: Tailwind v4 does not support `@apply` from imports. Use plain standard CSS rules or inline Tailwind classes.
   * *Example*: `src/app/globals.css` styles `.kanban-card` using plain CSS properties instead of `@apply`.
3. **Layout Dynamic Render**: Any layout or page reading from the DB at render time must declare:
   ```ts
   export const dynamic = 'force-dynamic';
   ```
   This ensures admin setting modifications reflect immediately across the app.
4. **Use Inline Color Hexes**: Use direct Tailwind background/text classes (e.g. `bg-[#6771ab]`) instead of CSS variables for Tailwind v4 visual consistency.
5. **API Error Handling Wrapper**: Every new API route file created must import and use `withErrorHandler` from `src/lib/api-handler.ts` to wrap its core logic.
6. **Idempotency Rule**: Seeding scripts, migrations, or database mutation utilities must use Prisma `upsert` patterns rather than raw `create` to ensure deployments are safe and repeatable.
7. **Database Migrations & Synchronization**: The database configuration uses PostgreSQL. Running the migration script (`src/lib/migrate.ts`) executes `npx prisma db push --accept-data-loss` to synchronize the PostgreSQL schema.
8. **Docker Persistence**: PostgreSQL data is persisted using the `pgdata` Docker volume defined in `docker-compose.yml`.

---

## Next Steps / Roadmap
* **WhatsApp Integration**: Connection via Evolution API to receive updates and respond to tasks.
* **Agentic AI & Custom Skills**: Development of autonomous agents that manage tasks and coordinate workflows using defined custom skills.
* **Calendar & Event Canvas Views**: Rich canvas-based visual editors and detailed calendar schedules.
* **Team Assignment**: Direct team member dropdown assignments linked to activities.

---

## Developer Workflows

### Command Cheat-sheet

```bash
# Run local dev environment
npm run dev

# Rebuild and start Docker containers
docker-compose build
docker-compose down
docker-compose up -d

# Manually trigger DB migration script
npx tsx src/lib/migrate.ts

# Run Playwright tests
npm test
```

### Knowledge Graph Integration
* Always prioritize the local knowledge graph (at `graphify-out/`) when answering architecture, dependency, or structural questions.
* Use the `/graphify` tool before scanning raw files to maintain token efficiency and ensure accuracy.
* **Maintenance Rule**: After significant code changes (new files, refactoring), run `graphify . --no-semantic` in the terminal to update the AST mapping.
