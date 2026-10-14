# TDC Matchmaker Algorithm & Dashboard MVP — End-to-End Project Plan

> **Client / Organization:** The Date Crew (TDC)  
> **Product:** Internal Matchmaker Tool MVP & Custom Matching Engine  
> **Target User:** Senior Matchmaker (e.g., Priya Sharma)  
> **Core Tech Stack:** Next.js (React) + Node.js / Express + Groq LLM API + Indian Demographic Dataset (100+ Profiles)

---

## 1. Project Overview & Objectives

### 1.1 Context & Problem Statement
The Date Crew (TDC) provides an elite, personalized matchmaking service in India. Matchmakers manage clients across various journey stages. Currently, matchmakers face heavy cognitive load manually sifting through profiles, cross-referencing traditional and modern compatibility criteria, identifying subtle relationship risks, and drafting bespoke introductory emails.

### 1.2 Core Goals
1. **Pipeline & Client Management:** Centralize client tracking with clear journey stages and quick meeting note logs.
2. **Comprehensive Indian Matrimonial Biodata:** Capture essential Indian cultural and lifestyle dimensions (education pedigree, income, caste/religion, Manglik status, diet, habits, relocation, family).
3. **Two-Tier Matching Engine:**
   - **Tier 1:** Strict algorithmic dealbreaker gates tailored for male vs. female clients.
   - **Tier 2:** Multi-dimensional weighted soft compatibility scoring (Pedigree, Lifestyle, Cultural harmony, Relocation).
4. **AI-Augmented Reasoning & Risk Analysis:**
   - LLM compatibility reasoning & headline badges.
   - **AI "Friction Points & Risk Analysis"** (identifying potential lifestyle/family misalignments for matchmaker awareness).
   - Bespoke personalized match introduction emails.
5. **Operational Speed:** Enable a matchmaker to evaluate a client, inspect top candidates with risk callouts, and dispatch an introduction within 60 seconds.

---

## 2. System Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React / Next.js)                │
│  - Matchmaker Auth Gate (/login)                            │
│  - Client Dashboard & Pipeline Kanban/Grid (/dashboard)     │
│  - Client Detailed View & Tabs (/customer/:id)              │
│    • Tab 1: Comprehensive Biodata                           │
│    • Tab 2: Suggested Matches (Scores + AI Friction Alerts) │
│    • Tab 3: Matchmaker Journey Notes                        │
│  - Send Match Modal with Editable AI Email Pitch            │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / JSON (JWT / Demo Auth)
┌──────────────────────────────▼──────────────────────────────┐
│                  BACKEND (Node.js + Express)                │
│  - Auth Controller (Login, Session, Role verification)      │
│  - Customer Controller (List, Detail, Notes, Status update) │
│  - Two-Tier Matching Engine Service:                        │
│    • Tier 1: Hard Dealbreakers Filter (Male vs. Female)     │
│    • Tier 2: Weighted Multi-Factor Scoring (0-100)          │
│  - AI Service (Groq LLM Client + Fallback Engine):          │
│    • Semantic Reasoning & Badge Generation                  │
│    • AI Friction Points & Risk Analysis Detector            │
│    • AI Email Pitch Generator                               │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│         DATA LAYER           │        │         AI PROVIDER          │
│ - Seed Database (120+ dummy  │        │ - Groq API (OpenAI-compat)   │
│   Indian profiles)           │        │   Model: gpt-oss-120b /      │
│ - In-memory / JSON store with │        │   llama-3.3-70b-versatile    │
│   local persistence          │        │ - Offline Smart Fallback     │
│ - Match Notes & Dispatched   │        │   Generator (zero failure)   │
│   Matches tracker            │        │                              │
└──────────────────────────────┘        └──────────────────────────────┘
```

---

## 3. Detailed Data Models & Biodata Specification

### 3.1 Customer / Client Model (`Customer`)
Each profile includes the base assessment fields plus essential Indian matchmaking fields identified in research:

| Category | Field Name | Type | Options / Example Values |
| :--- | :--- | :--- | :--- |
| **Identity & Core** | `id` | String / UUID | `cust_001` |
| | `first_name`, `last_name` | String | e.g. "Rohan", "Mehta" |
| | `gender` | Enum | `Male`, `Female` |
| | `dob` / `age` | Date / Number | e.g. `1995-04-12` (29 years) |
| | `height_cm` / `height_ft` | Number / String | e.g. `178` (5'10") |
| | `photo_url` | String | High-quality portrait avatar |
| **Contact & Location** | `email`, `phone` | String | e.g. `rohan.m@example.com`, `+91 98765 43210` |
| | `city`, `country` | String | Mumbai, Bengaluru, Delhi NCR, Pune, Hyderabad |
| **Professional** | `ug_college`, `degree` | String | IIT Bombay (B.Tech), SRCC (B.Com), BITS Pilani |
| | `company`, `designation` | String | Google (Staff SDE), McKinsey (Associate Partner) |
| | `income_lpa` | Number (INR) | e.g. `45` (₹45 LPA) |
| **Cultural & Family** | `marital_status` | Enum | `Never Married`, `Divorced`, `Awaiting Divorce` |
| | `caste`, `religion` | String | Hindu (Brahmin / Baniya / etc.), Jain, Sikh, etc. |
| | `mother_tongue` / `languages`| Array[String] | Hindi, English, Gujarati, Marathi, etc. |
| | `siblings` | String | "1 elder sister (married)", "Only child" |
| | `family_type` | Enum | `Nuclear`, `Joint` |
| **Lifestyle & Values** | `want_kids` | Enum | `Yes`, `No`, `Maybe` |
| | `open_to_relocate` | Enum | `Yes`, `No`, `Maybe` |
| | `open_to_pets` | Enum | `Yes`, `No`, `Maybe` |
| | `diet` | Enum | `Vegetarian`, `Non-Vegetarian`, `Eggetarian`, `Jain`, `Vegan` |
| | `drinking`, `smoking` | Enum | `Non-Drinker`, `Socially`, `Regular` / `Non-Smoker`, `Occasionally` |
| | `manglik_status` | Enum | `Non-Manglik`, `Manglik`, `Anshik Manglik`, `Doesn't Matter` |
| **Pipeline Tracking** | `status_tag` | Enum | `New`, `Interviewing`, `Active Matching`, `Matches Sent`, `Matched` |
| | `matchmaker_id` | String | Assigned matchmaker ID |

### 3.2 Matchmaker Model (`Matchmaker`)
- `id`, `name` (e.g., Priya Sharma), `email`, `role` (Senior Matchmaker), `assigned_client_count`.

### 3.3 Match Notes Model (`MatchNote`)
- `id`, `customer_id`, `matchmaker_id`, `note_text`, `category` (`Call`, `In-Person`, `Preferences Update`), `created_at`.

### 3.4 Dispatched Match Log (`DispatchedMatch`)
- `id`, `client_id`, `match_id`, `compatibility_score`, `email_subject`, `email_body`, `sent_at`, `client_feedback` (`Pending`, `Liked`, `Passed`).

---

## 4. Innovative Matching Engine & AI Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                         CANDIDATE POOL (100+ Profiles)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               TIER 1: HARD DEALBREAKERS (Algorithmic Gate)             │
│  MALE CLIENT RULES:                  FEMALE CLIENT RULES:              │
│  - Candidate strictly younger        - Career & income parity          │
│  - Candidate strictly earns less     - Relocation harmony              │
│  - Candidate strictly shorter        - Dealbreaker compatibility       │
│  - Strict alignment on "Want Kids"                                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Passed Candidates)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│           TIER 2: WEIGHTED SOFT COMPATIBILITY MATRIX (0 - 100)         │
│  - Pedigree & Career Synergy (25%)   - Relocation & Geography (15%)    │
│  - Lifestyle & Habits Harmony (25%)  - Age & Height Delta Curves (10%) │
│  - Cultural & Family Harmony (25%)                                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Ranked Shortlist)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             AI REASONING & RISK INTELLIGENCE LAYER (Groq LLM)          │
│  1. Match Score Refinement & Reasoning Badge (e.g., "High Potential")  │
│  2. Synergy Highlights (Shared values, college tier, mutual passions) │
│  3. AI Friction Points & Risk Analysis (Joint vs Nuclear, Diet, etc.)   │
│  4. Concierge Intro Email Pitch Generator (One-click Send Match)       │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Tier 1: Hard Dealbreaker Gateways (Pass / Fail Gate)

#### **A. For Male Clients (Evaluating Female Candidates)**
1. **Strict Age Dealbreaker:** Candidate must be strictly younger:
   $$\text{Age}_{\text{candidate}} < \text{Age}_{\text{client}}$$
2. **Strict Income Dealbreaker:** Candidate must earn strictly less:
   $$\text{Income}_{\text{candidate}} < \text{Income}_{\text{client}}$$
3. **Strict Height Dealbreaker:** Candidate must be strictly shorter:
   $$\text{Height}_{\text{candidate}} < \text{Height}_{\text{client}}$$
4. **Strict Kids Outlook:** Views on children must align (`Yes` with `Yes`, `No` with `No`, `Maybe` acceptable with both).
*Candidates failing ANY of these 4 rules are immediately gated out.*

#### **B. For Female Clients (Evaluating Male Candidates)**
1. **Career & Financial Parity:** Candidate must earn equal or higher income bracket ($\text{Income}_{\text{candidate}} \ge \text{Income}_{\text{client}}$ or verified high-trajectory role).
2. **Relocation Harmony:** If the female client is `Open to Relocate: No`, the male candidate must reside in the same city or be `Open to Relocate: Yes`.
3. **Core Dealbreakers:** Respects strict non-negotiables (e.g. strict vegetarian requirement, non-smoker).
*Candidates failing these rules are filtered out.*

---

### 4.2 Tier 2: Weighted Soft Compatibility Matrix (0–100 Composite Score)

For candidates passing Tier 1, a multi-dimensional weighted score is computed:

$$\text{Composite Score} = \sum (W_i \times S_i)$$

| Dimension | Weight | Scoring Criteria |
| :--- | :---: | :--- |
| **1. Pedigree & Career Synergy** | **25%** | Tier-1 College matching (IIT/IIM/BITS/SRCC/Top US), corporate seniority tier, complementary career paths (e.g., Tech + Product/Finance). |
| **2. Lifestyle & Habits Harmony** | **25%** | Dietary alignment (Strict Veg/Jain vs Non-Veg compatibility), Smoking & Drinking habit matching, Pets compatibility (`Yes` $\leftrightarrow$ `Yes`). |
| **3. Cultural & Family Harmony** | **25%** | Religion & Community compatibility, Mother tongue overlap, Manglik compatibility (Manglik $\leftrightarrow$ Manglik or Non-Manglik), Family structure adaptability (Nuclear vs. Joint). |
| **4. Relocation & Geography** | **15%** | Same city = 100 pts; different city with willing relocation = 80 pts; cross-metro = 40 pts. |
| **5. Age & Height Delta Optimum** | **10%** | Closeness to cultural sweet spot (e.g., 2–4 years age delta, 3–6 inch height delta). |

---

### 4.3 AI Reasoning & Risk Intelligence Layer (Groq LLM)

Unlike standard matchmaking tools that only generate positive praise, TDC's AI engine acts as a **candid decision-support advisor** for the matchmaker:

#### **1. Positive Synergy & Reasoning Badge**
- Generates a headline badge: `"High Potential Match"`, `"Exceptional Lifestyle Synergy"`, or `"Strong Professional Alignment"`.
- Highlights 2–3 positive synergy pillars (e.g., *"Both graduated from Tier-1 institutions in Mumbai, work in fast-paced tech, and share a passion for dogs"*).

#### **2. AI Friction Points & Risk Analysis (Innovative Feature)**
- The LLM explicitly scans for subtle relationship risks, family mismatches, or lifestyle conflicts that could cause friction down the road:
  - **Family Structure Risk:** e.g., *"⚠️ Family Dynamics: Rohan envisions living in a joint family setup, whereas Sneha has indicated a preference for nuclear living. Advise matchmaker to address early."*
  - **Dietary & Lifestyle Risk:** e.g., *"⚠️ Dietary Nuance: Rohan is a strict vegetarian while Sneha is non-vegetarian. Confirm comfort with non-veg dining."*
  - **Relocation Burden:** e.g., *"⚠️ Career Mobility: Sneha is based in Bengaluru with no plans to move; Rohan is open to relocate but holds an on-site role in Mumbai."*
- Gives the matchmaker deep confidence and talking points prior to pitching the match.

#### **3. Personalized Concierge Intro Email (`POST /api/matches/draft-email`)**
- Drafts an elegant, warm, bespoke introduction email pitching the candidate to the client:
  - Concise profile highlight card.
  - 2–3 shared lifestyle/interest points.
  - Suggests 2 personalized icebreaker topics.
  - Editable by the matchmaker before dispatching.

#### **4. AI Interactive Prompt Re-ranking / Match Steering (`POST /api/matches/rerank`) (Innovative Feature)**
- Allows the matchmaker to steer the recommendation engine dynamically using natural language:
  - e.g., *"Prioritize strict vegetarians in tech startups who want to live in Mumbai"* or *"Focus on IIT/BITS alumni with nuclear family preference"*.
  - Groq (`openai/gpt-oss-120b`) evaluates candidates against the specific prompt in real-time.
  - Dynamically updates candidate scores, awards custom steering badges, generates prompt-tailored synergy rationales, and re-orders the candidate pool live.
  - Provides 1-click preset prompt pills and instant "Reset to Standard Engine" capability.

#### **5. Offline Smart Fallback**
- An internal deterministic reasoning generator ensures all scores, friction warnings, email templates, and prompt reranking render seamlessly even without an external API key.

---

## 5. UI/UX Specifications & Design System

### 5.1 Visual Language
- **Brand Identity:** High-touch, confidential matrimonial concierge.
- **Color Palette:**
  - Primary: Deep Midnight Navy (`#0F172A`)
  - Accent / Primary CTA: Warm Rose / Coral (`#E11D48` / `#F43F5E`)
  - Risk / Friction Warning: Soft Amber / Gold (`#F59E0B` / `#FEF3C7`)
  - Compatibility High: Emerald Green (`#10B981` / `#D1FAE5`)
  - Canvas: Pristine Pearl / Soft Slate (`#F8FAFC`)
- **Typography:** Modern sans-serif (Inter / Plus Jakarta Sans).
- **Icons:** Lucide React icons.

### 5.2 Key Views & Features

#### 1. Authentication Screen (`/login`)
- Matchmaker portal login with email & password.
- **One-Click Quick Login:** *"Sign in as Priya Sharma (Senior Matchmaker)"*.

#### 2. Matchmaker Dashboard (`/dashboard`)
- **Pipeline Metrics Bar:** Active Clients, Matching In-Progress, Introductions Sent, Feedback Pending.
- **Pipeline Filter Tabs:** `All`, `New`, `Interviewing`, `Active Matching`, `Matches Sent`, `Matched`.
- **Search & Filter Bar:** Instant filtering by Name, City, Age, Gender, Status.
- **Client Cards Grid:** Photo, Name, Age, Location, Role, CTC, Status Tag dropdown, and "Open Profile" button.

#### 3. Customer Detailed View (`/customer/:id`)
- **Header:** Client summary banner, quick status tag switcher, contact badges.
- **Tab 1: Comprehensive Biodata:**
  - Personal & Physical, Education & Career, Cultural & Family, Lifestyle & Habits, Dealbreakers.
- **Tab 2: Suggested Matches (Two-Tier Engine & AI Insights):**
  - **Rule Banner:** Displays active Tier 1 dealbreakers applied for this client.
  - **AI Match Steering Copilot Bar:** Natural language prompt input with 1-click preset pills and real-time reranking.
  - **Ranked Match Cards:**
    - Match score dial (e.g., `94% Match`).
    - AI Reasoning Badge (`High Potential Match` or custom steered badge).
    - **Synergy Highlights Card** (Green tint).
    - **AI Friction Points & Risk Analysis Card** (Amber tint with warning icon).
    - Side-by-side attribute comparison table toggle.
- **Tab 3: Dispatched Matches & Client Feedback Lifecycle (Innovative Feature):**
  - **Milestone Pipeline Bar:** Real-time counter across all 6 feedback stages (`Sent`, `Awaiting Client Feedback`, `Client Interested`, `Intro Call Scheduled`, `First Date Arranged`, `Client Passed`).
  - **Interactive Lifecycle Status Dropdown:** Easily advance each match through dating milestones with auto-logged interaction notes.
  - **Client Feedback & Debrief Box:** Add and edit qualitative notes regarding client impressions, date outcomes, and next steps.
  - **Dispatched Email Viewer:** Expandable viewer displaying the exact AI introduction email sent to the client.
- **Tab 4: Matchmaker Notes Timeline:**
  - Meeting & call logs with timestamp and category tag.

#### 4. Side-by-Side Biodata Deep-Dive Drawer (Innovative Feature)
- Slide-over comparison drawer opening directly over the candidate list.
- **Compatibility & Delta Strip:** Instant visual comparison of Age Delta, Height Delta, CTC Comparison, Diet Harmony, and Relocation/Kids alignment.
- **AI Synergy & Friction Breakdown:** Live display of top alignment points and potential risks.
- **Dual-Column Synchronized Biodata:** Side-by-side comparison across all 5 matrimonial dimensions (Personal, Career, Family, Habits, Dealbreakers).
- **Direct Dispatch Trigger:** "Proceed to Dispatch Introduction" button directly from inside the drawer.

#### 5. "Send Match" Modal
- Displays candidate profile snapshot.
- Displays AI friction alerts so matchmaker has full context before sending.
- **AI-Generated Introduction Email Preview** (editable Subject and Body).
- "Confirm & Send Match" button dispatches email, shows success toast, and updates client status to `Matches Sent`.

---

## 6. End-to-End Project Execution Roadmap

```
Phase 1: Project Scaffolding & Seed Data (100+ Profiles)
   ├── Initialize Next.js 14+ Frontend & Express Backend
   ├── Setup TypeScript types & schemas
   └── Generate 120+ authentic Indian matchmaking profiles (60M / 60F)
        │
Phase 2: Express Backend Services & Two-Tier Engine
   ├── Auth endpoints & session middleware
   ├── Customer CRUD & Matchmaker Notes API
   ├── Two-Tier Matching Engine (Tier 1 Dealbreakers + Tier 2 Weighted Scoring)
   └── Groq AI Service (Reasoning + AI Friction Analysis + Email Drafting)
        │
Phase 3: Frontend Dashboard & Biodata Views
   ├── Build Design System (Navy, Rose, Amber risk tints, Lucide icons)
   ├── Matchmaker Login screen with one-click demo credentials
   ├── Dashboard: Pipeline metrics, client grid, search, and filters
   └── Customer Detail View: Full Biodata breakdown & Notes timeline
        │
Phase 4: AI Matching UI & Send Match Workflow
   ├── Build Suggested Matches tab with Score Dials, Synergy & Friction Cards
   ├── AI Match Steering Copilot (Natural language prompt re-ranking via Groq)
   ├── Side-by-Side Biodata Deep-Dive Drawer (Delta matrix & dual-column comparison)
   ├── Implement "Send Match" modal with live AI email generation
   └── Connect interactive status tag updates and toast notifications
        │
Phase 5: Verification, Testing & Submission Deliverables
   ├── Unit test Two-Tier matching algorithm (dealbreaker gate assertions)
   ├── Manual end-to-end user flow testing
   └── Prepare Submission Write-Up (Custom Matching Logic, AI Design, Assumptions)
```

---

## 7. Step-by-Step Task Breakdown

### Phase 1: Architecture Setup & Data Modeling
1. **Initialize Project Structure:**
   - `frontend/`: Next.js 14 App Router, Tailwind CSS, Lucide React.
   - `backend/`: Node.js, Express, TypeScript, CORS, dotenv.
2. **Seed Dataset Generation (`data/profiles.json`):**
   - Create **120+ realistic Indian profiles** (60 male, 60 female) reflecting authentic Indian demographics (IIT/IIM/BITS/SRCC alumni, tech/finance/creative/medical professions, Tier-1 metros, diverse castes, Manglik statuses, diets).

### Phase 2: Express Backend API & Two-Tier Engine
1. **API Endpoints:**
   - `POST /api/auth/login`: Authenticate matchmaker.
   - `GET /api/customers`: Fetch assigned client list with pipeline filters.
   - `GET /api/customers/:id`: Fetch complete client biodata.
   - `POST /api/customers/:id/notes`: Add interaction/call note.
   - `POST /api/customers/:id/status`: Update customer pipeline status.
   - `POST /api/matches/generate/:id`: Run Two-Tier Matching Logic + Groq AI Scoring & Friction Analysis.
   - `POST /api/matches/draft-email`: Generate personalized match pitch email via Groq.
2. **Matching Engine Logic (`backend/services/matchingEngine.ts`):**
   - **Tier 1 Gate:** Strict male (younger, shorter, lower earning, matching kids) and female (career parity, relocation) dealbreakers.
   - **Tier 2 Matrix:** Weighted scoring across Pedigree (25%), Lifestyle (25%), Cultural (25%), Relocation (15%), Delta (10%).
3. **Groq AI Service (`backend/services/groqService.ts`):**
   - Prompt templates for positive reasoning, **AI friction point detection**, and concierge email pitch generation.
   - Offline fallback engine ensuring 100% uptime.

### Phase 3: Frontend Dashboard & Biodata Views
1. **Authentication Flow (`/login`):** Matchmaker portal with one-click demo credentials.
2. **Main Dashboard (`/dashboard`):** Pipeline metrics, stage filter tabs, search, client grid.
3. **Customer Detail View (`/customer/:id`):** Header status switcher, Tab 1 Biodata, Tab 3 Notes log.

### Phase 4: Matching UI, AI Steering & "Send Match" Action
1. **Suggested Matches View (Tab 2):**
   - Active dealbreaker rule banner.
   - **AI Match Steering Copilot Bar:** Natural language re-ranking (`POST /api/matches/rerank`) with 1-click preset pills and reset option.
   - Ranked match cards with Score Dials, Synergy Highlights, and **AI Friction Risk Badges**.
2. **Side-by-Side Biodata Deep-Dive Drawer:**
   - Quick Delta comparison strip (Age, Height, CTC, Diet, Relocate/Kids).
   - Synchronized dual-column biodata inspection table across all 5 sections.
3. **"Send Match" Interactive Modal:**
   - Match summary snapshot, friction warnings preview, AI email editor, and "Dispatch Match" action.

### Phase 5: Verification & Deliverables
1. **Automated Verification:** Comprehensive test suite (`npm test`) validating Tier 1 dealbreakers (100% compliance), Tier 2 weighted matrix, Groq AI friction detection, and AI Copilot prompt re-ranking.
2. **Deliverables Document (`submission_writeup.md`):** Write-up on Custom Matching Logic, AI Design, Assumptions, and demo credentials.

---

## 8. Definition of Done (Assessment Checklist)

- [x] Matchmaker login screen working with sample credentials.
- [x] Dashboard showing all assigned clients with Name, Age, City, Marital Status, and Status Tag.
- [x] Clicking a customer opens full detailed biodata view with all mandatory + Indian research fields.
- [x] At least 100 dummy profiles of the opposite gender loaded in the database/pool (210 pool candidates + 12 assigned clients).
- [x] **Tier 1 Hard Dealbreaker Gate** strictly enforced (Male: younger, shorter, earns less, kids; Female: career parity, relocation).
- [x] **Tier 2 Weighted Soft Compatibility Matrix** active (Pedigree, Lifestyle, Cultural, Relocation, Delta).
- [x] **AI Integration active:** Groq LLM scoring/ranking with reasoning badges (`openai/gpt-oss-120b`).
- [x] **AI Friction Points & Risk Analysis** dynamically identifies potential lifestyle/family misalignments with talking points.
- [x] **AI Match Steering Copilot:** Plain-English prompt re-ranking with preset pills and instant reset.
- [x] **Side-by-Side Comparison Drawer:** Visual delta matrix and synchronized head-to-head biodata evaluation.
- [x] "Send Match" button with interactive modal, AI email preview, editable fields, and dispatch trigger.
- [x] Matchmaker notes feature implemented to record meeting logs.
- [x] Clean, modular, well-commented code in Next.js + Node/Express.
- [ ] 2–3 paragraph custom matching logic write-up ready for submission email.
