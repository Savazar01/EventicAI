"use client";

import Link from "next/link";
import { useState } from "react";

const FEATURES = [
  { title: "AI-Powered Planning", description: "Intelligent scheduling, smart suggestions, and automated workflows that adapt to your event and project needs.", icon: "brain" },
  { title: "Kanban Boards", description: "Visualize your workflow with drag-and-drop Kanban boards. Move activities across columns as they progress.", icon: "columns" },
  { title: "Timeline & Calendar", description: "Switch between Kanban, Timeline, and Calendar views to manage deadlines and milestones at a glance.", icon: "calendar" },
  { title: "Guest & Vendor Management", description: "Track RSVPs, manage guest lists, and coordinate with vendors — all from one platform.", icon: "users" },
  { title: "Budget & Effort Tracking", description: "Set planned budgets and hours, then track actuals. Stay on top of costs and resource allocation.", icon: "dollar" },
  { title: "Activity Reports", description: "Generate detailed reports on activities, guests, and vendors. Export data for offline analysis.", icon: "chart" },
];

const TECH_FEATURES = [
  { title: "Local First", description: "Your data stays on your infrastructure. No cloud dependency, no third-party servers. Full control, always.", icon: "server" },
  { title: "Privacy by Design", description: "End-to-end data ownership. No telemetry, no analytics phoning home. What you create stays yours.", icon: "shield" },
  { title: "Easy Deployment", description: "One Docker command to deploy. SQLite-backed persistence means zero configuration — just run.", icon: "rocket" },
  { title: "Full Customization", description: "Customize colors, fonts, button labels, and branding from the Admin panel. Make the platform yours.", icon: "sliders" },
  { title: "Personalization", description: "Role-based access, per-user event assignments, and customizable date formats based on your locale.", icon: "user-check" },
  { title: "AI Integrations", description: "Bring your own AI provider — OpenAI, Anthropic, Gemini, Groq, Ollama, or LM Studio. You choose.", icon: "cpu" },
];

function FeatureIcon({ name, className }: { name: string; className?: string }) {
  const cls = `w-6 h-6 ${className || ""}`;
  switch (name) {
    case "brain": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-1 2.5-2 3l1 3h-6l1-3c-1-.5-2-1.5-2-3a4 4 0 0 1 4-4z"/><path d="M8 12h8"/><path d="M10 16h4"/><path d="M6 20c0-2 2-4 6-4s6 2 6 4"/></svg>;
    case "columns": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>;
    case "calendar": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "users": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "dollar": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
    case "chart": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
    case "server": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>;
    case "shield": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case "rocket": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;
    case "sliders": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>;
    case "user-check": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>;
    case "cpu": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>;
    default: return null;
  }
}

function ArrowRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
  );
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Savazar" className="h-9 w-auto" />
              <span className="text-lg font-bold tracking-tight" style={{ color: '#6771ab' }}>EventicAI</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <a href="#features" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#6771ab] rounded-lg hover:bg-slate-50 transition-all">Features</a>
              <a href="#tech" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#6771ab] rounded-lg hover:bg-slate-50 transition-all">Technology</a>
              <Link href="/login" className="ml-3 px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm transition-all active:scale-[0.97]" style={{ backgroundColor: '#6771ab' }} onMouseEnter={e => (e.target as HTMLElement).style.filter = 'brightness(0.9)'} onMouseLeave={e => (e.target as HTMLElement).style.filter = ''}>Sign In</Link>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all">
              <MenuIcon />
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-all">Features</a>
            <a href="#tech" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-all">Technology</a>
            <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-semibold text-white rounded-xl text-center transition-all" style={{ backgroundColor: '#6771ab' }}>Sign In</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #eef0f7 0%, #fefce8 50%, #f8fafc 100%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ backgroundColor: '#eef0f7', color: '#6771ab' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              AI-First · Local-First Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Plan Smarter with{" "}
              <span style={{ color: '#6771ab' }}>EventicAI</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              The intelligent platform for planning events, projects, and campaigns. 
              AI-powered, privacy-first, and deployed entirely on your infrastructure.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white rounded-xl shadow-md transition-all active:scale-[0.97] text-center" style={{ backgroundColor: '#6771ab' }} onMouseEnter={e => (e.target as HTMLElement).style.filter = 'brightness(0.9)'} onMouseLeave={e => (e.target as HTMLElement).style.filter = ''}>
                Get Started
              </Link>
              <a href="#features" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-700 rounded-xl border border-slate-300 bg-white/80 shadow-sm hover:bg-white transition-all active:scale-[0.97] text-center">
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* End User Features */}
      <section id="features" className="py-20 sm:py-28" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Everything You Need</h2>
            <p className="mt-4 text-lg text-slate-600">Powerful features designed for event planners, project managers, and campaign organizers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="group bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors" style={{ backgroundColor: '#eef0f7', color: '#6771ab' }}>
                  <FeatureIcon name={f.icon} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Features */}
      <section id="tech" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ backgroundColor: '#eef0f7', color: '#6771ab' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Built for the Modern Stack
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Technology You Can Trust</h2>
            <p className="mt-4 text-lg text-slate-600">Designed from the ground up with privacy, performance, and personalization as core principles.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {TECH_FEATURES.map((f, i) => (
              <div key={i} className="rounded-2xl border p-6 sm:p-8 transition-all duration-200" style={{ borderColor: '#e2e8f0' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: '#fefce8', color: '#6771ab' }}>
                  <FeatureIcon name={f.icon} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28" style={{ background: 'linear-gradient(135deg, #eef0f7 0%, #fefce8 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-slate-600">Deploy EventicAI on your infrastructure today and take control of your event and project planning.</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white rounded-xl shadow-md transition-all active:scale-[0.97] text-center" style={{ backgroundColor: '#6771ab' }} onMouseEnter={e => (e.target as HTMLElement).style.filter = 'brightness(0.9)'} onMouseLeave={e => (e.target as HTMLElement).style.filter = ''}>Sign In</Link>
            <Link href="/login" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-700 rounded-xl border border-slate-300 bg-white/80 shadow-sm hover:bg-white transition-all active:scale-[0.97] text-center">Create Account</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Savazar" className="h-8 w-auto" />
                <span className="text-base font-bold tracking-tight" style={{ color: '#6771ab' }}>EventicAI</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                An AI-first, local-first event and project planning platform. Built with care by Savazar LLC.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Platform</h4>
              <ul className="space-y-2.5">
                <li><a href="#features" className="text-sm text-slate-600 hover:text-[#6771ab] transition-colors">Features</a></li>
                <li><a href="#tech" className="text-sm text-slate-600 hover:text-[#6771ab] transition-colors">Technology</a></li>
                <li><Link href="/login" className="text-sm text-slate-600 hover:text-[#6771ab] transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li><a href="https://savazar.com/terms-of-use" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-[#6771ab] transition-colors">Terms of Use</a></li>
                <li><a href="https://savazar.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-[#6771ab] transition-colors">Privacy Policy</a></li>
                <li><a href="https://savazar.com/cookies-notice" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-[#6771ab] transition-colors">Cookies Notice</a></li>
                <li><a href="https://savazar.com/data-privacy" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-[#6771ab] transition-colors">Data Privacy</a></li>
                <li><a href="https://savazar.com/refund-and-return-policy" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-[#6771ab] transition-colors">Return & Refund Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Connect</h4>
              <ul className="space-y-2.5">
                <li><a href="https://savazar.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-[#6771ab] transition-colors">Savazar LLC</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Savazar LLC. All rights reserved.</p>
            <p className="text-xs text-slate-500">EventicAI &mdash; <a href="https://eventicai.savazar.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#6771ab] transition-colors">eventicai.savazar.com</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
