import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";

async function main() {
  console.log("Enabling pgvector extension...");
  await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS vector");

  console.log("Running schema migration...");
  execSync("npx prisma db push --config prisma/config.ts --accept-data-loss", { stdio: "inherit" });

  console.log("Seeding database...");

  const settings: { key: string; value: string }[] = [
    { key: "appTitle", value: "Savazar Agentic Events & Projects Platform" },
    { key: "logoUrl", value: "/logo.png" },
    { key: "brandColor", value: "#6771ab" },
    { key: "llmEnabledOpenAI", value: "" },
    { key: "llmEnabledAnthropic", value: "" },
    { key: "llmEnabledOpenRouter", value: "" },
    { key: "llmEnabledGemini", value: "true" },
    { key: "llmEnabledGroq", value: "" },
    { key: "llmEnabledOllama", value: "" },
    { key: "llmEnabledLMStudio", value: "" },
    { key: "colorPrimary", value: "#6771ab" },
    { key: "colorPrimaryLight", value: "#8b93c5" },
    { key: "colorPrimaryDark", value: "#4a5280" },
    { key: "colorPrimaryContainer", value: "#eef0f7" },
    { key: "colorOnPrimaryContainer", value: "#2d336b" },
    { key: "colorSecondary", value: "#8b93c5" },
    { key: "colorSecondaryContainer", value: "#f0f1fa" },
    { key: "colorOnSecondaryContainer", value: "#3d4580" },
    { key: "colorTertiary", value: "#c484b0" },
    { key: "colorTertiaryContainer", value: "#fce4f0" },
    { key: "colorAccent", value: "#ffcc00" },
    { key: "colorCream", value: "#fefce8" },
    { key: "colorSuccess", value: "#22c55e" },
    { key: "colorWarning", value: "#f59e0b" },
    { key: "colorError", value: "#ef4444" },
    { key: "colorBackground", value: "#f8fafc" },
    { key: "colorForeground", value: "#1e293b" },
    { key: "colorCard", value: "#ffffff" },
    { key: "colorCardForeground", value: "#1e293b" },
    { key: "colorBorder", value: "#e2e8f0" },
    { key: "colorOutline", value: "#cbd5e1" },
    { key: "colorInput", value: "#e2e8f0" },
    { key: "colorRing", value: "#6771ab" },
    { key: "fontFamily", value: "Inter" },
    { key: "fsPageTitle", value: "1.5rem" },
    { key: "fsSectionHeading", value: "1.125rem" },
    { key: "fsCardTitle", value: "0.875rem" },
    { key: "fsSidebarItem", value: "0.75rem" },
    { key: "fsFormLabel", value: "0.75rem" },
    { key: "fsBodyText", value: "0.75rem" },
    { key: "fsStatValue", value: "0.75rem" },
    { key: "fsButtonText", value: "0.875rem" },
    { key: "btnAddActivity", value: "Add Activity" },
    { key: "btnMarkComplete", value: "Mark Complete" },
    { key: "btnSave", value: "Save" },
    { key: "btnDelete", value: "Delete" },
    { key: "btnCloneEvent", value: "Copy" },
    { key: "btnAddGuest", value: "Add Guest" },
    { key: "btnAddVendor", value: "Add Vendor" },
    { key: "btnCancel", value: "Cancel" },
    { key: "btnEdit", value: "Edit" },
    { key: "btnCreateEvent", value: "Create Event/Project" },
    { key: "btnEditEvent", value: "Edit Event/Project" },
    { key: "btnViewBoard", value: "View Board" },
    { key: "llmModelOpenAI", value: "GPT-4o" },
    { key: "llmModelAnthropic", value: "Claude 3.5 Sonnet" },
    { key: "llmModelOpenRouter", value: "" },
    { key: "llmModelGemini", value: "Gemini 1.5 Pro" },
    { key: "llmModelGroq", value: "Llama 3 70B" },
    { key: "llmModelOllama", value: "llama2" },
    { key: "llmModelLMStudio", value: "" },
    { key: "llmKeyOpenAI", value: "" },
    { key: "llmKeyAnthropic", value: "" },
    { key: "llmKeyOpenRouter", value: "" },
    { key: "llmKeyGemini", value: "" },
    { key: "llmKeyGroq", value: "" },
    { key: "llmKeyOllama", value: "" },
    { key: "llmKeyLMStudio", value: "" },
  ];

  for (const s of settings) {
    await prisma.settings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  const existingAdmin = await prisma.teamMember.findUnique({ where: { username: "savadmin" } });
  if (!existingAdmin) {
    const hash = await bcrypt.hash("savadmin123", 12);
    await prisma.teamMember.create({
      data: { username: "savadmin", name: "Super Admin", role: "savadmin", password: hash, force_password_change: 1 },
    });
    console.log("  Created default savadmin user (password: savadmin123)");
  }

  const eventsWithoutColumns = await prisma.event.findMany({
    where: { columnConfigs: { none: {} } },
    select: { id: true },
  });
  for (const ev of eventsWithoutColumns) {
    await prisma.columnConfig.createMany({
      data: [
        { event_id: ev.id, status_id: "backlog", label: "Backlog", color: "#6771ab", sort_order: 0 },
        { event_id: ev.id, status_id: "in-progress", label: "In-Progress", color: "#c484b0", sort_order: 1 },
      ],
    });
    console.log(`  Seeded default columns for event ${ev.id}`);
  }

  const legacyDoneCols = await prisma.columnConfig.findMany({
    where: { status_id: "done", label: "Done", sort_order: 2 },
  });
  for (const c of legacyDoneCols) {
    await prisma.columnConfig.delete({ where: { id: c.id } });
    console.log(`  Removed legacy auto-seeded Done column (id=${c.id})`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => process.exit(0));
