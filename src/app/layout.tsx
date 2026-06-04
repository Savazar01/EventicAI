import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Roboto, Poppins, Playfair_Display, Open_Sans, Lato, Montserrat, Source_Sans_3, Nunito, Quicksand } from "next/font/google";
import "./globals.css";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap", preload: true });
const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["300", "400", "500", "700"], display: "swap", preload: false });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], display: "swap", preload: false });
const playfairDisplay = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap", preload: false });
const openSans = Open_Sans({ variable: "--font-open-sans", subsets: ["latin"], display: "swap", preload: false });
const lato = Lato({ variable: "--font-lato", subsets: ["latin"], weight: ["300", "400", "700"], display: "swap", preload: false });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"], display: "swap", preload: false });
const sourceSans3 = Source_Sans_3({ variable: "--font-source-sans", subsets: ["latin"], display: "swap", preload: false });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"], display: "swap", preload: false });
const quicksand = Quicksand({ variable: "--font-quicksand", subsets: ["latin"], display: "swap", preload: false });

const FONT_MAP: Record<string, string> = {
  Inter: 'var(--font-inter)',
  Roboto: 'var(--font-roboto)',
  Poppins: 'var(--font-poppins)',
  'Playfair Display': 'var(--font-playfair)',
  'Open Sans': 'var(--font-open-sans)',
  Lato: 'var(--font-lato)',
  Montserrat: 'var(--font-montserrat)',
  'Source Sans Pro': 'var(--font-source-sans)',
  Nunito: 'var(--font-nunito)',
  Quicksand: 'var(--font-quicksand)',
};

export const metadata: Metadata = {
  title: "Event Manager",
  description: "Manage your events efficiently",
};

const DB_TO_CSS: Record<string, string> = {
  brandColor: '--brand-violet',
  colorPrimary: '--brand-violet',
  colorPrimaryLight: '--brand-violet-light',
  colorPrimaryDark: '--brand-violet-dark',
  colorPrimaryContainer: '--brand-violet-container',
  colorOnPrimaryContainer: '--brand-on-violet-container',
  colorSecondary: '--brand-secondary',
  colorSecondaryContainer: '--brand-secondary-container',
  colorOnSecondaryContainer: '--brand-on-secondary-container',
  colorTertiary: '--brand-rose',
  colorTertiaryContainer: '--brand-rose-container',
  colorAccent: '--brand-yellow',
  colorCream: '--brand-cream',
  colorSuccess: '--brand-success',
  colorWarning: '--brand-warning',
  colorError: '--brand-error',
  colorBackground: '--background',
  colorForeground: '--foreground',
  colorCard: '--card',
  colorCardForeground: '--card-foreground',
  colorBorder: '--border',
  colorOutline: '--outline',
  colorInput: '--input',
  colorRing: '--ring',
  fontFamily: '--font-family',
  fsPageTitle: '--fs-page-title',
  fsSectionHeading: '--fs-section-heading',
  fsCardTitle: '--fs-card-title',
  fsSidebarItem: '--fs-sidebar-item',
  fsFormLabel: '--fs-form-label',
  fsBodyText: '--fs-body-text',
  fsStatValue: '--fs-stat-value',
  fsButtonText: '--fs-button-text',
};

const CSS_DEFAULTS: Record<string, string> = {
  '--brand-violet': '#6771ab',
  '--brand-violet-light': '#8b93c5',
  '--brand-violet-dark': '#4a5280',
  '--brand-violet-container': '#eef0f7',
  '--brand-on-violet-container': '#2d336b',
  '--brand-secondary': '#8b93c5',
  '--brand-secondary-container': '#f0f1fa',
  '--brand-on-secondary-container': '#3d4580',
  '--brand-rose': '#c484b0',
  '--brand-rose-container': '#fce4f0',
  '--brand-yellow': '#ffcc00',
  '--brand-cream': '#fefce8',
  '--brand-success': '#22c55e',
  '--brand-warning': '#f59e0b',
  '--brand-error': '#ef4444',
  '--background': '#f8fafc',
  '--foreground': '#1e293b',
  '--card': '#ffffff',
  '--card-foreground': '#1e293b',
  '--border': '#cbd5e1',
  '--outline': '#94a3b8',
  '--input': '#cbd5e1',
  '--ring': '#6771ab',
  '--popover': '#ffffff',
  '--popover-foreground': '#1e293b',
  '--muted': '#f1f5f9',
  '--muted-foreground': '#64748b',
  '--accent': '#eef0f7',
  '--accent-foreground': '#2d336b',
  '--font-family': 'var(--font-inter)',
  '--fs-page-title': '1.5rem',
  '--fs-section-heading': '1.125rem',
  '--fs-card-title': '0.875rem',
  '--fs-sidebar-item': '0.75rem',
  '--fs-form-label': '0.75rem',
  '--fs-body-text': '0.75rem',
  '--fs-stat-value': '0.75rem',
  '--fs-button-text': '0.875rem',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cssVars = { ...CSS_DEFAULTS };

  // Auth check
  let currentUser: { name: string; role: string; force_password_change: number } | null = null;
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    if (sessionToken) {
      const session = await prisma.session.findFirst({
        where: { token: sessionToken, expires_at: { gt: new Date() } },
        include: { user: { select: { name: true, role: true, force_password_change: true } } },
      });
      if (session) currentUser = session.user;
    }
  } catch {} // Ignore cookie/session errors on first load

  try {
    const settings = await prisma.settings.findMany();
    const config: Record<string, string> = {};
    for (const s of settings) config[s.key] = s.value;
    for (const [dbKey, cssVar] of Object.entries(DB_TO_CSS)) {
      if (config[dbKey]) cssVars[cssVar] = config[dbKey];
    }
  } catch (e) {
    console.error("Failed to load settings from DB", e);
  }

  const primary = cssVars['--brand-violet'];
  const logoUrl = cssVars['--brand-cream'] ? undefined : undefined;
  let appTitle = "Savazar Agentic Events & Projects Platform";
  let logoPath = "/logo.png";
  try {
    const titleRow = await prisma.settings.findUnique({ where: { key: "appTitle" } });
    if (titleRow) appTitle = titleRow.value;
    const logoRow = await prisma.settings.findUnique({ where: { key: "logoUrl" } });
    if (logoRow) logoPath = logoRow.value;
  } catch {}

  const fontName = cssVars['--font-family'] || 'Inter';
  const selectedFontVar = FONT_MAP[fontName] || FONT_MAP['Inter'] || 'var(--font-inter)';
  cssVars['--font-family'] = selectedFontVar;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${roboto.variable} ${poppins.variable} ${playfairDisplay.variable} ${openSans.variable} ${lato.variable} ${montserrat.variable} ${sourceSans3.variable} ${nunito.variable} ${quicksand.variable} h-full antialiased`} style={cssVars as React.CSSProperties}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {currentUser && (
          <header className="border-b bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
              <div className="flex items-center gap-3">
                  {logoPath && <img src={logoPath} alt="Client Logo" className="h-10 w-auto object-contain" />}
                  <h1 className="text-xl font-bold tracking-tight" style={{ color: primary }}>{appTitle}</h1>
              </div>
              {/* Desktop Nav */}
              <nav className="hidden md:flex gap-6 font-medium text-sm text-slate-600 items-center">
                  <span className="text-xs text-slate-500 mr-2">{currentUser.name}</span>
                  <a href="/dashboard" className="hover:text-[var(--brand-violet)] transition-colors">Dashboard</a>
                  <a href="/docs" className="hover:text-[var(--brand-violet)] transition-colors">Docs</a>
                  {currentUser.role === 'savadmin' && (
                    <a href="/admin" className="hover:text-[var(--brand-violet)] transition-colors">Admin</a>
                  )}
                  <form action="/api/auth/logout" method="POST" className="inline">
                    <button type="submit" className="text-xs text-slate-500 hover:text-red-600 transition-colors">Logout</button>
                  </form>
              </nav>

              {/* Mobile Hamburger Menu */}
              <details className="md:hidden relative">
                <summary className="list-none flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors select-none">
                  <span className="text-xs text-slate-500 max-w-[80px] truncate">{currentUser.name}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 shrink-0"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                </summary>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-lg p-3 space-y-1 z-50">
                  <div className="px-3 py-2.5 text-sm font-semibold text-slate-900 border-b border-slate-100 mb-1 truncate">{currentUser.name}</div>
                  <a href="/dashboard" className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">Dashboard</a>
                  <a href="/docs" className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">Docs</a>
                  {currentUser.role === 'savadmin' && (
                    <a href="/admin" className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">Admin</a>
                  )}
                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <form action="/api/auth/logout" method="POST">
                      <button type="submit" className="w-full text-left px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">Logout</button>
                    </form>
                  </div>
                </div>
              </details>
          </header>
        )}
        <main className={`flex-1 ${currentUser ? "p-4 sm:p-6" : ""}`}>{children}</main>
        {currentUser && (
          <footer className="border-t bg-white p-6 text-center text-sm text-slate-600">
              <div className="flex justify-center items-center gap-2">
                  <span>Powered by</span>
                  <img src="/logo.png" alt="Savazar Logo" className="h-10 w-auto opacity-90" />
                  <span className="font-semibold text-slate-700">Savazar Agentic Events & Projects Platform</span>
              </div>
          </footer>
        )}
      </body>
    </html>
  );
}
