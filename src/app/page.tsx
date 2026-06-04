import prisma from "@/lib/prisma";
import LandingPageClient from "./LandingPageClient";

export const dynamic = 'force-dynamic';

export default async function Page() {
  let appTitle = "EventicAI";
  let logoUrl = "https://savazar.com/wp-content/uploads/2023/10/cropped-Transparent_Image_2-300x100.png";
  
  try {
    const titleRow = await prisma.settings.findUnique({ where: { key: "appTitle" } });
    if (titleRow) appTitle = titleRow.value;
    const logoRow = await prisma.settings.findUnique({ where: { key: "logoUrl" } });
    if (logoRow) logoUrl = logoRow.value;
  } catch (e) {
    console.error("Failed to load settings in landing page", e);
  }

  return <LandingPageClient appTitle={appTitle} logoUrl={logoUrl} />;
}
