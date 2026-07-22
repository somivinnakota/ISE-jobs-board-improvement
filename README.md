# ISE Jobs Board — Rebuild and Internalisation

A modern full-stack web application for the Immersive Software Engineering (ISE) programme at the University of Limerick. This system manages residency job postings, student preference rankings, and partner onboarding for the ISE residency selection process.

## Project Overview

This project rebuilds the existing Airtable-based jobs board as an internally managed system. It removes reliance on a single administrator, improves the student ranking experience, and introduces a dedicated residency partner portal.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (TypeScript) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Tailwind CSS, shadcn/ui |
| Drag and Drop | @dnd-kit/core |
| Hosting | Local dev / Vercel-ready |

## User Roles

- **Student** — Browse job postings, search and filter, rank preferences with drag-and-drop, auto-save rankings, submit before deadline
- **Residency Partner (Company)** — Submit and manage job postings, view posting status, track engagement analytics, repost from previous cycles
- **Administrator** — Approve/reject postings, monitor student submissions, open/close ranking periods, archive postings, export data as CSV

## Getting Started

### Prerequisites
- Node.js v18+
- pnpm (`npm install -g pnpm`)
- A Supabase project (free tier works fine)

### Setup

1. **Clone the repo**
```bash
git clone https://github.com/somivinnakota/ISE-jobs-board-improvement.git
cd ISE-jobs-board-improvement/frontend
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Create a `.env.local` file** in the `frontend` folder:
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8080
4. **Set up the database**

Run the SQL scripts in `frontend/supabase/schema.sql` in your Supabase SQL editor to create the required tables.

5. **Start the development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Features

- **59 real ISE job postings** imported from the existing system
- **Drag-and-drop ranking** with auto-save on every change
- **Partner dashboard** with posting status, cycle phase timeline, and engagement analytics
- **Admin approval queue** with approve/reject and reason field
- **Student submission monitor** with CSV export
- **Ranking period controls** — open/close per residency
- **Company profile pages** persistent across residency cycles
- **Repost from history** — duplicate previous postings with one click

## Project Structure
frontend/
├── src/
│ ├── app/
│ │ ├── (auth)/ # Login, register, password reset
│ │ ├── (main)/ # All main pages
│ │ │ ├── admin-dashboard/ # Admin portal
│ │ │ ├── rp-dashboard/ # Partner portal
│ │ │ ├── job-postings/ # Student job browser
│ │ │ ├── pre-interview-rankings/ # Student ranking page
│ │ │ └── company/[id]/ # Company profile pages
│ │ └── api/ # Supabase helper functions
│ └── components/ # Reusable UI components
## Architecture

The system uses Next.js server components to query Supabase directly on the server, with client components for interactive features (drag-and-drop, auto-save, export). There is no separate backend server — all data access goes through Supabase.
Browser → Next.js (server + client components) → Supabase (PostgreSQL + Auth)
## Deliverables

- Functional scope and requirements summary
- User flow and data model documentation  
- Working MVP — ISE Jobs Board system
- Testing report
- Technical documentation
- Recommendations for further development

## Known Issues

See the Testing Report for a full list of known issues and recommended fixes for the next development iteration.

## Author

Somi Vinnakota — ISE Internship Project, University of Limerick, 2026