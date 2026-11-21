
# EVOLVIA — Gamified Productivity Ecosystem
**Transform your goals into quests. Build discipline. Level up your life.**

---

## 1. Project Overview

**EVOLVIA** is a full-stack gamified productivity application that fuses the immersive aesthetic of a futuristic cyberpunk RPG with the high-performance utility of a modern SaaS productivity platform.

The visual design is strictly faithful to the authoritative UI reference (`EVOLVIA Cyberpunk Productivity Dashboard.png`) and adheres to the Software Requirements Specification (`EVOLVIA_SRS.md`).

### Exact 3-Color Visual Identity
- **Jet Black (`#050505`)**: Main app background, deep surfaces, base layer (65%)
- **Royal Amethyst (`#3B0A6B`)**: Card borders, glowing ambient mist, gradient stops (20%)
- **Electric Cyan (`#00E5FF`)**: Primary action buttons, active navigation states, progress indicators, highlights (15%)
- **Derived Neutrals**: Primary text (`#F5F3FF`), Secondary text (`#B9B0D4`), Muted text (`#7D7396`), Success checks (`#2EE59D`), Gold achievements (`#FFC857`)

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS with custom cyberpunk design tokens & glassmorphism
- **Animations:** Framer Motion (page transitions, shared layout pills, celebration modals)
- **Data & State Management:** TanStack Query v5 + React Context (`AuthContext`, `ToastContext`, `FocusContext`)
- **Icons & Visuals:** Lucide React (two-tone duotone styled with cyan and amethyst) + Custom SVG components
- **Forms & Validation:** React Hook Form + Zod
- **Routing:** React Router v6

### Backend
- **Framework:** Python 3.13 + Django 5 + Django REST Framework (DRF)
- **Authentication:** `djangorestframework-simplejwt` (JWT access & refresh tokens)
- **Database:** SQLite (local development) / PostgreSQL compatible
- **API Documentation:** `drf-spectacular` OpenAPI schema (`/api/docs/`)
- **AI Integration:** Google Gemini API with robust rule-based fallback planner
- **Architecture:** Clean service layer architecture with isolated business logic in services (`gamification/services.py`, `quests/services.py`, `focus/services.py`, `achievements/services.py`)

---

## 3. Features Implemented

1. **Pixel-Perfect Home Dashboard:**
   - **Hero Section:** "Ready for today's Quest?", subtitle, 4 action buttons, and moonlit cyberpunk ruins artwork.
   - **Player Profile Card:** Hexagonal avatar frame, Level 12 badge, XP bar (2,450 / 3,000 XP, 82%), Quests Done (24), Day Streak (7), Consistency (86%).
   - **Today's Quests Card:** 5-segment indicator (3 cyan filled), top 3 quest rows with live completion checkboxes.
   - **Evo AI Companion Card:** Floating robot companion, online status dot, rotating suggestion bubble, "Chat with Evo".
   - **Focus Arena Widget:** 25:00 circular arc countdown ring, interactive play button, and mode chips (Pomodoro, Deep Work, Study, Custom).
   - **My Progress Widget:** 7-bar vertical XP chart (Mon–Sun) with cyan-to-amethyst gradient, "+420 XP This Week", "68% Goal Completion".
   - **Achievements Widget:** 3 hexagonal medal badges (Quest Novice, Streak Master, Focus Adept).
   - **Active Questline Banner:** "Exam Preparation Arc" (EPIC), landscape portal artwork, 60% progress bar, "Continue →" button.
   - **Sidebar Daily Login Reward:** Floating glowing amethyst crystal + "+50 XP" card with solid Electric Cyan "Claim" button.
2. **Quest Management:** Full CRUD, Kanban & List views, category filtering, difficulty tiers (Easy 25 XP, Medium 50 XP, Hard 100 XP, Epic 150 XP), estimated time, and idempotent completions.
3. **Gamification Engine:** Server-authoritative XP calculations, immutable XP ledger (`XPTransaction`), closed-form level formula (`need(L) = 250 × L`), rank progression (Quest Novice to Evolved Master), and streak multiplier.
4. **Focus Arena:** Persistent timer that survives page reloads, synthesized audio chimes, pause/resume/abandon states, and server-verified completion rewards.
5. **Habit Tracking:** Daily habit check-ins, 7-day dot completion history, and streak flame counters.
6. **Achievements Catalog:** Hexagonal badge matrix with criteria progress bars and crystal rewards.
7. **Global Leaderboard:** Weekly and all-time player rankings with podium emblems.
8. **Evo AI Assistant & Day Planner:** Chat drawer with quick prompts, structured study planning, and one-click "Add to Quests" capability.
9. **Player World & Rewards Shop:** Character showcase, cosmetic item redemption (avatar frames, streak freezes) using soft currency crystals.
10. **System Settings:** Timezone configuration, neon glow intensity, reduced motion toggle, sound effects toggle, and complete JSON game data export.

---

## 4. Installation and Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (optional)
python -m venv venv
venv\Scripts\activate   # Windows

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed authentic reference demo data (ashwin / evolvia123)
python manage.py seed_demo

# Start Django API server
python manage.py runserver
```
*Backend runs on `http://127.0.0.1:8000`.*
*Interactive API Swagger documentation is available at `http://127.0.0.1:8000/api/docs/`.*

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 5. Seed Credentials

- **Username:** `ashwin`
- **Password:** `evolvia123`
- **Pre-loaded State:** Level 12 (18,950 XP), "Productivity Explorer", 7-day streak, 24 completed quests, 45 crystals, and active "Exam Preparation Arc".

---

## 6. Verification and Testing

To execute automated backend tests verifying gamification formulas, level boundaries, streak math, idempotent quest completion, and daily login rewards:

```bash
cd backend
python manage.py test apps.gamification apps.core
```

To run the production frontend build:
```bash
cd frontend
npm run build
```
*(All 2080 modules transformed and bundled cleanly with zero errors).*

---

## 7. Documentation Index
- `EVOLVIA_SRS.md`: Comprehensive Software Requirements Specification
- `docs/implementation-plan.md`: Architectural strategy and implementation roadmap
- `docs/requirements-traceability.md`: Functional Requirements Traceability Matrix (FR-001 to FR-060)
- `docs/visual-QA.md`: Side-by-side visual audit and responsive breakpoint verification
- `ASSETS.md`: Asset registry, image resolutions, and licensing documentation
=======
# EVOLVIA
EVOLVIA is a gamified productivity web application that transforms everyday goals, tasks, habits, and focus sessions into an RPG-inspired progression experience. Name : Ashwin Bhalaji A E ,RollNo. : 25BCA007
>>>>>>> 4f00b2c8d42951d3071e9b0002d7186d1cbc6876
