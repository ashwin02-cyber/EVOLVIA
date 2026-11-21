# EVOLVIA — Visual Quality Assurance (Visual QA) Report

**Baseline Canvas:** 1672 × 941 (Desktop Baseline) & 1440 × 900  
**Primary Visual Authority:** `EVOLVIA Cyberpunk Productivity Dashboard.png`  
**Color Palette Compliance:**
- Jet Black: `#050505` (App background, base depth, 65%)
- Royal Amethyst: `#3B0A6B` (Surfaces, glowing ambient mist, border gradients, 20%)
- Electric Cyan: `#00E5FF` (Buttons, active navigation, progress fills, highlights, 15%)
- Accent / Semantic Colors: `#F5F3FF` (Primary text), `#B9B0D4` (Secondary text), `#7D7396` (Muted), `#2EE59D` (Success checks), `#FFC857` (Gold/Legendary medals)

---

## 1. Visual Verification & Audit Results

### 1.1 Left Navigation Sidebar (Width ~238px, ~14% screen width)
- **Logo Emblem:** Winged cyan crest with wide-tracked "EVOLVIA" wordmark and "PRODUCTIVITY × GAMIFIED" micro caps in a rounded border glass card.
- **Navigation Items:** 8 primary links (Home, Quest Board, Focus Arena, Habits, My World, Achievements, Leaderboard, Analytics) with two-tone cyan/amethyst icons.
- **Active Navigation Pill:** "Home" displays a cyan-filled, cyan-bordered pill with glowing cyan text, cyan icon, and trailing chevron icon.
- **Daily Login Reward:** Amethyst glowing crystal artwork floating on an illuminated pedestal + "+50 XP" card with solid Electric Cyan "Claim" button and gift icon.

### 1.2 Top Header
- **Greeting:** "Good Evening, **Ashwin** 👋" with "Ashwin" highlighted in Electric Cyan.
- **Controls:** Circular glass buttons for Global Search, Notification Bell (with cyan unread dot), and Profile Avatar with glowing cyan ring.

### 1.3 Hero Section (~28% canvas height)
- **Typography:** Display title "Ready for today's" in crisp white, followed by "Quest?" in high-contrast italic bold Electric Cyan (~44–52px).
- **Subtitle:** Clean muted lavender text ("Turn your goals into quests, earn XP, level up and build your best self.").
- **Hero Actions:** Solid Electric Cyan button "+ New Quest" with dark text, accompanied by 3 dark glass buttons with amethyst borders ("Focus Session", "Plan My Day", "AI Assistant").
- **Hero Artwork:** Giant purple moon in a misty starry sky, gothic ruins, and cloaked cyberpunk protagonist with glowing back-crest emblem.

### 1.4 Row 1 Dashboard Cards
- **Player Profile Card (~39% width):**
  - Hexagonal portrait frame with cyan glow enclosing cyberpunk character artwork.
  - Player name "Ashwin Bhalaji" with cyan verified badge.
  - Subtitle "Productivity Explorer".
  - Amethyst hexagonal badge displaying "Level 12".
  - XP counter "2,450 / 3,000 XP" with "82%" progress.
  - Smooth cyan-to-aqua gradient progress bar with end-glow.
  - 3 stat counters: "24 Quests Done" (lightning bolt), "7 Day Streak" (flame), "86% Consistency" (bullseye target).
- **Today's Quests Card (~33% width):**
  - Ancient scroll icon, header "Today's Quests", "3 of 5 completed" count.
  - 5-segment indicator with 3 cyan filled segments and 2 hollow tracks.
  - Top 3 list rows with green checkmarks/rings, titles ("Complete Java assignment", "Study Cyber Forensics (2 hrs)", "30-minute Focus Session"), cyan XP badges ("+100 XP", "+150 XP", "+50 XP"), and navigation chevrons.
- **Evo AI Companion Card (~28% width):**
  - Sparkle icon, "Evo AI", glowing "● Online" pill.
  - Floating 3D violet/cyan robot companion with cyan eye visor on an illuminated platform.
  - Speech bubble: "Need a plan for your exams, projects or daily goals?".
  - Electric Cyan button "Chat with Evo".

### 1.5 Row 2 Dashboard Cards
- **Focus Arena Widget (~31% width):**
  - Target icon, title "Focus Arena / Stay focused. Earn XP.".
  - Ambient cyberpunk study desk backdrop with headphones and plant.
  - Circular cyan arc countdown ring showing "25:00 / Focus Mode" with circular cyan play button.
  - Interactive mode pills: Pomodoro (active cyan pill), Deep Work, Study, Custom.
- **My Progress Widget (~33% width):**
  - Chart icon, "My Progress", "This Week ⌄" dropdown.
  - 7 vertical gradient bars (Mon–Sun) with cyan-to-amethyst fills.
  - Two stat cards: "+420 XP This Week" and "68% Goal Completion".
- **Achievements Widget (~36% width):**
  - Trophy icon, "Achievements", "View All →" link.
  - 3 hexagonal medal badges: "Quest Novice" (open book), "Streak Master" (flame), "Focus Adept" (hourglass).

### 1.6 Row 3 Active Questline Banner (Full Width, ~10% height)
- Crossed-swords icon, "Active Questline", title "Exam Preparation Arc", "EPIC" amethyst pill.
- Landscape portal artwork with glowing cyan portal gate and ancient stone pillars.
- Progress indicator "Progress 60%" with cyan progress bar.
- Outlined Electric Cyan button "Continue →".

---

## 2. Layout & Responsive Breakpoints
- **1672 × 941 (Desktop Baseline):** Exact reproduction of the authoritative reference image proportions and layout hierarchy.
- **1440 × 900 (Laptop):** Proportional grid scaling with preserved 3-card rows.
- **1024 × 768 (Tablet):** Responsive 2-column card wrapping with accessible touch targets.
- **390 × 844 (Mobile):** Single-column dashboard with sticky bottom navigation tab bar (`MobileTabBar`), compact cards, and responsive hero artwork.
