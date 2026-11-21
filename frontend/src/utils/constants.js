export const APP_NAME = 'EVOLVIA';
export const APP_TAGLINE = 'Transform your goals into quests. Build discipline. Level up your life.';

export const NAV_ITEMS = [
  { id: 'home', label: 'Home', path: '/', icon: 'Home' },
  { id: 'quests', label: 'Quest Board', path: '/quests', icon: 'BookOpen' },
  { id: 'focus', label: 'Focus Arena', path: '/focus', icon: 'Target' },
  { id: 'habits', label: 'Habits', path: '/habits', icon: 'Layers' },
  { id: 'world', label: 'My World', path: '/world', icon: 'Box' },
  { id: 'achievements', label: 'Achievements', path: '/achievements', icon: 'Trophy' },
  { id: 'leaderboard', label: 'Leaderboard', path: '/leaderboard', icon: 'BarChart2' },
  { id: 'analytics', label: 'Analytics', path: '/analytics', icon: 'BarChart' },
];

export const FOCUS_MODES = [
  { id: 'POMODORO', label: 'Pomodoro', durationMinutes: 25, breakMinutes: 5 },
  { id: 'DEEP_WORK', label: 'Deep Work', durationMinutes: 50, breakMinutes: 10 },
  { id: 'STUDY', label: 'Study', durationMinutes: 45, breakMinutes: 10 },
  { id: 'CUSTOM', label: 'Custom', durationMinutes: 30, breakMinutes: 5 }
];

export const SEED_DASHBOARD_DATA = {
  greeting_name: 'Ashwin',
  profile: {
    display_name: 'Ashwin Bhalaji',
    title_tagline: 'Productivity Explorer',
    level: 12,
    rank: 'Productivity Explorer',
    total_xp: 18950,
    xp_in_level: 2450,
    xp_needed: 3000,
    progress_pct: 82,
    quests_done: 24,
    current_streak: 7,
    consistency_pct: 86,
    is_verified: true,
  },
  today: {
    total: 5,
    completed: 3,
    items: [
      {
        id: 1,
        title: 'Complete Java assignment',
        difficulty: 'HARD',
        xp_reward: 100,
        status: 'COMPLETED',
        is_completed: true
      },
      {
        id: 2,
        title: 'Study Cyber Forensics (2 hrs)',
        difficulty: 'EPIC',
        xp_reward: 150,
        status: 'COMPLETED',
        is_completed: true
      },
      {
        id: 3,
        title: '30-minute Focus Session',
        difficulty: 'MEDIUM',
        xp_reward: 50,
        status: 'TODO',
        is_completed: false
      }
    ]
  },
  evo: {
    online: true,
    tip: 'Need a plan for your exams, projects or daily goals?'
  },
  focus: {
    default_mode: 'POMODORO',
    default_seconds: 1500
  },
  progress: {
    range: 'This Week',
    week_xp: 420,
    goal_pct: 68,
    daily_xp: [
      { day: 'Mon', xp: 60 },
      { day: 'Tue', xp: 40 },
      { day: 'Wed', xp: 65 },
      { day: 'Thu', xp: 110 },
      { day: 'Fri', xp: 75 },
      { day: 'Sat', xp: 45 },
      { day: 'Sun', xp: 25 },
    ]
  },
  achievements: [
    {
      id: 1,
      code: 'quest_novice',
      name: 'Quest Novice',
      criteria_text: 'Complete 10 quests',
      icon: 'BookOpen',
      unlocked: true,
      badge_type: 'book'
    },
    {
      id: 2,
      code: 'streak_master',
      name: 'Streak Master',
      criteria_text: '7-day streak',
      icon: 'Flame',
      unlocked: true,
      badge_type: 'flame'
    },
    {
      id: 3,
      code: 'focus_adept',
      name: 'Focus Adept',
      criteria_text: '10 focus sessions',
      icon: 'Hourglass',
      unlocked: true,
      badge_type: 'hourglass'
    }
  ],
  active_questline: {
    id: 1,
    title: 'Exam Preparation Arc',
    rarity: 'EPIC',
    progress_pct: 60,
    milestones_total: 5,
    milestones_completed: 3
  },
  login_reward: {
    claimable: true,
    amount: 50,
    claimed: false
  },
  unread_notifications: 1
};
