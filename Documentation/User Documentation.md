# User Documentation — Savazar Agentic Events & Projects Platform

---

## 1. Platform Overview

The **Savazar Agentic Events & Projects Platform** is a full-stack web application for creating, managing, and tracking events and projects through an interactive Kanban board interface with timeline and calendar views. It supports hierarchical task decomposition (activities with sub-activities), guest and vendor management, role-based team access, payment information tracking, effort and budget planning, and comprehensive reporting with CSV export.

### Key Features

- **Event/Project Creation** with detailed forms including description, dates, locations, guests, team assignment, budget, effort hours, and payment details.
- **Kanban Board** with drag-and-drop column management for activities, supporting custom columns per event.
- **Timeline View** with filters, grouping by day/week, sort controls, and date range filtering.
- **Calendar View** with month, week, and day modes displaying all activities chronologically.
- **Hierarchical Activities** — parent activities with nested sub-activities, each trackable independently.
- **Guest Management** — add guests at event level or per-activity with CSV import/export and status tracking (Attending, No, Maybe).
- **Vendor Management** — assign vendors/service providers to specific activities.
- **Role-Based Access Control** — three tiers: Savadmin (super admin), Event Manager (full event access), Event User (assigned events only).
- **Custom UI Configuration** — customize colors, fonts, font sizes, and button labels via Admin panel.
- **AI Provider Integration** — connect OpenAI, Anthropic, Google Gemini, Groq, Ollama, LM Studio, or OpenRouter.
- **Cloning** — duplicate an entire event with all its activities, guests, vendors, locations, and column configurations.
- **Reporting** — detailed guest, vendor, and activity reports with filtering, sorting, and CSV export.
- **Business Profile** — configure business name, address, contacts, social media, timezone, and languages.

---

## 2. User / Team Management (Admin Functionality)

The Admin panel (`/admin`) allows the **Savadmin** role to manage all aspects of the platform. Access is restricted to users with the `savadmin` role.

### Roles

| Role | Identifier | Permissions |
|------|-----------|-------------|
| **Savadmin** | `savadmin` | Full system access — Admin settings, all events, team management, AI config, UI customization |
| **Event Manager** | `event_manager` | Access to all events, manage activities/guests/vendors, but **no** access to Admin settings |
| **Event User** | `event_user` | Access only to events explicitly assigned to them; cannot create or delete events |

### Managing Team Members

Navigate to **Admin > Team Management** to view, add, edit, or remove team members.

#### Adding a Team Member

1. Click **"Add Member"** button.
2. Fill in:
   - **First Name** and **Last Name** — used to construct the display name.
   - **Username** — unique login identifier (required). Must be unique across the system.
   - **Password** — used for initial authentication (required for new members; can be left blank when editing).
   - **Email** — optional contact email.
   - **WhatsApp** — optional contact number.
   - **Role** — select either:
     - **Event Manager** — full access to all events, no admin settings.
     - **Event User** — restricted to assigned events only.
3. **Assign Events** (for Event Users only): A checklist of all events appears. Tick the events this user should have access to.
4. Click **"Add Member"** to save.

### Editing a Team Member

Click the pencil icon next to any team member to open the edit dialog. All fields are pre-populated. Leave the password field blank to keep the current password unchanged.

### Deleting a Team Member

Click the trash icon and confirm the deletion in the browser prompt.

### Team Member Report

Click the **"Report"** button to open a detailed report dialog. Features:
- Filter by role (All / Event Manager / Event User).
- Sort by Name, Username, Role, or Email.
- Toggle ascending/descending order.
- View assigned event titles for each member.
- **Export CSV** to download the report.

### Assigning Events to Event Users

Event Users can be assigned to events in **two ways**:

1. **Via Team Management (Admin)** — when creating or editing an Event User, tick the desired events in the "Assigned Events" checklist. Each assignment is stored as a JSON array of event IDs in the `event_ids` field.

2. **Via Event Create/Edit Dialog** — when creating or editing an event, navigate to the **"Team"** section:
   - **Event Owner** dropdown — select an Event Manager or Savadmin to own the event.
   - **Assigned Event Users** checklist — tick the Event Users who should have access to this specific event. This automatically updates the user's `event_ids` array on save.

Both methods are synchronized — assigning from either direction persists the relationship.

---

## 3. Events Management

Events (also referred to as projects) are the top-level organizational unit. Each event has a title, description, date range, locations, guests, team assignments, budget, effort hours, and payment details.

### Creating an Event

1. On the dashboard (`/`), click **"Create Event/Project"** button.
2. The creation dialog opens with a sidebar for multi-section navigation:

| Section | Fields |
|---------|--------|
| **Details** | Title (required), Description — "Describe the event in detail — objectives, scope, key stakeholders, important deadlines, and any constraints or dependencies." |
| **Team** | Event Owner (Admin/Manager), Assigned Event Users (checkboxes) |
| **Date & Location** | Start Date, End Date, Multiple venues with Name, Description, City, State, Country, Zip Code |
| **Guests** | Add individual guests (Name, WhatsApp, Count, Status) or upload via CSV. Status options: Attending, No, Maybe |
| **Effort & Budget** | Planned Budget (currency configurable per activity), Planned Effort Hours |
| **Payment** | Bank Name, Account Number, IFSC Code, QR Code image — pre-populated from Admin defaults |

3. Click the **"Create Event/Project"** button at the bottom to save.

### Viewing Events (Dashboard)

The dashboard displays all events the current user has access to as cards. Each card shows:
- Event title and description.
- Date range (formatted per business country locale).
- Location and Event Owner name.
- Buttons: **View Board**, **Edit**, **Copy** (clone), **Delete**.

Event Users will only see events they are explicitly assigned to.

### Editing an Event

Click the **"Edit"** button on any event card. The edit dialog mirrors the creation form with all existing data pre-populated, including loaded locations, guests, team assignments, and payment details.

### Cloning (Copying) an Event

Click the **"Copy"** button to duplicate an event. The clone creates:
- A new event titled `Copy of [original title]`.
- Duplicated locations, column configurations, activities (both parent and sub-activities with remapped parent IDs), guests, and vendors.

### Deleting an Event

Click the **"Delete"** button and type the exact event title into the confirmation input to enable the delete button. This permanently removes the event along with all associated locations, guests, activities, and column configurations.

### Event Detail Page (`/events/[id]`)

The event detail page is the main workspace. It is structured with:

- **Header** — event title and a quick-add activity bar (title, date, time, duration, and "Add Activity" button).
- **Left Sidebar** — toggleable collapsible navigation with:
  - **View switcher**: Kanban, Timeline, Calendar.
  - **Manage Columns** button.
  - **Reports**: Guest Report, Vendor Report, Activity Details.
  - **Navigation links**: Dashboard, Admin.
- **Summary Status** — collapsible section showing:
  - **Activities** — parent and sub-activity counts, per-column status breakdown (Open / In-Progress / Done counts).
  - **Guests** — total, attending, declined, maybe counts.
  - **Vendors** — total vendor count.
  - **Payment** — bank name, masked account number, and QR code (event-specific or business default).

---

## 4. Activities Management

Activities are the core work items within an event. They can represent tasks, sessions, milestones, or any discrete unit of work.

### Activity Types

- **Parent Activity** — a top-level activity with no parent. Displayed as cards on the Kanban board.
- **Sub-Activity** — a child activity nested under a parent activity (see Section 5).

### Creating an Activity

Use the quick-add bar at the top of the event detail page:
1. Enter an **Activity Title**.
2. Optionally set a **Date** (start date), **Start Time**, and **Duration** (from 15 min to 8 hours).
3. Click **"Add Activity"** . The activity is created in the first column (typically "Backlog").

### Activity Lifecycle

Activities progress through **columns** (statuses) defined per event:

1. **Open / Backlog** — created but not started.
2. **In Progress** — work has begun (marked via button or drag).
3. **Done** — completed (marked via completion dialog or drag).

Each activity can be dragged between columns on the Kanban board using drag-and-drop (via @dnd-kit). Column status can also be changed via an inline dropdown on each Kanban card.

### Viewing Activity Details

Click the pencil/edit button or click a card on any view (Kanban, Timeline, Calendar) to open the **Activity Details** sheet (left-side drawer). The sheet has its own collapsible sidebar with these sections:

| Section | Features |
|---------|----------|
| **Details** | Title, Description, Assigned Owner, Planned Effort (hours), Planned Budget (with currency selector: INR, USD, EUR, GBP, AED, SAR) |
| **Sub-Activities** | List of sub-activities with checkbox completion, delete button, and "Add" form (title, description, date, time, duration, owner) |
| **Dates & Location** | Activity Date (date + time + duration), Planned Start (for scheduling), Activity End (actual end datetime), Location (from event locations) |
| **Guests** | Add/Edit/Delete activity-specific guests, CSV import, Sample CSV download |
| **Vendors** | Assign/Edit/Delete vendors (business name, WhatsApp, services) |
| **Completion** | Mark In Progress, Mark Complete (with completion note, actual effort hours, actual budget); or Reopen if already completed |

The bottom of the sheet always shows **"Save Changes"** and **"Delete"** buttons. A **Timeline** strip at the bottom of the sheet displays the activity and its sub-activities chronologically.

### Completion Workflow

When marking an activity as **Complete**:

1. Click **"Mark Complete"** in the Completion section.
2. A dialog appears for tracking:
   - **Completion Note** — free text describing what was done (e.g., "All sub-activities finalized, vendor confirmed, budget approved").
   - **Actual Effort (hours)** — actual hours spent.
   - **Actual Budget** — actual spend with currency.
3. Click **"Confirm Complete"**. The activity and all its sub-activities are marked as done with a timestamp.

When marking an activity **In Progress**: The activity's `progress_status` is set to `in-progress` and `completed` is set to `0`. This applies to the activity and all its sub-activities.

A **"Reopen"** button appears if the activity is already completed, allowing it to be moved back to In Progress.

### Kanban Board

The default view. Activities are displayed as draggable cards within customizable columns. Each card shows:
- Activity title with status badge (Done / In Progress).
- Start date, sub-activity count, guest count, vendor count.
- Inline status dropdown for quick column changes.
- Edit button (appears on hover).

### Timeline View

Accessible from the sidebar. Displays activities chronologically with:
- Filter by column, progress status, date range.
- Sort by oldest/newest.
- Group by **Day** or **Week**.
- Cards show column color indicator, status badges, date/time, and sub-activity/guest/vendor counts.

### Calendar View

Accessible from the sidebar. Shows activities on a calendar with three modes:
- **Month** — overview grid with up to 3 activities per day, click day to drill in.
- **Week** — 7-day columns showing up to 5 activities per day.
- **Day** — hourly time slots with completed activities in a separate sidebar.

Navigation controls: previous/next, "Today" button.

### Activity Reports

Three report types available from the sidebar:

| Report | Filters | Sort Options | Export |
|--------|---------|-------------|--------|
| **Guest Report** | Status (All/Attending/No/Maybe), Level (All/Event/Activity) | Name, Status, Count | CSV |
| **Vendor Report** | — | Name, Service, Activity | CSV |
| **Activity Details** | Column, Progress, Level (Parent/Sub), Search | Date, Title, Status, Column, Progress, Parent, Guest Count, Vendor Count | CSV |

### Managing Columns

Click **"Manage Columns"** in the sidebar to open the column manager:
- View all columns with their color indicators and status IDs.
- **Reorder** columns using up/down arrows.
- **Edit** a column's label, status ID, or color.
- **Delete** a column (confirmation required — activities in the column may become orphaned).
- **Add** a new column with label, status ID (auto-formatted as lowercase hyphenated), and color picker.

---

## 5. Sub-Activities

Sub-activities are child items nested under a parent activity. They extend the core functionality by allowing hierarchical decomposition of work.

### Relationship Model

- Each sub-activity has a `parent_activity_id` referencing its parent activity.
- A parent activity can have zero or more sub-activities.
- Sub-activities cannot have their own sub-activities (single-level nesting).

### Creating Sub-Activities

Within the **Activity Details** sheet, navigate to the **"Sub-Activities"** section:
1. Enter a **Title** and optional **Description**.
2. Optionally set a **Date**, **Start Time**, and **Duration**.
3. Optionally **Assign an Owner** (from the event's assigned team members).
4. Click **"Add"**.

### Managing Sub-Activities

Each sub-activity in the list shows:
- **Checkbox** — check to mark as Done (updates `completed` field). Uncheck to mark as Pending.
- **Title** (with strikethrough if completed) and **Description**.
- **Date and Time** display.
- **Assigned Owner** name (if set).
- **Delete** button (trash icon) with confirmation prompt.

### Completion Behavior

When a parent activity is marked as **Complete**, all its sub-activities are automatically marked as complete as well (via `UPDATE Activity SET completed = 1, progress_status = 'done' WHERE parent_activity_id = ?`).

When a parent activity is marked as **In Progress**, all its sub-activities are set to In Progress.

### Timeline Integration

The Timeline view within the Activity Details sheet displays the parent activity and all its sub-activities chronologically, sorted by planned start date, with the parent activity labeled as **"Activity"** and completed items shown with strikethrough and a green "Done" badge.

---

## 6. Core Functionality & Workflow

### Typical User Journey

#### 1. Authentication

- Navigate to `/login`.
- Enter **Username** and **Password**.
- On successful login, the session is established via an HTTP-only cookie (`session_token`) for 7 days.
- If the account requires a password change (`force_password_change = 1`), the user is redirected to `/change-password` where they must enter their current password and a new password (minimum 6 characters, must match confirmation).
- On password change success, the user is redirected to the dashboard.
- If authentication fails, an error message is displayed.
- Logout clears the session cookie.

#### 2. Dashboard (`/`)

After login, the dashboard displays:
- **Business Name** (configured in Admin) displayed as title: `"[Business Name] Events & Projects"`.
- **Event Cards** — each showing title, description, date range, location, owner, and action buttons.
- **"Create Event/Project"** button — opens the creation dialog.

Available actions per event card:
- **View Board** — navigates to `/events/[id]` for full event management.
- **Edit** — opens the edit event dialog.
- **Copy** — clones the event.
- **Delete** — removes the event (with name confirmation).

Access control: Event Users see only assigned events; Managers and Savadmins see all events.

#### 3. Event Detail Page (`/events/[id]`)

The main workspace for managing an event:

1. **Quick-Add Activity** — enter title, date, time, duration, and click "Add Activity" to create a new activity in the first column.
2. **Kanban Board** (default view) — drag activities between columns or use the inline status dropdown to update their status.
3. **Switch Views** — use the sidebar to toggle between Kanban, Timeline, and Calendar views.
4. **View Summary Stats** — click "Summary Status" to expand activity status breakdown, guest counts, vendor counts, and payment info.
5. **Manage Columns** — add, edit, reorder, or delete columns.
6. **Run Reports** — open Guest, Vendor, or Activity Details reports from the sidebar, apply filters and sorting, and export to CSV.
7. **Click on an Activity** — opens the Activity Details sheet for full management.

#### 4. Activity Management (Details Sheet)

Within the Activity Details sheet:

1. **Update Details** — edit title, description, assign owner, set planned effort and budget.
2. **Add Sub-Activities** — break down the activity into smaller actionable items.
3. **Set Dates** — configure activity date with time/duration, planned start, and actual end.
4. **Select Location** — choose from event locations.
5. **Manage Guests** — add guests manually or via CSV upload, edit guest details, update status.
6. **Assign Vendors** — link service providers with contact info and services description.
7. **Mark Progress** — set to In Progress or Complete (with completion metadata).
8. **Save Changes** — persist all modifications.
9. **Delete Activity** — permanently remove the activity and associated guests/vendors/sub-activities.

#### 5. Admin Settings (`/admin`)

Accessible from the sidebar navigation (Savadmin only):

| Section | Configuration |
|---------|--------------|
| **Business Address** | Business name, full address, street, city, state, country, zip, timezone, languages, email, WhatsApp, social media links, business contacts |
| **Team Management** | Full CRUD for team members with role assignment and event-level access control |
| **Payments** | Default bank name, account number, IFSC code, QR code image — inherited by all new events |
| **UI/UX Appearance** | Application title, logo URL, font family (10 options), per-element font sizes, custom button labels (12 buttons), full color palette (22 color tokens) |
| **AI Configuration** | Enable/disable providers (OpenAI, Anthropic, OpenRouter, Gemini, Groq, Ollama, LM Studio), set model names and API keys per provider |

#### 6. Admin > Payments

Configure default payment information that pre-populates the payment section of every new event:
- **Bank Name**, **Account Number**, **IFSC Code**, **QR Code** image upload (PNG/JPG).
- Events can override these defaults at creation or edit time.

#### 7. Admin > UI/UX Appearance

Full customization of the platform's look and feel:
- **Colors** — 22 tokens covering primary, secondary, tertiary, accent, success, warning, error, backgrounds, borders, inputs, and focus rings. Each has a hex color picker and manual input.
- **Font Family** — choose from Inter (default), Roboto, Poppins, Playfair Display, Open Sans, Lato, Montserrat, Source Sans Pro, Nunito, Quicksand.
- **Font Sizes** — 8 element types (Page Title, Section Heading, Card Title, Sidebar Item, Form Label, Body Text, Stat Value, Button Text).
- **Button Labels** — customize text for 12 action buttons across the platform.

#### 8. Admin > AI Configuration

Connect the platform to AI providers for intelligent assistance:
- Supported providers: OpenAI, Anthropic, OpenRouter, Google Gemini, Groq, Ollama, LM Studio.
- Per-provider: enable/disable toggle, model name input, API key input (password masked).
- Multiple providers can be enabled simultaneously.

### Data Model Summary

| Entity | Description |
|--------|-------------|
| **Event** | Top-level container with title, dates, description, location, contact, budget, effort hours, owner, payment info |
| **Activity** | Work item within an event; can be parent (hierarchical top-level) or sub (child of a parent) |
| **TeamMember** | Platform user with username, password (hashed), role, and assigned event IDs |
| **Guest** | Person invited to an event or activity, with status (Attending/No/Maybe) and guest count |
| **Vendor** | Service provider assigned to an activity, with business name, WhatsApp, services |
| **ColumnConfig** | Custom Kanban column definition per event |
| **EventLocation** | Venue associated with an event |
| **Session** | Authentication session with token and expiry |
| **BusinessContact** | Contact person linked to the business profile |
| **Todo** | Simple todo item (legacy/minimal) |

### Error Handling

- All API routes use `withErrorHandler` wrapper that catches exceptions and returns `{ success: false, error: "Internal Server Error" }` with status 500.
- Authentication failures return 401 with `{ error: "Unauthorized" }`.
- Authorization failures (wrong role, no event access) return 403 with `{ error: "Forbidden" }`.
- Client errors (missing fields) return 400 with descriptive error messages.
- Database errors (e.g., duplicate username) return appropriate status codes (409 Conflict).

### Database Migration

The platform uses a non-destructive migration strategy (`src/lib/migrate.ts`):
- `CREATE TABLE IF NOT EXISTS` for new tables.
- `ALTER TABLE ADD COLUMN` fallbacks for new columns.
- Safe to run on every startup — never drops tables or deletes data.
- Database file: `prisma/dev.db` (SQLite via better-sqlite3).
- Persisted via Docker volume `./prisma:/app/prisma` across restarts.
