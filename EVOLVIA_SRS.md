# EVOLVIA — GAMIFIED PRODUCTIVITY SYSTEM
## Software Requirements Specification (SRS)

**Tagline:** Transform your goals into quests. Build discipline. Level up your life.

---

# 1. Title Page

| Item | Value |
|---|---|
| Product | EVOLVIA — Gamified Productivity System |
| Document | Software Requirements Specification |
| Version | 1.0 (Implementation-Ready) |
| Date | 20 November 2026 |
| Audience | Google Antigravity IDE (primary implementer), reviewers, QA |
| Companion artifact | EVOLVIA UI reference image (dashboard screenshot) — **primary visual authority** |
| Status | Approved for implementation |

---

# 2. Document Control and Version History

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-11-18 | SRS Engineering | Initial analysis of reference image and problem statement |
| 0.9 | 2026-11-19 | SRS Engineering | Gamification engine, database and API drafted |
| 1.0 | 2026-11-20 | SRS Engineering | Full specification issued |

**Conventions.** "SHALL" = mandatory. "SHOULD" = strongly recommended. "MAY" = optional. Requirement IDs: `FR-###` (functional), `NFR-###` (non-functional), `AST-##` (assets), `API-###` (endpoints). Priority: **M** = Must (MVP), **S** = Should, **C** = Could (optional enhancement).

---

# 3. Table of Contents

1. Title Page · 2. Document Control · 3. Table of Contents · 4. Introduction · 5. Purpose · 6. Scope · 7. Product Overview · 8. Target Users · 9. Product Perspective · 10. Assumptions and Constraints · 11. Functional Requirements · 12. Detailed Module Specifications · 13. UI/UX Design Requirements (incl. **Mandatory Visual Implementation Directive**) · 14. Design System and Visual Guidelines · 15. Screen-by-Screen Specifications · 16. Gamification Engine · 17. System Architecture · 18. Database Design · 19. ER Diagram · 20. API Specifications · 21. User Workflows · 22. Non-Functional Requirements · 23. Security Requirements · 24. Error Handling · 25. Testing and Acceptance Criteria · 26. Deployment Requirements · 27. Future Enhancements · 28. Glossary

---

# 4. Introduction

EVOLVIA is a web application that turns personal goals, study tasks, habits and focus time into a role-playing-style progression experience. Users create **quests**, complete them to earn **XP**, **level up**, advance **ranks**, unlock **achievements**, keep **streaks**, run **focus sessions**, follow multi-step **questlines**, and consult an AI planner (**Evo AI**). The look is futuristic cyberpunk: near-black surfaces, amethyst depth, electric-cyan highlights.

The attached reference image shows the "Home" dashboard for a sample player (Ashwin Bhalaji, Level 12, Productivity Explorer, 2,450/3,000 XP). That image is the specification for the dashboard's visual design; this document supplies everything the image cannot: behavior, data, rules, APIs and architecture.

# 5. Purpose

1. Give the implementation environment an unambiguous, testable description of what to build.
2. Ensure the result is a **real working full-stack application** (persistent data, real auth, real XP math), not a static mockup.
3. Lock down visual fidelity to the reference image and the three-color palette.

# 6. Scope

**In scope (MVP, priority M/S):** authentication and profile; dashboard ("Home"); quest board and CRUD; XP/level/rank engine; habits and streaks; achievements and badges; Focus Arena (Pomodoro/Deep Work/Study/Custom); analytics; questlines and milestones; daily login reward; notifications; Evo AI chat/planner with graceful fallback; leaderboard; settings; seed-data mechanism.

**Optional (C):** reward shop/inventory redemption beyond cosmetic items, friends/guilds, social sharing, PWA offline mode, email/push reminders (see §27).

**Out of scope:** native mobile apps, payments, multi-tenant admin consoles, third-party calendar sync (future).

# 7. Product Overview

```
 Create Quest ─► Complete Quest ─► XP Transaction ─► Level / Rank ─► Achievements
      ▲                                  │                  │              │
      │                                  ▼                  ▼              ▼
  Evo AI plans ◄──── Analytics ◄──── Streaks ◄──── Focus Sessions ◄── Notifications
```

Core loop: **Plan → Do → Earn → Reflect → Repeat.**

# 8. Target Users

| Persona | Description | Key needs |
|---|---|---|
| Student (primary) | College learner (e.g., BCA student) juggling assignments, exams, projects | Exam-prep questlines, focus timer, streaks |
| Self-improver | Young professional building habits | Habit tracking, consistency metrics |
| Gamer-minded planner | Motivated by progression systems | XP, ranks, achievements, leaderboard |

# 9. Product Perspective

Standalone SPA (React) consuming a REST API (Django REST Framework). Optional external dependency: Gemini API for Evo AI. No other external dependencies are required for core function. All core features SHALL work offline from AI (see FR-052).

# 10. Assumptions and Constraints

| ID | Assumption / constraint |
|---|---|
| A-01 | Reference image is 1672×941 (≈16:9). Design baseline is a **1440–1672 px wide desktop**; tablet/mobile derive from it (§22). |
| A-02 | The reference shows "3 of 5 completed" but lists only three rows (two checked, one open). **Resolution:** the dashboard card shows the **top 3 items** of today's list (open items first sorted by XP desc, then completed), the segmented bar always shows all 5 segments (3 filled), and a "View all" link opens the Quest Board filtered to Today. The reference rows are seed-data illustration. |
| A-03 | 2,450 / 3,000 XP = 81.67 % displayed as **82 %** (round half up). Level 12 therefore needs 3,000 XP within the level → level formula in §16.2 (`250 × level`). |
| A-04 | "Productivity Explorer" is the rank title for level 10–19 (§16.3). |
| A-05 | The sample player name "Ashwin Bhalaji" is **seed data only**; UI always renders the logged-in user's data. |
| A-06 | Times are stored in UTC; the user's IANA timezone (default `Asia/Kolkata`) defines "day" boundaries for streaks and daily limits. |
| A-07 | Free/open-source tools only. SQLite in dev, PostgreSQL in production. |
| A-08 | Images are legitimate free-license or original generated artwork (§13.4). |
| A-09 | Single locale (English) in MVP; strings centralised for future i18n. |
| A-10 | Optional Gemini key is supplied via environment variable; absent key = AI in fallback mode. |

---

# 11. Functional Requirements

See full SRS text for requirements FR-001 through FR-060.
