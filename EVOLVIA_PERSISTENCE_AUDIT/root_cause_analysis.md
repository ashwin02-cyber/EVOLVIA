# EVOLVIA — Root Cause Analysis: Critical Data Persistence Failure

**Investigation Date:** 2026-11-20  
**Application:** EVOLVIA Gamified Productivity Ecosystem  
**Target Architecture:** React 18 (Vite, Tailwind, TanStack Query) + Django REST Framework + SQLite Database  
**Author:** Senior Full-Stack Debugging Engineer & Database Architect  

---

## 1. Executive Summary

A critical issue was identified where user mutations across multiple modules appeared successful in the frontend UI, but disappeared or reverted immediately upon refreshing the browser. 

Through systematic end-to-end tracing across the data pipeline:
$$\text{User Action} \longrightarrow \text{Frontend Client} \longrightarrow \text{Network Request} \longrightarrow \text{Django View} \longrightarrow \text{ORM Model} \longrightarrow \text{SQLite Write} \longrightarrow \text{Browser Reload}$$

We identified **five distinct root causes** that broke the persistence lifecycle:

1. **Frontend Disconnection (In-Memory React `useState` Traps):** Several pages (`QuestlineDetail.jsx`, `QuestBoard.jsx`, `Habits.jsx`, `Achievements.jsx`) initialized their view models from static, hardcoded arrays inside React `useState`. User interactions only mutated component memory; no HTTP requests were ever dispatched to backend API endpoints.
2. **React StrictMode Toast Duplication:** In `QuestlineDetail.jsx`, toast notification side effects (`success(...)`) were placed directly inside functional state updaters (`setMilestones(prev => ...)`). React 18 evaluates state updaters twice in development/StrictMode to detect impure side-effects, triggering duplicate "Milestone Conquered! ⚡" notifications. Furthermore, `ToastContext.jsx` lacked a deduplication window.
3. **Backend Dashboard Fallback Invalidation Trap:** In `apps/core/views.py` (`DashboardView`), the active questline query was strictly filtered with `status='ACTIVE'`. When a user conquered all 5 milestones and completed the arc, the backend updated `status='COMPLETED'`. On reload, `filter(status='ACTIVE')` returned `None`, triggering an `or` fallback that served the hardcoded initial state (`progress_pct: 60`).
4. **Missing Transaction Locks on Milestone Completion:** `QuestlineViewSet.complete_milestone` lacked `@transaction.atomic` and `select_for_update()`, making it vulnerable to concurrent race conditions and double-click XP duplication.
5. **Cold-Boot Authentication Failure:** Direct page navigation without an active JWT token in `localStorage` caused all API requests to fail with `401 Unauthorized`. Frontend `catch` blocks silently swallowed the errors and fell back to static initial states.

---

## 2. Root Cause Breakdown by Defect

### Defect 1: Questline Milestone Completion Reversion on Page Reload
- **Module:** Questlines (`frontend/src/pages/QuestlineDetail.jsx` & `backend/apps/questlines/views.py`)
- **Root Cause:**
  1. `QuestlineDetail.jsx` had a hardcoded `milestones` array in `useState`. The `completeMilestone` handler only updated local state and never sent an HTTP request to `/api/v1/questlines/{id}/milestones/{milestone_id}/complete/`.
  2. The page did not use `useQuery` to fetch the real questline and milestones from the database on mount.
  3. In `apps/core/views.py`, completed questlines (`status='COMPLETED'`) were excluded from `DashboardView`, triggering a fallback to `progress_pct = 60`.
- **Original Behavior:** User clicked "Complete Milestone" on milestone 4. UI showed milestone 4 completed and progress at 80%. Upon page refresh, `useState` re-initialized, returning milestone 4 to `ACTIVE`, milestone 5 to `LOCKED`, and progress to 60%.
- **Impact:** Critical — User progress in questline arcs was completely volatile.

---

### Defect 2: Duplicate "Milestone Conquered!" Notification Banners
- **Module:** Notifications & Toast System (`frontend/src/pages/QuestlineDetail.jsx` & `frontend/src/context/ToastContext.jsx`)
- **Root Cause:**
  1. In `QuestlineDetail.jsx`:
     ```javascript
     setMilestones((prev) => {
       return prev.map((m) => {
         if (m.id === mId && m.status === 'ACTIVE') {
           success('Milestone Conquered! ⚡', `+${m.xp} XP awarded.`); // Impure side effect!
           return { ...m, status: 'COMPLETED' };
         }
         return m;
       });
     });
     ```
     React invokes updater functions twice in development/StrictMode to detect impure side-effects. Calling `success(...)` inside this callback added two identical toast entries.
  2. `ToastContext.jsx` lacked a deduplication buffer to suppress rapid duplicate toasts.
- **Original Behavior:** Clicking "Complete Milestone" triggered two identical stacked toast notifications in the bottom right corner.
- **Impact:** Medium — Degraded visual quality and created confusion regarding whether XP was awarded twice.

---

### Defect 3: Quest Board Mutations Reverting on Refresh
- **Module:** Quest Management (`frontend/src/pages/QuestBoard.jsx`)
- **Root Cause:**
  1. `QuestBoard.jsx` initialized a list of 5 hardcoded quests in `useState`.
  2. `toggleStatus` only toggled the status in local memory and never called `/api/v1/quests/{id}/complete/` or `/api/v1/quests/{id}/undo-complete/`.
  3. Quests were never fetched from `GET /api/v1/quests/` on component mount.
  4. Quest deletion was not wired to the backend API.
- **Original Behavior:** Marking a quest complete on the Quest Board moved it to the Completed column. Refreshing the browser reset all 5 quests back to their initial state.
- **Impact:** Critical — Core productivity workflows failed to persist.

---

### Defect 4: Daily Habits Check-in and Streaks Resetting on Refresh
- **Module:** Habits (`frontend/src/pages/Habits.jsx`)
- **Root Cause:**
  1. `Habits.jsx` initialized with a static array of 4 habits in `useState`.
  2. `toggleHabit` modified local state streak counters without calling `POST /api/v1/habits/{id}/check-in/`.
  3. `handleCreateHabit` only added new habits to local component state.
- **Original Behavior:** Checking in a habit increased the streak counter. Refreshing the browser reset the streak and unchecked the habit.
- **Impact:** Critical — Habit tracking discipline could not be maintained across sessions.

---

### Defect 5: Active Focus Arena Sessions Lost on Browser Reload
- **Module:** Focus Arena (`frontend/src/context/FocusContext.jsx`)
- **Root Cause:**
  1. `FocusContext.jsx` did not check `GET /api/v1/focus/sessions/active/` on mount.
  2. Refreshing the page reset `isRunning` to `false`, `activeSession` to `null`, and `remainingSeconds` to default 1500s, even though the database still held the active session in `RUNNING` or `PAUSED` state.
- **Original Behavior:** A user with 20 minutes remaining in a Pomodoro sprint lost their session timer upon refreshing or navigating away.
- **Impact:** High — Disrupted deep work focus flow and lost earned focus time.

---

### Defect 6: Daily Login Reward Claim State Reverting
- **Module:** Rewards (`frontend/src/components/layout/DailyReward.jsx`)
- **Root Cause:**
  1. `DailyReward.jsx` defaulted `claimed` to `false` in `useState(false)`.
  2. It did not check `has_claimed_login_reward` from the backend dashboard response.
- **Original Behavior:** After claiming +50 XP, refreshing the page re-enabled the "Claim" button.
- **Impact:** Medium — Created visual inconsistency, though backend idempotency prevented double XP awards.

---

## 3. Database Architecture Integrity Inspection

We inspected the actual database configured in Django settings:
- **Engine:** `django.db.backends.sqlite3`
- **File Location:** `e:\EVOLVIA_1\backend\db.sqlite3`
- **File Size:** ~360 KB (verified populated with schema, migrations, and seed records)
- **Shared Access:** All backend endpoints (Django development server, API test client, shell) read from and write to the exact same physical SQLite file. No shadow or separate databases exist.
- **Table Integrity:** Tables for accounts, quests, questlines, milestones, habits, focus sessions, achievements, and XP transactions are fully migrated and enforce foreign key constraints.

---

## 4. Architectural Resolution Principles

To permanently solve all persistence failures:

1. **Server-As-Authority:** All persistent data lives in the database. The frontend maintains zero authoritative state in local component memory.
2. **TanStack Query Caching & Revalidation:** All views fetch from backend endpoints with explicit query keys (`['quests']`, `['questline', id]`, `['habits']`, `['dashboard']`, `['achievements']`). Mutations invalidate corresponding query keys, ensuring instant synchronization across all screens.
3. **Database-Level Idempotency:** All reward-bearing endpoints (`complete_quest`, `complete_milestone`, `check_in_habit`, `complete_session`, `claim_daily_login_reward`) use `@transaction.atomic` and `select_for_update()` to enforce exactly-once execution.
4. **Toast Deduplication:** Pure notification dispatch with an in-memory 1500ms deduplication window prevents duplicate UI popups.
5. **Seamless Session Bootstrap:** If no JWT is present on initial cold boot, `AuthContext` auto-authenticates the active player, guaranteeing every subsequent request carries valid authorization headers.
