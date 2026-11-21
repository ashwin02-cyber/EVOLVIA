# EVOLVIA — 30-Test Execution Results Matrix

| Test ID | Category | Test Case | Expected Result | Actual Result | Status | Severity |
|---|---|---|---|---|---|---|
| **TC-01** | Authentication | User Registration | Account created atomically (Level 1, 0 XP); JWT tokens issued. | Verified successfully in 3.232s. | **PASS** | None |
| **TC-02** | Authentication | User Login | Valid credentials return access + refresh tokens and profile data. | Verified successfully in 1.941s. | **PASS** | None |
| **TC-03** | Authentication | Invalid Login | Incorrect credentials rejected with 401; protected content safe. | Verified successfully in 2.904s. | **PASS** | None |
| **TC-04** | Authentication | Logout and Session Protection | Unauthenticated requests to protected routes rejected with 401. | Verified successfully in 0.996s. | **PASS** | None |
| **TC-05** | Quest Management | Create Quest | Quest created; backend sets server-authoritative XP reward (Hard=100). | Verified successfully in 0.956s. | **PASS** | None |
| **TC-06** | Quest Management | Edit Quest | Modified quest title and description persist in database. | Verified successfully in 0.924s. | **PASS** | None |
| **TC-07** | Quest Management | Delete Quest | Deleted quest no longer appears in active user quests list. | Verified successfully in 0.943s. | **PASS** | None |
| **TC-08** | Quest Management | Quest Completion | Status transitions to COMPLETED and correct XP reward credited. | Verified successfully in 1.089s. | **PASS** | None |
| **TC-09** | Quest Management | Duplicate Quest Completion | Idempotent; repeated completion call returns 0 XP, no duplicate credit. | Verified successfully in 0.984s. | **PASS** | None |
| **TC-10** | Gamification Engine | XP Calculation | Backend calculates Easy=25, Medium=50, Hard=100, Epic=150 per SRS. | Verified successfully in 0.972s. | **PASS** | None |
| **TC-11** | Gamification Engine | Level Progression | Level formula need(L)=250*L; Level 12 18,950 total XP gives 82% progress. | Verified successfully in 0.965s. | **PASS** | None |
| **TC-12** | Gamification Engine | Achievement Unlocking | Fulfilling criteria unlocks UserAchievement and awards bonus crystals. | Verified successfully in 0.977s. | **PASS** | None |
| **TC-13** | Gamification Engine | Streak Calculation | Consecutive days increment streak; gap > 1 day resets streak to 1. | Verified successfully in 1.027s. | **PASS** | None |
| **TC-14** | Focus and Habits | Focus Timer | Focus session handles start, pause, resume, and awards focus XP. | Verified successfully in 0.966s. | **PASS** | None |
| **TC-15** | Focus and Habits | Focus Session Persistence | Active session survives reload and is retrievable via /sessions/active/. | Verified successfully in 1.092s. | **PASS** | None |
| **TC-16** | Focus and Habits | Habit Check-in | Daily check-in logs HabitLog and awards +10 XP. | Verified successfully in 1.045s. | **PASS** | None |
| **TC-17** | Focus and Habits | Duplicate Habit Check-in | Second check-in on same day awards 0 additional XP. | Verified successfully in 0.962s. | **PASS** | None |
| **TC-18** | AI, Questlines and Analytics | Evo AI Assistant | Evo responds with motivating reply or graceful fallback mode. | Verified successfully in 0.937s. | **PASS** | None |
| **TC-19** | AI, Questlines and Analytics | Plan My Day | Plan generated; accept endpoint creates corresponding Quest rows. | Verified successfully in 0.982s. | **PASS** | None |
| **TC-20** | AI, Questlines and Analytics | Questline Progression | Milestones update progress %; final milestone triggers completion bonus. | Verified successfully in 0.978s. | **PASS** | None |
| **TC-21** | AI, Questlines and Analytics | Analytics Validation | Analytics API endpoints return accurate time-series aggregates. | Verified successfully in 0.983s. | **PASS** | None |
| **TC-22** | Security and API Validation | Authentication API | Token refresh endpoint rotates access token seamlessly. | Verified successfully in 1.984s. | **PASS** | None |
| **TC-23** | Security and API Validation | Authorization and Ownership | User B cannot view, modify, or complete User A quests (404/403). | Verified successfully in 2.201s. | **PASS** | None |
| **TC-24** | Security and API Validation | Input Validation | Empty, invalid, and oversized inputs are rejected with 400 Bad Request. | Verified successfully in 2.146s. | **PASS** | None |
| **TC-25** | Security and API Validation | API Error Handling | Standard error responses returned without exposing sensitive stack traces. | Verified successfully in 2.257s. | **PASS** | None |
| **TC-26** | UI/UX and Responsiveness | Visual Fidelity | 1672x941 desktop baseline matches exact 3-color palette tokens. | Verified successfully in 0.123s. | **PASS** | None |
| **TC-27** | UI/UX and Responsiveness | Responsive Compatibility | 5 target viewports (1672, 1440, 1024, 768, 390) verified. | Verified successfully in 0.008s. | **PASS** | None |
| **TC-28** | UI/UX and Responsiveness | UI Interaction and Accessibility | Interactive buttons, ARIA labels, image alts, and reduced-motion exist. | Verified successfully in 0.021s. | **PASS** | None |
| **TC-29** | Performance and End-to-End | Performance Audit | Frontend dist bundle optimized, assets compressed, bundle < 5MB total. | Verified successfully in 0.007s. | **PASS** | None |
| **TC-30** | Performance and End-to-End | Complete End-to-End User Journey | Full 14-step workflow from registration to logout succeeds without errors. | Verified successfully in 2.417s. | **PASS** | None |
