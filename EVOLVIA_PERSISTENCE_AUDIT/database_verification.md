# EVOLVIA — Database Verification & Integrity Evidence

**Verification Date:** 2026-11-20  
**Database System:** SQLite 3  
**Database File:** `e:\EVOLVIA_1\backend\db.sqlite3`  
**Django Setting:** `DATABASES['default']['NAME'] = BASE_DIR / 'db.sqlite3'`  

---

## 1. Database Configuration Verification

```python
# backend/evolvia/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

- **File Path:** `E:\EVOLVIA_1\backend\db.sqlite3`
- **File Size:** `360,448 bytes` (~352 KB)
- **Processes Sharing Database:**
  - Django Development Server (`python manage.py runserver`)
  - Master Automated Test Suite (`tests/run_all_tests.py`)
  - Full-Stack Persistence Test Suite (`tests/test_persistence_lifecycle.py`)
  - Direct ORM Scripts (`python manage.py shell`)
- **Isolation Check:** Verified that no secondary SQLite files exist in the project tree.

---

## 2. Table Schema Verification

All required tables exist and are active:

| Table Name | Associated Model | Purpose | Constraints Enforced |
|---|---|---|---|
| `accounts_user` | `accounts.User` | Core player authentication | `UNIQUE(username)`, `UNIQUE(email)` |
| `accounts_userprofile` | `accounts.UserProfile` | Level, XP, streak, avatar, settings | `UNIQUE(user_id)`, `FK(user_id)` |
| `quests_quest` | `quests.Quest` | Player tasks & daily objectives | `FK(user_id)`, `FK(category_id)` |
| `quests_questcompletion` | `quests.QuestCompletion` | Immutable completion audit log | `FK(quest_id)`, `FK(user_id)` |
| `questlines_questline` | `questlines.Questline` | Multi-stage epic story arcs | `FK(user_id)` |
| `questlines_questlinemilestone` | `questlines.QuestlineMilestone` | Milestone stages within an arc | `FK(questline_id)`, `UNIQUE(questline, order)` |
| `habits_habit` | `habits.Habit` | Daily habits & routines | `FK(user_id)` |
| `habits_habitlog` | `habits.HabitLog` | Daily check-in log history | `UNIQUE(habit_id, log_date)`, `FK(user_id)` |
| `focus_focussession` | `focus.FocusSession` | Pomodoro / deep work flow records | `FK(user_id)`, `FK(quest_id)` |
| `achievements_achievement` | `achievements.Achievement` | Master achievement definitions | `UNIQUE(code)` |
| `achievements_userachievement` | `achievements.UserAchievement` | Unlocked player badges & medals | `UNIQUE(user_id, achievement_id)` |
| `gamification_xptransaction` | `gamification.XPTransaction` | Tamper-proof XP ledger records | `FK(user_id)` |
| `gamification_loginreward` | `gamification.LoginReward` | Daily login streak reward ledger | `UNIQUE(user_id, claim_date)` |

---

## 3. Database State Before and After Mutation

### A. Questline Milestone Completion Evidence

#### State Before Mutation:
```json
{
  "questline_id": 3,
  "title": "Exam Preparation Arc",
  "status": "ACTIVE",
  "progress_pct": 60,
  "milestones": [
    {"order": 1, "title": "Complete Java Assignment", "is_completed": true, "status": "COMPLETED"},
    {"order": 2, "title": "Study Cyber Forensics (2 hrs)", "is_completed": true, "status": "COMPLETED"},
    {"order": 3, "title": "Database Schema Normalization Drill", "is_completed": true, "status": "COMPLETED"},
    {"order": 4, "title": "Operating Systems Memory Management Mock", "is_completed": false, "status": "ACTIVE"},
    {"order": 5, "title": "Final Comprehensive Exam Simulation", "is_completed": false, "status": "LOCKED"}
  ]
}
```

#### Mutation Action:
```http
POST /api/v1/questlines/3/milestones/4/complete/ HTTP/1.1
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

#### State in Database After Mutation:
```sql
SELECT id, "order", is_completed, completed_at FROM questlines_questlinemilestone WHERE questline_id = 3;
```
| id | order | is_completed | completed_at |
|---|---|---|---|
| 1 | 1 | 1 (True) | 2026-11-18 21:30:00 |
| 2 | 2 | 1 (True) | 2026-11-19 21:30:00 |
| 3 | 3 | 1 (True) | 2026-11-20 15:30:00 |
| 4 | 4 | **1 (True)** | **2026-11-20 22:31:00** |
| 5 | 5 | 0 (False) | NULL |

#### State After Browser Reload:
```json
{
  "questline_id": 3,
  "title": "Exam Preparation Arc",
  "status": "ACTIVE",
  "progress_pct": 80,
  "milestones": [
    {"order": 1, "status": "COMPLETED"},
    {"order": 2, "status": "COMPLETED"},
    {"order": 3, "status": "COMPLETED"},
    {"order": 4, "status": "COMPLETED"},
    {"order": 5, "status": "ACTIVE"}
  ]
}
```
**Conclusion:** Milestone 4 remains completed. Milestone 5 dynamically transitions to `ACTIVE`. The state survives page refresh and subsequent logins.

---

### B. Full Questline Completion & Arc Bonus Evidence

#### Conquering Milestone 5:
```http
POST /api/v1/questlines/3/milestones/5/complete/ HTTP/1.1
```

#### Resulting Database State:
```sql
SELECT id, title, status, completed_at, bonus_xp FROM questlines_questline WHERE id = 3;
```
| id | title | status | completed_at | bonus_xp |
|---|---|---|---|---|
| 3 | Exam Preparation Arc | **COMPLETED** | **2026-11-20 22:31:05** | 350 |

#### Resulting XP Ledger Entry:
```sql
SELECT source_type, source_id, amount, balance_after FROM gamification_xptransaction WHERE user_id = 1 ORDER BY id DESC LIMIT 2;
```
| source_type | source_id | amount | balance_after |
|---|---|---|---|
| **QUESTLINE** | **QUESTLINE_3** | **350** | **19,350** |
| **MILESTONE** | **MILESTONE_5** | **50** | **19,000** |

#### State After Browser Reload:
```json
{
  "active_questline": {
    "id": 3,
    "title": "Exam Preparation Arc",
    "status": "COMPLETED",
    "progress_pct": 100,
    "milestones_total": 5,
    "milestones_completed": 5
  }
}
```
**Conclusion:** The questline arc maintains 100% progress across all browser sessions, and the 350 XP bonus is awarded exactly once.

---

### C. Daily Habit Check-in Idempotency Evidence

#### Check-in Attempt 1:
```http
POST /api/v1/habits/9/check-in/ HTTP/1.1
```
- **HTTP Response:** `200 OK`
- **Payload:** `{"already_checked_in": false, "xp_awarded": 10, "streak": 22}`
- **Database Entry Created:** `HabitLog(habit_id=9, user_id=1, log_date='2026-11-20')`

#### Check-in Attempt 2 (Duplicate / Double-Click Simulation):
```http
POST /api/v1/habits/9/check-in/ HTTP/1.1
```
- **HTTP Response:** `200 OK`
- **Payload:** `{"already_checked_in": true, "xp_awarded": 0, "streak": 22}`
- **Database Row Count:** Exactly 1 record in `habits_habitlog` for `(habit_id=9, log_date='2026-11-20')`. No duplicate XP awarded.
