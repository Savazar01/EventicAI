# EventicAI — Agentic Event & Project Management Platform

**EventicAI** is a production-ready, AI-first platform for planning events, projects, and campaigns. It combines an intuitive Kanban/Timeline/Calendar workspace with hierarchical activity management, guest and vendor coordination, role-based team access, and multi-provider AI orchestration — all deployed on your infrastructure.

Built by [Savazar LLC](https://savazar.com).  
Hosted at **[eventicai.savazar.com](https://eventicai.savazar.com)**.

---

## Key Features

- **Kanban, Timeline & Calendar Views** — Drag-and-drop Kanban board with custom columns, a filterable timeline view, and a full calendar (month/week/day). Switch between views without losing context.
- **Hierarchical Activities** — Parent activities with nested sub-activities, each independently trackable with effort hours, budget, dates, location, assigned owners, and completion notes.
- **Guest & Vendor Management** — Add guests and vendors at the event or activity level. CSV import/export, RSVP status tracking (Attending / No / Maybe), and service assignment.
- **Role-Based Access Control** — Three tiers: **Savadmin** (full system access), **Event Manager** (all events, no admin settings), **Event User** (assigned events only).
- **Multi-Provider AI Integration** — Bring your own AI provider: OpenAI, Anthropic, Google Gemini, Groq, Ollama, LM Studio, or OpenRouter. Configured entirely through the Admin panel.
- **Reporting & Export** — Detailed guest, vendor, and activity reports with filtering, sorting, and CSV export.
- **Custom UI Configuration** — Customize colors, fonts, font sizes, and button labels in real time via the Admin panel.
- **Event Cloning** — Duplicate any event with all activities, guests, vendors, locations, and column configurations in one click.
- **Effort & Budget Tracking** — Set planned budget and hours per activity or event; track actuals at completion with currency selection (INR, USD, EUR, GBP, AED, SAR).
- **Localized Date Formatting** — Dates automatically format based on the business address country (US, India, UK, Australia, UAE, Singapore).

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), `lucide-react` icons |
| **Database** | SQLite via `better-sqlite3` (`prisma/dev.db`) |
| **Drag & Drop** | [@dnd-kit](https://dndkit.com) |
| **Authentication** | bcryptjs + httpOnly session cookies |
| **Infrastructure** | Docker (Node 22 Alpine), Docker Compose |

---

## Getting Started

### Prerequisites

- **Node.js** 22+ and **npm**
- **Docker Desktop** (optional, for containerized deployment)

### Local Development

```bash
# Install dependencies
npm install

# Run database migration
npx tsx src/lib/migrate.ts

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The default admin credentials are:

| Username | Password | Role |
|----------|----------|------|
| `savadmin` | `savadmin123` | System administrator |

You will be required to change the password on first login.

### Docker Deployment

```bash
# Build and start
docker-compose up -d --build

# Access at http://localhost:3078
```

The database is persisted via a Docker volume at `./prisma:/app/prisma`. Data survives container restarts and rebuilds.

---

## Architecture Overview

```
Event → Activity (parent/child) → Guest / Vendor / EventLocation
Settings (key-value store) → applied at runtime
TeamMember → Session (httpOnly cookie)
```

The platform uses a **self-healing, idempotent** migration pattern: `src/lib/migrate.ts` runs `CREATE TABLE IF NOT EXISTS` with `ALTER TABLE ADD COLUMN` fallbacks on every startup. It never drops tables or deletes data, making it safe for continuous deployment.

All API routes are wrapped with a centralized error handler (`src/lib/api-handler.ts`) that prevents stack traces from leaking to clients.

### Key Directories

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Public landing page |
| `src/app/dashboard/page.tsx` | Event dashboard — list, create, edit, clone, delete |
| `src/app/events/[id]/page.tsx` | Kanban board + activity details sheet |
| `src/app/admin/page.tsx` | Admin settings — branding, AI config, team management |
| `src/app/login/page.tsx` | Authentication |
| `src/lib/migrate.ts` | Database schema migration |
| `src/lib/auth.ts` | Session management & access control |
| `src/middleware.ts` | Route protection & redirects |
| `prisma/dev.db` | SQLite database file |

---

## Agentic AI Integration

EventicAI is architected for **multi-agent orchestration**. The Admin panel supports simultaneous configuration of multiple AI providers:

- **OpenAI** (GPT-4o, GPT-4)
- **Anthropic** (Claude 3.5 Sonnet)
- **Google Gemini** (Gemini 1.5 Pro)
- **Groq** (Llama 3, Mixtral)
- **Ollama** (local models)
- **LM Studio** (local models)
- **OpenRouter** (multi-provider gateway)

Each provider requires only an API key and model name — all configured through the UI. The platform stores credentials securely in the local database, never transmitting them to third-party services beyond the configured provider.

---

## Deployment

EventicAI is designed for **self-hosted deployment** on any VPS or container platform.

### Coolify

1. Connect your Git repository to Coolify.
2. Set the build pack to **Docker Compose**.
3. Coolify will detect `docker-compose.yml` and deploy automatically.
4. Configure the public port (default: `3078`) and domain (`eventicai.yourdomain.com`).
5. The database volume (`./prisma:/app/prisma`) persists data across deployments.

### Manual VPS Deployment

```bash
git clone https://github.com/your-org/eventicai.git
cd eventicai
docker-compose up -d --build
```

Place behind a reverse proxy (Caddy, Nginx, Traefik) with SSL termination for production use.

---

## License

Copyright © Savazar LLC. All rights reserved.

This project is licensed under the **Apache License, Version 2.0**. See the [LICENSE](./LICENSE) file for details.
