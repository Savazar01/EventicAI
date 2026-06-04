"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { DndContext, closestCenter, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Calendar, Users, Briefcase, Save, Upload, Pencil, X, Download, Filter, Kanban, CalendarDays, List, Menu, ChevronDown, ChevronUp, Clock, DollarSign, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

type Activity = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  completed: number;
  parent_activity_id: number | null;
  start_date: string;
  end_date: string;
  location: string | null;
  planned_start: string | null;
  planned_end: string | null;
  actual_end: string | null;
  assigned_owner_id: number | null;
  sub_activity_count: number;
  guest_count: number;
  vendor_count: number;
  progress_status: string | null;
  completion_note: string | null;
  completed_at: string | null;
  planned_effort_hours: number | null;
  actual_effort_hours: number | null;
  planned_budget: number | null;
  actual_budget: number | null;
  currency: string | null;
};

function Column({ id, label, color, children }: { id: string; label: string; color: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="rounded-2xl p-4 border border-slate-200 shadow-sm min-h-[300px]" style={{ backgroundColor: color }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--brand-violet)' }} />
        <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-violet)' }}>{label}</h2>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function ActivityCard({ activity, columns, onClick, onStatusChange, businessCountry }: { activity: Activity; columns: { status_id: string; label: string }[]; onClick: () => void; onStatusChange: (id: number, status: string) => void; businessCountry: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: activity.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="kanban-card group relative cursor-grab active:cursor-grabbing">
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onClick(); }}
        className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-slate-50 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
      >
        <Pencil size={12} />
      </button>
      <h3 className="font-semibold text-slate-900 leading-tight pr-14">
        {activity.title}
        {(activity.progress_status === 'done' || (activity.completed === 1 && !activity.progress_status)) && <span className="ml-2 text-xs font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">✓ Done</span>}
        {activity.progress_status === 'in-progress' && <span className="ml-2 text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">In Progress</span>}
      </h3>
      <div className="flex items-center gap-4 mt-3 text-xs font-medium bg-white w-fit px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
        <span className="flex items-center gap-1" style={{ color: 'var(--brand-violet)' }}><Calendar size={12}/> {formatDate(activity.start_date, businessCountry)}</span>
        <span className="flex items-center gap-1" style={{ color: 'var(--brand-secondary)' }}><Plus size={12}/> {activity.sub_activity_count}</span>
        <span className="flex items-center gap-1" style={{ color: 'var(--brand-rose)' }}><Users size={12}/> {activity.guest_count}</span>
        <span className="flex items-center gap-1" style={{ color: 'var(--brand-secondary)' }}><Briefcase size={12}/> {activity.vendor_count}</span>
      </div>
      <select
        value={activity.status}
        onClick={e => e.stopPropagation()}
        onChange={e => onStatusChange(activity.id, e.target.value)}
        className="mt-2 text-xs rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-slate-600 cursor-pointer hover:border-[var(--brand-violet)] transition-colors"
      >
        {columns.map(col => (
          <option key={col.status_id} value={col.status_id}>{col.label}</option>
        ))}
      </select>
    </div>
  );
}

const DURATION_OPTIONS = [
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hour" },
  { value: "90", label: "1 hr 30 min" },
  { value: "120", label: "2 hours" },
  { value: "150", label: "2 hr 30 min" },
  { value: "180", label: "3 hours" },
  { value: "240", label: "4 hours" },
  { value: "300", label: "5 hours" },
  { value: "360", label: "6 hours" },
  { value: "480", label: "8 hours" },
];

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

function TimePicker({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  const parts = (value || '09:00').split(':');
  const h = parts[0] || '09';
  const m = parts[1] || '00';
  return (
    <div className={`flex items-center gap-0.5 ${className || ''}`}>
      <select value={h} onChange={e => onChange(e.target.value + ':' + m)} className="rounded-xl border-slate-200 bg-white px-1.5 py-2 text-sm border shadow-sm flex-1 min-w-0">
        {HOURS.map(hh => <option key={hh} value={hh}>{hh}</option>)}
      </select>
      <span className="text-slate-500 text-sm font-bold px-0.5">:</span>
      <select value={m} onChange={e => onChange(h + ':' + e.target.value)} className="rounded-xl border-slate-200 bg-white px-1.5 py-2 text-sm border shadow-sm flex-1 min-w-0">
        {MINUTES.map(mm => <option key={mm} value={mm}>{mm}</option>)}
      </select>
    </div>
  );
}

function computeEndStr(dateStr: string, timeStr: string, durationMin: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + Number(durationMin);
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  const dayOffset = Math.floor(total / (60 * 24));
  const d = new Date(dateStr);
  d.setDate(d.getDate() + dayOffset);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
}

const statusColor: Record<string, string> = {
  backlog: '#94a3b8',
  'in-progress': '#c484b0',
  done: '#22c55e'
};

function exportCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  for (const row of data) {
    csvRows.push(headers.map(h => {
      const val = String(row[h] ?? '');
      return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
    }).join(','));
  }
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function TimelineView({ activity, subActivities, businessCountry }: { activity: Activity; subActivities: Activity[]; businessCountry: string }) {
  const items = [
    { ...activity, isMain: true },
    ...subActivities.map(s => ({ ...s, isMain: false })),
  ].sort((a, b) => {
    const aDate = a.planned_start || a.start_date || '';
    const bDate = b.planned_start || b.start_date || '';
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return aDate.localeCompare(bDate);
  });

  if (items.length === 0) return null;

  return (
    <div className="border-t border-slate-200 px-4 py-4 bg-white">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--brand-violet)' }} />
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-violet)' }}>Timeline</h3>
      </div>
      <div className="relative pl-7">
        <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[var(--brand-violet)] to-slate-200 rounded-full" />
        {items.map((item, idx) => {
          const start = item.planned_start || item.start_date || '';
          const date = start.split('T')[0] || '';
          const time = start.includes('T') ? start.split('T')[1]?.slice(0, 5) : '';
          const end = item.planned_end || item.end_date || '';
          const endDate = end.split('T')[0] || '';
          const endTime = end.includes('T') ? end.split('T')[1]?.slice(0, 5) : '';
          const color = statusColor[item.status] || '#94a3b8';
          const isLast = idx === items.length - 1;
          return (
            <div key={item.id} className={`relative ${isLast ? '' : 'pb-4'}`}>
              <div
                className="absolute -left-[18px] top-[5px] w-3.5 h-3.5 rounded-full border-[3px] border-white shadow-md z-10"
                style={{ backgroundColor: item.completed === 1 ? '#22c55e' : color }}
              />
              <div className="ml-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-semibold ${item.completed === 1 ? 'line-through text-slate-500' : item.isMain ? 'text-slate-900' : 'text-slate-800'}`}>
                    {item.title}
                  </span>
                  {item.isMain && (
                    <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-violet) 12%, transparent)', color: 'var(--brand-violet)' }}>
                      Activity
                    </span>
                  )}
                  {item.completed === 1 && (
                    <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-50 text-green-600">
                      Done
                    </span>
                  )}
                </div>
                {item.description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>}
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                  <Calendar size={11} className="shrink-0" />
                  {date && <span>{formatDate(date, businessCountry)}</span>}
                  {time && <span className="font-mono">{time}</span>}
                  {(endDate && endDate !== date) || (endTime && endTime !== time) ? (
                    <>
                      <span className="text-slate-300">→</span>
                      {endDate && endDate !== date && <span>{formatDate(endDate, businessCountry)}</span>}
                      {endTime && endTime !== time && <span className="font-mono">{endTime}</span>}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EnhancedTimeline({ activities, columns, onActivityClick, businessCountry }: { activities: Activity[]; columns: { status_id: string; label: string; color: string }[]; onActivityClick: (a: Activity) => void; businessCountry: string }) {
  const [filterColumn, setFilterColumn] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [groupBy, setGroupBy] = useState<"day" | "week">("day");

  const colMap = new Map(columns.map(c => [c.status_id, c]));
  const columnOpts = columns.map(c => ({ value: c.status_id, label: c.label }));

  const filtered = activities
    .filter(a => a.planned_start || a.start_date)
    .filter(a => filterColumn === "all" || a.status === filterColumn)
    .filter(a => filterStatus === "all" || (filterStatus === "done" ? a.progress_status === "done" || a.completed === 1 : filterStatus === "in-progress" ? a.progress_status === "in-progress" : a.progress_status !== "done" && a.completed !== 1))
    .filter(a => !dateFrom || (a.planned_start || a.start_date || "").split("T")[0] >= dateFrom)
    .filter(a => !dateTo || (a.planned_start || a.start_date || "").split("T")[0] <= dateTo)
    .sort((a, b) => {
      const da = (a.planned_start || a.start_date || "");
      const db = (b.planned_start || b.start_date || "");
      return sortDir === "asc" ? da.localeCompare(db) : db.localeCompare(da);
    });

  const groups = new Map<string, Activity[]>();
  for (const a of filtered) {
    const d = (a.planned_start || a.start_date || "").split("T")[0];
    if (!d) continue;
    const key = groupBy === "week" ? (() => { const dt = new Date(d); const s = new Date(dt); s.setDate(s.getDate() - s.getDay()); return s.toISOString().split("T")[0]; })() : d;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(a);
  }

  if (filtered.length < 1) return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center text-slate-600 text-sm">
      {activities.length < 2 ? "Add at least 2 activities with dates to see the timeline." : "No activities match the current filters."}
    </div>
  );

  const groupKeys = [...groups.keys()].sort((a, b) => sortDir === "asc" ? a.localeCompare(b) : b.localeCompare(a));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--brand-violet)' }} />
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand-violet)' }}>Timeline</h3>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} of {activities.filter(a => a.planned_start || a.start_date).length} shown</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5 p-3 bg-slate-50 rounded-xl border border-slate-200">
        <select value={filterColumn} onChange={e => setFilterColumn(e.target.value)} className="text-xs rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700">
          <option value="all">All Columns</option>
          {columnOpts.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700">
          <option value="all">All Status</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="text-xs rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700" placeholder="From" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="text-xs rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700" placeholder="To" />
        <button onClick={() => setSortDir(s => s === "asc" ? "desc" : "asc")} className="text-xs rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 hover:bg-slate-100 flex items-center gap-1">
          {sortDir === "asc" ? "↑ Oldest" : "↓ Newest"}
        </button>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button onClick={() => setGroupBy("day")} className={`px-2.5 py-1.5 text-xs font-semibold transition-all ${groupBy === "day" ? "bg-[var(--brand-violet)] text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}>Day</button>
          <button onClick={() => setGroupBy("week")} className={`px-2.5 py-1.5 text-xs font-semibold transition-all ${groupBy === "week" ? "bg-[var(--brand-violet)] text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}>Week</button>
        </div>
      </div>

      {/* Timeline content */}
      <div className="space-y-6">
        {groupKeys.map(key => {
          const items = groups.get(key)!;
          const label = groupBy === "week"
            ? (() => { const d = new Date(key); const e = new Date(d); e.setDate(e.getDate() + 6); return `${d.toLocaleDateString("en",{month:"short",day:"numeric"})} — ${e.toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"})}`; })()
            : (() => { const d = new Date(key + "T00:00:00"); const today = new Date(); const isToday = d.toDateString() === today.toDateString(); return `${d.toLocaleDateString("en",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}${isToday ? "  •  Today" : ""}`; })();

          return (
            <div key={key}>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-[var(--brand-violet)] to-slate-200 rounded-full" />
                <span className={`text-xs font-bold uppercase tracking-widest shrink-0 ${groupBy === "day" && new Date(key + "T00:00:00").toDateString() === new Date().toDateString() ? "text-[var(--brand-violet)]" : "text-slate-600"}`}>{label}</span>
                <div className="h-0.5 flex-1 bg-gradient-to-l from-[var(--brand-violet)] to-slate-200 rounded-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {items.map(a => {
                  const col = colMap.get(a.status);
                  const start = a.planned_start || a.start_date || "";
                  const time = start.includes("T") ? start.split("T")[1]?.slice(0, 5) : "";
                  const isDone = a.progress_status === "done" || (a.completed === 1 && !a.progress_status);
                  return (
                    <div key={a.id} onClick={() => onActivityClick(a)} className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md hover:border-[var(--brand-violet)]/30 transition-all active:scale-[0.98]">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col?.color || "#94a3b8" }} />
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{col?.label || a.status}</span>
                        {isDone && <span className="ml-auto text-xs font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">✓ Done</span>}
                        {a.progress_status === "in-progress" && <span className="ml-auto text-xs font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">In Progress</span>}
                      </div>
                      <p className={`text-sm font-semibold leading-snug mb-1.5 card-title ${isDone ? "line-through text-slate-500" : "text-slate-900"}`}>{a.title}</p>
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        {time ? `${formatDate(start.split("T")[0], businessCountry)} at ${time}` : formatDate(start.split("T")[0], businessCountry)}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                        {a.sub_activity_count > 0 && <span><Plus size={10} className="inline mr-0.5"/>{a.sub_activity_count}</span>}
                        {a.guest_count > 0 && <span><Users size={10} className="inline mr-0.5"/>{a.guest_count}</span>}
                        {a.vendor_count > 0 && <span><Briefcase size={10} className="inline mr-0.5"/>{a.vendor_count}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function CalendarView({ activities, onActivityClick, businessCountry }: { activities: Activity[]; onActivityClick: (a: Activity) => void; businessCountry: string }) {
  const [calMode, setCalMode] = useState<'month' | 'week' | 'day'>('month');
  const [baseDate, setBaseDate] = useState(new Date());

  const goToDay = (d: Date) => {
    setBaseDate(d);
    setCalMode('day');
  };

  const actMap = new Map<string, Activity[]>();
  for (const a of activities) {
    const d = (a.planned_start || a.start_date || '').split('T')[0];
    if (d) {
      if (!actMap.has(d)) actMap.set(d, []);
      actMap.get(d)!.push(a);
    }
  }

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const nav = (dir: number) => {
    const d = new Date(baseDate);
    if (calMode === 'month') d.setMonth(d.getMonth() + dir);
    else if (calMode === 'week') d.setDate(d.getDate() + 7 * dir);
    else d.setDate(d.getDate() + dir);
    setBaseDate(d);
  };

  const resetToday = () => setBaseDate(new Date());

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {(['month','week','day'] as const).map(m => (
              <button key={m} onClick={() => setCalMode(m)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all ${calMode === m ? 'bg-[var(--brand-violet)] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}>
                {m === 'month' ? 'Month' : m === 'week' ? 'Week' : 'Day'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => nav(-1)} className="px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">&lt;</button>
          <span className="text-sm font-semibold text-slate-900 min-w-[140px] text-center">
            {calMode === 'month' && `${MONTHS[month]} ${year}`}
            {calMode === 'week' && (() => {
              const sw = new Date(baseDate);
              sw.setDate(sw.getDate() - sw.getDay());
              const ew = new Date(sw);
              ew.setDate(ew.getDate() + 6);
              return `${sw.getDate()} ${MONTHS[sw.getMonth()]} — ${ew.getDate()} ${MONTHS[ew.getMonth()]} ${sw.getFullYear() !== ew.getFullYear() ? ew.getFullYear() : ''}`;
            })()}
            {calMode === 'day' && formatDate(baseDate.toISOString().split("T")[0], businessCountry)}
          </span>
          <button onClick={() => nav(1)} className="px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 rounded-lg">&gt;</button>
          <button onClick={resetToday} className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200">Today</button>
        </div>
      </div>
      {calMode === 'month' && (
        <div className="p-3">
          <div className="grid grid-cols-7 gap-0.5">
            {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-slate-500 uppercase py-1">{d}</div>)}
            {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const acts = actMap.get(key) || [];
              const isToday = new Date().toISOString().split('T')[0] === key;
              return (
                <div key={day} onClick={() => goToDay(new Date(year, month, day))} className={`rounded-lg p-1.5 min-h-[56px] text-xs border ${isToday ? 'border-[var(--brand-violet)] bg-[var(--brand-violet)]/5' : 'border-transparent hover:border-slate-200'} transition-all cursor-pointer`}>
                  <span className={`font-semibold ${isToday ? 'text-[var(--brand-violet)]' : 'text-slate-700'}`}>{day}</span>
                  <div className="mt-0.5 space-y-0.5">
                    {acts.slice(0, 3).map(a => (
                      <div key={a.id} onClick={() => onActivityClick(a)} className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.completed === 1 ? 'bg-green-500' : a.status === 'in-progress' ? 'bg-yellow-500' : 'bg-slate-300'}`} />
                        <span className="truncate text-xs text-slate-700">{a.title}</span>
                      </div>
                    ))}
                    {acts.length > 3 && <p className="text-xs text-slate-500">+{acts.length - 3} more</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {calMode === 'week' && (() => {
        const startOfWeek = new Date(baseDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const days: { date: Date; key: string; label: string }[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(startOfWeek);
          d.setDate(d.getDate() + i);
          const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          const label = `${DAYS[i]} ${d.getDate()}`;
          days.push({ date: d, key, label });
        }
        return (
          <div className="p-3">
            <div className="grid grid-cols-7 gap-1">
              {days.map(day => {
                const acts = actMap.get(day.key) || [];
                const isToday = new Date().toISOString().split('T')[0] === day.key;
                return (
                  <div key={day.key} onClick={() => goToDay(day.date)} className={`rounded-xl p-2 min-h-[120px] border ${isToday ? 'border-[var(--brand-violet)] bg-[var(--brand-violet)]/5' : 'border-slate-200'} transition-all cursor-pointer`}>
                    <div className={`text-xs font-bold mb-1 ${isToday ? 'text-[var(--brand-violet)]' : 'text-slate-700'}`}>{day.label}</div>
                    <div className="space-y-1">
                      {acts.slice(0, 5).map(a => (
                      <div key={a.id} onClick={e => { e.stopPropagation(); onActivityClick(a); }} className="flex items-center gap-1 cursor-pointer hover:opacity-80">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.completed === 1 ? 'bg-green-500' : a.status === 'in-progress' ? 'bg-yellow-500' : 'bg-slate-300'}`} />
                          <span className="truncate text-xs text-slate-700">{a.title}</span>
                        </div>
                      ))}
                      {acts.length > 5 && <p className="text-xs text-slate-500">+{acts.length - 5} more</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
      {calMode === 'day' && (() => {
        const key = `${baseDate.getFullYear()}-${String(baseDate.getMonth()+1).padStart(2,'0')}-${String(baseDate.getDate()).padStart(2,'0')}`;
        const dayActs = actMap.get(key) || [];
        const hourSlots = HOURS.slice(8).map(h => {
          const hourNum = parseInt(h);
          const slotActs = dayActs.filter(a => {
            const start = a.planned_start || a.start_date || '';
            const t = start.includes('T') ? start.split('T')[1]?.slice(0, 2) : '';
            const startHour = parseInt(t);
            if (isNaN(startHour)) return false;
            if (a.completed === 1) return false;
            return startHour === hourNum;
          });
          return { hour: h, acts: slotActs };
        });
        const completedActs = dayActs.filter(a => a.completed === 1);
        const miniDays: { date: Date; key: string; label: string; hasActs: boolean }[] = [];
        for (let i = -14; i <= 14; i++) {
          const d = new Date(baseDate);
          d.setDate(d.getDate() + i);
          const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          miniDays.push({ date: d, key, label: String(d.getDate()), hasActs: actMap.has(key) && actMap.get(key)!.length > 0 });
        }
        return (
          <div className="p-3">
            <div className="flex gap-1 overflow-x-auto pb-2 mb-3 border-b border-slate-200">
              {miniDays.map(md => {
                const isSelected = md.key === key;
                return (
                  <button key={md.key} onClick={() => goToDay(md.date)}
                    className={`shrink-0 w-8 h-10 flex flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all ${isSelected ? 'bg-[var(--brand-violet)] text-white' : md.hasActs ? 'bg-[var(--brand-violet)]/10 text-slate-800 hover:bg-[var(--brand-violet)]/20' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    <span>{md.label}</span>
                    {md.hasActs && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-[var(--brand-violet)]'}`} />}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <div className="flex-1 space-y-0.5 max-h-[500px] overflow-y-auto">
              {hourSlots.map(slot => (
                <div key={slot.hour} className="flex gap-2 min-h-[32px] items-start">
                  <div className="text-xs text-slate-500 font-mono w-8 shrink-0 pt-1">{slot.hour}:00</div>
                  <div className="flex-1 border-t border-slate-100 min-h-[32px] py-0.5">
                    {slot.acts.map(a => (
                      <div key={a.id} onClick={() => onActivityClick(a)} className="cursor-pointer hover:opacity-80 rounded px-1.5 py-0.5 text-xs bg-[var(--brand-violet)]/10 text-slate-800 font-medium truncate mb-0.5">
                        {a.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {completedActs.length > 0 && (
              <div className="w-48 shrink-0 border-l border-slate-200 pl-3">
                <div className="text-xs font-semibold text-green-600 mb-2">Completed</div>
                <div className="space-y-1">
                  {completedActs.map(a => (
                    <div key={a.id} onClick={() => onActivityClick(a)} className="cursor-pointer hover:opacity-80 line-through text-xs text-slate-500 truncate">{a.title}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function KanbanBoard() {
  const params = useParams();
  const eventId = params.id as string;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [eventStats, setEventStats] = useState<any>(null);
  const [adminPaymentInfo, setAdminPaymentInfo] = useState<any>(null);
  const [businessCountry, setBusinessCountry] = useState("");

  const [editForm, setEditForm] = useState<Partial<Activity>>({});
  const [activeView, setActiveView] = useState<'kanban' | 'timeline' | 'calendar'>('kanban');
  const [newSubTitle, setNewSubTitle] = useState("");
  const [newSubDescription, setNewSubDescription] = useState("");
  const [newSubDate, setNewSubDate] = useState("");
  const [newSubTime, setNewSubTime] = useState("");
  const [newSubDuration, setNewSubDuration] = useState("60");
  const [newSubOwnerId, setNewSubOwnerId] = useState<number | null>(null);
  const [eventTeamMembers, setEventTeamMembers] = useState<{ id: number; name: string }[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<Activity>>({ title: '', description: '', status: '', assigned_owner_id: null, planned_effort_hours: null, planned_budget: null, currency: 'INR', location: null });
  const [createActDate, setCreateActDate] = useState("");
  const [createActTime, setCreateActTime] = useState("");
  const [createActDuration, setCreateActDuration] = useState("60");
  const [createPlanDate, setCreatePlanDate] = useState("");
  const [createPlanTime, setCreatePlanTime] = useState("");
  const [createPlanDuration, setCreatePlanDuration] = useState("60");
  const [createSubItems, setCreateSubItems] = useState<{ title: string; description: string; date: string; time: string; duration: string; owner: number | null }[]>([]);
  const [createGuestItems, setCreateGuestItems] = useState<{ name: string; whatsapp: string; count: number; status: string }[]>([]);
  const [createVendorItems, setCreateVendorItems] = useState<{ business_name: string; whatsapp: string; services: string }[]>([]);
  const [createNewSubTitle, setCreateNewSubTitle] = useState("");
  const [createNewSubDesc, setCreateNewSubDesc] = useState("");
  const [createNewSubDate, setCreateNewSubDate] = useState("");
  const [createNewSubTime, setCreateNewSubTime] = useState("");
  const [createNewSubDur, setCreateNewSubDur] = useState("60");
  const [createNewSubOwner, setCreateNewSubOwner] = useState<number | null>(null);
  const [createNewGuestName, setCreateNewGuestName] = useState("");
  const [createNewGuestWA, setCreateNewGuestWA] = useState("");
  const [createNewGuestCount, setCreateNewGuestCount] = useState(1);
  const [createNewGuestStatus, setCreateNewGuestStatus] = useState("Attending");
  const [createNewVendorName, setCreateNewVendorName] = useState("");
  const [createNewVendorWA, setCreateNewVendorWA] = useState("");
  const [createNewVendorSvc, setCreateNewVendorSvc] = useState("");

  const [plannedDate, setPlannedDate] = useState("");
  const [plannedStartTime, setPlannedStartTime] = useState("");
  const [plannedDuration, setPlannedDuration] = useState("60");
  const [activityDate, setActivityDate] = useState("");
  const [activityStartTime, setActivityStartTime] = useState("");
  const [activityDuration, setActivityDuration] = useState("60");

  const [eventLocations, setEventLocations] = useState<{ id: number; name: string; description: string | null }[]>([]);
  const [teamMembers, setTeamMembers] = useState<{ id: number; name: string }[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestWhatsApp, setNewGuestWhatsApp] = useState("");
  const [editingGuestId, setEditingGuestId] = useState<number | null>(null);
  const [editGuestName, setEditGuestName] = useState("");
  const [editGuestWhatsApp, setEditGuestWhatsApp] = useState("");
  const [editGuestCount, setEditGuestCount] = useState(1);
  const [editGuestStatus, setEditGuestStatus] = useState("Attending");
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorService, setNewVendorService] = useState("");
  const [newVendorWhatsApp, setNewVendorWhatsApp] = useState("");
  const [editingVendorId, setEditingVendorId] = useState<number | null>(null);
  const [editVendorName, setEditVendorName] = useState("");
  const [editVendorWhatsApp, setEditVendorWhatsApp] = useState("");
  const [editVendorService, setEditVendorService] = useState("");
  const [completionNote, setCompletionNote] = useState("");
  const [completionActualHours, setCompletionActualHours] = useState("");
  const [completionActualBudget, setCompletionActualBudget] = useState("");
  const [completionCurrency, setCompletionCurrency] = useState("INR");
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [activitySidebarCollapsed, setActivitySidebarCollapsed] = useState(true);
  const [activeActivitySection, setActiveActivitySection] = useState("details");

  // Guest Report
  const [isGuestReportOpen, setIsGuestReportOpen] = useState(false);
  const [reportGuests, setReportGuests] = useState<any[]>([]);
  const [reportFilterStatus, setReportFilterStatus] = useState("");
  const [reportFilterLevel, setReportFilterLevel] = useState("");
  const [reportSort, setReportSort] = useState("name");
  const [reportOrder, setReportOrder] = useState("asc");

  // Vendor Report
  const [isVendorReportOpen, setIsVendorReportOpen] = useState(false);
  const [reportVendors, setReportVendors] = useState<any[]>([]);
  const [vendorReportSort, setVendorReportSort] = useState("business_name");
  const [vendorReportOrder, setVendorReportOrder] = useState("asc");

  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Activity Details Report
  const [isActivityReportOpen, setIsActivityReportOpen] = useState(false);
  const [reportActivities, setReportActivities] = useState<any[]>([]);
  const [activityReportFilterStatus, setActivityReportFilterStatus] = useState("");
  const [activityReportFilterProgress, setActivityReportFilterProgress] = useState("");
  const [activityReportFilterLevel, setActivityReportFilterLevel] = useState("");
  const [activityReportSearch, setActivityReportSearch] = useState("");
  const [activityReportSort, setActivityReportSort] = useState("planned_start");
  const [activityReportOrder, setActivityReportOrder] = useState("asc");

  const [columns, setColumns] = useState<{ id: number; event_id: number; status_id: string; label: string; color: string; sort_order: number }[]>([]);
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false);
  const [newColLabel, setNewColLabel] = useState("");
  const [newColStatusId, setNewColStatusId] = useState("");
  const [newColColor, setNewColColor] = useState("#94a3b8");
  const [editingColId, setEditingColId] = useState<number | null>(null);
  const hasAutoPromptedRef = useRef(false);

  useEffect(() => {
    hasAutoPromptedRef.current = false;
  }, [eventId]);

  const fetchColumns = useCallback(async () => {
    const res = await fetch(`/api/columns?event_id=${eventId}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setColumns(data);
      if (data.length === 0 && !hasAutoPromptedRef.current) {
        hasAutoPromptedRef.current = true;
        setIsColumnManagerOpen(true);
      }
    }
  }, [eventId]);

  const moveColumn = async (id: number, direction: -1 | 1) => {
    const idx = columns.findIndex(c => c.id === id);
    if (idx === -1) return;
    const target = idx + direction;
    if (target < 0 || target >= columns.length) return;
    const a = columns[idx];
    const b = columns[target];
    await fetch('/api/columns', { method: 'PUT', body: JSON.stringify({ id: a.id, sort_order: b.sort_order }), headers: { 'Content-Type': 'application/json' } });
    await fetch('/api/columns', { method: 'PUT', body: JSON.stringify({ id: b.id, sort_order: a.sort_order }), headers: { 'Content-Type': 'application/json' } });
    await fetchColumns();
  };

  const fetchActivities = useCallback(async () => {
    const res = await fetch(`/api/activities?event_id=${eventId}&t=${Date.now()}`);
    const data = await res.json();
    setActivities(Array.isArray(data) ? data : []);
  }, [eventId]);

  const fetchDrawerData = useCallback(async (activityId: number) => {
    const guestsRes = await fetch(`/api/guests?activity_id=${activityId}`);
    const vendorsRes = await fetch(`/api/activities/${activityId}/vendors`);
    setGuests(await guestsRes.json());
    setVendors(await vendorsRes.json());
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchColumns();
    fetch('/api/team-members').then(r => r.json()).then(d => setTeamMembers(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`/api/event-locations?event_id=${eventId}`).then(r => r.json()).then(d => setEventLocations(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`/api/events/${eventId}`).then(r => r.json()).then(d => setEventStats(d)).catch(() => {});
    fetch('/api/admin/business').then(r => r.json()).then(d => { if (d?.country) setBusinessCountry(d.country); }).catch(() => {});
    fetch('/api/admin/payment-info').then(r => r.json()).then(d => { if (d) setAdminPaymentInfo(d); }).catch(() => {});
    // Load team members assigned to this event
    (async () => {
      try {
        const eventData = await fetch(`/api/events/${eventId}`).then(r => r.json());
        const ownerId = eventData?.event_owner_id;
        const allMembers = await fetch('/api/team-members').then(r => r.json());
        if (Array.isArray(allMembers)) {
          const assigned = allMembers.filter((m: any) => {
            const ids: number[] = JSON.parse(m.event_ids || '[]');
            return ids.includes(Number(eventId)) || m.id === ownerId;
          });
          setEventTeamMembers(assigned.map((m: any) => ({ id: m.id, name: m.name })));
        }
      } catch {}
    })();
  }, [fetchActivities, fetchColumns, eventId]);

  useEffect(() => {
    if (selectedActivity) {
      setEditForm(selectedActivity);
      if (selectedActivity.planned_start) {
        const parts = selectedActivity.planned_start.split('T');
        const date = parts[0] || '';
        const time = parts[1]?.slice(0, 5) || '';
        setPlannedDate(date);
        setPlannedStartTime(time);
        setNewSubDate(date);
        setNewSubTime(time);
      } else {
        setPlannedDate('');
        setPlannedStartTime('');
        setNewSubDate('');
        setNewSubTime('');
      }
      if (selectedActivity.start_date) {
        const parts = selectedActivity.start_date.split('T');
        setActivityDate(parts[0] || '');
        setActivityStartTime(parts[1]?.slice(0, 5) || '');
      } else {
        setActivityDate('');
        setActivityStartTime('');
      }
      if (selectedActivity.start_date && selectedActivity.end_date) {
        const diff = new Date(selectedActivity.end_date).getTime() - new Date(selectedActivity.start_date).getTime();
        const mins = Math.round(diff / 60000);
        setActivityDuration(mins > 0 ? String(mins) : "60");
      } else {
        setActivityDuration("60");
      }
      if (selectedActivity.planned_start && selectedActivity.planned_end) {
        const diff = new Date(selectedActivity.planned_end).getTime() - new Date(selectedActivity.planned_start).getTime();
        const mins = Math.round(diff / 60000);
        const dur = mins > 0 ? String(mins) : "60";
        setPlannedDuration(dur);
        setNewSubDuration(dur);
      } else {
        setPlannedDuration("60");
      }
      fetchDrawerData(selectedActivity.id);
    }
  }, [selectedActivity, fetchDrawerData]);

  useEffect(() => {
    if (isGuestReportOpen) fetchGuestReport();
  }, [isGuestReportOpen, reportFilterStatus, reportFilterLevel, reportSort, reportOrder]);

  useEffect(() => {
    if (isVendorReportOpen) fetchVendorReport();
  }, [isVendorReportOpen, vendorReportSort, vendorReportOrder]);

  useEffect(() => {
    if (isActivityReportOpen) fetchActivityReport();
  }, [isActivityReportOpen, activityReportFilterStatus, activityReportFilterProgress, activityReportFilterLevel, activityReportSearch, activityReportSort, activityReportOrder]);

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const activeId = active.id as number;
    const overStr = over.id as string;
    const columnIds = columns.map(c => c.status_id);
    const newStatus = columnIds.includes(overStr)
      ? overStr
      : (activities.find(a => a.id === Number(overStr))?.status || 'backlog');
    
    await fetch(`/api/activities`, {
        method: 'PUT',
        body: JSON.stringify({ id: activeId, status: newStatus }),
        headers: { 'Content-Type': 'application/json' }
    });
    setActivities(activities.map(a => a.id === activeId ? { ...a, status: newStatus } : a));
  };

  const handleCardStatusChange = async (id: number, status: string) => {
    await fetch(`/api/activities`, {
      method: 'PUT',
      body: JSON.stringify({ id, status }),
      headers: { 'Content-Type': 'application/json' }
    });
    setActivities(activities.map(a => a.id === id ? { ...a, status } : a));
  };

  const handleDeleteActivity = async (id: number) => {
    if (!confirm("Delete this activity?")) return;
    await fetch(`/api/activities?id=${id}`, { method: "DELETE" });
    setActivities(activities.filter(a => a.id !== id));
    if (selectedActivity?.id === id) setSelectedActivity(null);
  };

  const updateSubActivity = async (sub: Activity, completed: boolean) => {
    await fetch(`/api/activities`, {
        method: 'PUT',
        body: JSON.stringify({ id: sub.id, status: completed ? 'done' : 'in-progress', completed, parent_activity_id: sub.parent_activity_id }),
        headers: { 'Content-Type': 'application/json' }
    });
    await fetchActivities();
  };

  const saveActivityDetails = async () => {
    if (!selectedActivity) return;
    const body: any = { id: selectedActivity.id, ...editForm };
    if (plannedDate && plannedDuration) {
      const time = plannedStartTime || '09:00';
      body.planned_start = `${plannedDate}T${time}:00`;
      body.planned_end = computeEndStr(plannedDate, time, plannedDuration);
    }
    if (activityDate && activityDuration) {
      const time = activityStartTime || '09:00';
      body.start_date = `${activityDate}T${time}:00`;
      body.end_date = computeEndStr(activityDate, time, activityDuration);
    }
    const res = await fetch(`/api/activities`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
        await fetchActivities();
        setSelectedActivity(null);
        alert("Saved successfully!");
    } else {
        alert("Failed to save!");
    }
  };

  const addSubActivity = async () => {
    if (!newSubTitle.trim() || !selectedActivity) return;
    let startDate = selectedActivity.start_date;
    let endDate = selectedActivity.end_date;
    if (newSubDate && newSubTime && newSubDuration) {
      startDate = `${newSubDate}T${newSubTime}:00`;
      endDate = computeEndStr(newSubDate, newSubTime, newSubDuration);
    }
    const res = await fetch("/api/activities", {
      method: "POST",
      body: JSON.stringify({ 
        event_id: Number(eventId), 
        parent_activity_id: selectedActivity.id,
        title: newSubTitle,
        description: newSubDescription || null,
        start_date: startDate,
        end_date: endDate,
        assigned_owner_id: newSubOwnerId || null
      }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
        await fetchActivities();
        setNewSubTitle("");
        setNewSubDescription("");
        setNewSubDate("");
        setNewSubTime("");
        setNewSubDuration("60");
        setNewSubOwnerId(null);
        const updatedActivities = await fetch(`/api/activities?event_id=${eventId}&t=${Date.now()}`).then(r => r.json());
        setSelectedActivity(updatedActivities.find((a: Activity) => a.id === selectedActivity.id));
    }
  };

  const addGuest = async () => {
    if (!newGuestName.trim() || !selectedActivity) return;
    try {
        const res = await fetch("/api/guests", {
          method: "POST",
          body: JSON.stringify({ activity_id: selectedActivity.id, name: newGuestName, whatsapp: newGuestWhatsApp }),
          headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            const newGuest = await res.json();
            setGuests(prev => [...prev, newGuest]);
            setNewGuestName("");
            setNewGuestWhatsApp("");
            await fetchActivities();
        } else {
            console.error("Failed to add guest", await res.text());
        }
    } catch (e) {
        console.error(e);
    }
  };

  const updateGuest = async () => {
    if (editingGuestId === null) return;
    await fetch("/api/guests", {
      method: "PUT",
      body: JSON.stringify({ id: editingGuestId, name: editGuestName, whatsapp: editGuestWhatsApp, guest_count: editGuestCount, status: editGuestStatus }),
      headers: { "Content-Type": "application/json" }
    });
    setGuests(prev => prev.map(g => g.id === editingGuestId ? { ...g, name: editGuestName, whatsapp: editGuestWhatsApp, guest_count: editGuestCount, status: editGuestStatus } : g));
    setEditingGuestId(null);
    await fetchActivities();
  };

  const deleteGuest = async (id: number) => {
    if (!confirm("Remove this guest?")) return;
    await fetch(`/api/guests?id=${id}`, { method: "DELETE" });
    setGuests(prev => prev.filter(g => g.id !== id));
    await fetchActivities();
  };

  const startEditGuest = (g: any) => {
    setEditingGuestId(g.id);
    setEditGuestName(g.name);
    setEditGuestWhatsApp(g.whatsapp || "");
    setEditGuestCount(g.guest_count || 1);
    setEditGuestStatus(g.status || "Attending");
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

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedActivity) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
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
        const res = await fetch("/api/guests", {
          method: "POST",
          body: JSON.stringify({ activity_id: selectedActivity.id, name, whatsapp, guest_count: guestCount, status }),
          headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
          const guest = await res.json();
          setGuests(prev => [...prev, guest]);
        }
      }
      await fetchActivities();
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const assignVendor = async () => {
    if (!newVendorName.trim() || !selectedActivity) return;
    try {
        const res = await fetch(`/api/activities/${selectedActivity.id}/vendors`, {
          method: "POST",
          body: JSON.stringify({ business_name: newVendorName, whatsapp: newVendorWhatsApp || "N/A", services: newVendorService }),
          headers: { "Content-Type": "application/json" }
        });
        if (res.ok) {
            await fetchDrawerData(selectedActivity.id);
            setNewVendorName("");
            setNewVendorService("");
            setNewVendorWhatsApp("");
            // Refresh parent to update vendor count
            await fetchActivities();
        } else {
            console.error("Failed to add vendor", await res.text());
        }
    } catch (e) {
        console.error(e);
    }
  };

  const startEditVendor = (v: any) => {
    setEditingVendorId(v.id);
    setEditVendorName(v.business_name);
    setEditVendorWhatsApp(v.whatsapp || "");
    setEditVendorService(v.services || "");
  };

  const cancelEditVendor = () => {
    setEditingVendorId(null);
  };

  const saveEditVendor = async () => {
    if (editingVendorId === null) return;
    await fetch("/api/vendors", {
      method: "PUT",
      body: JSON.stringify({ id: editingVendorId, business_name: editVendorName, whatsapp: editVendorWhatsApp, services: editVendorService }),
      headers: { "Content-Type": "application/json" }
    });
    setEditingVendorId(null);
    if (selectedActivity) await fetchDrawerData(selectedActivity.id);
  };

  const deleteVendor = async (id: number) => {
    if (!confirm("Remove this vendor?")) return;
    await fetch(`/api/vendors?id=${id}`, { method: "DELETE" });
    if (selectedActivity) {
      await fetchDrawerData(selectedActivity.id);
      await fetchActivities();
    }
  };

  const markActivityComplete = async () => {
    if (!selectedActivity) return;
    setCompletionNote("");
    setCompletionActualHours("");
    setCompletionActualBudget("");
    setCompletionCurrency(selectedActivity.currency || "INR");
    setIsCompleteDialogOpen(true);
  };

  const confirmComplete = async () => {
    if (!selectedActivity) return;
    await fetch("/api/activities/complete", {
      method: "POST",
      body: JSON.stringify({
        id: selectedActivity.id,
        note: completionNote || null,
        actual_effort_hours: completionActualHours ? Number(completionActualHours) : null,
        actual_budget: completionActualBudget ? Number(completionActualBudget) : null,
        currency: completionCurrency || null
      }),
      headers: { "Content-Type": "application/json" }
    });
    setIsCompleteDialogOpen(false);
    await fetchActivities();
    const updated = await fetch(`/api/activities?event_id=${eventId}&t=${Date.now()}`).then(r => r.json());
    setSelectedActivity(updated.find((a: any) => a.id === selectedActivity.id));
  };

  const markActivityInProgress = async () => {
    if (!selectedActivity) return;
    await fetch("/api/activities/inprogress", {
      method: "POST",
      body: JSON.stringify({ id: selectedActivity.id }),
      headers: { "Content-Type": "application/json" }
    });
    await fetchActivities();
    const updated = await fetch(`/api/activities?event_id=${eventId}&t=${Date.now()}`).then(r => r.json());
    setSelectedActivity(updated.find((a: any) => a.id === selectedActivity.id));
  };

  const fetchGuestReport = async () => {
    const params = new URLSearchParams();
    params.set("event_id", eventId);
    if (reportFilterStatus) params.set("status", reportFilterStatus);
    if (reportFilterLevel) params.set("level", reportFilterLevel);
    params.set("sort", reportSort);
    params.set("order", reportOrder);
    const res = await fetch(`/api/report/guests?${params}`);
    const data = await res.json();
    setReportGuests(Array.isArray(data) ? data : []);
  };

  const fetchVendorReport = async () => {
    const params = new URLSearchParams();
    params.set("event_id", eventId);
    params.set("sort", vendorReportSort);
    params.set("order", vendorReportOrder);
    const res = await fetch(`/api/report/vendors?${params}`);
    const data = await res.json();
    setReportVendors(Array.isArray(data) ? data : []);
  };

  const fetchActivityReport = async () => {
    const params = new URLSearchParams();
    params.set("event_id", eventId);
    if (activityReportFilterStatus) params.set("status", activityReportFilterStatus);
    if (activityReportFilterProgress) params.set("progress", activityReportFilterProgress);
    if (activityReportFilterLevel) params.set("level", activityReportFilterLevel);
    if (activityReportSearch) params.set("search", activityReportSearch);
    params.set("sort", activityReportSort);
    params.set("order", activityReportOrder);
    const res = await fetch(`/api/report/activities?${params}`);
    const data = await res.json();
    setReportActivities(Array.isArray(data) ? data : []);
  };

  const resetCreateForm = () => {
    setCreateForm({ title: '', description: '', status: columns[0]?.status_id || '', assigned_owner_id: null, planned_effort_hours: null, planned_budget: null, currency: 'INR', location: null });
    setCreateActDate(""); setCreateActTime(""); setCreateActDuration("60");
    setCreatePlanDate(""); setCreatePlanTime(""); setCreatePlanDuration("60");
    setCreateSubItems([]); setCreateGuestItems([]); setCreateVendorItems([]);
    setCreateNewSubTitle(""); setCreateNewSubDesc(""); setCreateNewSubDate(""); setCreateNewSubTime(""); setCreateNewSubDur("60"); setCreateNewSubOwner(null);
    setCreateNewGuestName(""); setCreateNewGuestWA(""); setCreateNewGuestCount(1); setCreateNewGuestStatus("Attending");
    setCreateNewVendorName(""); setCreateNewVendorWA(""); setCreateNewVendorSvc("");
  };

  const handleCreateActivity = async () => {
    if (!createForm.title?.trim()) { alert("Activity title is required."); return; }
    let startDate = new Date().toISOString().slice(0, 16);
    let endDate = startDate;
    if (createActDate && createActTime && createActDuration) {
      startDate = `${createActDate}T${createActTime}:00`;
      endDate = computeEndStr(createActDate, createActTime, createActDuration);
    }
    let plannedStart: string | null = null;
    let plannedEnd: string | null = null;
    if (createPlanDate && createPlanTime && createPlanDuration) {
      plannedStart = `${createPlanDate}T${createPlanTime}:00`;
      plannedEnd = computeEndStr(createPlanDate, createPlanTime, createPlanDuration);
    }
    const body: any = {
      event_id: Number(eventId),
      parent_activity_id: null,
      title: createForm.title,
      description: createForm.description || null,
      status: createForm.status || columns[0]?.status_id || 'backlog',
      start_date: startDate,
      end_date: endDate,
      planned_start: plannedStart,
      planned_end: plannedEnd,
      assigned_owner_id: createForm.assigned_owner_id || null,
      planned_effort_hours: createForm.planned_effort_hours ?? null,
      planned_budget: createForm.planned_budget ?? null,
      currency: createForm.currency || 'INR',
      location: createForm.location || null,
    };
    const res = await fetch("/api/activities", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) { alert("Failed to create activity"); return; }
    const newAct = await res.json();
    const newId = newAct.id;

    for (const sub of createSubItems) {
      let subStart = startDate;
      let subEnd = endDate;
      if (sub.date && sub.time && sub.duration) {
        subStart = `${sub.date}T${sub.time}:00`;
        subEnd = computeEndStr(sub.date, sub.time, sub.duration);
      }
      await fetch("/api/activities", {
        method: "POST",
        body: JSON.stringify({ event_id: Number(eventId), parent_activity_id: newId, title: sub.title, description: sub.description || null, start_date: subStart, end_date: subEnd, assigned_owner_id: sub.owner || null }),
        headers: { "Content-Type": "application/json" },
      });
    }

    for (const g of createGuestItems) {
      await fetch("/api/guests", {
        method: "POST",
        body: JSON.stringify({ activity_id: newId, name: g.name, whatsapp: g.whatsapp, guest_count: g.count, status: g.status }),
        headers: { "Content-Type": "application/json" },
      });
    }

    for (const v of createVendorItems) {
      await fetch(`/api/activities/${newId}/vendors`, {
        method: "POST",
        body: JSON.stringify({ business_name: v.business_name, whatsapp: v.whatsapp || "N/A", services: v.services }),
        headers: { "Content-Type": "application/json" },
      });
    }

    await fetchActivities();
    setIsCreateDialogOpen(false);
    resetCreateForm();
  };

  const addCreateSubItem = () => {
    if (!createNewSubTitle.trim()) return;
    setCreateSubItems([...createSubItems, { title: createNewSubTitle, description: createNewSubDesc, date: createNewSubDate, time: createNewSubTime, duration: createNewSubDur, owner: createNewSubOwner }]);
    setCreateNewSubTitle(""); setCreateNewSubDesc(""); setCreateNewSubDate(""); setCreateNewSubTime(""); setCreateNewSubDur("60"); setCreateNewSubOwner(null);
  };

  const removeCreateSubItem = (idx: number) => setCreateSubItems(createSubItems.filter((_, i) => i !== idx));

  const addCreateGuest = () => {
    if (!createNewGuestName.trim()) return;
    setCreateGuestItems([...createGuestItems, { name: createNewGuestName, whatsapp: createNewGuestWA, count: createNewGuestCount, status: createNewGuestStatus }]);
    setCreateNewGuestName(""); setCreateNewGuestWA(""); setCreateNewGuestCount(1); setCreateNewGuestStatus("Attending");
  };

  const removeCreateGuest = (idx: number) => setCreateGuestItems(createGuestItems.filter((_, i) => i !== idx));

  const addCreateVendor = () => {
    if (!createNewVendorName.trim()) return;
    setCreateVendorItems([...createVendorItems, { business_name: createNewVendorName, whatsapp: createNewVendorWA, services: createNewVendorSvc }]);
    setCreateNewVendorName(""); setCreateNewVendorWA(""); setCreateNewVendorSvc("");
  };

  const removeCreateVendor = (idx: number) => setCreateVendorItems(createVendorItems.filter((_, i) => i !== idx));

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const topLevelActivities = activities.filter(a => !a.parent_activity_id);
  const subActivities = selectedActivity ? activities.filter(a => a.parent_activity_id === selectedActivity.id) : [];

  return (
    <div className="space-y-4">
      {/* Title + Add Activity Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[var(--brand-cream)] p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        {eventStats?.title && <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-slate-900 w-full sm:flex-1 sm:min-w-0 truncate page-title">{eventStats.title}</h1>}
        <Button onClick={() => { resetCreateForm(); createForm.status = columns[0]?.status_id || ''; setIsCreateDialogOpen(true); }} className="w-full sm:w-auto rounded-xl bg-[var(--brand-violet)] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-90 transition-all active:scale-[0.97] btn-text sm:ml-auto"><Plus size={16} /> Add Activity</Button>
      </div>

      <div className="flex gap-4">
        {/* Sidebar */}
        <aside className={`max-sm:!w-14 ${sidebarOpen ? 'w-52' : 'w-14'} shrink-0 transition-all duration-200 overflow-hidden relative`}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`max-sm:hidden absolute ${sidebarOpen ? '-right-3' : 'right-1/2 translate-x-1/2'} top-3 z-10 h-6 w-6 flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 shadow-sm transition-all`}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
            {sidebarOpen ? <Menu size={12} /> : <Menu size={12} />}
          </button>
          <div className={`max-sm:!w-14 ${sidebarOpen ? 'w-52' : 'w-14'} space-y-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-2 pt-8 transition-all duration-200`}>

            {/* View */}
            <div className="space-y-1">
              {sidebarOpen && <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-2">View</p>}
              {(['kanban','timeline','calendar'] as const).map(v => (
                <button key={v} onClick={() => setActiveView(v)}
                  className={`w-full flex items-center ${sidebarOpen ? 'gap-2 px-3' : 'justify-center px-0'} py-2 text-xs font-semibold rounded-lg sidebar-item transition-all ${activeView === v ? 'bg-[var(--brand-violet)] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'}`}>
                  {v === 'kanban' ? <Kanban size={14} /> : v === 'timeline' ? <List size={14} /> : <CalendarDays size={14} />}
                  {sidebarOpen && (v === 'kanban' ? 'Kanban' : v === 'timeline' ? 'Timeline' : 'Calendar')}
                </button>
              ))}
              <button onClick={() => setIsColumnManagerOpen(true)}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-2 px-3' : 'justify-center px-0'} py-2 text-xs font-semibold rounded-lg sidebar-item transition-all text-slate-700 hover:bg-slate-100`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>
                {sidebarOpen && 'Manage Columns'}
              </button>
            </div>

            {sidebarOpen && <div className="border-t border-slate-200" />}

            {/* Reports */}
            <div className="space-y-1">
              {sidebarOpen && <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-2">Reports</p>}
              <button onClick={() => { setIsGuestReportOpen(true); fetchGuestReport(); }}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-2 px-3' : 'justify-center px-0'} py-2 text-xs font-semibold rounded-lg sidebar-item transition-all text-slate-700 hover:bg-slate-100`}>
                <Users size={14} />
                {sidebarOpen && 'Guest Report'}
              </button>
              <button onClick={() => { setIsVendorReportOpen(true); fetchVendorReport(); }}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-2 px-3' : 'justify-center px-0'} py-2 text-xs font-semibold rounded-lg sidebar-item transition-all text-slate-700 hover:bg-slate-100`}>
                <Briefcase size={14} />
                {sidebarOpen && 'Vendor Report'}
              </button>
              <button onClick={() => { setIsActivityReportOpen(true); fetchActivityReport(); }}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-2 px-3' : 'justify-center px-0'} py-2 text-xs font-semibold rounded-lg sidebar-item transition-all text-slate-700 hover:bg-slate-100`}>
                <List size={14} />
                {sidebarOpen && 'Activity Details'}
              </button>
            </div>

            {sidebarOpen && <div className="border-t border-slate-200" />}

            {/* Navigation */}
            <div className="space-y-1">
              {sidebarOpen && <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-2">Navigation</p>}
              <a href="/dashboard"
                className={`w-full flex items-center ${sidebarOpen ? 'gap-2 px-3' : 'justify-center px-0'} py-2 text-xs font-semibold rounded-lg sidebar-item transition-all text-slate-700 hover:bg-slate-100`}>
                <Kanban size={14} />
                {sidebarOpen && 'Dashboard'}
              </a>
              <a href="/admin"
                className={`w-full flex items-center ${sidebarOpen ? 'gap-2 px-3' : 'justify-center px-0'} py-2 text-xs font-semibold rounded-lg sidebar-item transition-all text-slate-700 hover:bg-slate-100`}>
                <Users size={14} />
                {sidebarOpen && 'Admin'}
              </a>
            </div>

          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">

      {/* Stats Box */}
      {eventStats && (
        !isStatsOpen ? (
          <button onClick={() => setIsStatsOpen(true)} className="w-full flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all text-xs font-semibold uppercase tracking-widest text-slate-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Summary Status
            <span className="ml-auto text-xs text-slate-500 font-normal normal-case">{eventStats.parent_activity_count || 0}p / {eventStats.sub_activity_count || 0}s · {eventStats.total_guest_count || 0} guests · {eventStats.vendor_count || 0} vendors</span>
            <ChevronDown size={14} className="text-slate-500" />
          </button>
        ) : (
        <div className="space-y-2">
          <button onClick={() => setIsStatsOpen(false)} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-600 hover:text-slate-800 transition-all px-1">
            <ChevronUp size={14} /> Summary Status
          </button>
          <div className="flex gap-3 flex-wrap">
          {/* Activities Frame */}
          <div className="flex-1 min-w-[150px] sm:min-w-[200px] border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-2 flex items-center gap-1.5">
              <Calendar size={11} /> Activities
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Parent</span>
                <span className="font-semibold stat-value" style={{ color: 'var(--brand-violet)' }}>{eventStats.parent_activity_count || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Sub</span>
                <span className="font-semibold stat-value" style={{ color: 'var(--brand-violet)' }}>{eventStats.sub_activity_count || 0}</span>
              </div>
              {eventStats.activity_status_breakdown && (() => {
                try {
                  const statuses = JSON.parse(eventStats.activity_status_breakdown);
                  return statuses.length > 0 && (
                    <div className="border-t border-slate-100 pt-1.5 mt-1.5 space-y-1.5">
                      {statuses.map((s: any, i: number) => (
                        <div key={i}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                            <span className="text-xs font-semibold text-slate-700">{s.label}</span>
                          </div>
                          <div className="flex gap-2 text-xs pl-[10px]">
                            <span className={s.open > 0 ? "text-slate-600 font-medium" : "text-slate-300"}>{s.open} Open</span>
                            <span className="text-slate-300">·</span>
                            <span className={s.in_progress > 0 ? "text-amber-600 font-medium" : "text-slate-300"}>{s.in_progress} In-Progress</span>
                            <span className="text-slate-300">·</span>
                            <span className={s.done > 0 ? "text-green-600 font-medium" : "text-slate-300"}>{s.done} Done</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                } catch { return null; }
              })()}
            </div>
          </div>

          {/* Guests Frame */}
          <div className="flex-1 min-w-[150px] sm:min-w-[200px] border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-2 flex items-center gap-1.5">
              <Users size={11} /> Guests
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">Total</span>
                <span className="font-semibold text-slate-800 stat-value">{eventStats.total_guest_count || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-600">✓ Attending</span>
                <span className="font-semibold text-green-600 stat-value">{eventStats.attending_total || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-red-600">✗ Declined</span>
                <span className="font-semibold text-red-600 stat-value">{eventStats.no_total || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-yellow-600">~ Maybe</span>
                <span className="font-semibold text-yellow-600 stat-value">{eventStats.maybe_total || 0}</span>
              </div>
            </div>
          </div>

          {/* Vendors Frame */}
          <div className="flex-1 min-w-[150px] sm:min-w-[200px] border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-2 flex items-center gap-1.5">
              <Briefcase size={11} /> Vendors
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Total</span>
              <span className="font-semibold stat-value" style={{ color: 'var(--brand-rose)' }}>{eventStats.vendor_count || 0}</span>
                      </div>
                      </div>
          {/* Payment Frame */}
          <div className="flex-1 min-w-[150px] sm:min-w-[200px] border border-slate-200 rounded-xl p-3 bg-white shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-2 flex items-center gap-1.5">
              <DollarSign size={11} /> Payment
            </div>
            <div className="space-y-1">
              {(eventStats.payment_bank_name || eventStats.payment_account_number) ? (
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Bank</span>
                    <span className="font-semibold text-slate-800">{eventStats.payment_bank_name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Account</span>
                    <span className="font-semibold text-slate-800 font-mono text-[10px]">{'••••' + eventStats.payment_account_number.slice(-4)}</span>
                  </div>
                  {eventStats.payment_qr_code ? (
                    <div className="pt-1">
                      <img src={eventStats.payment_qr_code} alt="QR" className="w-full max-w-[80px] h-auto border border-slate-200 rounded-lg mx-auto" />
                    </div>
                  ) : null}
                </div>
              ) : adminPaymentInfo?.bank_name || adminPaymentInfo?.account_number ? (
                <div>
                  <p className="text-xs text-slate-500 italic mb-1">Using business default</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Bank</span>
                    <span className="font-semibold text-slate-800">{adminPaymentInfo.bank_name || 'Default'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Account</span>
                    <span className="font-semibold text-slate-800 font-mono text-[10px]">{adminPaymentInfo.account_number ? '••••' + adminPaymentInfo.account_number.slice(-4) : 'Default'}</span>
                  </div>
                  {adminPaymentInfo.qr_code ? (
                    <div className="pt-1">
                      <img src={adminPaymentInfo.qr_code} alt="QR" className="w-full max-w-[80px] h-auto border border-slate-200 rounded-lg mx-auto" />
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No payment info set</p>
              )}
            </div>
          </div>
                    </div>
                  </div>  
        )
      )}

      {/* Timeline View */}
      {activeView === 'timeline' && <EnhancedTimeline activities={activities} columns={columns} onActivityClick={(a) => setSelectedActivity(a)} businessCountry={businessCountry} />}

      {/* Calendar View */}
      {activeView === 'calendar' && <CalendarView activities={activities} onActivityClick={(a) => setSelectedActivity(a)} businessCountry={businessCountry} />}

      {/* Kanban Board */}
      {activeView === 'kanban' && (
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {columns.map(col => (
            <Column key={col.status_id} id={col.status_id} label={col.label} color={col.color}>
              <SortableContext items={activities.filter(a => a.status === col.status_id).map(a => a.id)} strategy={verticalListSortingStrategy}>
                  {topLevelActivities.filter(a => a.status === col.status_id).map(activity => (
                    <ActivityCard key={activity.id} activity={activity} columns={columns} onClick={() => setSelectedActivity(activity)} onStatusChange={handleCardStatusChange} businessCountry={businessCountry} />
                ))}
              </SortableContext>
            </Column>
          ))}
        </div>
      </DndContext>
      )}

        </div>
      </div>

      {/* Create Activity Sheet */}
      <Sheet open={isCreateDialogOpen} onOpenChange={(open) => { if (!open) { setIsCreateDialogOpen(false); resetCreateForm(); } }}>
        <SheetContent side="left" className="flex flex-col w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <SheetHeader className="border-b border-slate-200 pb-4 shrink-0 px-4">
            <SheetTitle className="text-lg font-bold" style={{ color: 'var(--brand-violet)' }}>Create Activity</SheetTitle>
          </SheetHeader>
          <div className="flex-1 flex min-h-0">
            {/* Left Sidebar */}
            <div className="w-10 flex flex-col border-r border-slate-200 bg-slate-50 pt-2">
              {[
                { id: 'details', icon: Save, label: '' },
                { id: 'sub-activities', icon: List, label: '' },
                { id: 'dates-location', icon: Calendar, label: '' },
                { id: 'guests', icon: Users, label: '' },
                { id: 'vendors', icon: Briefcase, label: '' },
              ].map(item => (
                <button key={item.id} onClick={() => setActiveActivitySection(item.id)}
                  className={`flex items-center justify-center h-10 w-10 rounded-lg text-sm font-semibold transition-all ${
                    activeActivitySection === item.id
                      ? 'bg-[var(--brand-violet)] text-white shadow-sm'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}>
                  <item.icon size={16} />
                </button>
              ))}
            </div>
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Title & Description — always visible */}
              <Input value={createForm.title || ''} onChange={e => setCreateForm({...createForm, title: e.target.value})} placeholder="Activity title" className="text-xl font-bold border-slate-300 bg-white rounded-xl" />
              <div>
                <Textarea value={createForm.description || ''} onChange={e => setCreateForm({...createForm, description: e.target.value})} placeholder="Describe the activity in detail..." className="min-h-[80px] border-slate-300 bg-white rounded-xl" />
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Describe the Activity in detail — objectives, scope, key stakeholders, important deadlines, and any constraints or dependencies.
                </p>
              </div>

              {/* Section: Details */}
              {activeActivitySection === 'details' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label">Kanban Column</label>
                      <Select value={createForm.status || ''} onValueChange={v => { if (!v) return; setCreateForm({...createForm, status: v}); }}>
                        <SelectTrigger className="bg-white border-slate-200 rounded-xl"><SelectValue placeholder="Select column" /></SelectTrigger>
                        <SelectContent side="bottom" sideOffset={8}>
                          {columns.map(c => (
                            <SelectItem key={c.status_id} value={c.status_id}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label">Assigned Owner</label>
                      <Select value={String(createForm.assigned_owner_id || '')} onValueChange={v => setCreateForm({...createForm, assigned_owner_id: v ? Number(v) : null})}>
                        <SelectTrigger className="bg-white border-slate-200 rounded-xl"><SelectValue placeholder="Unassigned">{createForm.assigned_owner_id ? teamMembers.find(m => m.id === createForm.assigned_owner_id)?.name || "Unassigned" : "Unassigned"}</SelectValue></SelectTrigger>
                        <SelectContent side="bottom" sideOffset={8}>
                          <SelectItem value="">Unassigned</SelectItem>
                          {teamMembers.map(m => (
                            <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 form-label">Planned Effort (hours)</label>
                      <input type="number" min="0" step="0.5" value={createForm.planned_effort_hours ?? ''} onChange={e => setCreateForm({...createForm, planned_effort_hours: e.target.value ? Number(e.target.value) : null})}
                        placeholder="e.g. 8" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 form-label">Planned Budget</label>
                      <div className="flex gap-1">
                        <input type="number" min="0" step="0.01" value={createForm.planned_budget ?? ''} onChange={e => setCreateForm({...createForm, planned_budget: e.target.value ? Number(e.target.value) : null})}
                          placeholder="0.00" className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                        <select value={createForm.currency || 'INR'} onChange={e => setCreateForm({...createForm, currency: e.target.value})}
                          className="w-20 rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm">
                          <option value="INR">₹</option>
                          <option value="USD">$</option>
                          <option value="EUR">€</option>
                          <option value="GBP">£</option>
                          <option value="AED">د.إ</option>
                          <option value="SAR">﷼</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Sub-Activities */}
              {activeActivitySection === 'sub-activities' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="text-center py-6 text-sm text-slate-600 italic">Add sub-activities below. They will be created after the main activity is saved.</div>
                  <ul className="space-y-2">
                    {createSubItems.map((sub, idx) => (
                      <li key={idx} className="text-sm p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className="font-medium truncate">{sub.title}</span>
                          {sub.description && <p className="text-xs text-slate-500 truncate">{sub.description}</p>}
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 hover:bg-red-50" style={{ color: 'var(--brand-error)' }} onClick={() => removeCreateSubItem(idx)}><Trash2 size={13} /></Button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Input value={createNewSubTitle} onChange={e => setCreateNewSubTitle(e.target.value)} placeholder="Sub-activity title..." className="bg-white border-slate-200 rounded-xl flex-1 min-w-[140px] text-sm" />
                    <Button onClick={addCreateSubItem} className="rounded-xl bg-[var(--brand-secondary)] text-white px-4 py-2 text-sm font-semibold">Add Sub</Button>
                  </div>
                </div>
              )}

              {/* Section: Dates & Location */}
              {activeActivitySection === 'dates-location' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label">Activity Date</label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[130px]"><label className="text-xs text-slate-600 block mb-0.5">Date</label><Input value={createActDate} onChange={e => setCreateActDate(e.target.value)} type="date" className="border-slate-200 bg-white rounded-xl w-full" /></div>
                      <div className="flex-1 min-w-[100px]"><label className="text-xs text-slate-600 block mb-0.5">Start Time</label><TimePicker value={createActTime} onChange={setCreateActTime} className="w-full" /></div>
                      <div className="flex-1 min-w-[100px]"><label className="text-xs text-slate-600 block mb-0.5">Duration</label>
                        <select value={createActDuration} onChange={e => setCreateActDuration(e.target.value)} className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm border shadow-sm">
                          {DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 form-label">Planned Start</label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-1 min-w-[130px]"><label className="text-xs text-slate-600 block mb-0.5">Date</label><Input value={createPlanDate} onChange={e => setCreatePlanDate(e.target.value)} type="date" className="border-slate-200 bg-white rounded-xl w-full" /></div>
                      <div className="flex-1 min-w-[100px]"><label className="text-xs text-slate-600 block mb-0.5">Start Time</label><TimePicker value={createPlanTime} onChange={setCreatePlanTime} className="w-full" /></div>
                      <div className="flex-1 min-w-[100px]"><label className="text-xs text-slate-600 block mb-0.5">Duration</label>
                        <select value={createPlanDuration} onChange={e => setCreatePlanDuration(e.target.value)} className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm border shadow-sm">
                          {DURATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 max-w-xs">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 form-label">Location</label>
                    <Select value={createForm.location || ''} onValueChange={v => setCreateForm({...createForm, location: v || null})}>
                      <SelectTrigger className="bg-white border-slate-200 rounded-xl"><SelectValue placeholder="Select location" /></SelectTrigger>
                      <SelectContent side="bottom" sideOffset={8}>
                        <SelectItem value="">None</SelectItem>
                        {eventLocations.map(loc => (<SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Section: Guests */}
              {activeActivitySection === 'guests' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex gap-2 flex-wrap">
                    <Input value={createNewGuestName} onChange={e => setCreateNewGuestName(e.target.value)} placeholder="Guest Name" className="bg-white border-slate-200 rounded-xl flex-1 min-w-[140px]" />
                    <Input value={createNewGuestWA} onChange={e => setCreateNewGuestWA(e.target.value)} placeholder="WhatsApp" className="bg-white border-slate-200 rounded-xl flex-1 min-w-[140px]" />
                    <Button onClick={addCreateGuest} className="rounded-xl bg-[var(--brand-secondary)] text-white px-4 py-2 text-sm font-semibold">Add</Button>
                  </div>
                  <ul className="space-y-2">
                    {createGuestItems.map((g, idx) => (
                      <li key={idx} className="text-sm p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium truncate">{g.name}</span>
                          {g.whatsapp && <span className="text-slate-600 text-xs truncate">{g.whatsapp}</span>}
                          <span className="text-xs text-slate-500 shrink-0">×{g.count}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 hover:bg-red-50" style={{ color: 'var(--brand-error)' }} onClick={() => removeCreateGuest(idx)}><Trash2 size={13} /></Button>
                      </li>
                    ))}
                  </ul>
                  {createGuestItems.length === 0 && <p className="text-xs text-slate-600 text-center py-3 italic">No guests added yet.</p>}
                </div>
              )}

              {/* Section: Vendors */}
              {activeActivitySection === 'vendors' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex gap-2 flex-wrap">
                    <Input value={createNewVendorName} onChange={e => setCreateNewVendorName(e.target.value)} placeholder="Vendor Name" className="bg-white border-slate-200 rounded-xl flex-1 min-w-[140px]" />
                    <Input value={createNewVendorWA} onChange={e => setCreateNewVendorWA(e.target.value)} placeholder="WhatsApp" className="bg-white border-slate-200 rounded-xl flex-1 min-w-[140px]" />
                    <Input value={createNewVendorSvc} onChange={e => setCreateNewVendorSvc(e.target.value)} placeholder="Services" className="bg-white border-slate-200 rounded-xl flex-1 min-w-[140px]" />
                    <Button onClick={addCreateVendor} className="rounded-xl bg-[var(--brand-secondary)] text-white px-4 py-2 text-sm font-semibold">Assign</Button>
                  </div>
                  <ul className="space-y-2">
                    {createVendorItems.map((v, idx) => (
                      <li key={idx} className="text-sm p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-sm">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="font-medium truncate">{v.business_name}</span>
                          {v.whatsapp && v.whatsapp !== "N/A" && <span className="text-slate-600 text-xs truncate">{v.whatsapp}</span>}
                          <span className="text-slate-700 text-xs truncate">{v.services}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 hover:bg-red-50" style={{ color: 'var(--brand-error)' }} onClick={() => removeCreateVendor(idx)}><Trash2 size={13} /></Button>
                      </li>
                    ))}
                  </ul>
                  {createVendorItems.length === 0 && <p className="text-xs text-slate-600 text-center py-3 italic">No vendors assigned yet.</p>}
                </div>
              )}

              {/* Create & Cancel */}
              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <Button onClick={handleCreateActivity} className="flex-1 rounded-xl bg-[var(--brand-violet)] py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-90 transition-all active:scale-[0.97] gap-2"><Plus size={16} /> Create Activity</Button>
                <Button onClick={() => { setIsCreateDialogOpen(false); resetCreateForm(); }} className="rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all">Cancel</Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={!!selectedActivity} onOpenChange={(open) => { if (!open) setSelectedActivity(null); }}>
        <SheetContent side="left" className="flex flex-col">
            <SheetHeader className="border-b border-slate-200 pb-4 shrink-0 px-4">
                <SheetTitle className="text-lg font-bold" style={{ color: 'var(--brand-violet)' }}>Activity Details</SheetTitle>
            </SheetHeader>
            <div className="flex-1 flex min-h-0">
              {/* Left Sidebar */}
              <div className={`${activitySidebarCollapsed ? 'w-14' : 'w-44'} shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col transition-all duration-200`}>
                <button onClick={() => setActivitySidebarCollapsed(!activitySidebarCollapsed)}
                  className="h-10 border-b border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 shrink-0">
                  {activitySidebarCollapsed ? <Menu size={16} /> : <Menu size={16} />}
                </button>
                <div className="flex flex-col p-1.5 gap-0.5 flex-1">
                  {[
                    { id: 'details', icon: Save, label: 'Details' },
                    { id: 'sub-activities', icon: List, label: 'Sub-Activities' },
                    { id: 'dates-location', icon: Calendar, label: 'Dates & Location' },
                    { id: 'guests', icon: Users, label: 'Guests' },
                    { id: 'vendors', icon: Briefcase, label: 'Vendors' },
                    { id: 'completion', icon: CheckCircle, label: 'Completion' },
                  ].map(item => (
                    <button key={item.id} onClick={() => setActiveActivitySection(item.id)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeActivitySection === item.id
                          ? 'bg-[var(--brand-violet)] text-white shadow-sm'
                          : 'text-slate-800 hover:bg-slate-100'
                      }`}>
                      <item.icon size={16} className="shrink-0" />
                      {!activitySidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  ))}
                </div>
              </div>
              {/* Main Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Title & Description — always visible */}
                <Input value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Activity title" className="text-xl font-bold border-slate-300 bg-white rounded-xl" />
                <div>
                  <Textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="Describe the activity in detail..." className="min-h-[80px] border-slate-300 bg-white rounded-xl" />
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Describe the Activity in detail — objectives, scope, key stakeholders, important deadlines, and any constraints or dependencies. This description will be used by AI agents to fully understand the scope and assist in planning.
                  </p>
                </div>

                {/* Section: Details */}
                {activeActivitySection === 'details' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label">Assigned Owner</label>
                        <Select value={String(editForm.assigned_owner_id || '')} onValueChange={v => setEditForm({...editForm, assigned_owner_id: v ? Number(v) : null})}>
                          <SelectTrigger className="bg-white border-slate-200 rounded-xl"><SelectValue placeholder="Unassigned">{editForm.assigned_owner_id ? teamMembers.find(m => m.id === editForm.assigned_owner_id)?.name || "Unassigned" : "Unassigned"}</SelectValue></SelectTrigger>
                          <SelectContent side="bottom" sideOffset={8}>
                            <SelectItem value="">Unassigned</SelectItem>
                            {teamMembers.map(m => (
                              <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 form-label">Planned Effort (hours)</label>
                        <input type="number" min="0" step="0.5" value={editForm.planned_effort_hours ?? ''} onChange={e => setEditForm({...editForm, planned_effort_hours: e.target.value ? Number(e.target.value) : null})}
                          placeholder="e.g. 8" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 form-label">Planned Budget</label>
                        <div className="flex gap-1">
                          <input type="number" min="0" step="0.01" value={editForm.planned_budget ?? ''} onChange={e => setEditForm({...editForm, planned_budget: e.target.value ? Number(e.target.value) : null})}
                            placeholder="0.00" className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                          <select value={editForm.currency || 'INR'} onChange={e => setEditForm({...editForm, currency: e.target.value})}
                            className="w-20 rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm">
                            <option value="INR">₹</option>
                            <option value="USD">$</option>
                            <option value="EUR">€</option>
                            <option value="GBP">£</option>
                            <option value="AED">د.إ</option>
                            <option value="SAR">﷼</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section: Sub-Activities */}
                {activeActivitySection === 'sub-activities' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <ul className="space-y-2">
                      {subActivities.map(sub => (
                        <li key={sub.id} className="text-sm p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
                          <div className="flex items-start gap-2 flex-1">
                            <Checkbox
                              checked={sub.completed === 1}
                              onCheckedChange={(c: boolean) => updateSubActivity(sub, c)}
                              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 mt-0.5 border-2 border-slate-400 bg-white"
                            />
                            <div>
                              <span className={sub.completed === 1 ? 'line-through text-slate-600' : ''}>{sub.title}</span>
                              {sub.description && <p className="text-xs text-slate-500 mt-0.5">{sub.description}</p>}
                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                                <span><Calendar size={11} className="inline mr-0.5" />{formatDate(sub.start_date, businessCountry)}</span>
                                {sub.start_date?.includes('T') && <span className="font-mono">{sub.start_date.split('T')[1]?.slice(0, 5)}</span>}
                              </div>
                              {sub.assigned_owner_id && (
                                <span className="text-xs text-[var(--brand-violet)] mt-0.5 block">
                                  Owner: {teamMembers.find((m: any) => m.id === sub.assigned_owner_id)?.name || 'Unknown'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className={`text-xs font-semibold ${sub.completed === 1 ? 'text-green-600' : 'text-slate-500'}`}>
                              {sub.completed === 1 ? 'Done' : 'Pending'}
                            </span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" style={{ color: 'var(--brand-error)' }} onClick={() => handleDeleteActivity(sub.id)}><Trash2 size={16}/></Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 mt-4 pt-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={newSubTitle}
                          onChange={(e) => setNewSubTitle(e.target.value)}
                          placeholder="Sub-activity title..."
                          className="bg-white border-slate-200 rounded-xl flex-1 text-sm"
                        />
                        <Input
                          value={newSubDescription}
                          onChange={(e) => setNewSubDescription(e.target.value)}
                          placeholder="Describe this sub-activity in detail — purpose, deliverables, and any relevant context..."
                          className="bg-white border-slate-200 rounded-xl flex-1 text-sm"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <Input
                          type="date"
                          value={newSubDate}
                          onChange={(e) => setNewSubDate(e.target.value)}
                          className="sm:max-w-36 w-full sm:w-auto border-slate-200 bg-white rounded-xl"
                        />
                        <TimePicker
                          value={newSubTime}
                          onChange={setNewSubTime}
                          className="sm:max-w-32 w-full sm:w-auto"
                        />
                        <select
                          value={newSubDuration}
                          onChange={(e) => setNewSubDuration(e.target.value)}
                          className="sm:max-w-32 w-full sm:w-auto rounded-xl border-slate-200 bg-white px-3 py-2 text-sm border shadow-sm"
                        >
                          {DURATION_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <Button onClick={addSubActivity} className="rounded-xl bg-[var(--brand-secondary)] text-white px-5 py-2 text-sm font-semibold hover:brightness-90 transition-all">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center pt-1">
                        <Select value={String(newSubOwnerId || '')} onValueChange={v => setNewSubOwnerId(v ? Number(v) : null)}>
                          <SelectTrigger className="bg-white border-slate-200 rounded-xl text-sm min-w-[180px]"><SelectValue placeholder="Assign owner...">{newSubOwnerId ? eventTeamMembers.find(m => m.id === newSubOwnerId)?.name || "Assign owner..." : "Assign owner..."}</SelectValue></SelectTrigger>
                          <SelectContent side="bottom" sideOffset={8}>
                            <SelectItem value="">Unassigned</SelectItem>
                            {eventTeamMembers.map(m => (
                              <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      </div>
                    </div>
                  )}

                {/* Section: Dates & Location */}
                {activeActivitySection === 'dates-location' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label">Activity Date</label>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs text-slate-600">Date</label>
                          <Input value={activityDate} onChange={e => setActivityDate(e.target.value)} type="date" className="border-slate-200 bg-white rounded-xl w-full" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">Start Time</label>
                          <TimePicker value={activityStartTime} onChange={setActivityStartTime} className="w-full" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">Duration</label>
                          <select
                            value={activityDuration}
                            onChange={e => setActivityDuration(e.target.value)}
                            className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm border shadow-sm"
                          >
                            {DURATION_OPTIONS.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 form-label">Planned Start</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-slate-600">Date</label>
                          <Input value={plannedDate} onChange={e => setPlannedDate(e.target.value)} type="date" className="border-slate-200 bg-white rounded-xl w-full" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">Start Time</label>
                          <TimePicker value={plannedStartTime} onChange={setPlannedStartTime} className="w-full" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">Duration</label>
                          <select
                            value={plannedDuration}
                            onChange={e => setPlannedDuration(e.target.value)}
                            className="w-full rounded-xl border-slate-200 bg-white px-3 py-2 text-sm border shadow-sm"
                          >
                            {DURATION_OPTIONS.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-700 form-label">Activity End</label>
                      <Input value={editForm.actual_end || ''} onChange={e => setEditForm({...editForm, actual_end: e.target.value})} type="datetime-local" className="border-slate-200 bg-white rounded-xl w-full" />
                    </div>
                    <div className="space-y-2 max-w-xs">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-600 form-label">Location</label>
                      <Select value={editForm.location || ''} onValueChange={v => setEditForm({...editForm, location: v || null})}>
                        <SelectTrigger className="bg-white border-slate-200 rounded-xl"><SelectValue placeholder="Select location" /></SelectTrigger>
                        <SelectContent side="bottom" sideOffset={8}>
                          <SelectItem value="">None</SelectItem>
                          {eventLocations.map(loc => (
                            <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Section: Guests */}
                {activeActivitySection === 'guests' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex gap-2 flex-wrap">
                      <Input value={newGuestName} onChange={e => setNewGuestName(e.target.value)} placeholder="Guest Name" className="bg-white border-slate-200 rounded-xl" />
                      <Input value={newGuestWhatsApp} onChange={e => setNewGuestWhatsApp(e.target.value)} placeholder="WhatsApp" className="bg-white border-slate-200 rounded-xl" />
                      <Button onClick={addGuest} className="rounded-xl bg-[var(--brand-secondary)] text-white px-4 py-2 text-sm font-semibold hover:brightness-90 transition-all">Add</Button>
                      <label className="cursor-pointer rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1.5">
                        <Upload size={14} /> CSV
                        <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                      </label>
                      <button onClick={downloadSampleCSV} className="rounded-xl bg-white border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5" type="button">
                        <Download size={14} /> Sample CSV
                      </button>
                    </div>
                    {editingGuestId !== null && (
                      <div className="border border-[var(--brand-violet)] rounded-xl p-3 bg-[var(--brand-violet-container)] space-y-2">
                        <p className="text-xs font-semibold" style={{ color: 'var(--brand-violet)' }}>Editing Guest</p>
                        <div className="flex gap-2 flex-wrap">
                          <Input value={editGuestName} onChange={e => setEditGuestName(e.target.value)} className="bg-white border-slate-200 rounded-xl flex-1 min-w-[120px]" />
                          <Input value={editGuestWhatsApp} onChange={e => setEditGuestWhatsApp(e.target.value)} placeholder="WhatsApp" className="bg-white border-slate-200 rounded-xl flex-1 min-w-[120px]" />
                          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2">
                            <span className="text-xs text-slate-600">×</span>
                            <input type="number" min={1} value={editGuestCount} onChange={e => setEditGuestCount(parseInt(e.target.value) || 1)} className="w-12 border-none bg-transparent text-sm text-center focus:outline-none" />
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap items-center">
                          <Select value={editGuestStatus} onValueChange={(v: string | null) => v && setEditGuestStatus(v)}>
                            <SelectTrigger className="bg-white border-slate-200 rounded-xl w-[140px]"><SelectValue /></SelectTrigger>
                            <SelectContent side="bottom" sideOffset={8}>
                              <SelectItem value="Attending">🟢 Attending</SelectItem>
                              <SelectItem value="No">🔴 No</SelectItem>
                              <SelectItem value="Maybe">🟡 Maybe</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button onClick={updateGuest} size="sm" className="rounded-xl bg-[var(--brand-violet)] text-white px-3 text-xs font-semibold">Save</Button>
                          <Button onClick={() => setEditingGuestId(null)} size="sm" variant="ghost" className="rounded-xl text-slate-600 px-2 text-xs">Cancel</Button>
                        </div>
                      </div>
                    )}
                    <ul className="space-y-2">
                      {guests.map(g => (
                        <li key={g.id} className="text-sm p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-sm">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className={`w-2 h-2 shrink-0 rounded-full ${g.status === 'Attending' ? 'bg-green-500' : g.status === 'No' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                            <span className="font-medium truncate">{g.name}</span>
                            {g.whatsapp && <span className="text-slate-600 text-xs truncate">{g.whatsapp}</span>}
                            <span className="text-xs text-slate-500 shrink-0">×{g.guest_count || 1}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${g.status === 'Attending' ? 'bg-green-50 text-green-700' : g.status === 'No' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                              {g.status}
                            </span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-[var(--brand-violet)]" onClick={() => startEditGuest(g)}><Pencil size={13} /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50" style={{ color: 'var(--brand-error)' }} onClick={() => deleteGuest(g.id)}><Trash2 size={13} /></Button>
                          </div>
                        </li>
                      ))}
                      {guests.length === 0 && <p className="text-sm text-slate-600 text-center py-4">No guests yet. Add manually or upload a CSV.</p>}
                    </ul>
                    <p className="text-xs text-slate-600">CSV format: <code className="bg-slate-100 px-1 rounded">Name, WhatsApp, Count, Status</code> — Status can be Attending, No, or Maybe</p>
                  </div>
                )}

                {/* Section: Vendors */}
                {activeActivitySection === 'vendors' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex gap-2">
                      <Input value={newVendorName} onChange={e => setNewVendorName(e.target.value)} placeholder="Vendor Name" className="bg-white border-slate-200 rounded-xl" />
                      <Input value={newVendorWhatsApp} onChange={e => setNewVendorWhatsApp(e.target.value)} placeholder="WhatsApp" className="bg-white border-slate-200 rounded-xl" />
                      <Input value={newVendorService} onChange={e => setNewVendorService(e.target.value)} placeholder="Services" className="bg-white border-slate-200 rounded-xl" />
                      <Button onClick={assignVendor} className="rounded-xl bg-[var(--brand-secondary)] text-white px-4 py-2 text-sm font-semibold hover:brightness-90 transition-all">Assign</Button>
                    </div>
                    <ul className="space-y-2">
                      {vendors.map(v => (
                        editingVendorId === v.id ? (
                          <li key={v.id} className="text-sm p-3 bg-[var(--brand-cream)] border border-slate-200 rounded-xl shadow-sm space-y-2">
                            <Input value={editVendorName} onChange={e => setEditVendorName(e.target.value)} placeholder="Vendor Name" className="bg-white border-slate-200 rounded-xl" />
                            <Input value={editVendorWhatsApp} onChange={e => setEditVendorWhatsApp(e.target.value)} placeholder="WhatsApp" className="bg-white border-slate-200 rounded-xl" />
                            <Input value={editVendorService} onChange={e => setEditVendorService(e.target.value)} placeholder="Services" className="bg-white border-slate-200 rounded-xl" />
                            <div className="flex gap-2">
                              <Button onClick={saveEditVendor} className="rounded-xl bg-[var(--brand-violet)] text-white px-3 py-1.5 text-xs font-semibold hover:brightness-90 transition-all">Save</Button>
                              <Button onClick={cancelEditVendor} variant="ghost" className="rounded-xl px-3 py-1.5 text-xs font-semibold">Cancel</Button>
                            </div>
                          </li>
                        ) : (
                          <li key={v.id} className="text-sm p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-sm">
                            <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                              <span className="font-medium">{v.business_name}</span>
                              {v.whatsapp && v.whatsapp !== "N/A" ? <span className="text-slate-600 text-xs">{v.whatsapp}</span> : null}
                              <span className="text-slate-700 text-xs">{v.services}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-[var(--brand-violet)]" onClick={() => startEditVendor(v)}><Pencil size={13} /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50" style={{ color: 'var(--brand-error)' }} onClick={() => deleteVendor(v.id)}><Trash2 size={13} /></Button>
                            </div>
                          </li>
                        )
                      ))}
                      {vendors.length === 0 && <p className="text-sm text-slate-600 text-center py-4">No vendors assigned yet.</p>}
                    </ul>
                  </div>
                )}

                {/* Section: Activity Completion */}
                {activeActivitySection === 'completion' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="flex gap-2">
                      {selectedActivity?.completed === 1 ? (
                        <>
                          <div className="flex-1 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-semibold text-green-700">
                            <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</span>
                            Completed
                          </div>
                          <Button onClick={markActivityInProgress} className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-600 transition-all gap-2">
                            Reopen
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button onClick={markActivityInProgress} className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-600 transition-all active:scale-[0.97] gap-2">
                            Mark In Progress
                          </Button>
                          <Button onClick={markActivityComplete} className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-bold text-white shadow-md hover:bg-green-700 transition-all active:scale-[0.97] gap-2">
                            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
                            Mark Complete
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Completion Info */}
                    {(selectedActivity?.completed === 1 || selectedActivity?.completed_at) && (
                      <div className="rounded-xl border border-green-200 bg-green-50 p-3 space-y-1.5">
                        <p className="text-xs font-bold uppercase tracking-widest text-green-700">Completion Info</p>
                        {selectedActivity?.completed_at && (
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600">Completed At</span>
                            <span className="font-medium text-green-800">{new Date(selectedActivity.completed_at).toLocaleString()}</span>
                          </div>
                        )}
                        {selectedActivity?.actual_effort_hours != null && (
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600">Actual Effort</span>
                            <span className="font-medium text-green-800">{selectedActivity.actual_effort_hours}h</span>
                          </div>
                        )}
                        {selectedActivity?.actual_budget != null && (
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600">Actual Budget</span>
                            <span className="font-medium text-green-800">{selectedActivity.actual_budget} {selectedActivity.currency || ''}</span>
                          </div>
                        )}
                        {selectedActivity?.completion_note && (
                          <div className="text-xs text-green-700 pt-1 border-t border-green-200 mt-1">{selectedActivity.completion_note}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Save & Delete — always visible at bottom */}
                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  <Button onClick={saveActivityDetails} className="flex-1 rounded-xl bg-[var(--brand-violet)] py-2.5 text-sm font-semibold text-white shadow-md hover:brightness-90 transition-all active:scale-[0.97] gap-2"><Save size={16}/> Save Changes</Button>
                  <Button onClick={async () => {
                    if (!selectedActivity) return;
                    await handleDeleteActivity(selectedActivity.id);
                  }} className="rounded-xl bg-white border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all gap-2"><Trash2 size={16}/> Delete</Button>
                </div>
              </div>
            </div>
            {selectedActivity && <div className="shrink-0 border-t border-slate-200"><TimelineView activity={selectedActivity} subActivities={subActivities} businessCountry={businessCountry} /></div>}
        </SheetContent>
      </Sheet>

      {/* Guest Report Dialog */}
      <Dialog open={isGuestReportOpen} onOpenChange={(open) => { setIsGuestReportOpen(open); if (!open) { setReportGuests([]); } }}>
        <DialogContent className="!max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-xl" style={{ color: 'var(--brand-violet)' }}>Guest Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap items-end">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Status</label>
                <select value={reportFilterStatus} onChange={e => setReportFilterStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm">
                  <option value="">All Statuses</option>
                  <option value="Attending">Attending</option>
                  <option value="No">No</option>
                  <option value="Maybe">Maybe</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Level</label>
                <select value={reportFilterLevel} onChange={e => setReportFilterLevel(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm">
                  <option value="">All</option>
                  <option value="event">Event Level</option>
                  <option value="activity">Activity Level</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Sort</label>
                <select value={reportSort} onChange={e => setReportSort(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm">
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                  <option value="guest_count">Count</option>
                </select>
              </div>
              <button onClick={() => setReportOrder(reportOrder === "asc" ? "desc" : "asc")} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-1">
                <Filter size={14} /> {reportOrder === "asc" ? "Asc" : "Desc"}
              </button>
            </div>
            <div className="border border-slate-200 rounded-xl max-h-[65vh] overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="p-3">Name</th>
                    <th className="p-3">WhatsApp</th>
                    <th className="p-3">Count</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Level</th>
                    <th className="p-3">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportGuests.length === 0 && (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-600 italic">No guests match your filters.</td></tr>
                  )}
                  {reportGuests.map((g: any) => (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium">{g.name}</td>
                      <td className="p-3 text-slate-600">{g.whatsapp || "—"}</td>
                      <td className="p-3">×{g.guest_count}</td>
                      <td className="p-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${g.status === 'Attending' ? 'bg-green-50 text-green-700' : g.status === 'No' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>{g.status}</span>
                      </td>
                      <td className="p-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${g.level === 'Event' ? 'bg-violet-50 text-violet-700' : 'bg-sky-50 text-sky-700'}`}>{g.level}</span>
                      </td>
                      <td className="p-3 text-slate-600">{g.activity_title || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">{reportGuests.length} guest(s) found.</p>
              <button onClick={() => exportCSV(reportGuests, 'guest-report.csv')} className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-1">
                <Download size={12} /> Export CSV
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vendor Report Dialog */}
      <Dialog open={isVendorReportOpen} onOpenChange={(open) => { setIsVendorReportOpen(open); if (!open) { setReportVendors([]); } }}>
        <DialogContent className="!max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-xl" style={{ color: 'var(--brand-violet)' }}>Vendor Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap items-end">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Sort</label>
                <select value={vendorReportSort} onChange={e => setVendorReportSort(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm">
                  <option value="business_name">Name</option>
                  <option value="service">Service</option>
                  <option value="activity">Activity</option>
                </select>
              </div>
              <button onClick={() => setVendorReportOrder(vendorReportOrder === "asc" ? "desc" : "asc")} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-1">
                <Filter size={14} /> {vendorReportOrder === "asc" ? "Asc" : "Desc"}
              </button>
            </div>
            <div className="border border-slate-200 rounded-xl max-h-[65vh] overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="p-3">Business Name</th>
                    <th className="p-3">WhatsApp</th>
                    <th className="p-3">Services</th>
                    <th className="p-3">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportVendors.length === 0 && (
                    <tr><td colSpan={4} className="p-6 text-center text-slate-600 italic">No vendors found for this event.</td></tr>
                  )}
                  {reportVendors.map((v: any) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium">{v.business_name}</td>
                      <td className="p-3 text-slate-600">{v.whatsapp || "—"}</td>
                      <td className="p-3 text-slate-700">{v.services || "—"}</td>
                      <td className="p-3 text-slate-600">{v.activity_title || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">{reportVendors.length} vendor(s) found.</p>
              <button onClick={() => exportCSV(reportVendors, 'vendor-report.csv')} className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-1">
                <Download size={12} /> Export CSV
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activity Details Report Dialog */}
      <Dialog open={isActivityReportOpen} onOpenChange={(open) => { setIsActivityReportOpen(open); if (!open) { setReportActivities([]); } }}>
        <DialogContent className="!max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-xl" style={{ color: 'var(--brand-violet)' }}>Activity Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap items-end">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Column</label>
                <select value={activityReportFilterStatus} onChange={e => setActivityReportFilterStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm">
                  <option value="">All Columns</option>
                  {columns.map(c => <option key={c.status_id} value={c.status_id}>{c.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Progress</label>
                <select value={activityReportFilterProgress} onChange={e => setActivityReportFilterProgress(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm">
                  <option value="">All</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="none">Not Started</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Level</label>
                <select value={activityReportFilterLevel} onChange={e => setActivityReportFilterLevel(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm">
                  <option value="">All</option>
                  <option value="parent">Parent Only</option>
                  <option value="sub">Sub-Activities Only</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Sort</label>
                <select value={activityReportSort} onChange={e => setActivityReportSort(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm">
                  <option value="planned_start">Date</option>
                  <option value="title">Title</option>
                  <option value="status">Status</option>
                  <option value="column">Column</option>
                  <option value="progress">Progress</option>
                  <option value="parent">Parent Activity</option>
                  <option value="guest_count">Guest Count</option>
                  <option value="vendor_count">Vendor Count</option>
                </select>
              </div>
              <button onClick={() => setActivityReportOrder(activityReportOrder === "asc" ? "desc" : "asc")} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-1">
                <Filter size={14} /> {activityReportOrder === "asc" ? "Asc" : "Desc"}
              </button>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Search</label>
                <input type="text" value={activityReportSearch} onChange={e => setActivityReportSearch(e.target.value)} placeholder="Search title..." className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm w-40" />
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl max-h-[65vh] overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="p-3">Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Parent</th>
                    <th className="p-3">Column</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Guests</th>
                    <th className="p-3">Vendors</th>
                    <th className="p-3">Sub-Activities</th>
                    <th className="p-3">Completion Note</th>
                    <th className="p-3">Planned Hours</th>
                    <th className="p-3">Actual Hours</th>
                    <th className="p-3">Planned Budget</th>
                    <th className="p-3">Actual Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportActivities.length === 0 && (
                    <tr><td colSpan={14} className="p-6 text-center text-slate-600 italic">No activities match your filters.</td></tr>
                  )}
                  {reportActivities.map((a: any) => {
                    const isParent = !a.parent_activity_id;
                    const isDone = a.progress_status === "done" || (a.completed === 1 && !a.progress_status);
                    const dateStr = (a.planned_start || a.start_date || "");
                    return (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className={`p-3 font-medium ${isDone ? "line-through text-slate-500" : ""}`}>{a.title}</td>
                        <td className="p-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isParent ? "bg-violet-50 text-violet-700" : "bg-sky-50 text-sky-700"}`}>
                            {isParent ? "Parent" : "Sub"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{a.parent_title || "—"}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.column_color }} />
                            <span>{a.column_label || a.status}</span>
                          </span>
                        </td>
                        <td className="p-3">
                          {isDone ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">Done</span>
                          ) : a.progress_status === "in-progress" ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">In Progress</span>
                          ) : (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Not Started</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 text-xs whitespace-nowrap">
                          {dateStr ? formatDate(dateStr.split("T")[0], businessCountry) : "—"}
                          {dateStr.includes("T") && dateStr.split("T")[1]?.slice(0, 5) ? ` ${dateStr.split("T")[1].slice(0, 5)}` : ""}
                        </td>
                        <td className="p-3 text-slate-600">{a.guest_count || 0}</td>
                        <td className="p-3 text-slate-600">{a.vendor_count || 0}</td>
                        <td className="p-3 text-slate-600">{a.sub_activity_count || 0}</td>
                        <td className="p-3 text-slate-600 text-xs max-w-[200px] truncate" title={a.completion_note || ""}>{a.completion_note || "—"}</td>
                        <td className="p-3 text-slate-600 text-xs">{a.planned_effort_hours != null ? a.planned_effort_hours : "—"}</td>
                        <td className="p-3 text-slate-600 text-xs">{a.actual_effort_hours != null ? a.actual_effort_hours : "—"}</td>
                        <td className="p-3 text-slate-600 text-xs">{a.planned_budget != null ? `${a.planned_budget} ${a.currency || ''}` : "—"}</td>
                        <td className="p-3 text-slate-600 text-xs">{a.actual_budget != null ? `${a.actual_budget} ${a.currency || ''}` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600">{reportActivities.length} activit(ies) found.</p>
              <button onClick={() => exportCSV(reportActivities, 'activity-details.csv')} className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all flex items-center gap-1">
                <Download size={12} /> Export CSV
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isColumnManagerOpen} onOpenChange={(open) => { if (!open) setIsColumnManagerOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
             <DialogTitle className="text-lg" style={{ color: 'var(--brand-violet)' }}>Manage Columns</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {columns.map((col, idx) => (
                <div key={col.id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveColumn(col.id, -1)} disabled={idx === 0} className="h-4 w-4 flex items-center justify-center text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-all" title="Move up">▲</button>
                    <button onClick={() => moveColumn(col.id, 1)} disabled={idx === columns.length - 1} className="h-4 w-4 flex items-center justify-center text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-20 disabled:cursor-not-allowed transition-all" title="Move down">▼</button>
                  </div>
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                  <span className="text-sm font-medium flex-1">{col.label}</span>
                  <span className="text-xs text-slate-500 font-mono">{col.status_id}</span>
                  <button onClick={() => {
                    setEditingColId(col.id);
                    setNewColLabel(col.label);
                    setNewColStatusId(col.status_id);
                    setNewColColor(col.color);
                  }} className="text-xs text-slate-600 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100">Edit</button>
                  <button onClick={async () => {
                    if (!confirm(`Delete column "${col.label}"? Activities in this column may not display.`)) return;
                    await fetch(`/api/columns?id=${col.id}`, { method: "DELETE" });
                    await fetchColumns();
                  }} className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">Del</button>
                </div>
              ))}
              {columns.length === 0 && <p className="text-sm text-slate-600 italic">No columns configured.</p>}
            </div>
            <div className="border-t border-slate-200 pt-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--brand-violet)' }}>{editingColId ? 'Edit Column' : 'Add Column'}</p>
              <div className="flex gap-2">
                <Input value={newColLabel} onChange={e => setNewColLabel(e.target.value)} placeholder="Label (e.g. Review)" className="flex-1 border-slate-200 rounded-xl" />
                <Input value={newColStatusId} onChange={e => setNewColStatusId(e.target.value.replace(/\s+/g, '-').toLowerCase())} placeholder="status-id" className="w-28 border-slate-200 rounded-xl font-mono text-xs" />
                <Input value={newColColor} onChange={e => setNewColColor(e.target.value)} type="color" className="w-10 h-9 p-0.5 border-slate-200 rounded-xl cursor-pointer" />
              </div>
              <div className="flex gap-2">
                <Button onClick={async () => {
                  if (!newColLabel.trim() || !newColStatusId.trim()) return;
                  if (editingColId) {
                    await fetch(`/api/columns`, {
                      method: 'PUT',
                      body: JSON.stringify({ id: editingColId, label: newColLabel.trim(), color: newColColor, status_id: newColStatusId.trim() }),
                      headers: { 'Content-Type': 'application/json' }
                    });
                  } else {
                    await fetch(`/api/columns`, {
                      method: 'POST',
                      body: JSON.stringify({ event_id: Number(eventId), status_id: newColStatusId.trim(), label: newColLabel.trim(), color: newColColor }),
                      headers: { 'Content-Type': 'application/json' }
                    });
                  }
                  setEditingColId(null);
                  setNewColLabel("");
                  setNewColStatusId("");
                  setNewColColor("#94a3b8");
                  await fetchColumns();
                }} className="flex-1 rounded-xl bg-[var(--brand-violet)] py-2 text-sm font-semibold text-white shadow-md hover:brightness-90 transition-all">
                  {editingColId ? 'Save' : 'Add'}
                </Button>
                {editingColId && <Button onClick={() => { setEditingColId(null); setNewColLabel(""); setNewColStatusId(""); setNewColColor("#94a3b8"); }} variant="outline" className="rounded-xl">Cancel</Button>}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Note Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={(open) => { if (!open) setIsCompleteDialogOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg" style={{ color: 'var(--brand-violet)' }}>Mark Activity Complete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-700">Completion details for tracking:</p>
            <Textarea
              value={completionNote}
              onChange={e => setCompletionNote(e.target.value)}
              placeholder="e.g. All sub-activities finalized, vendor confirmed, budget approved"
              className="min-h-20 border-slate-200 bg-white rounded-xl"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Actual Effort (hours)</label>
                <input type="number" min="0" step="0.5" value={completionActualHours} onChange={e => setCompletionActualHours(e.target.value)}
                  placeholder="e.g. 4.5" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Actual Budget</label>
                <div className="flex gap-1">
                  <input type="number" min="0" step="0.01" value={completionActualBudget} onChange={e => setCompletionActualBudget(e.target.value)}
                    placeholder="0.00" className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                  <select value={completionCurrency} onChange={e => setCompletionCurrency(e.target.value)}
                    className="w-20 rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm">
                    <option value="INR">₹</option>
                    <option value="USD">$</option>
                    <option value="EUR">€</option>
                    <option value="GBP">£</option>
                    <option value="AED">د.إ</option>
                    <option value="SAR">﷼</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setIsCompleteDialogOpen(false)} variant="outline" className="rounded-xl">Cancel</Button>
              <Button onClick={confirmComplete} className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-green-700 transition-all gap-2">
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
                Confirm Complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
