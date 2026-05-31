<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Savazar Eventic AI Platform

## Quick Reference
- **Stack**: Next.js 16, Tailwind v4, better-sqlite3, @dnd-kit, shadcn/ui (Base UI)
- Port: 3078 (Docker) / 3000 (dev)
- **DB**: `prisma/dev.db` (SQLite via better-sqlite3)
- **Design**: See `DESIGN.md` — Primary violet `#6771ab`, cream `#fefce8`
- **Context**: See `CLAUDE.md` for full project map

Knowledge Graph Integration

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Savazar Eventic AI Platform

## Quick Reference
*   **Stack**: Next.js 16, Tailwind v4, better-sqlite3, @dnd-kit, shadcn/ui (Base UI)
*   Port: 3078 (Docker) / 3000 (dev)
*   **DB**: `prisma/dev.db` (SQLite via better-sqlite3)
*   **Design**: See `DESIGN.md` — Primary violet `#6771ab`, cream `#fefce8`
*   **Context**: See `CLAUDE.md` for full project map

## Development Standards

*   **API Error Handling Rule:** Every new API route file created must import and use `withErrorHandler` from `src/lib/api-handler.ts` to wrap its core logic.
*   **Idempotency Rule:** Any new database seeding scripts, migrations, or utility functions that populate the database must use Prisma upsert patterns rather than create to ensure the environment remains predictable and repeatable across all deployments.

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

(End of file - total 27 lines)
1. **Route params are Promises**: Always `await params` in route handlers: `{ params }: { params: Promise<{ id: string }> }`
2. **No `@apply` in CSS**: Tailwind v4 doesn't support `@apply` from `@import "tailwindcss"`. Use plain CSS or inline classes.
3. **Layout must be dynamic**: Any layout reading DB at render time must have `export const dynamic = 'force-dynamic'`
4. **Use `bg-[#hex]` classes** instead of CSS variables for consistency (Tailwind v4)
5. **Migration is non-destructive**: `src/lib/migrate.ts` uses `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ADD COLUMN` fallbacks — safe to run on every startup, never drops tables or deletes data
6. **DB connection**: Use `import db from "@/lib/db"` — singleton from `better-sqlite3`
7. **DB file path**: `prisma/dev.db`; Docker volume `./prisma:/app/prisma` persists data across restarts
