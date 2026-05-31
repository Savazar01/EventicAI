"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Save, Upload, Download, Filter, Menu, MapPin, Users, CreditCard, Palette, Cpu, Pencil, X } from 'lucide-react';

type TeamMember = { id: number; username: string; name: string; first_name?: string | null; last_name?: string | null; whatsapp: string | null; email?: string | null; role?: string; event_ids?: string; };

const COUNTRY_STATES: Record<string, { label: string; states: string[]; zipLabel: string }> = {
  India: {
    label: 'India',
    states: ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'],
    zipLabel: 'PIN Code',
  },
  US: { label: 'United States', states: ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'], zipLabel: 'ZIP Code' },
  UK: { label: 'United Kingdom', states: ['England','Scotland','Wales','Northern Ireland'], zipLabel: 'Postcode' },
  Australia: { label: 'Australia', states: ['New South Wales','Victoria','Queensland','Western Australia','South Australia','Tasmania','Australian Capital Territory','Northern Territory'], zipLabel: 'Postcode' },
  UAE: { label: 'United Arab Emirates', states: ['Abu Dhabi','Dubai','Sharjah','Ajman','Fujairah','Ras Al Khaimah','Umm Al Quwain'], zipLabel: 'Postal Code' },
  Singapore: { label: 'Singapore', states: [], zipLabel: 'Postal Code' },
};

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' }, { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Dubai', label: 'UAE' }, { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'America/New_York', label: 'US Eastern' }, { value: 'Europe/London', label: 'UK' },
  { value: 'Australia/Sydney', label: 'Australia' }, { value: 'Asia/Riyadh', label: 'Saudi Arabia' },
];

const LANGUAGES = [
  'English','Spanish','French','German','Chinese (Simplified)','Japanese','Korean','Arabic','Portuguese','Russian','Italian','Dutch','Turkish',
  'Hindi','Bengali','Telugu','Marathi','Tamil','Urdu','Gujarati','Kannada','Malayalam','Odia','Punjabi','Assamese',
];

const COLORS: { key: string; label: string; description: string }[] = [
  { key: 'brandColor', label: 'Brand Color (Primary)', description: 'Main accent color used for buttons, header text, active tab indicators, links, and focus rings.' },
  { key: 'colorPrimary', label: 'Primary', description: 'Primary violet accent — fills action buttons, active sidebar nav items, and highlighted UI elements.' },
  { key: 'colorPrimaryLight', label: 'Primary Light', description: 'Lighter tint of primary for hover states, subtle backgrounds, and secondary highlights.' },
  { key: 'colorPrimaryDark', label: 'Primary Dark', description: 'Darker shade of primary for pressed/active states and emphasis.' },
  { key: 'colorPrimaryContainer', label: 'Primary Container', description: 'Background tint for alternating table rows, active section areas.' },
  { key: 'colorOnPrimaryContainer', label: 'On Primary Container', description: 'Text and icon color displayed on top of Primary Container backgrounds.' },
  { key: 'colorSecondary', label: 'Secondary', description: 'Secondary accent — used for secondary buttons, @username text, decorative icons.' },
  { key: 'colorSecondaryContainer', label: 'Secondary Container', description: 'Background surface for secondary-themed sections and info areas.' },
  { key: 'colorTertiary', label: 'Tertiary (Rose)', description: 'Rose accent — used for stat highlights, guest counts, special decorative elements.' },
  { key: 'colorTertiaryContainer', label: 'Tertiary Container', description: 'Rose-tinted background for tertiary-themed container areas.' },
  { key: 'colorAccent', label: 'Accent (Yellow)', description: 'Yellow accent for callouts, attention-grabbing badges, and highlight marks.' },
  { key: 'colorCream', label: 'Cream', description: 'Warm off-white used for Kanban column backgrounds, dashboard cards, and subtle section fills.' },
  { key: 'colorSuccess', label: 'Success', description: 'Green for completed activity status, success messages, positive indicators.' },
  { key: 'colorWarning', label: 'Warning', description: 'Amber/orange for in-progress status indicators, pending states, and caution alerts.' },
  { key: 'colorError', label: 'Error', description: 'Red for delete buttons, error messages, destructive actions.' },
  { key: 'colorBackground', label: 'Page Background', description: 'Overall page background color behind all content panels.' },
  { key: 'colorForeground', label: 'Text Foreground', description: 'Primary body text color for paragraphs, descriptions, and general content.' },
  { key: 'colorCard', label: 'Card Background', description: 'Surface background for cards, sheets, dialogs, and content panels.' },
  { key: 'colorCardForeground', label: 'Card Foreground', description: 'Text color used inside cards, sheets, and dialog components.' },
  { key: 'colorBorder', label: 'Border', description: 'Border color for cards, inputs, dividers, and UI component outlines.' },
  { key: 'colorOutline', label: 'Outline', description: 'Subtle divider and separator lines between sections and list items.' },
  { key: 'colorInput', label: 'Input Background', description: 'Background fill for text input fields, selects, and textareas.' },
  { key: 'colorRing', label: 'Ring / Focus', description: 'Focus ring color that appears around focused interactive elements.' },
];

const SETTINGS_DEFAULTS: Record<string, string> = {
  llmEnabledOpenAI: '', llmEnabledAnthropic: '', llmEnabledOpenRouter: '', llmEnabledGemini: 'true', llmEnabledGroq: '', llmEnabledOllama: '', llmEnabledLMStudio: '', logoUrl: '/logo.png', appTitle: 'Savazar Agentic Events & Projects Platform',
  brandColor: '#6771ab',
  colorPrimary: '#6771ab', colorPrimaryLight: '#8b93c5', colorPrimaryDark: '#4a5280',
  colorPrimaryContainer: '#eef0f7', colorOnPrimaryContainer: '#2d336b',
  colorSecondary: '#8b93c5', colorSecondaryContainer: '#f0f1fa', colorOnSecondaryContainer: '#3d4580',
  colorTertiary: '#c484b0', colorTertiaryContainer: '#fce4f0',
  colorAccent: '#ffcc00', colorCream: '#fefce8',
  colorSuccess: '#22c55e', colorWarning: '#f59e0b', colorError: '#ef4444',
  colorBackground: '#f8fafc', colorForeground: '#1e293b', colorCard: '#ffffff', colorCardForeground: '#1e293b',
  colorBorder: '#e2e8f0', colorOutline: '#cbd5e1', colorInput: '#e2e8f0', colorRing: '#6771ab',
  fontFamily: 'Inter',
  fsPageTitle: '1.5rem', fsSectionHeading: '1.125rem', fsCardTitle: '0.875rem',
  fsSidebarItem: '0.75rem', fsFormLabel: '0.75rem', fsBodyText: '0.75rem',
  fsStatValue: '0.75rem', fsButtonText: '0.875rem',
  btnAddActivity: 'Add Activity', btnMarkComplete: 'Mark Complete',
  btnSave: 'Save', btnDelete: 'Delete', btnCloneEvent: 'Copy',
  btnAddGuest: 'Add Guest', btnAddVendor: 'Add Vendor',
  btnCancel: 'Cancel', btnEdit: 'Edit',
  btnCreateEvent: 'Create Event/Project', btnEditEvent: 'Edit Event/Project',
  btnViewBoard: 'View Board',
  llmModelOpenAI: 'GPT-4o', llmModelAnthropic: 'Claude 3.5 Sonnet',
  llmModelOpenRouter: '', llmModelGemini: 'Gemini 1.5 Pro',
  llmModelGroq: 'Llama 3 70B', llmModelOllama: 'llama2', llmModelLMStudio: '',
  llmKeyOpenAI: '', llmKeyAnthropic: '', llmKeyOpenRouter: '', llmKeyGemini: '', llmKeyGroq: '', llmKeyOllama: '', llmKeyLMStudio: '',
};

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Default)', display: "'Inter', sans-serif" },
  { value: 'Roboto', label: 'Roboto (Material Design)', display: "'Roboto', sans-serif" },
  { value: 'Poppins', label: 'Poppins', display: "'Poppins', sans-serif" },
  { value: 'Playfair Display', label: 'Playfair Display', display: "'Playfair Display', serif" },
  { value: 'Open Sans', label: 'Open Sans', display: "'Open Sans', sans-serif" },
  { value: 'Lato', label: 'Lato', display: "'Lato', sans-serif" },
  { value: 'Montserrat', label: 'Montserrat', display: "'Montserrat', sans-serif" },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', display: "'Source Sans Pro', sans-serif" },
  { value: 'Nunito', label: 'Nunito', display: "'Nunito', sans-serif" },
  { value: 'Quicksand', label: 'Quicksand', display: "'Quicksand', sans-serif" },
];

const FONT_SIZES: { key: string; label: string; description: string }[] = [
  { key: 'fsPageTitle', label: 'Page Title', description: 'Main page heading at the top of dashboard and event detail pages (h1).' },
  { key: 'fsSectionHeading', label: 'Section Heading', description: 'Section titles like "Summary Status", "Activities", "Guests", "Vendors".' },
  { key: 'fsCardTitle', label: 'Card Title', description: 'Activity/task titles on Kanban cards, Timeline cards, and calendar cells.' },
  { key: 'fsSidebarItem', label: 'Sidebar Item', description: 'Navigation items in the left sidebar — view switches, report buttons, menu links.' },
  { key: 'fsFormLabel', label: 'Form Label', description: 'Labels above form fields ("Title", "Date", "Duration", "Description", etc.).' },
  { key: 'fsBodyText', label: 'Body Text', description: 'General descriptive and helper text — descriptions, hints, annotations.' },
  { key: 'fsStatValue', label: 'Stat Value', description: 'Numerical values displayed in summary stat boxes (parent count, guest count, vendor count).' },
  { key: 'fsButtonText', label: 'Button Text', description: 'Text inside all action buttons — Add Activity, Save, Delete, Cancel, etc.' },
];

const BUTTON_LABELS: { key: string; label: string; description: string; defaultValue: string }[] = [
  { key: 'btnAddActivity', label: 'Add Activity Button', description: 'Button to create a new activity on event detail pages.', defaultValue: 'Add Activity' },
  { key: 'btnMarkComplete', label: 'Mark Complete Button', description: 'Button in the Activity Detail sheet to mark an activity as done.', defaultValue: 'Mark Complete' },
  { key: 'btnSave', label: 'Save Button', description: 'Generic save/submit button used in forms and dialogs.', defaultValue: 'Save' },
  { key: 'btnDelete', label: 'Delete Button', description: 'Button to delete/remove an item (activities, guests, vendors).', defaultValue: 'Delete' },
  { key: 'btnCloneEvent', label: 'Copy Button', description: 'Button to duplicate an event with all its activities, guests, and vendors.', defaultValue: 'Copy' },
  { key: 'btnAddGuest', label: 'Add Guest Button', description: 'Button to add a guest to an activity or event.', defaultValue: 'Add Guest' },
  { key: 'btnAddVendor', label: 'Add Vendor Button', description: 'Button to add a vendor/service provider to an activity.', defaultValue: 'Add Vendor' },
  { key: 'btnCancel', label: 'Cancel Button', description: 'Generic cancel/close button used in dialogs, sheets, and forms.', defaultValue: 'Cancel' },
  { key: 'btnEdit', label: 'Edit Button', description: 'Button to edit an activity, guest, or vendor details.', defaultValue: 'Edit' },
  { key: 'btnCreateEvent', label: 'Create Event/Project Button', description: 'Button and dialog title for creating a new event or project.', defaultValue: 'Create Event/Project' },
  { key: 'btnEditEvent', label: 'Edit Event/Project Button', description: 'Dialog title for editing an existing event or project.', defaultValue: 'Edit Event/Project' },
  { key: 'btnViewBoard', label: 'View Board Button', description: 'Button on event tiles to navigate to the event detail board page.', defaultValue: 'View Board' },
];

const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI', models: 'GPT-4o, GPT-4, GPT-3.5' },
  { value: 'anthropic', label: 'Anthropic', models: 'Claude 3.5 Sonnet, Claude 3 Opus' },
  { value: 'openrouter', label: 'OpenRouter', models: 'Multi-provider access' },
  { value: 'gemini', label: 'Google Gemini', models: 'Gemini 1.5 Pro, Gemini 1.5 Flash' },
  { value: 'groq', label: 'Groq', models: 'Llama 3, Mixtral (fast inference)' },
  { value: 'ollama', label: 'Ollama', models: 'Local models (Llama 2, Mistral, etc.)' },
  { value: 'lmstudio', label: 'LMStudio', models: 'Local models via LM Studio' },
];

const SIDEBAR_ITEMS = [
  { id: 'business', label: 'Business Address', icon: MapPin },
  { id: 'team', label: 'Team Management', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'appearance', label: 'UI/UX Appearance', icon: Palette },
  { id: 'ai', label: 'AI Configuration', icon: Cpu },
];

export default function AdminSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('business');
  const [settings, setSettings] = useState<Record<string, string>>({ ...SETTINGS_DEFAULTS });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [events, setEvents] = useState<{ id: number; title: string }[]>([]);

  // Team form
  const [teamFormOpen, setTeamFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [teamFirstName, setTeamFirstName] = useState('');
  const [teamLastName, setTeamLastName] = useState('');
  const [teamUsername, setTeamUsername] = useState('');
  const [teamWhatsApp, setTeamWhatsApp] = useState('');
  const [teamEmail, setTeamEmail] = useState('');
  const [teamRole, setTeamRole] = useState('event_user');
  const [teamEventIds, setTeamEventIds] = useState<number[]>([]);
  const [teamPassword, setTeamPassword] = useState('');

  // Team report
  const [isTeamReportOpen, setIsTeamReportOpen] = useState(false);
  const [reportMembers, setReportMembers] = useState<any[]>([]);
  const [reportRoleFilter, setReportRoleFilter] = useState('');
  const [reportSort, setReportSort] = useState('name');
  const [reportOrder, setReportOrder] = useState('asc');

  // Business
  const [business, setBusiness] = useState<Record<string, string>>({
    business_name: '', address: '', street: '', location: '', city: '', state: '', country: '',
    zip_code: '', email: '', whatsapp: '',
    website: '', youtube: '', linkedin: '', facebook: '', tiktok: '', instagram: '',
    timezone: 'UTC', languages: 'English',
  });
  const [contacts, setContacts] = useState<{ id: number; full_name: string; whatsapp: string; designation: string }[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactWhatsApp, setNewContactWhatsApp] = useState('');
  const [newContactDesignation, setNewContactDesignation] = useState('');

  // Payments
  const [paymentInfo, setPaymentInfo] = useState({ bank_name: '', account_number: '', ifsc_code: '', qr_code: '' });

  // Events dropdown cache
  const fetchEvents = useCallback(async () => {
    const res = await fetch('/api/events');
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    const res = await fetch('/api/team-members');
    const data = await res.json();
    setTeamMembers(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetch('/api/admin').then(r => r.json()).then(d => { if (d && Object.keys(d).length > 0) setSettings(prev => ({...prev, ...d})); }).catch(() => {});
    fetchTeamMembers();
    fetchEvents();
    fetch('/api/admin/business').then(r => r.json()).then(d => { if (d) { const m = {...d}; if (m.language && !m.languages) m.languages = m.language; delete m.language; setBusiness(prev => ({...prev, ...m})); } }).catch(() => {});
    fetch('/api/admin/business-contacts').then(r => r.json()).then(d => { if (Array.isArray(d)) setContacts(d); }).catch(() => {});
    fetch('/api/admin/payment-info').then(r => r.json()).then(d => { if (d) setPaymentInfo(d); }).catch(() => {});
  }, [fetchTeamMembers, fetchEvents]);

  const saveSettings = async () => {
    await fetch('/api/admin', { method: 'POST', body: JSON.stringify(settings), headers: { 'Content-Type': 'application/json' } });
    const bp: any = {...business, language: business.languages}; delete bp.languages;
    await fetch('/api/admin/business', { method: 'POST', body: JSON.stringify(bp), headers: { 'Content-Type': 'application/json' } });
    await fetch('/api/admin/payment-info', { method: 'POST', body: JSON.stringify(paymentInfo), headers: { 'Content-Type': 'application/json' } });
    alert('Settings saved!');
    window.location.reload();
  };

  // Contacts
  const addContact = async () => {
    if (!newContactName.trim()) return;
    const res = await fetch('/api/admin/business-contacts', { method: 'POST', body: JSON.stringify({ full_name: newContactName.trim(), whatsapp: newContactWhatsApp.trim(), designation: newContactDesignation.trim() }), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      setContacts([...contacts, { id: data.id, full_name: newContactName.trim(), whatsapp: newContactWhatsApp.trim(), designation: newContactDesignation.trim() }]);
      setNewContactName(''); setNewContactWhatsApp(''); setNewContactDesignation('');
    }
  };
  const deleteContact = async (id: number) => { await fetch(`/api/admin/business-contacts?id=${id}`, { method: 'DELETE' }); setContacts(contacts.filter(c => c.id !== id)); };

  // Team CRUD
  const openTeamForm = (member?: TeamMember) => {
    setTeamPassword('');
    if (member) {
      setEditingMember(member);
      setTeamFirstName(member.first_name || member.name?.split(' ')[0] || '');
      setTeamLastName(member.last_name || member.name?.split(' ').slice(1).join(' ') || '');
      setTeamUsername(member.username);
      setTeamWhatsApp(member.whatsapp || '');
      setTeamEmail(member.email || '');
      setTeamRole(member.role || 'event_user');
      try { setTeamEventIds(JSON.parse(member.event_ids || '[]')); } catch { setTeamEventIds([]); }
    } else {
      setEditingMember(null);
      setTeamFirstName(''); setTeamLastName(''); setTeamUsername(''); setTeamWhatsApp(''); setTeamEmail('');
      setTeamRole('event_user'); setTeamEventIds([]);
    }
    setTeamFormOpen(true);
  };

  const saveTeamMember = async () => {
    const body: any = {
      username: teamUsername.trim(),
      first_name: teamFirstName.trim(), last_name: teamLastName.trim(),
      whatsapp: teamWhatsApp.trim() || null, email: teamEmail.trim() || null,
      role: teamRole, event_ids: teamEventIds,
    };
    if (teamPassword.trim()) body.password = teamPassword.trim();
    if (editingMember) body.id = editingMember.id;
    const method = editingMember ? 'PUT' : 'POST';
    await fetch('/api/team-members', { method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
    setTeamFormOpen(false);
    fetchTeamMembers();
  };

  const deleteTeamMember = async (id: number) => { await fetch(`/api/team-members?id=${id}`, { method: 'DELETE' }); fetchTeamMembers(); };

  // Team report
  const fetchTeamReport = async () => {
    const params = new URLSearchParams();
    params.set('report', 'true');
    if (reportRoleFilter) params.set('role', reportRoleFilter);
    params.set('sort', reportSort);
    params.set('order', reportOrder);
    const res = await fetch(`/api/team-members?${params}`);
    const data = await res.json();
    setReportMembers(Array.isArray(data) ? data : []);
  };

  const exportCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(row => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const sidebar = (label: string, icon: any) => (
    <button onClick={() => setActiveSection(label)}
      className={`w-full flex items-center ${sidebarOpen ? 'gap-2 px-3' : 'justify-center px-0'} py-2 text-xs font-semibold rounded-lg transition-all ${activeSection === label ? 'bg-[var(--brand-violet)] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}`}>
      {icon({ size: 14 })}
      {sidebarOpen && label.split(/(?=[A-Z])/).join(' ')}
    </button>
  );

  return (
    <div className="p-4 sm:p-8 container mx-auto">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Admin Settings</h1>
      <p className="text-slate-700 text-sm mt-1 mb-6">Configure your platform branding, AI integration, team, and more.</p>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Mobile horizontal tabs */}
        <div className="sm:hidden flex gap-1 overflow-x-auto pb-2">
          {SIDEBAR_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeSection === item.id
                  ? 'bg-[var(--brand-violet)] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}>
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </div>
        {/* Desktop sidebar */}
        <aside className={`hidden sm:flex flex-col ${sidebarOpen ? 'w-52' : 'w-14'} transition-all duration-200 relative shrink-0`}>
          <div className={`${sidebarOpen ? 'w-52' : 'w-14'} space-y-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-2 transition-all duration-200`}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`w-full flex items-center ${sidebarOpen ? 'justify-end' : 'justify-center'} py-1 mb-1 text-slate-500 hover:text-slate-700`}>
              {sidebarOpen ? <Menu size={14} /> : <Menu size={14} />}
            </button>
            {SIDEBAR_ITEMS.map(item => (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-2 px-3' : 'justify-center px-0'} py-2 text-xs font-semibold rounded-lg transition-all ${activeSection === item.id ? 'bg-[var(--brand-violet)] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}`}>
                <item.icon size={14} />
                {sidebarOpen && item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* ===== BUSINESS ADDRESS ===== */}
          {activeSection === 'business' && (
            <div className="max-w-2xl space-y-6">
              <div><h2 className="text-lg font-bold text-slate-900">Business Address</h2><p className="text-sm text-slate-700 mt-1">Configure your business profile. Used to personalize events and communications.</p></div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Business Name *</label>
                <Input value={business.business_name} onChange={e => setBusiness({...business, business_name: e.target.value})} placeholder="Your Business Name" className="bg-white border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Address</label>
                <Textarea value={business.address} onChange={e => setBusiness({...business, address: e.target.value})} placeholder="Full address line" className="bg-white border-slate-200 rounded-xl min-h-[60px]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-semibold text-slate-800">Street</label><Input value={business.street} onChange={e => setBusiness({...business, street: e.target.value})} placeholder="Street name" className="bg-white border-slate-200 rounded-xl" /></div>
                <div className="space-y-2"><label className="text-sm font-semibold text-slate-800">Location / Area</label><Input value={business.location} onChange={e => setBusiness({...business, location: e.target.value})} placeholder="Location or area" className="bg-white border-slate-200 rounded-xl" /></div>
                <div className="space-y-2"><label className="text-sm font-semibold text-slate-800">City</label><Input value={business.city} onChange={e => setBusiness({...business, city: e.target.value})} placeholder="City" className="bg-white border-slate-200 rounded-xl" /></div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Country</label>
                  <Select value={business.country} onValueChange={(v: string | null) => { if (!v) return; setBusiness({...business, country: v, state: ''}); }}>
                    <SelectTrigger className="bg-white border-slate-200 rounded-xl w-full"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent side="bottom" sideOffset={8}>{Object.entries(COUNTRY_STATES).map(([val, c]) => (<SelectItem key={val} value={val}>{c.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">State / Province</label>
                  {business.country && COUNTRY_STATES[business.country]?.states.length > 0 ? (
                    <Select value={business.state} onValueChange={(v: string | null) => v && setBusiness({...business, state: v})}>
                      <SelectTrigger className="bg-white border-slate-200 rounded-xl w-full"><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent side="bottom" sideOffset={8}>{COUNTRY_STATES[business.country].states.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                    </Select>
                  ) : (<Input value={business.state} onChange={e => setBusiness({...business, state: e.target.value})} placeholder="State or province" className="bg-white border-slate-200 rounded-xl" />)}
                </div>
                <div className="space-y-2"><label className="text-sm font-semibold text-slate-800">{business.country && COUNTRY_STATES[business.country] ? COUNTRY_STATES[business.country].zipLabel : 'ZIP / Postal Code'}</label><Input value={business.zip_code} onChange={e => setBusiness({...business, zip_code: e.target.value})} placeholder="ZIP or postal code" className="bg-white border-slate-200 rounded-xl" /></div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Timezone</label>
                  <Select value={business.timezone} onValueChange={(v: string | null) => v && setBusiness({...business, timezone: v})}>
                    <SelectTrigger className="bg-white border-slate-200 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent side="bottom" sideOffset={8}>{TIMEZONES.map(tz => (<SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>))}</SelectContent>
                  </Select>
                  <p className="text-xs text-slate-600">Used to format dates and times across the platform.</p>
                </div>
              </div>

              {/* Business Contacts */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-md font-bold text-slate-900 mb-1">Business Contacts</h3>
                <p className="text-xs text-slate-600 mb-4">People associated with this business.</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Input value={newContactName} onChange={e => setNewContactName(e.target.value)} placeholder="Full Name" className="max-w-[180px] bg-white border-slate-200 rounded-xl" />
                  <Input value={newContactWhatsApp} onChange={e => setNewContactWhatsApp(e.target.value)} placeholder="WhatsApp" className="max-w-[160px] bg-white border-slate-200 rounded-xl" />
                  <Input value={newContactDesignation} onChange={e => setNewContactDesignation(e.target.value)} placeholder="Designation" className="max-w-[160px] bg-white border-slate-200 rounded-xl" />
                  <Button onClick={addContact} className="rounded-xl bg-[var(--brand-violet)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-90 transition-all">Add Contact</Button>
                </div>
                <div className="border border-slate-200 rounded-xl divide-y overflow-hidden bg-white">
                  {contacts.length === 0 && <p className="text-sm text-slate-600 p-4">No contacts added yet.</p>}
                  {contacts.map((c, idx) => (
                    <div key={c.id} className={`flex items-center justify-between p-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-[var(--brand-primary-container)]'}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--brand-secondary)' }} />
                        <span className="font-medium text-sm text-slate-900">{c.full_name}</span>
                        {c.whatsapp && <span className="text-xs text-slate-600">{c.whatsapp}</span>}
                        {c.designation && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{c.designation}</span>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 rounded-lg shrink-0" style={{ color: 'var(--brand-error)' }} onClick={() => deleteContact(c.id)}><Trash2 size={16} /></Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-md font-bold text-slate-900 mb-1">Contact</h3>
                <p className="text-xs text-slate-600 mb-4">How can people reach your business?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-semibold text-slate-800">Email</label><Input value={business.email} onChange={e => setBusiness({...business, email: e.target.value})} type="email" placeholder="contact@business.com" className="bg-white border-slate-200 rounded-xl" /></div>
                  <div className="space-y-2"><label className="text-sm font-semibold text-slate-800">WhatsApp</label><Input value={business.whatsapp} onChange={e => setBusiness({...business, whatsapp: e.target.value})} placeholder="+1234567890" className="bg-white border-slate-200 rounded-xl" /></div>
                </div>
              </div>

              {/* Social Media */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-md font-bold text-slate-900 mb-1">Social Media</h3>
                <p className="text-xs text-slate-600 mb-4">Links to your online presence.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['website','youtube','linkedin','facebook','tiktok','instagram'].map(field => (
                    <div key={field} className="space-y-2">
                      <label className="text-sm font-semibold text-slate-800 capitalize">{field}</label>
                      <Input value={(business as any)[field]} onChange={e => setBusiness({...business, [field]: e.target.value})} placeholder={`https://${field}.com/...`} className="bg-white border-slate-200 rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Localization */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-md font-bold text-slate-900 mb-1">Localization</h3>
                <p className="text-xs text-slate-600 mb-4">Language and regional preferences.</p>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-800">Languages</label>
                  <div className="border border-slate-200 rounded-xl p-4 bg-white">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5">
                      {LANGUAGES.map(l => {
                        const selected = business.languages.split(',').map(s => s.trim());
                        const checked = selected.includes(l);
                        return (
                          <label key={l} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={checked} onChange={() => setBusiness({...business, languages: (checked ? selected.filter(s => s !== l) : [...selected, l]).join(',')})} className="rounded border-slate-300 text-[var(--brand-violet)] focus:ring-[var(--brand-violet)]" />
                            {l}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TEAM MANAGEMENT ===== */}
          {activeSection === 'team' && (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center justify-between">
                <div><h2 className="text-lg font-bold text-slate-900">Team Management</h2><p className="text-sm text-slate-700 mt-1">Manage team members, roles, and event assignments.</p></div>
                <div className="flex gap-2">
                  <Button onClick={() => { setIsTeamReportOpen(true); fetchTeamReport(); }} variant="outline" className="rounded-xl border-slate-200 text-slate-700 flex items-center gap-1.5"><Download size={14} /> Report</Button>
                  <Button onClick={() => openTeamForm()} className="rounded-xl bg-[var(--brand-violet)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-90 transition-all">Add Member</Button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl divide-y overflow-hidden bg-white">
                {teamMembers.length === 0 && <p className="text-sm text-slate-600 p-6 text-center">No team members yet.</p>}
                {teamMembers.map((m, idx) => {
                  let eventIds: number[] = [];
                  try { eventIds = JSON.parse(m.event_ids || '[]'); } catch {}
                  const eventNames = eventIds.map(eid => events.find(e => e.id === eid)?.title).filter(Boolean).join(', ');
                  return (
                    <div key={m.id} className={`flex items-center justify-between p-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-[var(--brand-primary-container)]'}`}>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--brand-secondary)' }} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-slate-900">{m.name}</span>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${m.role === 'event_manager' ? 'bg-violet-50 text-violet-700' : 'bg-sky-50 text-sky-700'}`}>{m.role === 'event_manager' ? 'Manager' : 'User'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                            <span>@{m.username}</span>
                            {m.email && <span>· {m.email}</span>}
                            {m.whatsapp && <span>· {m.whatsapp}</span>}
                          </div>
                          {eventNames && <p className="text-xs text-slate-500 mt-0.5">Events: {eventNames}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-lg" onClick={() => openTeamForm(m)}><Pencil size={14} className="text-slate-600" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 rounded-lg" style={{ color: 'var(--brand-error)' }} onClick={() => { if (confirm('Delete this team member?')) deleteTeamMember(m.id); }}><Trash2 size={16} /></Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== PAYMENTS ===== */}
          {activeSection === 'payments' && (
            <div className="max-w-xl space-y-6">
              <div><h2 className="text-lg font-bold text-slate-900">Payments</h2><p className="text-sm text-slate-700 mt-1">Default payment information for your business. Event-level payment details can be set per event to override these defaults.</p></div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Bank Name</label>
                <Input value={paymentInfo.bank_name} onChange={e => setPaymentInfo({...paymentInfo, bank_name: e.target.value})} placeholder="e.g. State Bank of India" className="bg-white border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-semibold text-slate-800">Account Number</label><Input value={paymentInfo.account_number} onChange={e => setPaymentInfo({...paymentInfo, account_number: e.target.value})} placeholder="Account number" className="bg-white border-slate-200 rounded-xl" /></div>
                <div className="space-y-2"><label className="text-sm font-semibold text-slate-800">IFSC Code</label><Input value={paymentInfo.ifsc_code} onChange={e => setPaymentInfo({...paymentInfo, ifsc_code: e.target.value})} placeholder="e.g. SBIN0001234" className="bg-white border-slate-200 rounded-xl" /></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">QR Code</label>
                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  {paymentInfo.qr_code ? (
                    <div className="flex items-start gap-4">
                      <img src={paymentInfo.qr_code} alt="Payment QR Code" className="w-40 h-40 object-contain border border-slate-200 rounded-xl" />
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 rounded-xl" onClick={() => setPaymentInfo({...paymentInfo, qr_code: ''})}>Remove</Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer py-6 text-slate-600 hover:text-[var(--brand-violet)] transition-colors">
                      <Upload size={32} />
                      <span className="text-sm font-medium">Click to upload QR Code image</span>
                      <span className="text-xs">PNG or JPG recommended</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = evt => setPaymentInfo({...paymentInfo, qr_code: evt.target?.result as string}); reader.readAsDataURL(file); e.target.value = ''; }} />
                    </label>
                  )}
                </div>
                <p className="text-xs text-slate-600">Upload a UPI / bank QR code. This is the default used for all events unless overridden at the event level.</p>
              </div>
            </div>
          )}

          {/* ===== UI/UX APPEARANCE ===== */}
          {activeSection === 'appearance' && (
            <div className="space-y-8">
              <div><h2 className="text-lg font-bold text-slate-900">UI/UX Appearance</h2><p className="text-sm text-slate-700 mt-1">Customize the look and feel of your platform.</p></div>
              <div className="max-w-xl space-y-5">
                <div className="space-y-2"><label className="text-sm font-semibold text-slate-800">Application Title</label><Input value={settings.appTitle} onChange={e => setSettings({...settings, appTitle: e.target.value})} className="bg-white border-slate-200 rounded-xl" /></div>
                <div className="space-y-2"><label className="text-sm font-semibold text-slate-800">Logo URL</label><Input value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} className="bg-white border-slate-200 rounded-xl font-mono text-xs" /></div>
              </div>

              {/* Font Family */}
              <div className="border-t border-slate-200 pt-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Font Family</h2>
                <p className="text-sm text-slate-600 mb-4">Choose the primary font for the entire platform. Material 3 recommends Roboto for clean, modern UI typography.</p>
                <div className="max-w-sm">
                  <Select value={settings.fontFamily || 'Inter'} onValueChange={(v: string | null) => { if (!v) return; setSettings({...settings, fontFamily: v}); }}>
                    <SelectTrigger className="bg-white border-slate-200 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent side="bottom" sideOffset={8}>
                      {FONT_OPTIONS.map(f => (
                        <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.display }}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Font Sizes */}
              <div className="border-t border-slate-200 pt-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Element Font Sizes</h2>
                <p className="text-sm text-slate-600 mb-4">Adjust the font size for specific UI element types across the entire application.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FONT_SIZES.map(fs => (
                    <div key={fs.key} className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{fs.label}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{fs.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" value={settings[fs.key] || ''}
                          onChange={e => setSettings({...settings, [fs.key]: e.target.value})}
                          placeholder="e.g. 0.75rem"
                          className="font-mono text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-violet)]" />
                        <span className="text-xs text-slate-500 font-mono w-8 text-right"
                          style={{ fontSize: settings[fs.key] || '0.75rem' }}>Aa</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Button Labels */}
              <div className="border-t border-slate-200 pt-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Button Labels</h2>
                <p className="text-sm text-slate-600 mb-4">Customize the text displayed on action buttons throughout the platform.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BUTTON_LABELS.map(bl => (
                    <div key={bl.key} className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{bl.label}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{bl.description}</p>
                      </div>
                      <Input value={settings[bl.key] || bl.defaultValue}
                        onChange={e => setSettings({...settings, [bl.key]: e.target.value})}
                        placeholder={bl.defaultValue}
                        className="bg-white border-slate-200 rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>

              {/* UI Colors */}
              <div className="border-t border-slate-200 pt-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6">UI Colors</h2>
                <p className="text-sm text-slate-600 mb-4">Customize the color palette used across the platform. Changes apply immediately after saving.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {COLORS.map(c => (
                    <div key={c.key} className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
                      <div className="flex items-center gap-2">
                        <input type="color" value={settings[c.key] || SETTINGS_DEFAULTS[c.key]} onChange={e => setSettings({...settings, [c.key]: e.target.value})} className="w-9 h-9 p-0.5 border border-slate-200 rounded-lg cursor-pointer shrink-0 bg-white" />
                        <input type="text" value={settings[c.key] || SETTINGS_DEFAULTS[c.key]} onChange={e => setSettings({...settings, [c.key]: e.target.value})} className="font-mono text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 w-full bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-violet)]" />
                      </div>
                      <div><p className="text-sm font-semibold text-slate-900">{c.label}</p><p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{c.description}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== AI CONFIGURATION ===== */}
          {activeSection === 'ai' && (
            <div className="max-w-2xl space-y-6">
              <div><h2 className="text-lg font-bold text-slate-900">AI Configuration</h2><p className="text-sm text-slate-700 mt-1">Enable one or more AI providers. Each enabled provider will have its own API key and model name.</p></div>
              <div className="space-y-4">
                {AI_PROVIDERS.map(provider => {
                  const enabledKey = `llmEnabled${provider.value.charAt(0).toUpperCase() + provider.value.slice(1)}`;
                  const modelKey = `llmModel${provider.value.charAt(0).toUpperCase() + provider.value.slice(1)}`;
                  const apiKeyKey = `llmKey${provider.value.charAt(0).toUpperCase() + provider.value.slice(1)}`;
                  const isEnabled = settings[enabledKey] === 'true';
                  return (
                    <div key={provider.value}
                      className={`block border rounded-xl p-4 transition-all ${isEnabled ? 'border-[var(--brand-violet)] bg-[var(--brand-violet)]/5 ring-1 ring-[var(--brand-violet)]' : 'border-slate-200 bg-white'}`}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={isEnabled} onChange={e => setSettings({...settings, [enabledKey]: e.target.checked ? 'true' : ''})}
                          className="w-4 h-4 rounded border-slate-300 text-[var(--brand-violet)] focus:ring-[var(--brand-violet)]" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{provider.label}</p>
                          <p className="text-xs text-slate-600">{provider.models}</p>
                        </div>
                      </label>
                      {isEnabled && (
                        <div className="mt-3 pl-7 space-y-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">Model Name</label>
                            <Input value={settings[modelKey] || ''} onChange={e => setSettings({...settings, [modelKey]: e.target.value})}
                              placeholder="e.g. GPT-4o, Claude 3.5 Sonnet, llama2"
                              className="bg-white border-slate-200 rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">API Key</label>
                            <Input value={settings[apiKeyKey] || ''} onChange={e => setSettings({...settings, [apiKeyKey]: e.target.value})} type="password" placeholder="Enter your API key..." className="bg-white border-slate-200 rounded-xl text-sm" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Save */}
          <div className="flex justify-end pt-8 mt-8 border-t border-slate-200">
            <Button onClick={saveSettings} size="lg" className="rounded-xl bg-[var(--brand-violet)] px-8 py-3 text-sm font-semibold text-white shadow-md hover:brightness-90 transition-all active:scale-[0.97] flex items-center gap-2">
              <Save size={18} /> Save All Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Team Member Form Dialog */}
      <Dialog open={teamFormOpen} onOpenChange={(open) => { if (!open) setTeamFormOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg" style={{ color: 'var(--brand-violet)' }}>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">First Name</label>
                <Input value={teamFirstName} onChange={e => setTeamFirstName(e.target.value)} placeholder="First name" className="bg-white border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Last Name</label>
                <Input value={teamLastName} onChange={e => setTeamLastName(e.target.value)} placeholder="Last name" className="bg-white border-slate-200 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Username *</label>
              <Input value={teamUsername} onChange={e => setTeamUsername(e.target.value)} placeholder="Username" className="bg-white border-slate-200 rounded-xl" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">{editingMember ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
              <Input value={teamPassword} onChange={e => setTeamPassword(e.target.value)} type="password" placeholder="Enter password" className="bg-white border-slate-200 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Email</label>
                <Input value={teamEmail} onChange={e => setTeamEmail(e.target.value)} type="email" placeholder="email@example.com" className="bg-white border-slate-200 rounded-xl" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">WhatsApp</label>
                <Input value={teamWhatsApp} onChange={e => setTeamWhatsApp(e.target.value)} placeholder="+1234567890" className="bg-white border-slate-200 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Role</label>
              <Select value={teamRole} onValueChange={(v: string | null) => v && setTeamRole(v)}>
                <SelectTrigger className="bg-white border-slate-200 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent side="bottom" sideOffset={8}>
                  <SelectItem value="event_manager">Event Manager (full access except Admin)</SelectItem>
                  <SelectItem value="event_user">Event User (assigned events only)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-600">Event Managers have access to all events except Admin settings. Event Users can only access assigned events.</p>
            </div>
            {teamRole === 'event_user' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Assigned Events</label>
                <div className="border border-slate-200 rounded-xl p-3 bg-white max-h-40 overflow-y-auto space-y-1.5">
                  {events.length === 0 && <p className="text-xs text-slate-500">No events available.</p>}
                  {events.map(ev => {
                    const checked = teamEventIds.includes(ev.id);
                    return (
                      <label key={ev.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={checked} onChange={() => setTeamEventIds(checked ? teamEventIds.filter(id => id !== ev.id) : [...teamEventIds, ev.id])} className="rounded border-slate-300 text-[var(--brand-violet)] focus:ring-[var(--brand-violet)]" />
                        {ev.title}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-end pt-2">
              <Button onClick={() => setTeamFormOpen(false)} variant="outline" className="rounded-xl">Cancel</Button>
              <Button onClick={saveTeamMember} className="rounded-xl bg-[var(--brand-violet)] px-4 py-2 text-sm font-semibold text-white shadow-md hover:brightness-90 transition-all">{editingMember ? 'Save Changes' : 'Add Member'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Member Report Dialog */}
      <Dialog open={isTeamReportOpen} onOpenChange={(open) => { setIsTeamReportOpen(open); if (!open) setReportMembers([]); }}>
        <DialogContent className="!max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-xl" style={{ color: 'var(--brand-violet)' }}>Team Member Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap items-end">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Role</label>
                <select value={reportRoleFilter} onChange={e => setReportRoleFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm">
                  <option value="">All Roles</option>
                  <option value="event_manager">Event Manager</option>
                  <option value="event_user">Event User</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Sort</label>
                <select value={reportSort} onChange={e => setReportSort(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm">
                  <option value="name">Name</option>
                  <option value="username">Username</option>
                  <option value="role">Role</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <button onClick={() => setReportOrder(reportOrder === "asc" ? "desc" : "asc")} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-1">
                <Filter size={14} /> {reportOrder === "asc" ? "Asc" : "Desc"}
              </button>
              <button onClick={fetchTeamReport} className="rounded-xl bg-[var(--brand-violet)] px-3 py-1.5 text-sm font-semibold text-white hover:brightness-90 transition-all">Refresh</button>
            </div>
            <div className="border border-slate-200 rounded-xl max-h-[65vh] overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="p-3">Name</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">WhatsApp</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Assigned Events</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportMembers.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-600 italic">No team members found.</td></tr>
                  )}
                  {reportMembers.map((m: any) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium">{m.name}</td>
                      <td className="p-3 text-slate-600">@{m.username}</td>
                      <td className="p-3 text-slate-600">{m.email || "—"}</td>
                      <td className="p-3 text-slate-600">{m.whatsapp || "—"}</td>
                      <td className="p-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.role === 'event_manager' ? 'bg-violet-50 text-violet-700' : 'bg-sky-50 text-sky-700'}`}>{m.role === 'event_manager' ? 'Event Manager' : 'Event User'}</span>
                      </td>
                      <td className="p-3 text-slate-600 text-xs">{m.event_titles || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">{reportMembers.length} team member(s) found.</p>
              <button onClick={() => exportCSV(reportMembers, 'team-member-report.csv')} className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-1">
                <Download size={12} /> Export CSV
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
