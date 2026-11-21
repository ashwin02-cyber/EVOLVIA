# EVOLVIA — Test Suite & Quality Assurance Documentation

Comprehensive automated test suite for the **EVOLVIA** Gamified Productivity Platform.

---

## 📁 Directory Structure

```
tests/
├── README.md                          # This test documentation file
├── run_all_tests.py                   # Master test orchestrator & report generator
├── api/                               # Backend REST API & Gamification Test Suite
│   ├── __init__.py
│   ├── test_auth.py                   # TC-01, TC-02, TC-03, TC-04, TC-22 (Authentication & JWT)
│   ├── test_quests.py                 # TC-05, TC-06, TC-07, TC-08, TC-09 (Quest Lifecycle & Idempotency)
│   ├── test_gamification.py           # TC-10, TC-11, TC-12, TC-13 (XP Formula, Levels, Streaks, Achievements)
│   ├── test_focus_habits.py           # TC-14, TC-15, TC-16, TC-17 (Focus Sessions & Habit Tracking)
│   ├── test_ai_questlines_analytics.py # TC-18, TC-19, TC-20, TC-21 (Evo AI, Plan My Day, Questlines, Analytics)
│   └── test_security.py               # TC-23, TC-24, TC-25 (Ownership Isolation, Input Sanitization, Rate Limits)
└── e2e/                               # UI, Responsive & End-to-End Workflow Suite
    ├── __init__.py
    ├── test_ui_responsive.py          # TC-26, TC-27, TC-28, TC-29 (Desktop, Laptop, Tablet, Mobile, Contrast)
    └── test_full_workflow.py          # TC-30 (Complete End-to-End User Journey)
```

---

## 🚀 Running the Tests

### 1. Execute All 30 Tests & Generate Complete Report Package

Run the master test runner from the repository root:

```bash
python tests/run_all_tests.py
```

This single command:
1. Executes all 30 automated test cases (TC-01 through TC-30).
2. Measures API endpoint response times and frontend bundle performance metrics.
3. Generates the full QA report suite in `EVOLVIA_QA_REPORT/`:
   - `test_results.md` (30-test execution matrix)
   - `QA_EXECUTION_REPORT.md` (Executive summary & detailed test analysis)
   - `bug_report.md` (Defect tracking & severity matrix)
   - `performance_report.md` (Lighthouse, Core Web Vitals & API benchmarks)
   - `test_summary.json` (Machine-readable test statistics)
   - `EVOLVIA_QA_REPORT.pdf` (Multi-page comprehensive PDF report with visual evidence)
   - `logs/` (Detailed test execution logs)

---

### 2. Running Individual Test Modules

You can run individual test categories using Django's test runner:

```bash
# Authentication tests (TC-01 to TC-04, TC-22)
python manage.py test tests.api.test_auth

# Quest management tests (TC-05 to TC-09)
python manage.py test tests.api.test_quests

# Gamification engine tests (TC-10 to TC-13)
python manage.py test tests.api.test_gamification

# Focus sessions and habits tests (TC-14 to TC-17)
python manage.py test tests.api.test_focus_habits

# AI assistant, questlines & analytics tests (TC-18 to TC-21)
python manage.py test tests.api.test_ai_questlines_analytics

# Security, ownership & injection tests (TC-23 to TC-25)
python manage.py test tests.api.test_security

# UI responsive layout & design fidelity tests (TC-26 to TC-29)
python manage.py test tests.e2e.test_ui_responsive

# End-to-end user workflow test (TC-30)
python manage.py test tests.e2e.test_full_workflow
```

---

## 🧪 Test Case Coverage (30 Tests)

| Test ID | Category | Description | Target / Verification |
|---|---|---|---|
| **TC-01** | Authentication | User Registration | Registration endpoint creates user & profile, returns 201 Created |
| **TC-02** | Authentication | User Login & JWT | Valid credentials yield JWT access & refresh tokens |
| **TC-03** | Authentication | Invalid Login Handling | Invalid credentials return 401 Unauthorized with descriptive message |
| **TC-04** | Authentication | Logout & Route Protection | Protected endpoints block unauthenticated requests with 401 |
| **TC-05** | Quest Management | Quest Creation | Creating quest with title, difficulty, category persists in DB |
| **TC-06** | Quest Management | Quest Modification | Updates to quest title, difficulty, and priority persist accurately |
| **TC-07** | Quest Management | Quest Deletion | Deleting a quest removes it from user's active quest list |
| **TC-08** | Quest Management | Quest Completion & XP | Completing quest sets status='completed' and awards correct XP |
| **TC-09** | Quest Management | Duplicate Completion Idempotency | Multiple completion calls award XP only once |
| **TC-10** | Gamification Engine | XP Calculation Engine | Verifies SRS XP table: Trivial=25, Easy=50, Medium=100, Hard=200, Epic=500 |
| **TC-11** | Gamification Engine | Level Progression & Thresholds | Validates `need(L) = 250 × L` and `cum(L) = 125 × L × (L - 1)` formula |
| **TC-12** | Gamification Engine | Achievement Unlocking | Triggering achievement criteria unlocks badge and awards bonus XP |
| **TC-13** | Gamification Engine | Streak Calculation & Timezones | Daily activity increments streak; inactivity breaks streak correctly |
| **TC-14** | Focus & Habits | Focus Timer Lifecycle | Focus session records duration, mode, and completion status |
| **TC-15** | Focus & Habits | Focus Session State Persistence | Active sessions resume accurately without state loss |
| **TC-16** | Focus & Habits | Habit Tracking & Check-in | Habit creation and daily check-in logs history and awards XP |
| **TC-17** | Focus & Habits | Duplicate Habit Check-in Prevention| Same-day check-in is idempotent; prevents double XP award |
| **TC-18** | AI & Analytics | Evo AI Companion Response | Chat endpoint returns structured guidance or offline fallback |
| **TC-19** | AI & Analytics | Plan My Day Workflow | Daily plan generates schedule and converts into active quests |
| **TC-20** | AI & Analytics | Questline Arc Progression | Completing milestones updates arc progress percentage and unlocks rewards |
| **TC-21** | AI & Analytics | Analytics Data Aggregation | Summary statistics match database quest completions and XP gains |
| **TC-22** | Security & API | Authentication API Standards | Token refresh, token verification, and 401 challenge compliance |
| **TC-23** | Security & API | Ownership & Multi-tenant Isolation| User A cannot view, modify, or delete User B's quests/profiles |
| **TC-24** | Security & API | Input Sanitization & Injection Defense | XSS payloads (`<script>`) and SQLi characters are sanitized safely |
| **TC-25** | Security & API | Rate Limiting & Throttling | High-frequency burst requests are metered and handled smoothly |
| **TC-26** | UI & Responsive | Desktop 1672×941 Reference Fidelity | Strict visual alignment with reference screenshot at 1672×941 & 1440×900 |
| **TC-27** | UI & Responsive | Tablet Layout Adaptation | 1024×768 and 768×1024 viewports collapse sidebars and stack widgets |
| **TC-28** | UI & Responsive | Mobile Responsive & Navigation | 390×844 layout stacks cards, activates bottom navigation bar |
| **TC-29** | UI & Responsive | Accessibility & Color Contrast | Verifies Electric Cyan (#00E5FF) and Royal Amethyst contrast ratios |
| **TC-30** | End-to-End Workflow | Full User Lifecycle Journey | Register → Create Quest → Focus → Complete → Level Up → Analytics |

---

## 📊 Reports & Artifacts Generated

After execution, all test logs and verification artifacts are saved under `EVOLVIA_QA_REPORT/`:
- `test_results.md`
- `QA_EXECUTION_REPORT.md`
- `bug_report.md`
- `performance_report.md`
- `test_summary.json`
- `EVOLVIA_QA_REPORT.pdf`
- `screenshots/` (All 8 high-resolution screenshots & visual comparisons)
- `logs/` (Backend, API, E2E, and audit execution logs)
