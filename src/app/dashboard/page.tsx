"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, MapPin, User, Pencil, Trash2, X, Users, Upload, Download, Filter, Briefcase, Copy, Menu, DollarSign, Clock, CreditCard, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Event = {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  contact: string;
  parent_activity_count?: number;
  sub_activity_count?: number;
  event_guest_count?: number;
  activity_guest_count?: number;
  attending_total?: number;
  maybe_total?: number;
  no_total?: number;
  total_guest_count?: number;
  vendor_count?: number;
  activity_status_breakdown?: string;
  event_budget?: number;
  event_effort_hours?: number;
  event_owner_id?: number;
  event_owner_name?: string;
};

type Location = {
  id: number;
  event_id: number;
  name: string;
  description: string | null;
  city: string;
  state: string;
  country: string;
  zip_code: string;
};

type EventLocationForm = {
  name: string;
  description: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
};

type FormGuest = {
  name: string;
  whatsapp: string;
  guest_count: number;
  status: string;
};

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);
  const [deleteEventTitle, setDeleteEventTitle] = useState("");
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [editEventId, setEditEventId] = useState<number | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formEventBudget, setFormEventBudget] = useState("");
  const [formEventEffortHours, setFormEventEffortHours] = useState("");
  const [formLocations, setFormLocations] = useState<EventLocationForm[]>([]);
  const [newLocName, setNewLocName] = useState("");
  const [newLocDesc, setNewLocDesc] = useState("");
  const [newLocCity, setNewLocCity] = useState("");
  const [newLocState, setNewLocState] = useState("");
  const [newLocCountry, setNewLocCountry] = useState("");
  const [newLocZipCode, setNewLocZipCode] = useState("");
  const [formGuests, setFormGuests] = useState<FormGuest[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestWhatsApp, setNewGuestWhatsApp] = useState("");
  const [newGuestCount, setNewGuestCount] = useState(1);
  const [newGuestStatus, setNewGuestStatus] = useState("Attending");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState("details");
  const [teamMembers, setTeamMembers] = useState<{ id: number; name: string; role: string }[]>([]);
  const [formEventOwnerId, setFormEventOwnerId] = useState<number | null>(null);
  const [formTeamUserIds, setFormTeamUserIds] = useState<number[]>([]);
  const [formPaymentBankName, setFormPaymentBankName] = useState("");
  const [formPaymentAccountNumber, setFormPaymentAccountNumber] = useState("");
  const [formPaymentIfscCode, setFormPaymentIfscCode] = useState("");
  const [formPaymentQrCode, setFormPaymentQrCode] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [businessCountry, setBusinessCountry] = useState("");
  const [adminPaymentInfo, setAdminPaymentInfo] = useState<{ bank_name: string; account_number: string; ifsc_code: string; qr_code: string } | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/admin/business')
      .then(r => r.json())
      .then(d => { if (d?.business_name) setBusinessName(d.business_name); if (d?.country) setBusinessCountry(d.country); })
      .catch(() => {});
    fetch('/api/admin')
      .then(r => r.json())
      .then(d => { if (d) setSettings(d); })
      .catch(() => {});
    fetch('/api/team-members')
      .then(r => r.json())
      .then(d => setTeamMembers(Array.isArray(d) ? d : []))
      .catch(() => {});
    fetch('/api/admin/payment-info')
      .then(r => r.json())
      .then(d => { if (d) setAdminPaymentInfo(d); })
      .catch(() => {});
  }, []);

  const fetchEvents = useCallback(async () => {
    const res = await fetch('/api/events');
    const data = await res.json();
    setEvents(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormStartDate("");
    setFormEndDate("");
    setFormContact("");
    setFormEventBudget("");
    setFormEventEffortHours("");
    setFormLocations([]);
    setNewLocName("");
    setNewLocDesc("");
    setNewLocCity("");
    setNewLocState("");
    setNewLocCountry("");
    setNewLocZipCode("");
    setFormGuests([]);
    setNewGuestName("");
    setNewGuestWhatsApp("");
    setNewGuestCount(1);
    setNewGuestStatus("Attending");
    setActiveSection("details");
    setFormEventOwnerId(null);
    setFormTeamUserIds([]);
    setFormPaymentBankName(adminPaymentInfo?.bank_name || "");
    setFormPaymentAccountNumber(adminPaymentInfo?.account_number || "");
    setFormPaymentIfscCode(adminPaymentInfo?.ifsc_code || "");
    setFormPaymentQrCode(adminPaymentInfo?.qr_code || "");
  };

  const openEdit = async (event: Event) => {
    setEditEventId(event.id);
    setFormTitle(event.title);
    setFormDescription(event.description || "");
    setFormStartDate(event.start_date || "");
    setFormEndDate(event.end_date || "");
    setFormContact(event.contact || "");
    setFormEventBudget(event.event_budget ? String(event.event_budget) : "");
    setFormEventEffortHours(event.event_effort_hours ? String(event.event_effort_hours) : "");
    const locRes = await fetch(`/api/event-locations?event_id=${event.id}`);
    const locs = await locRes.json();
    setFormLocations(Array.isArray(locs) ? locs.map((l: Location) => ({
      name: l.name,
      description: l.description || "",
      city: l.city || "",
      state: l.state || "",
      country: l.country || "",
      zip_code: l.zip_code || "",
    })) : []);
    const guestRes = await fetch(`/api/guests?event_id=${event.id}`);
    const guests = await guestRes.json();
    setFormGuests(Array.isArray(guests) ? guests.map((g: any) => ({ name: g.name, whatsapp: g.whatsapp || "", guest_count: g.guest_count || 1, status: g.status || "Attending" })) : []);
    setNewLocName("");
    setNewLocDesc("");
    setNewLocCity("");
    setNewLocState("");
    setNewLocCountry("");
    setNewLocZipCode("");
    setNewGuestName("");
    setNewGuestWhatsApp("");
    setNewGuestCount(1);
    setNewGuestStatus("Attending");
    setActiveSection("details");
    setFormEventOwnerId(event.event_owner_id ?? null);
    setFormPaymentBankName((event as any).payment_bank_name || adminPaymentInfo?.bank_name || "");
    setFormPaymentAccountNumber((event as any).payment_account_number || adminPaymentInfo?.account_number || "");
    setFormPaymentIfscCode((event as any).payment_ifsc_code || adminPaymentInfo?.ifsc_code || "");
    setFormPaymentQrCode((event as any).payment_qr_code || adminPaymentInfo?.qr_code || "");
    // Load team members assigned to this event (those with event_ids containing this event id)
    try {
      const tmRes = await fetch('/api/team-members');
      const allMembers = await tmRes.json();
      if (Array.isArray(allMembers)) {
        const assigned = allMembers.filter((m: any) => {
          const ids: number[] = JSON.parse(m.event_ids || '[]');
          return ids.includes(event.id);
        });
        setFormTeamUserIds(assigned.map((m: any) => m.id));
      }
    } catch {}
    setIsEditOpen(true);
  };

  const addLocationToList = () => {
    if (!newLocName.trim()) return;
    setFormLocations([...formLocations, { name: newLocName.trim(), description: newLocDesc.trim(), city: newLocCity.trim(), state: newLocState.trim(), country: newLocCountry.trim(), zip_code: newLocZipCode.trim() }]);
    setNewLocName("");
    setNewLocDesc("");
    setNewLocCity("");
    setNewLocState("");
    setNewLocCountry("");
    setNewLocZipCode("");
  };

  const removeLocationFromList = (idx: number) => {
    setFormLocations(formLocations.filter((_, i) => i !== idx));
  };

  const addGuestToList = () => {
    if (!newGuestName.trim()) return;
    setFormGuests([...formGuests, { name: newGuestName.trim(), whatsapp: newGuestWhatsApp.trim(), guest_count: newGuestCount, status: newGuestStatus }]);
    setNewGuestName("");
    setNewGuestWhatsApp("");
    setNewGuestCount(1);
    setNewGuestStatus("Attending");
  };

  const removeGuestFromList = (idx: number) => {
    setFormGuests(formGuests.filter((_, i) => i !== idx));
  };

  const handleEventGuestCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      for (const line of lines) {
        const parts = line.split(",");
        const name = parts[0]?.trim();
        const whatsapp = parts[1]?.trim() || "";
        const rawCount = parts[2]?.trim();
        const guestCount = rawCount ? parseInt(rawCount) || 1 : 1;
        const rawStatus = parts[3]?.trim();
        const status = ["Attending", "No", "Maybe"].includes(rawStatus) ? rawStatus : "Attending";
        if (!name) continue;
        setFormGuests(prev => [...prev, { name, whatsapp, guest_count: guestCount, status }]);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const downloadSampleCSV = () => {
    const header = "Name,WhatsApp,Count,Status";
    const rows = [
      "John Doe,+1234567890,2,Attending",
      "Jane Smith,+1987654321,1,No",
      "Bob Wilson,+1122334455,3,Maybe",
    ];
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-guests.csv";
    a.click();
    URL.revokeObjectURL(url);
  };



  const saveEvent = async () => {
    if (!formTitle.trim()) return;
    const isEdit = editEventId !== null;
    const url = isEdit ? `/api/events/${editEventId}` : "/api/events";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      body: JSON.stringify({
        title: formTitle,
        description: formDescription,
        start_date: formStartDate,
        end_date: formEndDate,
        location: formLocations.map(l => [l.name, l.city, l.state, l.country, l.zip_code].filter(Boolean).join(", ")).join("; "),
        contact: formContact,
        event_budget: formEventBudget ? parseFloat(formEventBudget) : null,
        event_effort_hours: formEventEffortHours ? parseFloat(formEventEffortHours) : null,
        event_owner_id: formEventOwnerId || null,
        payment_bank_name: formPaymentBankName,
        payment_account_number: formPaymentAccountNumber,
        payment_ifsc_code: formPaymentIfscCode,
        payment_qr_code: formPaymentQrCode,
      }),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) { alert("Failed to save event"); return; }
    const eventData = isEdit ? null : await res.json();
    const eventId = isEdit ? editEventId! : eventData?.id;
    if (!eventId) { alert("Error: no event ID returned"); return; }
    // Save locations
    try {
      if (formLocations.length > 0) {
        const existingRes = await fetch(`/api/event-locations?event_id=${eventId}`);
        if (existingRes.ok) {
          const existingLocs: Location[] = await existingRes.json();
          for (const loc of existingLocs) {
            await fetch(`/api/event-locations?id=${loc.id}`, { method: "DELETE" });
          }
        }
        for (const loc of formLocations) {
          if (loc.name.trim()) {
            const saveRes = await fetch("/api/event-locations", {
              method: "POST",
              body: JSON.stringify({ event_id: eventId, name: loc.name.trim(), description: loc.description.trim(), city: loc.city, state: loc.state, country: loc.country, zip_code: loc.zip_code }),
              headers: { "Content-Type": "application/json" }
            });
            if (!saveRes.ok) console.error("Failed to save location:", loc.name);
          }
        }
      }
    } catch (e) {
      console.error("Error saving locations:", e);
      alert("Event saved but some locations failed to save. Check console.");
    }
    // Save event-level guests
    try {
      const existingGuestRes = await fetch(`/api/guests?event_id=${eventId}`);
      if (existingGuestRes.ok) {
        const existingGuests: any[] = await existingGuestRes.json();
        for (const g of existingGuests) {
          await fetch(`/api/guests?id=${g.id}`, { method: "DELETE" });
        }
      }
      for (const g of formGuests) {
        if (g.name.trim()) {
          await fetch("/api/guests", {
            method: "POST",
            body: JSON.stringify({ event_id: eventId, name: g.name.trim(), whatsapp: g.whatsapp, guest_count: g.guest_count, status: g.status }),
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    } catch (e) {
      console.error("Error saving guests:", e);
    }
    // Save team member assignments (Event Users)
    try {
      const allMembers = await fetch('/api/team-members').then(r => r.json());
      if (Array.isArray(allMembers)) {
        for (const m of allMembers) {
          const currentIds: number[] = JSON.parse(m.event_ids || '[]');
          let newIds: number[];
          if (formTeamUserIds.includes(m.id)) {
            newIds = currentIds.includes(eventId) ? currentIds : [...currentIds, eventId];
          } else {
            newIds = currentIds.filter((id: number) => id !== eventId);
          }
          if (JSON.stringify(newIds) !== JSON.stringify(currentIds)) {
            await fetch('/api/team-members', {
              method: 'PUT',
              body: JSON.stringify({ id: m.id, event_ids: newIds }),
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
      }
    } catch (e) {
      console.error("Error saving team assignments:", e);
    }
    await fetchEvents();
    resetForm();
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setEditEventId(null);
  };

  const openDeleteConfirm = (id: number, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteEventId(id);
    setDeleteEventTitle(title);
    setDeleteConfirmInput("");
    setIsDeleteOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!deleteEventId || deleteConfirmInput !== deleteEventTitle) return;
    await fetch(`/api/events/${deleteEventId}`, { method: "DELETE" });
    await fetchEvents();
    setIsDeleteOpen(false);
    setDeleteEventId(null);
    setDeleteEventTitle("");
    setDeleteConfirmInput("");
  };

  const cloneEvent = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const res = await fetch(`/api/events/${id}`, { method: "POST" });
    if (res.ok) {
      await fetchEvents();
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight page-title" style={{ color: 'var(--brand-violet)' }}>{businessName ? `${businessName} Events & Projects` : 'Events & Projects'}</h1>
        <div className="flex gap-3 items-center flex-wrap w-full sm:w-auto">
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand-violet)] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-90 transition-all active:scale-[0.97] btn-text">
            <Plus size={18} /> Create Event/Project
          </DialogTrigger>
          <DialogContent className="max-w-4xl !gap-0 !p-0 overflow-hidden rounded-2xl">
            <DialogHeader className="px-5 pt-5 pb-0">
              <DialogTitle className="text-xl" style={{ color: 'var(--brand-violet)' }}>Create Event/Project</DialogTitle>
            </DialogHeader>
            <div className="flex" style={{ height: '65vh' }}>
              {/* Left Sidebar */}
              <div className={`max-sm:!w-14 ${sidebarCollapsed ? 'w-14' : 'w-48'} shrink-0 border-r border-slate-200 bg-slate-50 flex-col transition-all duration-200 hidden sm:flex`}>
                <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="h-10 border-b border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 shrink-0 max-sm:hidden">
                  {sidebarCollapsed ? <Menu size={16} /> : <Menu size={16} />}
                </button>
                <div className="flex flex-col gap-1 p-2">
                  {[
                    { id: 'details', icon: FileText, label: 'Details' },
                    { id: 'team', icon: Users, label: 'Team' },
                    { id: 'guests', icon: Users, label: 'Guests' },
                    { id: 'budget', icon: DollarSign, label: 'Effort & Budget' },
                    { id: 'payment', icon: CreditCard, label: 'Payment' },
                  ].map(item => (
                    <button key={item.id} onClick={() => setActiveSection(item.id)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeSection === item.id
                          ? 'bg-[var(--brand-violet)] text-white shadow-sm'
                          : 'text-slate-800 hover:bg-slate-100'
                      }`}>
                      <item.icon size={16} className="shrink-0" />
                      {!sidebarCollapsed && <span className="truncate hidden sm:inline">{item.label}</span>}
                    </button>
                  ))}
                </div>
              </div>
              {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Title & Description — always visible */}
                <Input placeholder="Event title" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="bg-white border-slate-300 rounded-xl text-sm" />
                <div>
                  <Textarea placeholder="Describe the event in detail..." value={formDescription} onChange={e => setFormDescription(e.target.value)} className="bg-white border-slate-300 rounded-xl text-sm min-h-[80px]" />
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Describe the event in detail — objectives, scope, key stakeholders, important deadlines, and any constraints or dependencies. This description will be used by AI agents to fully understand the scope and assist in planning.
                  </p>
                </div>

                {/* Mobile section tabs */}
                <div className="sm:hidden flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
                  {[
                    { id: 'details', icon: FileText, label: 'Details' },
                    { id: 'team', icon: Users, label: 'Team' },
                    { id: 'guests', icon: Users, label: 'Guests' },
                    { id: 'budget', icon: DollarSign, label: 'Budget' },
                    { id: 'payment', icon: CreditCard, label: 'Payment' },
                  ].map(item => (
                    <button key={item.id} onClick={() => setActiveSection(item.id)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        activeSection === item.id
                          ? 'bg-[var(--brand-violet)] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}>
                      <item.icon size={14} />
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Section content */}
                {activeSection === 'details' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <p className="text-sm text-slate-600 body-text">Event details fields are at the top of this dialog.</p>
                  </div>
                )}

                  {activeSection === 'team' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label">Event Owner (Admin / Manager)</label>
                      <p className="text-xs text-slate-600">At least one team member who manages this event.</p>
                      <Select value={String(formEventOwnerId || '')} onValueChange={v => setFormEventOwnerId(v ? Number(v) : null)}>
                        <SelectTrigger className="bg-white border-slate-300 rounded-xl text-sm"><SelectValue placeholder="Select owner...">{formEventOwnerId ? teamMembers.find(m => m.id === formEventOwnerId)?.name : "Select owner..."}</SelectValue></SelectTrigger>
                        <SelectContent side="bottom" sideOffset={8}>
                          <SelectItem value="">None</SelectItem>
                          {teamMembers.filter(m => m.role === 'event_manager' || m.role === 'event_admin').map(m => (
                            <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label">Assigned Event Users</label>
                      <p className="text-xs text-slate-600">One or more team members who can access this event.</p>
                      <div className="border border-slate-200 rounded-xl divide-y overflow-hidden max-h-48 overflow-y-auto">
                        {teamMembers.filter(m => m.role === 'event_user').length === 0 && (
                          <p className="text-xs text-slate-600 italic p-3 bg-[var(--brand-cream)]">No Event Users found. Add them in Admin &gt; Team Management.</p>
                        )}
                        {teamMembers.filter(m => m.role === 'event_user').map(m => (
                          <label key={m.id} className={`flex items-center gap-3 p-3 text-sm cursor-pointer hover:bg-slate-50 ${formTeamUserIds.includes(m.id) ? 'bg-[var(--brand-violet-container)]' : ''}`}>
                            <input type="checkbox" checked={formTeamUserIds.includes(m.id)} onChange={() => {
                              setFormTeamUserIds(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]);
                            }} className="w-4 h-4 rounded border-slate-300 text-[var(--brand-violet)] focus:ring-[var(--brand-violet)]" />
                            <span className="font-medium text-slate-800">{m.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'date-location' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label mb-2 block">Event Dates</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Start Date</p>
                          <Input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} className="bg-white border-slate-300 rounded-xl text-sm" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600 mb-1">End Date</p>
                          <Input type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} className="bg-white border-slate-300 rounded-xl text-sm" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label block">Locations</label>
                      <p className="text-xs text-slate-600">Add venues with full address (City, State, Country, Zip Code)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        <Input value={newLocName} onChange={e => setNewLocName(e.target.value)} placeholder="Venue name" className="bg-white border-slate-300 rounded-xl text-sm" />
                        <Input value={newLocDesc} onChange={e => setNewLocDesc(e.target.value)} placeholder="Description" className="bg-white border-slate-300 rounded-xl text-sm" />
                        <Input value={newLocCity} onChange={e => setNewLocCity(e.target.value)} placeholder="City" className="bg-white border-slate-300 rounded-xl text-sm" />
                        <Input value={newLocState} onChange={e => setNewLocState(e.target.value)} placeholder="State" className="bg-white border-slate-300 rounded-xl text-sm" />
                        <Input value={newLocCountry} onChange={e => setNewLocCountry(e.target.value)} placeholder="Country" className="bg-white border-slate-300 rounded-xl text-sm" />
                        <Input value={newLocZipCode} onChange={e => setNewLocZipCode(e.target.value)} placeholder="Zip Code" className="bg-white border-slate-300 rounded-xl text-sm" />
                        <Button onClick={addLocationToList} className="col-span-full shrink-0 gap-1 rounded-xl bg-[var(--brand-secondary)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-90 transition-all"><Plus size={14} /> Add Location</Button>
                      </div>
                      <div className="border border-slate-200 rounded-xl divide-y overflow-hidden">
                        {formLocations.length === 0 && <p className="text-xs text-slate-600 italic p-3 bg-[var(--brand-cream)]">No locations added yet.</p>}
                        {formLocations.map((loc, idx) => (
                          <div key={idx} className={`flex items-center justify-between p-3 text-sm ${idx % 2 === 0 ? 'bg-[var(--brand-cream)]' : 'bg-[var(--brand-violet-container)]'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <span style={{ color: 'var(--brand-secondary)' }}>📍</span>
                              <span className="font-medium">{loc.name}</span>
                              {loc.city && <span className="text-slate-700 text-xs">— {[loc.city, loc.state, loc.country, loc.zip_code].filter(Boolean).join(", ")}</span>}
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50 rounded-lg shrink-0" style={{ color: 'var(--brand-error)' }} onClick={() => removeLocationFromList(idx)}>
                              <X size={14} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'guests' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label block">Event Guests</label>
                    <p className="text-xs text-slate-500">Guests invited to all activities across the entire event.</p>
                    <div className="flex gap-2 flex-wrap">
                      <Input value={newGuestName} onChange={e => setNewGuestName(e.target.value)} placeholder="Name" className="flex-1 min-w-[120px] bg-white border-slate-300 rounded-xl text-sm" />
                      <Input value={newGuestWhatsApp} onChange={e => setNewGuestWhatsApp(e.target.value)} placeholder="WhatsApp" className="flex-1 min-w-[120px] bg-white border-slate-300 rounded-xl text-sm" />
                      <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2">
                        <span className="text-xs text-slate-600">×</span>
                        <input type="number" min={1} value={newGuestCount} onChange={e => setNewGuestCount(parseInt(e.target.value) || 1)} className="w-10 border-none bg-transparent text-sm text-center focus:outline-none" />
                      </div>
                      <Select value={newGuestStatus} onValueChange={(v) => v && setNewGuestStatus(v)}>
                        <SelectTrigger className="bg-white border-slate-300 rounded-xl w-[110px] text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent side="bottom" sideOffset={8}>
                          <SelectItem value="Attending">🟢 Attending</SelectItem>
                          <SelectItem value="No">🔴 No</SelectItem>
                          <SelectItem value="Maybe">🟡 Maybe</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={addGuestToList} className="shrink-0 gap-1 rounded-xl bg-[var(--brand-secondary)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-90 transition-all"><Plus size={14} /> Add</Button>
                      <label className="shrink-0 cursor-pointer rounded-xl bg-white border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5">
                        <Upload size={14} /> CSV
                        <input type="file" accept=".csv" onChange={handleEventGuestCSV} className="hidden" />
                      </label>
                      <button onClick={downloadSampleCSV} className="shrink-0 rounded-xl bg-white border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5" type="button">
                        <Download size={14} /> Sample
                      </button>
                    </div>
                    <div className="border border-slate-200 rounded-xl divide-y overflow-hidden">
                      {formGuests.length === 0 && <p className="text-xs text-slate-600 italic p-3 bg-[var(--brand-cream)]">No event guests added yet.</p>}
                      {formGuests.map((g, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 text-sm ${idx % 2 === 0 ? 'bg-[var(--brand-cream)]' : 'bg-[var(--brand-violet-container)]'}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 shrink-0 rounded-full ${g.status === 'Attending' ? 'bg-green-500' : g.status === 'No' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                            <span className="font-medium truncate">{g.name}</span>
                            {g.whatsapp && <span className="text-slate-600 text-xs truncate">{g.whatsapp}</span>}
                            <span className="text-xs text-slate-500 shrink-0">×{g.guest_count}</span>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${g.status === 'Attending' ? 'bg-green-50 text-green-700' : g.status === 'No' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>{g.status}</span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50 rounded-lg shrink-0" style={{ color: 'var(--brand-error)' }} onClick={() => removeGuestFromList(idx)}>
                            <X size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'budget' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label block">Effort & Budget</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-600 flex items-center gap-1.5"><DollarSign size={13} /> Planned Budget</p>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                          <Input type="number" min={0} step={0.01} value={formEventBudget} onChange={e => setFormEventBudget(e.target.value)} placeholder="0.00" className="bg-white border-slate-300 rounded-xl text-sm pl-7" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-600 flex items-center gap-1.5"><Clock size={13} /> Planned Effort (hours)</p>
                        <Input type="number" min={0} step={0.5} value={formEventEffortHours} onChange={e => setFormEventEffortHours(e.target.value)} placeholder="0" className="bg-white border-slate-300 rounded-xl text-sm" />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'payment' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label block">Payment Details</label>
                    <p className="text-xs text-slate-600">Pre-populated from your Admin payment defaults. Change any field to override for this event only.</p>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700">Bank Name</label>
                      <Input value={formPaymentBankName} onChange={e => setFormPaymentBankName(e.target.value)} placeholder="e.g. State Bank of India" className="bg-white border-slate-300 rounded-xl text-sm" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Account Number</label>
                        <Input value={formPaymentAccountNumber} onChange={e => setFormPaymentAccountNumber(e.target.value)} placeholder="Account number" className="bg-white border-slate-300 rounded-xl text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">IFSC Code</label>
                        <Input value={formPaymentIfscCode} onChange={e => setFormPaymentIfscCode(e.target.value)} placeholder="e.g. SBIN0001234" className="bg-white border-slate-300 rounded-xl text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">QR Code</label>
                      <div className="border border-slate-200 rounded-xl p-4 bg-white">
                        {formPaymentQrCode ? (
                          <div className="flex items-start gap-4">
                            <img src={formPaymentQrCode} alt="Payment QR Code" className="w-32 h-32 object-contain border border-slate-200 rounded-xl" />
                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 rounded-xl" onClick={() => setFormPaymentQrCode('')}>Remove</Button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center gap-2 cursor-pointer py-4 text-slate-600 hover:text-[var(--brand-violet)] transition-colors">
                            <Upload size={24} />
                            <span className="text-sm font-medium">Upload QR Code</span>
                            <input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = evt => setFormPaymentQrCode(evt.target?.result as string || ''); reader.readAsDataURL(file); e.target.value = ''; }} />
                          </label>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">Event-specific QR code. If set, overrides the business default QR code.</p>
                    </div>
                  </div>
                )}

                <Button onClick={saveEvent} className="w-full rounded-xl bg-[var(--brand-violet)] py-3 text-sm font-semibold text-white shadow-md hover:brightness-90 transition-all active:scale-[0.97] btn-text">Create Event/Project</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="rounded-2xl border-slate-200 shadow-sm hover:shadow-lg transition-shadow group bg-[var(--brand-cream)]">
            <CardHeader className="relative">
              <CardTitle className="text-xl card-title">{event.title}</CardTitle>
              <CardDescription className="flex items-center gap-1.5"><Calendar size={14}/> {formatDate(event.start_date, businessCountry)} — {formatDate(event.end_date, businessCountry)}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-3 line-clamp-2">{event.description}</p>
              <div className="flex items-center gap-3 text-sm mb-3 flex-wrap">
                <span className="flex items-center gap-1.5" style={{ color: 'var(--brand-secondary)' }}><MapPin size={14}/> {event.location || "No location set"}</span>
                <span className="flex items-center gap-1.5" style={{ color: 'var(--brand-rose)' }}><User size={14}/> {event.event_owner_name || "No owner"}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href={`/events/${event.id}`} className="flex-1 min-w-[100px]">
                  <Button className="w-full rounded-xl bg-[var(--brand-violet)] text-sm font-semibold text-white shadow-md hover:brightness-90 transition-all active:scale-[0.97] btn-text">{settings.btnViewBoard || 'View Board'}</Button>
                </Link>
                <Button className="flex-1 min-w-[80px] rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-[0.97] btn-text" onClick={() => openEdit(event)}><Pencil size={14} className="mr-1" /> {settings.btnEdit || 'Edit'}</Button>
                <Button className="flex-1 min-w-[80px] rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-[0.97] btn-text" onClick={(e) => cloneEvent(event.id, e)}><Copy size={14} className="mr-1" /> {settings.btnCloneEvent || 'Copy'}</Button>
                <Button className="flex-1 min-w-[80px] rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-[0.97] btn-text" style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }} onClick={(e) => openDeleteConfirm(event.id, event.title, e)}><Trash2 size={14} className="mr-1" /> {settings.btnDelete || 'Delete'}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Event/Project Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) { resetForm(); setEditEventId(null); } }}>
        <DialogContent className="max-w-4xl !gap-0 !p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-5 pt-5 pb-0">
            <DialogTitle className="text-xl" style={{ color: 'var(--brand-violet)' }}>Edit Event/Project</DialogTitle>
          </DialogHeader>
          <div className="flex" style={{ height: '65vh' }}>
            {/* Left Sidebar */}
            <div className={`max-sm:!w-14 ${sidebarCollapsed ? 'w-14' : 'w-48'} shrink-0 border-r border-slate-200 bg-slate-50 flex-col transition-all duration-200 hidden sm:flex`}>
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="h-10 border-b border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 shrink-0 max-sm:hidden">
                {sidebarCollapsed ? <Menu size={16} /> : <Menu size={16} />}
              </button>
              <div className="flex flex-col p-1.5 gap-0.5 flex-1">
                {[
                  { id: 'details', icon: User, label: 'Event Details' },
                  { id: 'date-location', icon: Calendar, label: 'Date & Location' },
                  { id: 'team', icon: Users, label: 'Team' },
                  { id: 'guests', icon: Users, label: 'Guests' },
                  { id: 'budget', icon: DollarSign, label: 'Effort & Budget' },
                  { id: 'payment', icon: CreditCard, label: 'Payment' },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeSection === item.id
                        ? 'bg-[var(--brand-violet)] text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}>
                    <item.icon size={16} className="shrink-0" />
                    {!sidebarCollapsed && <span className="truncate hidden sm:inline">{item.label}</span>}
                  </button>
                ))}
              </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Title & Description — always visible */}
              <Input placeholder="Event title" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="bg-white border-slate-300 rounded-xl text-sm" />
              <div>
                <Textarea placeholder="Describe the event in detail..." value={formDescription} onChange={e => setFormDescription(e.target.value)} className="bg-white border-slate-300 rounded-xl text-sm min-h-[80px]" />
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Describe the event in detail — objectives, scope, key stakeholders, important deadlines, and any constraints or dependencies. This description will be used by AI agents to fully understand the scope and assist in planning.
                </p>
              </div>

              {/* Mobile section tabs */}
              <div className="sm:hidden flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
                {[
                  { id: 'details', icon: User, label: 'Details' },
                  { id: 'date-location', icon: Calendar, label: 'Date & Loc' },
                  { id: 'team', icon: Users, label: 'Team' },
                  { id: 'guests', icon: Users, label: 'Guests' },
                  { id: 'budget', icon: DollarSign, label: 'Budget' },
                  { id: 'payment', icon: CreditCard, label: 'Payment' },
                ].map(item => (
                  <button key={item.id} onClick={() => setActiveSection(item.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      activeSection === item.id
                        ? 'bg-[var(--brand-violet)] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}>
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Section content */}
              {activeSection === 'details' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <p className="text-sm text-slate-600 body-text">Event details fields are at the top of this dialog.</p>
                </div>
              )}

              {activeSection === 'team' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label">Event Owner (Admin / Manager)</label>
                    <p className="text-xs text-slate-600">At least one team member who manages this event.</p>
                    <Select value={String(formEventOwnerId || '')} onValueChange={v => setFormEventOwnerId(v ? Number(v) : null)}>
                      <SelectTrigger className="bg-white border-slate-300 rounded-xl text-sm"><SelectValue placeholder="Select owner...">{formEventOwnerId ? teamMembers.find(m => m.id === formEventOwnerId)?.name : "Select owner..."}</SelectValue></SelectTrigger>
                      <SelectContent side="bottom" sideOffset={8}>
                        <SelectItem value="">None</SelectItem>
                        {teamMembers.filter(m => m.role === 'event_manager' || m.role === 'event_admin').map(m => (
                          <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label">Assigned Event Users</label>
                    <p className="text-xs text-slate-600">One or more team members who can access this event.</p>
                    <div className="border border-slate-200 rounded-xl divide-y overflow-hidden max-h-48 overflow-y-auto">
                      {teamMembers.filter(m => m.role === 'event_user').length === 0 && (
                        <p className="text-xs text-slate-600 italic p-3 bg-[var(--brand-cream)]">No Event Users found. Add them in Admin &gt; Team Management.</p>
                      )}
                      {teamMembers.filter(m => m.role === 'event_user').map(m => (
                        <label key={m.id} className={`flex items-center gap-3 p-3 text-sm cursor-pointer hover:bg-slate-50 ${formTeamUserIds.includes(m.id) ? 'bg-[var(--brand-violet-container)]' : ''}`}>
                          <input type="checkbox" checked={formTeamUserIds.includes(m.id)} onChange={() => {
                            setFormTeamUserIds(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id]);
                          }} className="w-4 h-4 rounded border-slate-300 text-[var(--brand-violet)] focus:ring-[var(--brand-violet)]" />
                          <span className="font-medium text-slate-800">{m.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'date-location' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label mb-2 block">Event Dates</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Start Date</p>
                        <Input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} className="bg-white border-slate-300 rounded-xl text-sm" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">End Date</p>
                        <Input type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} className="bg-white border-slate-300 rounded-xl text-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label block">Locations</label>
                    <p className="text-xs text-slate-600">Add venues with full address (City, State, Country, Zip Code)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      <Input value={newLocName} onChange={e => setNewLocName(e.target.value)} placeholder="Venue name" className="bg-white border-slate-300 rounded-xl text-sm" />
                      <Input value={newLocDesc} onChange={e => setNewLocDesc(e.target.value)} placeholder="Description" className="bg-white border-slate-300 rounded-xl text-sm" />
                      <Input value={newLocCity} onChange={e => setNewLocCity(e.target.value)} placeholder="City" className="bg-white border-slate-300 rounded-xl text-sm" />
                      <Input value={newLocState} onChange={e => setNewLocState(e.target.value)} placeholder="State" className="bg-white border-slate-300 rounded-xl text-sm" />
                      <Input value={newLocCountry} onChange={e => setNewLocCountry(e.target.value)} placeholder="Country" className="bg-white border-slate-300 rounded-xl text-sm" />
                      <Input value={newLocZipCode} onChange={e => setNewLocZipCode(e.target.value)} placeholder="Zip Code" className="bg-white border-slate-300 rounded-xl text-sm" />
                      <Button onClick={addLocationToList} className="col-span-full shrink-0 gap-1 rounded-xl bg-[var(--brand-secondary)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-90 transition-all"><Plus size={14} /> Add Location</Button>
                    </div>
                    <div className="border border-slate-200 rounded-xl divide-y overflow-hidden">
                      {formLocations.length === 0 && <p className="text-xs text-slate-600 italic p-3 bg-[var(--brand-cream)]">No locations added yet.</p>}
                      {formLocations.map((loc, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 text-sm ${idx % 2 === 0 ? 'bg-[var(--brand-cream)]' : 'bg-[var(--brand-violet-container)]'}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span style={{ color: 'var(--brand-secondary)' }}>📍</span>
                            <span className="font-medium">{loc.name}</span>
                            {loc.city && <span className="text-slate-700 text-xs">— {[loc.city, loc.state, loc.country, loc.zip_code].filter(Boolean).join(", ")}</span>}
                          </div>
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50 rounded-lg shrink-0" style={{ color: 'var(--brand-error)' }} onClick={() => removeLocationFromList(idx)}>
                            <X size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'guests' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label block">Event Guests</label>
                  <p className="text-xs text-slate-500">Guests invited to all activities across the entire event.</p>
                  <div className="flex gap-2 flex-wrap">
                    <Input value={newGuestName} onChange={e => setNewGuestName(e.target.value)} placeholder="Name" className="flex-1 min-w-[120px] bg-white border-slate-300 rounded-xl text-sm" />
                    <Input value={newGuestWhatsApp} onChange={e => setNewGuestWhatsApp(e.target.value)} placeholder="WhatsApp" className="flex-1 min-w-[120px] bg-white border-slate-300 rounded-xl text-sm" />
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2">
                      <span className="text-xs text-slate-600">×</span>
                      <input type="number" min={1} value={newGuestCount} onChange={e => setNewGuestCount(parseInt(e.target.value) || 1)} className="w-10 border-none bg-transparent text-sm text-center focus:outline-none" />
                    </div>
                    <Select value={newGuestStatus} onValueChange={(v) => v && setNewGuestStatus(v)}>
                      <SelectTrigger className="bg-white border-slate-300 rounded-xl w-[110px] text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent side="bottom" sideOffset={8}>
                        <SelectItem value="Attending">🟢 Attending</SelectItem>
                        <SelectItem value="No">🔴 No</SelectItem>
                        <SelectItem value="Maybe">🟡 Maybe</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={addGuestToList} className="shrink-0 gap-1 rounded-xl bg-[var(--brand-secondary)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-90 transition-all"><Plus size={14} /> Add</Button>
                    <label className="shrink-0 cursor-pointer rounded-xl bg-white border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5">
                      <Upload size={14} /> CSV
                      <input type="file" accept=".csv" onChange={handleEventGuestCSV} className="hidden" />
                    </label>
                    <button onClick={downloadSampleCSV} className="shrink-0 rounded-xl bg-white border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5" type="button">
                      <Download size={14} /> Sample
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-xl divide-y overflow-hidden">
                    {formGuests.length === 0 && <p className="text-xs text-slate-600 italic p-3 bg-[var(--brand-cream)]">No event guests added yet.</p>}
                    {formGuests.map((g, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-3 text-sm ${idx % 2 === 0 ? 'bg-[var(--brand-cream)]' : 'bg-[var(--brand-violet-container)]'}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 shrink-0 rounded-full ${g.status === 'Attending' ? 'bg-green-500' : g.status === 'No' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                          <span className="font-medium truncate">{g.name}</span>
                          {g.whatsapp && <span className="text-slate-600 text-xs truncate">{g.whatsapp}</span>}
                          <span className="text-xs text-slate-500 shrink-0">×{g.guest_count}</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${g.status === 'Attending' ? 'bg-green-50 text-green-700' : g.status === 'No' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>{g.status}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50 rounded-lg shrink-0" style={{ color: 'var(--brand-error)' }} onClick={() => removeGuestFromList(idx)}>
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'budget' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label block">Effort & Budget</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <p className="text-xs text-slate-600 flex items-center gap-1.5"><DollarSign size={13} /> Planned Budget</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                        <Input type="number" min={0} step={0.01} value={formEventBudget} onChange={e => setFormEventBudget(e.target.value)} placeholder="0.00" className="bg-white border-slate-300 rounded-xl text-sm pl-7" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-slate-600 flex items-center gap-1.5"><Clock size={13} /> Planned Effort (hours)</p>
                      <Input type="number" min={0} step={0.5} value={formEventEffortHours} onChange={e => setFormEventEffortHours(e.target.value)} placeholder="0" className="bg-white border-slate-300 rounded-xl text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'payment' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label block">Payment Details</label>
                   <p className="text-xs text-slate-600">Pre-populated from your Admin payment defaults. Change any field to override for this event only.</p>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Bank Name</label>
                    <Input value={formPaymentBankName} onChange={e => setFormPaymentBankName(e.target.value)} placeholder="e.g. State Bank of India" className="bg-white border-slate-300 rounded-xl text-sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Account Number</label>
                      <Input value={formPaymentAccountNumber} onChange={e => setFormPaymentAccountNumber(e.target.value)} placeholder="Account number" className="bg-white border-slate-300 rounded-xl text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">IFSC Code</label>
                      <Input value={formPaymentIfscCode} onChange={e => setFormPaymentIfscCode(e.target.value)} placeholder="e.g. SBIN0001234" className="bg-white border-slate-300 rounded-xl text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">QR Code</label>
                    <div className="border border-slate-200 rounded-xl p-4 bg-white">
                      {formPaymentQrCode ? (
                        <div className="flex items-start gap-4">
                          <img src={formPaymentQrCode} alt="Payment QR Code" className="w-32 h-32 object-contain border border-slate-200 rounded-xl" />
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 rounded-xl" onClick={() => setFormPaymentQrCode('')}>Remove</Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-2 cursor-pointer py-4 text-slate-600 hover:text-[var(--brand-violet)] transition-colors">
                          <Upload size={24} />
                          <span className="text-sm font-medium">Upload QR Code</span>
                          <input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = evt => setFormPaymentQrCode(evt.target?.result as string || ''); reader.readAsDataURL(file); e.target.value = ''; }} />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Event-specific QR code. If set, overrides the business default QR code.</p>
                  </div>
                </div>
              )}

              <Button onClick={saveEvent} className="w-full rounded-xl bg-[var(--brand-violet)] py-3 text-sm font-semibold text-white shadow-md hover:brightness-90 transition-all active:scale-[0.97] btn-text">Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={(open) => { if (!open) { setIsDeleteOpen(false); setDeleteEventId(null); setDeleteConfirmInput(""); } }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg" style={{ color: 'var(--brand-error)' }}>Delete Event/Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-700">This action cannot be undone. All activities, guests, vendors, and other data associated with this event will be permanently deleted.</p>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Type the event title to confirm:</label>
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 mb-2">
                <p className="text-sm font-semibold text-slate-900 break-words">{deleteEventTitle}</p>
              </div>
              <Input value={deleteConfirmInput} onChange={e => setDeleteConfirmInput(e.target.value)} placeholder="Paste or type the title above" className="bg-white border-slate-300 rounded-xl text-sm" />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { setIsDeleteOpen(false); setDeleteEventId(null); setDeleteConfirmInput(""); }} className="flex-1 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all">Cancel</Button>
              <Button onClick={confirmDeleteEvent} disabled={deleteConfirmInput !== deleteEventTitle} className="flex-1 rounded-xl text-sm font-semibold text-white shadow-md transition-all disabled:opacity-40" style={{ backgroundColor: 'var(--brand-error, #ef4444)' }}>Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
