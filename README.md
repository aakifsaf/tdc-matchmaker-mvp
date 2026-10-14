# The Date Crew (TDC) · Internal Matchmaker Portal & Two-Tier AI Matching Engine

> **A high-touch, AI-augmented matrimonial concierge platform designed exclusively for senior matchmakers to manage client pipelines, enforce hard cultural dealbreakers, evaluate candidates with Groq LLM intelligence, and dispatch bespoke introductions in 60 seconds.**

---

## 🌟 Executive Overview

High-net-worth Indian matrimonial matchmaking requires a delicate balance between **strict cultural non-negotiables** and **soft holistic compatibility**. Generic matrimony algorithms often fail because they treat all preferences equally—recommending candidates who violate critical dealbreakers (such as income expectations, family dynamics, or relocation willingness) simply because their overall hobby or keyword score is high.

**The Date Crew (TDC) Staff Portal** solves this with a **Two-Tier Algorithmic Engine** combined with **Groq LLM Intelligence (openai/gpt-oss-120b)**:
1. **Tier 1 Hard Dealbreaker Gateways**: Deterministically filters out any candidate violating strict cultural rules before scoring begins.
2. **Tier 2 Weighted Soft Compatibility Matrix**: Evaluates candidates across 5 key dimensions (Pedigree, Lifestyle, Cultural, Geography, Delta).
3. **AI Copilot & Risk Analysis**: Identifies subtle relational risks, flags potential family friction points with matchmaker talking points, drafts personalized concierge emails, and allows real-time natural language match steering.

---

## 🚀 Key Innovations & Features

### 1. 🛡️ Two-Tier Matching Engine
- **Gender-Specific Tier 1 Hard Dealbreakers**:
  - **Male Client Logic**: Strictly younger, strictly shorter, strictly lower earning, aligned views on children.
  - **Female Client Logic**: Career/income parity (candidate income >= 90% of client income), relocation harmony, aligned views on children.
- **Tier 2 Weighted Matrix (100 pts total)**:
  - 🎓 **Pedigree & Career (25%)**: College tier (IIT/IIM/BITS/SRCC vs. others), company tier, and income bracket.
  - 🌿 **Lifestyle & Habits (25%)**: Dietary alignment (Vegetarian, Jain, Vegan, Eggetarian, Non-Veg), smoking, drinking, and pets.
  - 🕉️ **Cultural & Family (25%)**: Religion, caste/community, mother tongue, family structure (Nuclear vs. Joint), and Manglik status.
  - 🏙️ **Relocation & Geography (15%)**: Current metro alignment and relocation flexibility.
  - 📐 **Age & Height Delta Optimum (10%)**: Distance to Indian demographic sweet spots (2–4 yrs younger, 3–6 in height delta).

### 2. ⚠️ AI Friction Points & Risk Analysis (Not Just Praise)
Standard matchmaking algorithms only output praise. TDC’s AI Copilot scans for subtle relational and family friction points to prepare the matchmaker before pitching:
- **Family Structure Conflicts**: (e.g., Joint family expectation vs. Nuclear preference).
- **Dietary Nuances**: (Strict vegetarian vs. Non-vegetarian).
- **Career Mobility Friction**: (Cross-city relocations vs. demanding on-site roles).
- **Matchmaker Talking Points**: Provides actionable conversation guides for each friction point.

### 3. 🤖 AI Match Steering Copilot (Natural Language Re-Ranking)
Matchmakers can type plain-English instructions into the Copilot Bar (or click preset pills):
> *"Prioritize strict vegetarians in tech startups who want to live in Mumbai"*
- Groq LLM dynamically re-evaluates candidates, adjusts scores, awards custom badges (*"Top Tech & Veg Fit"*), and re-sorts the candidate pool in real time.
- Instant 1-click **Reset to Standard Engine** capability.

### 4. 🔍 Side-by-Side Biodata Deep-Dive Drawer
- Slide-over comparison drawer opening right over the match list.
- **Visual Delta Strip**: Instant visual comparison of Age Delta, Height Delta, CTC Comparison, Diet Harmony, and Relocation/Kids alignment.
- **Dual-Column Synchronized Biodata**: Inspect both profiles across all 5 matrimonial sections simultaneously.
- **Direct Dispatch Trigger**: Seamlessly transition to the intro email modal directly from the drawer.

### 5. ✉️ Concierge Introduction Email Generator
- Generates bespoke, warm, personalized match emails pitching the candidate to the client.
- Includes candidate highlights, mutual synergy pillars, and 2 customized first-date icebreakers.
- Full matchmaker editor with regeneration capabilities and status tracking (Matches Sent).

### 6. 📬 Dispatched Matches & Client Feedback Lifecycle Tracker
- **Dedicated Lifecycle Tab**: Pinned alongside Biodata, Suggested Matches, and Notes.
- **6-Stage Dating Milestone Pipeline**: `Sent` → `Awaiting Client Feedback` → `Client Interested` → `Intro Call Scheduled` → `First Date Arranged` → `Client Passed`.
- **Matchmaker Debrief & Feedback Notes**: Log qualitative notes regarding client impressions, date outcomes, and next steps.
- **Audit Sent Emails**: Expandable viewer to review the exact AI introduction email dispatched to the client.
- **Auto-Sync Activity Logs**: Advancing match milestones automatically creates logged interactions in the client's timeline.

### 7. 📝 Matchmaker Notes & Interaction History
- Categorized logs (Call, In-Person Meeting, Preferences Update, Client Feedback).
- Live chronological activity feed for full client context.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React |
| **Backend** | Node.js, Express, TypeScript, 	sx (TypeScript Execute), CORS, dotenv |
| **AI Model** | Groq SDK (openai/gpt-oss-120b), JSON mode, deterministic offline fallback |
| **Database** | In-memory cache + JSON file persistence (database.json), seeded with 222 realistic Indian matrimonial profiles |

---

## 📁 Repository Structure

`
matchmaker/
├── backend/                          # Express + TypeScript backend
│   ├── src/
│   │   ├── controllers/              # Auth, Customer, and Matching endpoints
│   │   │   ├── authController.ts
│   │   │   ├── customerController.ts
│   │   │   └── matchingController.ts
│   │   ├── data/
│   │   │   ├── database.json         # Seeded database (222 profiles + notes + dispatches)
│   │   │   ├── db.ts                 # DatabaseStore class (CRUD + persistence)
│   │   │   └── seedProfiles.ts       # Demographic profile generator
│   │   ├── routes/
│   │   │   └── api.ts                # Express API routes
│   │   ├── services/
│   │   │   ├── groqService.ts        # Groq LLM (Scoring, Friction, Emails, Steering)
│   │   │   └── matchingEngine.ts     # Two-Tier Matching Engine (Tier 1 & Tier 2)
│   │   ├── types/
│   │   │   └── customer.ts           # Shared TypeScript interfaces & enums
│   │   ├── server.ts                 # Express server entrypoint (Port 5000)
│   │   ├── testMatching.ts           # Matching engine verification test
│   │   └── testSuite.ts              # Full 5-suite automated test runner
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                          # Backend environment variables
│
├── frontend/                         # Next.js 14 App Router frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── customer/[id]/        # Client biodata, matches tab, notes tab
│   │   │   ├── dashboard/            # Pipeline metrics, filter tabs, client grid
│   │   │   ├── login/                # Staff portal login with one-click demo
│   │   │   ├── globals.css           # Tailwind styling & custom scrollbars
│   │   │   ├── layout.tsx            # Root layout
│   │   │   └── page.tsx              # Clean light-themed landing portal
│   │   ├── components/
│   │   │   ├── AICopilotSteeringBar.tsx # Natural language match steering bar
│   │   │   ├── BiodataView.tsx          # 5-section Indian matrimonial biodata view
│   │   │   ├── CandidateCompareDrawer.tsx # Slide-over side-by-side comparison drawer
│   │   │   ├── CustomerCard.tsx         # Dashboard client pipeline card
│   │   │   ├── MatchCandidateCard.tsx   # Match card with dials, badges & friction
│   │   │   ├── Navbar.tsx               # Persistent staff navbar
│   │   │   ├── NotesTimeline.tsx        # Interaction note logger & timeline
│   │   │   ├── PipelineMetrics.tsx      # Dashboard summary metrics
│   │   │   └── SendMatchModal.tsx       # AI email preview & dispatch modal
│   │   ├── lib/
│   │   │   ├── api.ts                # Type-safe API client wrapper
│   │   │   └── utils.ts              # Formatters (INR, Age, Diet configs, Tailwind)
│   │   └── types/
│   │       └── customer.ts           # Frontend mirrored TypeScript definitions
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── project_plan.md                   # Complete system design & architecture roadmap
└── package.json                      # Root orchestrator scripts
`

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- npm or pnpm installed
- A valid Groq API key (optional — system includes full intelligent fallback)

---

### Step 1: Install Dependencies

From the matchmaker/ root directory:
`ash
npm run install:all
`
*(Or install manually inside ackend/ and rontend/ using 
pm install)*

---

### Step 2: Configure Environment Variables

**Backend (ackend/.env):**
`nv
PORT=5000
FRONTEND_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key_here
`

**Frontend (rontend/.env.local):**
`nv
NEXT_PUBLIC_API_URL=http://localhost:5000/api
`

---

### Step 3: Seed Database (First-Time Only)

Populate ackend/src/data/database.json with 222 verified Indian matrimonial profiles (12 assigned clients + 210 pool candidates):
`ash
npm run seed
`

---

### Step 4: Start Development Servers

Open two terminal windows:

**Terminal 1 — Backend API (Port 5000):**
`ash
npm run dev:backend
# Or: cd backend && npx tsx src/server.ts
`

**Terminal 2 — Frontend Application (Port 3000):**
`ash
npm run dev:frontend
# Or: cd frontend && npm run dev
`

Visit **http://localhost:3000** in your browser.

---

## 🔑 Demo Access Credentials

The portal is designed strictly for authorized TDC matchmaker staff. Use the **"One-Click Login as Priya Sharma"** button on the login screen, or enter the credentials manually:

- **Staff Email:** priya.sharma@thedatecrew.com
- **Password:** 	dc2026
- **Role:** Senior Matchmaker (TDC Mumbai Office)
- **Assigned Clients:** 12 Active Profiles across all pipeline stages

---

## 🧪 Running Automated Tests

A comprehensive 5-suite verification test validates 100% compliance of Tier 1 dealbreakers, Tier 2 scoring calculations, Groq AI friction outputs, and Copilot prompt steering:

`ash
cd backend
npm test
`

### Test Coverage Summary:
- **Suite 1:** Male Client Tier 1 Dealbreaker Gate (Age, Height, Income, Kids — 0 violations).
- **Suite 2:** Female Client Tier 1 Parity Gate (>= 90% Income, Relocation harmony — 0 violations).
- **Suite 3:** Tier 2 Weighted Soft Compatibility (Boundary checks across all 5 dimensions).
- **Suite 4:** Groq AI Risk & Friction Analysis (Badges, synergies, and matchmaker talking points).
- **Suite 5:** AI Copilot Natural Language Prompt Re-Ranking (Dynamic score adjustments).

---

## 📡 API Reference Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Backend server health check |
| POST | /api/auth/login | Matchmaker login authentication |
| GET | /api/auth/me | Fetch active matchmaker profile |
| GET | /api/stats | Pipeline stage counts for dashboard metrics |
| GET | /api/customers | Query assigned clients (filters: status, search) |
| GET | /api/customers/:id | Fetch full client biodata, notes, and dispatches |
| POST | /api/customers/:id/status | Update customer pipeline stage tag |
| POST | /api/customers/:id/notes | Log a client interaction note |
| POST | /api/matches/generate/:id | Run Two-Tier Engine + Groq AI scoring |
| POST | /api/matches/rerank | Re-rank matches via AI using natural language prompts |
| POST | /api/matches/draft-email | Generate personalized introduction email draft |
| POST | /api/matches/dispatch | Dispatch match introduction and log dispatch history |
| PUT | /api/matches/dispatch/:id/feedback | Update match feedback status and debrief notes |

---

## 📄 License & Confidentiality

Internal Confidential Software. Developed exclusively for **The Date Crew (TDC)** matchmaker team.
All rights reserved © 2026 The Date Crew.
