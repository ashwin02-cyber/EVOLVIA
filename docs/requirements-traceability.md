# EVOLVIA — Requirements Traceability Matrix (RTM)

This document maps all Functional Requirements (`FR-001` through `FR-060`), Non-Functional Requirements, and Design Requirements from `EVOLVIA_SRS.md` to their corresponding architectural components, backend endpoints, and frontend views.

---

## 1. Authentication and Profile
| Req ID | Requirement Description | Backend App / Service | API Endpoint | Frontend Component / View | Test Verification |
|---|---|---|---|---|---|
| **FR-001** | User Registration & Initial Profile | `accounts.services.register_user` | `POST /api/v1/auth/register/` | `RegisterPage.jsx` | Unique username/email test, atomic profile init (L1, 0 XP) |
| **FR-002** | User Login & JWT issuance | `accounts.views.CustomTokenObtainPairView` | `POST /api/v1/auth/login/` | `LoginPage.jsx` | 401 on bad credentials, valid access + refresh JWT |
| **FR-003** | Token Refresh & Logout | `rest_framework_simplejwt` | `POST /api/v1/auth/refresh/`, `/logout/` | `AuthContext.jsx`, `apiClient.js` | Token rotation, blacklist verification |
| **FR-004** | Profile view & edit | `accounts.views.ProfileView` | `GET/PATCH /api/v1/profile/` | `SettingsPage.jsx`, `MyWorldPage.jsx` | Persistence of display name, timezone, goal |
| **FR-005** | Avatar selection & upload | `accounts.views.AvatarUploadView` | `POST /api/v1/profile/avatar/` | `SettingsPage.jsx`, `AvatarSelector.jsx` | Size check (<=2MB), preset selection |
| **FR-006** | Password change | `accounts.views.PasswordChangeView` | `POST /api/v1/auth/password/change/` | `SettingsPage.jsx` | Requires current password, token revocation |
| **FR-007** | Account deletion | `accounts.views.AccountDeleteView` | `DELETE /api/v1/profile/` | `SettingsPage.jsx` | Cascades user data, destroys auth tokens |

---

## 2. Dashboard ("Home")
| Req ID | Requirement Description | Backend App / Service | API Endpoint | Frontend Component / View | Test Verification |
|---|---|---|---|---|---|
| **FR-010** | Greeting header with timezone logic | `core.selectors.get_dashboard_data` | `GET /api/v1/dashboard/` | `Header.jsx`, `Hero.jsx` | Time of day greeting (Morning/Afternoon/Evening) |
| **FR-011** | Hero action buttons | N/A (Modal & Navigation triggers) | Client Router / Modals | `Hero.jsx` | New Quest, Focus Session, Plan My Day, AI Assistant |
| **FR-012** | Player profile card with XP progression | `gamification.services` | `GET /api/v1/dashboard/` | `ProfileCard.jsx` | XP bar (2450/3000), 82%, Level 12 badge, stats |
| **FR-013** | Today's Quests card | `quests.services` | `GET /api/v1/dashboard/` | `TodaysQuests.jsx` | Top 3 quests, 5-segment bar, inline complete |
| **FR-014** | Evo AI companion card | `ai_assistant.services` | `GET /api/v1/dashboard/` | `EvoAICard.jsx` | Online status dot, speech tip bubble, Chat CTA |
| **FR-015** | Focus Arena widget | `focus.services` | `GET /api/v1/dashboard/` | `FocusWidget.jsx` | 25:00 circular ring, mode chips, quick start |
| **FR-016** | My Progress analytics widget | `analytics.services` | `GET /api/v1/dashboard/` | `ProgressWidget.jsx` | 7-bar XP chart, +420 XP This Week, 68% Goal |
| **FR-017** | Achievements widget | `achievements.services` | `GET /api/v1/dashboard/` | `AchievementsWidget.jsx` | 3 hex medals (Quest Novice, Streak Master, Focus Adept) |
| **FR-018** | Active Questline banner | `questlines.services` | `GET /api/v1/dashboard/` | `QuestlineBanner.jsx` | "Exam Preparation Arc", EPIC pill, 60% progress |
| **FR-019** | Sidebar Daily Login Reward | `gamification.services.claim_daily_reward`| `POST /api/v1/rewards/daily-login/claim/` | `DailyReward.jsx` | +50 XP claim, one per local day, countdown |
| **FR-020** | Global search | `quests`, `habits` | `GET /api/v1/search/` | `Header.jsx` (Search modal) | Debounced 300ms, keyboard shortcuts |
| **FR-021** | Notification bell | `notifications.services` | `GET /api/v1/notifications/` | `Header.jsx` | Unread badge, dropdown list, mark as read |

---

## 3. Quests Management
| Req ID | Requirement Description | Backend App / Service | API Endpoint | Frontend Component / View | Test Verification |
|---|---|---|---|---|---|
| **FR-022** | Create quest | `quests.services.create_quest` | `POST /api/v1/quests/` | `QuestCreateModal.jsx` | Server computed XP reward by difficulty |
| **FR-023** | Edit & soft delete quest | `quests.views.QuestViewSet` | `PATCH/DELETE /api/v1/quests/{id}/` | `QuestCard.jsx`, `QuestDetailModal.jsx`| Soft delete, completed edit lock |
| **FR-024** | Quest board (Kanban & List) | `quests.views.QuestViewSet` | `GET /api/v1/quests/` | `QuestBoardPage.jsx` | Drag and drop, category/difficulty filters |
| **FR-025** | Start quest (In Progress) | `quests.services.start_quest` | `PATCH /api/v1/quests/{id}/` | `QuestCard.jsx` | Status transition to IN_PROGRESS |
| **FR-026** | Complete quest & XP reward | `quests.services.complete_quest` | `POST /api/v1/quests/{id}/complete/` | `QuestCard.jsx`, `TodaysQuests.jsx` | Idempotent completion, atomic XP transaction |
| **FR-027** | Uncomplete quest (Undo) | `quests.services.undo_complete_quest`| `POST /api/v1/quests/{id}/undo-complete/` | `QuestCard.jsx` | 5-minute window check, reversal transaction |
| **FR-028** | Recurring quests | `quests.management.commands.generate_recurring_quests` | Lazy eval on GET `/quests/` | `QuestBoardPage.jsx` | Exactly one daily instance per template |
| **FR-029** | Overdue quest handling | `quests.services.complete_quest` | `POST /api/v1/quests/{id}/complete/` | `QuestCard.jsx` | 50% XP penalty for overdue completion |
| **FR-030** | Daily & weekly challenges | `gamification.services.challenges` | `GET /api/v1/challenges/today/` | `QuestBoardPage.jsx`, `MyWorldPage.jsx`| Auto-tracked progress and bonus XP |

---

## 4. Gamification Engine
| Req ID | Requirement Description | Backend App / Service | API Endpoint | Frontend Component / View | Test Verification |
|---|---|---|---|---|---|
| **FR-031** | Immutable XP Ledger | `gamification.models.XPTransaction` | `GET /api/v1/xp/transactions/` | `MyWorldPage.jsx` | Total XP == SUM(transactions) invariant |
| **FR-032** | Level computation formula | `gamification.services.math` | `GET /api/v1/xp/summary/` | `ProfileCard.jsx`, `LevelHexagon.jsx` | need(L) = 250*L, cum(L) = 125*L*(L-1) |
| **FR-033** | Level-up event & animation | `gamification.services.award_xp` | Payload in completion endpoints | `LevelUpOverlay.jsx` | Level-up modal, crystals awarded |
| **FR-034** | Rank progression | `gamification.services.ranks` | `GET /api/v1/xp/summary/` | `ProfileCard.jsx`, `RankBadge.jsx` | Rank titles 1-4, 5-9, 10-19, etc. |
| **FR-035** | Player stats calculation | `gamification.services.stats` | `GET /api/v1/stats/` | `ProfileCard.jsx`, `MyWorldPage.jsx` | Quests Done, Day Streak, Consistency % |

---

## 5. Habits & Streaks
| Req ID | Requirement Description | Backend App / Service | API Endpoint | Frontend Component / View | Test Verification |
|---|---|---|---|---|---|
| **FR-036** | Habit CRUD | `habits.views.HabitViewSet` | `GET/POST/PATCH/DELETE /api/v1/habits/` | `HabitsPage.jsx`, `HabitModal.jsx` | Frequency validation, soft archiving |
| **FR-037** | Habit daily check-in | `habits.services.check_in_habit` | `POST /api/v1/habits/{id}/check-in/` | `HabitCard.jsx` | Unique per (habit, date), +10 XP |
| **FR-038** | App-wide streak calculation | `gamification.services.recalculate_streak` | Injected into all completions | `ProfileCard.jsx`, `StreakFlame.jsx` | Consecutive qualifying days |
| **FR-039** | Streak freeze item | `rewards.services.consume_freeze` | Nightly check / Auto-freeze | `SettingsPage.jsx`, `MyWorldPage.jsx` | Prevents streak reset if freeze owned |

---

## 6. Focus Arena
| Req ID | Requirement Description | Backend App / Service | API Endpoint | Frontend Component / View | Test Verification |
|---|---|---|---|---|---|
| **FR-040** | Start session (Pomodoro/Deep Work/Study/Custom) | `focus.services.start_session` | `POST /api/v1/focus/sessions/` | `FocusArenaPage.jsx`, `FocusWidget.jsx` | Server-synced timer timestamps |
| **FR-041** | Pause, resume & abandon | `focus.services.pause_session`, `resume_session`, `abandon_session` | `POST /api/v1/focus/sessions/{id}/pause/`, `resume/`, `abandon/` | `FocusArenaPage.jsx` | Max 3 pauses, 0 XP on abandon |
| **FR-042** | Complete session & server validation | `focus.services.complete_session` | `POST /api/v1/focus/sessions/{id}/complete/` | `FocusArenaPage.jsx` | Elapsed >= 95% planned, XP calculation |
| **FR-043** | Link session to quest | `focus.services.complete_session` | `POST /api/v1/focus/sessions/` | `FocusArenaPage.jsx` | Completing linked focus completes quest |
| **FR-044** | Chime sound and notifications | Client Web Audio API / Notification | Client trigger | `FocusArenaPage.jsx` | Audio synthesis chime on finish |
| **FR-045** | Focus history and statistics | `focus.views.FocusSessionViewSet` | `GET /api/v1/focus/sessions/` | `FocusArenaPage.jsx` | Total focus time by day/mode |

---

## 7. Achievements, Questlines, Rewards & Leaderboard
| Req ID | Requirement Description | Backend App / Service | API Endpoint | Frontend Component / View | Test Verification |
|---|---|---|---|---|---|
| **FR-046** | Achievement catalog | `achievements.views.AchievementViewSet` | `GET /api/v1/achievements/` | `AchievementsPage.jsx` | Locked/unlocked, progress bars |
| **FR-047** | Server-side achievement unlock | `achievements.services.evaluate_achievements` | Internal event trigger | `AchievementToast.jsx` | One-time bonus XP & crystals |
| **FR-048** | Questlines & milestones | `questlines.views.QuestlineViewSet` | `GET/POST /api/v1/questlines/` | `QuestlinesPage.jsx`, `QuestlineDetail.jsx` | Milestone progression |
| **FR-049** | Questline completion | `questlines.services.complete_milestone` | `POST /api/v1/questlines/{id}/milestones/{mid}/complete/` | `QuestlineDetail.jsx`, `QuestlineBanner.jsx`| Final milestone awards bonus XP & badge |
| **FR-050** | Crystals & cosmetic reward shop | `rewards.views.RewardViewSet` | `GET/POST /api/v1/rewards/`, `/purchase/` | `MyWorldPage.jsx` | Insufficient crystals check, inventory item equip |
| **FR-051** | Leaderboard (Weekly & All-time) | `rewards.views.LeaderboardView` | `GET /api/v1/leaderboard/` | `LeaderboardPage.jsx` | XP ranking, opt-out compliance |

---

## 8. AI, Analytics, Notifications, Seed Data
| Req ID | Requirement Description | Backend App / Service | API Endpoint | Frontend Component / View | Test Verification |
|---|---|---|---|---|---|
| **FR-052** | Evo AI chat with fallback | `ai_assistant.services.chat_with_evo` | `POST /api/v1/ai/chat/` | `EvoDrawer.jsx`, `EvoAICard.jsx` | Gemini API + rule-based fallback |
| **FR-053** | Plan My Day workflow | `ai_assistant.services.generate_day_plan` | `POST /api/v1/ai/plan-day/`, `accept/` | `PlanDayModal.jsx` | Schedule generation, creates real quests |
| **FR-054** | AI rate limiting & safety | DRF Throttling + prompt sanitization | Built-in | `EvoDrawer.jsx` | 30 requests/hour limit |
| **FR-055** | Analytics charts | `analytics.views` | `GET /api/v1/analytics/xp/`, `quests/`, `focus/`, `habits/` | `AnalyticsPage.jsx`, `ProgressWidget.jsx`| Recharts renders aggregations |
| **FR-056** | In-app notifications | `notifications.views` | `GET /api/v1/notifications/` | `Header.jsx`, `NotificationFeed.jsx` | Level-up, streak risk, achievement notices |
| **FR-057** | User settings | `accounts.views.ProfileView` | `PATCH /api/v1/profile/` | `SettingsPage.jsx` | Glow, sound, reduced motion, timezone |
| **FR-058** | Seed demo command | `core.management.commands.seed_demo` | CLI command | N/A | Reproduces reference image values |
| **FR-059** | User onboarding flow | `accounts.views.ProfileView` | `PATCH /api/v1/profile/` | `OnboardingPage.jsx` | 3-step setup (avatar, first quest, goal) |
| **FR-060** | Daily login reward engine | `gamification.services.claim_daily_reward` | `POST /api/v1/rewards/daily-login/claim/` | `DailyReward.jsx` | 50 XP, one claim per local day |
