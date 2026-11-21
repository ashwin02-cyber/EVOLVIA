# EVOLVIA — Implementation Plan

**Project:** EVOLVIA — Gamified Productivity System  
**Architecture:** React 18 + Vite + Tailwind CSS + Framer Motion (Frontend) / Django 5 + DRF + Simple JWT + SQLite/PostgreSQL (Backend)  
**Baseline Canvas:** 1672 × 941 (Desktop Baseline) / Responsive across 1440, 1024, 768, 390 px  

---

## 1. Project Overview & Strategy

EVOLVIA transforms personal goals, study sessions, habits, and tasks into a cyberpunk role-playing progression experience. The primary priority is **pixel-perfect visual fidelity to the authoritative UI reference dashboard**, supported by a production-grade full-stack backend with an immutable XP ledger, server-authoritative gamification rules, persistent focus timers, and intelligent AI assistance.

### Execution Phases:
- **Phase 0 — Document and Project Audit:** Establish requirements matrix, visual QA guidelines, implementation plan, and asset registry.
- **Phase 1 — Project Foundation:** Setup React + Vite frontend with Tailwind design tokens, setup Django backend with apps, authentication, and core database models.
- **Phase 2 — Design System & Authoritative Dashboard:** Build the complete Home dashboard faithfully matching `EVOLVIA Cyberpunk Productivity Dashboard.png` with reusable glassmorphic components, animations, and seed data.
- **Phase 3 — Backend Implementation:** Implement all Django apps, models, migrations, service layers (`gamification/services.py`, `focus/services.py`, `achievements/services.py`), API viewsets, and automated tests.
- **Phase 4 — Frontend Integration:** Integrate TanStack Query and Axios clients with backend endpoints, replacing seed data with live API state, optimistic UI mutations, and real-time XP counters.
- **Phase 5 — Remaining Screens:** Implement Quest Board (Kanban & List), Focus Arena, Habits, My World, Achievements catalog, Leaderboard, Analytics charts, Questline Detail, Evo AI drawer & modal, Notifications, Settings, and Auth screens.
- **Phase 6 — Testing & Quality Assurance:** Execute end-to-end user workflows, test XP concurrency, verify idempotent completion, ensure timer survivability, and validate responsive layouts.
- **Phase 7 — Visual Audit & Polish:** Side-by-side comparison against reference image at 1672 × 941, verify glow, color tokens, typography, and document findings in `docs/visual-QA.md`.

---

## 2. Technical Stack Details

### Frontend
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS with custom theme extensions (`#050505` Jet Black, `#3B0A6B` Royal Amethyst, `#00E5FF` Electric Cyan, `#F5F3FF`, `#B9B0D4`, `#7D7396`, `#2EE59D`)
- **Animation:** Framer Motion (page transitions, shared layout pills, level-up celebrations, modal popups)
- **State Management:** TanStack Query v5 (server cache & mutations) + React Context (Auth, Toast, FocusTimer, Theme)
- **Icons:** Lucide React (two-tone duotone styled with cyan and amethyst)
- **Charts:** Recharts (XP timeline, focus breakdown, habit heatmap)
- **Forms & Validation:** React Hook Form + Zod
- **Routing:** React Router v6

### Backend
- **Framework:** Python 3.13 + Django 5 + Django REST Framework (DRF)
- **Authentication:** `djangorestframework-simplejwt` with token rotation and blacklist
- **Database:** SQLite (local dev) / PostgreSQL compatible
- **API Documentation:** `drf-spectacular` OpenAPI schema
- **AI Integration:** Google Gemini API with robust rule-based fallback planner
- **Architecture:** Clean service layer architecture with models, serializers, views, and domain services.

---

## 3. Detailed Component & Module Mapping

| Module | Frontend View / Component | Backend App & Endpoints |
|---|---|---|
| **App Shell** | `AppShell`, `Sidebar`, `Header`, `MobileTabBar` | `accounts`, `notifications` (`/api/v1/profile/`, `/api/v1/notifications/`) |
| **Home Dashboard** | `Hero`, `ProfileCard`, `TodaysQuests`, `EvoAICard`, `FocusWidget`, `ProgressWidget`, `AchievementsWidget`, `QuestlineBanner` | `core/dashboard` (`/api/v1/dashboard/`, `/api/v1/rewards/daily-login/claim/`) |
| **Quest Management** | `QuestBoard`, `QuestCard`, `QuestCreateModal`, `QuestFilterBar` | `quests` (`/api/v1/quests/`, `/api/v1/quests/{id}/complete/`, `/api/v1/quests/preview-xp/`) |
| **Gamification Engine** | `LevelUpOverlay`, `XPCounter`, `AchievementToast` | `gamification` (`/api/v1/xp/transactions/`, `/api/v1/xp/summary/`, `/api/v1/stats/`) |
| **Focus Arena** | `FocusArena`, `CircularTimer`, `FocusHistory` | `focus` (`/api/v1/focus/sessions/`, `/api/v1/focus/sessions/{id}/complete/`) |
| **Habits** | `HabitsPage`, `HabitCard`, `HabitHeatmap` | `habits` (`/api/v1/habits/`, `/api/v1/habits/{id}/check-in/`) |
| **Achievements** | `AchievementsPage`, `AchievementBadge` | `achievements` (`/api/v1/achievements/`, `/api/v1/achievements/recent/`) |
| **Questlines** | `QuestlinesPage`, `QuestlineDetail`, `MilestoneTimeline` | `questlines` (`/api/v1/questlines/`, `/api/v1/questlines/{id}/milestones/{mid}/complete/`) |
| **Evo AI** | `EvoDrawer`, `EvoChat`, `PlanDayModal` | `ai_assistant` (`/api/v1/ai/status/`, `/api/v1/ai/chat/`, `/api/v1/ai/plan-day/`) |
| **Analytics** | `AnalyticsPage`, `XPChart`, `FocusChart`, `HabitMatrix` | `analytics` (`/api/v1/analytics/xp/`, `/api/v1/analytics/quests/`, `/api/v1/analytics/focus/`) |
| **My World & Rewards** | `MyWorldPage`, `RewardsShop`, `Inventory` | `rewards` (`/api/v1/rewards/`, `/api/v1/inventory/`, `/api/v1/leaderboard/`) |
| **Settings** | `SettingsPage` | `accounts` (`/api/v1/profile/`, `/api/v1/export/`) |

---

## 4. Milestones and Checkpoints
1. [x] Phase 0 Audit & Planning
2. [ ] Phase 1 Backend & Frontend Scaffolding
3. [ ] Phase 2 Pixel-Perfect Home Dashboard with Theme & Reusable UI
4. [ ] Phase 3 Full Backend Implementation & Migrations
5. [ ] Phase 4 End-to-End API Integration
6. [ ] Phase 5 Remaining Screens
7. [ ] Phase 6 Comprehensive Testing
8. [ ] Phase 7 Visual QA & Release Verification
