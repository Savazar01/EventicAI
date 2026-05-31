# Design System: Material 3 (Event Manager)

## Core Philosophy
- **Modern & Futuristic**: Clean, spacious, high-contrast, yet soft.
- **Material 3**: Use of elevation, surface colors, rounded geometry, and a full color role system.
- **Responsive**: Mobile-first design that scales gracefully to Desktop.

---

## Color Palette

All colors are derived from the Primary Violet `#6771ab`. Use these CSS custom properties or inline Tailwind classes throughout the app.

### Primary (Violet)
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#6771ab` | Buttons, active tabs, headers, links |
| On Primary | `#ffffff` | Text/icon on Primary backgrounds |
| Primary Container | `#eef0f7` | Light violet container backgrounds |
| On Primary Container | `#2d336b` | Text on Primary Container |

### Secondary (Light Violet)
| Token | Hex | Usage |
|-------|-----|-------|
| Secondary | `#8b93c5` | Secondary buttons, badges, subdued accents |
| On Secondary | `#ffffff` | Text on Secondary |
| Secondary Container | `#f0f1fa` | Hover states, secondary surfaces |
| On Secondary Container | `#3d4580` | Text on Secondary Container |

### Tertiary (Rose)
| Token | Hex | Usage |
|-------|-----|-------|
| Tertiary | `#c484b0` | Alternative accent, decorative elements |
| On Tertiary | `#ffffff` | Text on Tertiary |
| Tertiary Container | `#fce4f0` | Soft rose backgrounds |

### Neutral / Surface
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#f8fafc` | Page background |
| On Background | `#1e293b` | Body text |
| Surface | `#ffffff` | Card, modal, sheet default bg |
| On Surface | `#1e293b` | Text on Surface |
| Surface Variant | `#fefce8` | Cream — Kanban columns, event cards, list items |
| On Surface Variant | `#475569` | Subdued text on cream surfaces |

### Accent
| Token | Hex | Usage |
|-------|-----|-------|
| Accent (Gold) | `#ffcc00` | Highlights, badges, call-to-action embellishments |

### Feedback / Status
| Token | Hex | Usage |
|-------|-----|-------|
| Success | `#22c55e` | Completed items, success messages |
| Warning | `#f59e0b` | Pending states, warnings |
| Error | `#ef4444` | Delete buttons, error messages, destructive actions |

### Outline / Border
| Token | Hex | Usage |
|-------|-----|-------|
| Outline | `#cbd5e1` | Borders on cards, columns |
| Outline Variant | `#e2e8f0` | Lighter borders, dividers |

---

## Typography
- **Font Family**: Geist Sans (via `next/font/google`) — `--font-geist-sans`
- **Mono**: Geist Mono — `--font-geist-mono`
- **Scale**: Use Tailwind's default type scale (`text-xs` through `text-4xl`)

---

## Shape / Rounding
| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | `0.375rem` | Small badges, tags |
| `rounded-lg` | `0.5rem` | Buttons, inputs, interactive items |
| `rounded-xl` | `0.75rem` | Dropdowns, dialog content, list items |
| `rounded-2xl` | `1rem` | Cards, columns, modals, sheets |

---

## Elevation / Shadow
| Level | Class | Usage |
|-------|-------|-------|
| 1 | `shadow-sm` | Kanban cards, list items, default state |
| 2 | `shadow-md` | Buttons, hover state on cards |
| 3 | `shadow-lg` | Hovered cards, dropdowns |
| 4 | `shadow-2xl` | Dialogs, sheets, modals |

---

## Component Tokens (Tailwind CSS Variables in `globals.css`)
Use these CSS variables via `var(--token)` or reference `#hex` values directly:

```css
--brand-violet: #6771ab;
--brand-yellow: #ffcc00;
--brand-cream: #fefce8;
--background: #f8fafc;
--foreground: #1e293b;
--card: #ffffff;
--card-foreground: #1e293b;
--border: #e2e8f0;
--primary: #6771ab;
--primary-foreground: #ffffff;
--radius: 1rem;
--input: #e2e8f0;
--ring: #6771ab;
```

---

## Interactive States
- **Hover**: Scale + shadow increase + 100ms ease
- **Active (press)**: `scale-[0.97]` for buttons
- **Focus ring**: Violet ring using `focus-visible:ring-2 focus-visible:ring-[#6771ab]`
- **Disable**: `opacity-50 cursor-not-allowed`
- **Drag**: Kanban cards elevate with `shadow-lg` and `border-[#6771ab]`

---

## Component Recipes

### Buttons
```tsx
<!-- Primary -->
<Button className="rounded-xl bg-[#6771ab] text-white shadow-md hover:bg-[#566198] transition-all active:scale-[0.97]">

<!-- Ghost / Icon -->
<Button variant="ghost" size="icon" className="text-red-500 h-8 w-8">
```

### Cards
```tsx
<Card className="rounded-2xl border-slate-200 shadow-sm hover:shadow-lg transition-shadow bg-[#fefce8]">
```

### Kanban Columns
```tsx
<div className="bg-[#fefce8] rounded-2xl p-4 border border-slate-200 shadow-sm min-h-[300px]">
```

### Dialogs
```tsx
<DialogContent className="max-w-lg">
  <DialogHeader>
    <DialogTitle className="text-xl text-[#6771ab]">Title</DialogTitle>
  </DialogHeader>
```

### Inputs / Selects
```tsx
<Input className="bg-white border-slate-200 rounded-xl" />
<SelectTrigger className="bg-white border-slate-200 rounded-xl" />
```

### Tabs
```tsx
<TabsTrigger className="data-[state=active]:bg-[#6771ab] data-[state=active]:text-white rounded-lg transition-all">
```

### Labels
```tsx
<label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
```
