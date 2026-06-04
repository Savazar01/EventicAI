"use client";

import Link from "next/link";
import { useState } from "react";

const LOGO_URL = "https://savazar.com/wp-content/uploads/2023/10/cropped-Transparent_Image_2-300x100.png";

const FEATURES = [
  { title: "Kanban Boards", description: "Drag-and-drop boards that adapt to any workflow. Manage events, projects, campaigns, and operations — all with the same flexible interface.", icon: "columns" },
  { title: "Timeline View", description: "Visualize every milestone on an interactive timeline. Perfect for gantt-style planning across manufacturing, logistics, construction, and more.", icon: "timeline" },
  { title: "Calendar View", description: "Switch to a calendar view to manage deadlines, sessions, and recurring tasks. Day, week, or month — your schedule, your way.", icon: "calendar" },
  { title: "Customizable Workflows", description: "Tailor columns, statuses, and fields to match your process. From wedding planning to software releases — the board fits your industry.", icon: "sliders" },
  { title: "Personalized Dashboards", description: "Every user gets a role-aware workspace. Assign events, filter by team, and personalize the UI to match your brand.", icon: "user-check" },
  { title: "Multi-Industry Ready", description: "Event agencies, SMBs, enterprises, nonprofits — one platform adapts to your domain. Simple enough for a launch party, powerful enough for a product launch.", icon: "layers" },
];

const TECH_FEATURES = [
  { title: "Build Apps with AI", description: "Create powerful applications through natural conversation. Our AI engine turns your ideas into functional tools — no coding required.", icon: "brain" },
  { title: "Sovereign by Design", description: "Your data never leaves your infrastructure. Self-host on your own servers, VPC, or air-gapped environment. Zero third-party dependencies.", icon: "shield" },
  { title: "Private & Secure", description: "End-to-end encryption, no telemetry, no analytics phoning home. Role-based access control with audit trails. Your intellectual property stays yours.", icon: "lock" },
  { title: "For Users, SMBs & Enterprises", description: "Scale from a single user to thousands. Lightweight enough for a freelancer, robust enough for a Fortune 500 — all on the same platform.", icon: "users" },
  { title: "Open & Extensible", description: "Fully customizable stack. Bring your own AI provider (OpenAI, Anthropic, Ollama, Groq), integrate via APIs, and extend with plugins.", icon: "cpu" },
  { title: "One-Command Deploy", description: "Docker-based deployment with PostgreSQL persistence. Deploy on bare metal, VM, Kubernetes, or Raspberry Pi — it just works.", icon: "rocket" },
];

const COMING_SOON = [
  { title: "WhatsApp Integration", description: "Connect your boards to WhatsApp. Receive updates, respond to tasks, and manage workflows directly from your messaging app.", icon: "message" },
  { title: "Agentic AI", description: "Intelligent agents that autonomously manage tasks, coordinate workflows, and make decisions based on your rules and preferences.", icon: "bot" },
  { title: "Skills & Tools Engine", description: "Create and update custom AI skills and tools. Define capabilities, chain them into workflows, and watch your AI become an expert in your domain.", icon: "tool" },
  { title: "MCP Integration", description: "Model Context Protocol support for seamless AI-to-tool communication. Connect your AI agents to any API, database, or service securely.", icon: "plug" },
];

function FeatureIcon({ name, className }: { name: string; className?: string }) {
  const cls = `w-6 h-6 ${className || ""}`;
  switch (name) {
    case "brain": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.5-1 2.5-2 3l1 3h-6l1-3c-1-.5-2-1.5-2-3a4 4 0 0 1 4-4z"/><path d="M8 12h8"/><path d="M10 16h4"/><path d="M6 20c0-2 2-4 6-4s6 2 6 4"/></svg>;
    case "columns": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>;
    case "timeline": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case "calendar": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "users": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "shield": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case "lock": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
    case "rocket": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;
    case "sliders": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>;
    case "user-check": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>;
    case "cpu": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>;
    case "layers": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
    case "message": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
    case "bot": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>;
    case "tool": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
    case "plug": return <svg xmlns="http://www.w3.org/2000/svg" className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a6 6 0 0 1-12 0V8"/></svg>;
    default: return null;
  }
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
  );
}

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#f8fafc] via-[#ffffff] to-[#f4f6fc] text-slate-900 antialiased font-sans relative overflow-x-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-[#6771ab]/20 blur-[120px] pointer-events-none animate-float-1 z-0" />
      <div className="absolute top-[10%] right-[-15%] w-[55vw] h-[55vw] rounded-full bg-[#c484b0]/15 blur-[120px] pointer-events-none animate-float-2 z-0" />
      <div className="absolute bottom-[15%] left-[5%] w-[50vw] h-[50vw] rounded-full bg-[#fefce8]/70 blur-[100px] pointer-events-none z-0" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-200/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Savazar" className="h-9 w-auto object-contain transition-transform duration-300 hover:scale-105" />
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#6771ab] to-[#4a548c] bg-clip-text text-transparent">EventicAI</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              <a href="#features" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#6771ab] rounded-xl hover:bg-slate-100/50 transition-all duration-200 relative group">
                Features
                <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-[#6771ab] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <a href="#tech" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#6771ab] rounded-xl hover:bg-slate-100/50 transition-all duration-200 relative group">
                Technology
                <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-[#6771ab] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <a href="#coming-soon" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#6771ab] rounded-xl hover:bg-slate-100/50 transition-all duration-200 relative group">
                Coming Soon
                <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-[#6771ab] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
              <Link href="/login" className="ml-3 relative overflow-hidden px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md bg-[#6771ab] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#6771ab]/25 active:scale-[0.97]">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-shimmer" />
                Beta Access
              </Link>
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200">
              <MenuIcon />
            </button>
          </div>
        </div>
        
        {/* Mobile menu drawer panel */}
        <div className={`fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileOpen(false)}>
          <div className={`fixed top-0 right-0 h-full w-[280px] bg-white/95 backdrop-blur-lg shadow-2xl p-6 flex flex-col gap-6 border-l border-slate-200/50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <img src={LOGO_URL} alt="Savazar" className="h-8 w-auto object-contain" />
                <span className="text-lg font-bold text-[#6771ab]">EventicAI</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <a href="#features" onClick={() => setMobileOpen(false)} className="px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl hover:text-[#6771ab] transition-all">Features</a>
              <a href="#tech" onClick={() => setMobileOpen(false)} className="px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl hover:text-[#6771ab] transition-all">Technology</a>
              <a href="#coming-soon" onClick={() => setMobileOpen(false)} className="px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl hover:text-[#6771ab] transition-all">Coming Soon</a>
            </div>
            <div className="mt-auto border-t border-slate-100 pt-4">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-5 py-3.5 text-sm font-bold text-center text-white bg-[#6771ab] rounded-xl shadow-md active:scale-[0.97] transition-all">
                Beta Access
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40 overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 border border-[#e8e4c8] bg-[#fefce8]/90 text-[#6771ab] shadow-sm hover:scale-[1.02] transition-transform duration-200 cursor-default select-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Closed Beta · AI-First · Sovereign Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Build Intelligent Apps with{" "}
              <span className="bg-gradient-to-r from-[#6771ab] via-[#8b93c5] to-[#c484b0] bg-clip-text text-transparent">EventicAI</span>
            </h1>
            <p className="mt-8 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              The sovereign, privacy-first AI platform for users, SMBs, and enterprises. 
              Develop custom apps through natural conversation, deploy on your own infrastructure, 
              and keep your data completely under your control. Selected beta access only.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
              <a href="#beta" className="relative overflow-hidden w-full sm:w-auto px-8 py-4 text-base font-semibold text-white rounded-xl shadow-lg bg-[#6771ab] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#6771ab]/20 active:scale-[0.97] text-center">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-shimmer" />
                Request Beta Access
              </a>
              <a href="#features" className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-700 rounded-xl border border-slate-300 bg-white/70 backdrop-blur-sm shadow-sm hover:bg-white hover:-translate-y-0.5 hover:shadow-md hover:border-[#6771ab]/40 transition-all active:scale-[0.97] text-center">
                Explore Features
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 sm:py-32 bg-white/50 border-y border-slate-200/40 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-[#eef0f7] text-[#6771ab] border border-transparent shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Flexible by Design
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">One Platform, Infinite Possibilities</h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">Kanban, Timeline, and Calendar views that adapt to any industry — from event management to manufacturing, logistics to software development.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 p-8 shadow-sm hover:shadow-xl hover:shadow-[#6771ab]/5 hover:border-[#6771ab]/30 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-[#eef0f7] text-[#6771ab] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#6771ab] group-hover:text-white">
                  <FeatureIcon name={f.icon} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 transition-colors duration-200 group-hover:text-[#6771ab]">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section id="tech" className="py-24 sm:py-32 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-[#eef0f7] text-[#6771ab] border border-transparent shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Sovereign & Secure
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">AI That Answers to You</h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">Our core value proposition: build powerful apps with AI, deployed on your infrastructure, with sovereign data control, private by default, and secure by design.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {TECH_FEATURES.map((f, i) => (
              <div key={i} className="group relative bg-[#fefce8]/30 backdrop-blur-sm rounded-3xl border border-slate-200/50 p-8 shadow-sm hover:shadow-xl hover:shadow-[#6771ab]/5 hover:border-[#6771ab]/30 hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-[#fefce8] text-[#6771ab] border border-[#e8e4c8]/50 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#6771ab] group-hover:text-white">
                  <FeatureIcon name={f.icon} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 transition-colors duration-200 group-hover:text-[#6771ab]">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section id="coming-soon" className="py-24 sm:py-32 bg-white/50 border-t border-slate-200/40 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 bg-[#6771ab] text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Coming Soon
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">The Future Is Arriving</h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">We are building the next generation of AI-powered productivity. Here is what is on the horizon.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {COMING_SOON.map((f, i) => (
              <div key={i} className="group bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:shadow-[#6771ab]/5 hover:border-[#6771ab]/30 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[#eef0f7] text-[#6771ab] shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#6771ab] group-hover:text-white">
                    <FeatureIcon name={f.icon} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#6771ab] transition-colors">{f.title}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-0 sm:pl-16">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="beta" className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-br from-[#6771ab] to-[#4a548c] z-10 shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(196,132,176,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(254,252,232,0.1),transparent_50%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Closed Beta — Access by Invitation</h2>
          <p className="mt-6 text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">EventicAI is currently in a closed beta phase. Access is limited to selected beta users only. If you have received an invitation, sign in below.</p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            <Link href="/login" className="relative overflow-hidden w-full sm:w-auto px-10 py-4 text-base font-bold rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97] text-center bg-[#fefce8] text-[#4a548c] hover:bg-white">
              Sign In
            </Link>
            <a href="#features" className="w-full sm:w-auto px-10 py-4 text-base font-semibold text-white rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm shadow-sm hover:bg-white/20 hover:-translate-y-0.5 transition-all active:scale-[0.97] text-center">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <img src={LOGO_URL} alt="Savazar" className="h-8 w-auto object-contain" />
                <span className="text-lg font-bold tracking-tight text-[#6771ab]">EventicAI</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                A sovereign, AI-first platform for building intelligent apps. Selected beta access. Built with care by Savazar LLC.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm font-medium text-slate-600 hover:text-[#6771ab] transition-colors">Features</a></li>
                <li><a href="#tech" className="text-sm font-medium text-slate-600 hover:text-[#6771ab] transition-colors">Technology</a></li>
                <li><a href="#coming-soon" className="text-sm font-medium text-slate-600 hover:text-[#6771ab] transition-colors">Coming Soon</a></li>
                <li><Link href="/login" className="text-sm font-medium text-slate-600 hover:text-[#6771ab] transition-colors">Beta Access</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Legal</h4>
              <ul className="space-y-3">
                <li><a href="https://savazar.com/terms-of-use" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-600 hover:text-[#6771ab] transition-colors">Terms of Use</a></li>
                <li><a href="https://savazar.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-600 hover:text-[#6771ab] transition-colors">Privacy Policy</a></li>
                <li><a href="https://savazar.com/cookies-notice" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-600 hover:text-[#6771ab] transition-colors">Cookies Notice</a></li>
                <li><a href="https://savazar.com/data-privacy" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-600 hover:text-[#6771ab] transition-colors">Data Privacy</a></li>
                <li><a href="https://savazar.com/refund-and-return-policy" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-600 hover:text-[#6771ab] transition-colors">Return & Refund Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Connect</h4>
              <ul className="space-y-3">
                <li><a href="https://savazar.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-600 hover:text-[#6771ab] transition-colors">Savazar LLC</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} Savazar LLC. All rights reserved.</p>
            <p className="text-xs text-slate-400">EventicAI &mdash; <a href="https://eventicai.savazar.com" target="_blank" rel="noopener noreferrer" className="font-medium text-slate-500 hover:text-[#6771ab] transition-colors">eventicai.savazar.com</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
