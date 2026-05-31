1: This is a [Next.js](https://nextjs.org/docs/app/api-reference/cli/create-next-app) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
2: 
3: ## Getting Started
4: 
5: First, run the development server:
6: 
7: ```bash
8: npm run dev
9: # or
10: yarn dev
11: # or
12: pnpm dev
13: # or
14: bun dev
15: ```
16: 
17: Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
18: 
19: You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
20: 
21: This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
22: 
23: ## Learn More
24: 
25: To learn more about Next.js, take a look at the following resources:
26: 
27: ## AI-Native Development Stack
28: 
29: Prerequisites: LM Studio must be running the Gemma 4 E4B model with a 32k context window preset.
30: 
31: Knowledge Graph: This project uses Graphify to map the codebase.
32: 
33: Updating the Graph: If the AI seems unaware of recent changes, run `graphify . --no-semantic` to rebuild the index.
34: 
35: Operational Note: Always ensure LM Studio server is running before launching OpenCode.
36: - [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
37: 
## Development Standards

*   **Database:** The database seeding process is now fully idempotent. It can be safely run at any time using `npm run seed` without creating duplicate data or causing conflicts, ensuring a clean state for every Docker build.
*   **API Robustness:** All API routes are protected by a centralized error handler (`src/lib/api-handler.ts`). This ensures consistent error reporting and prevents stack traces from leaking to the client in production.
41: 
42: The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
43: 
44: Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.