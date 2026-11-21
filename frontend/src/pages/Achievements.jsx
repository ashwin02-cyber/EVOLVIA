import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, CheckCircle2, Lock, Sparkles, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import questNoviceBadge from '../assets/badges/quest_novice.png';
import streakMasterBadge from '../assets/badges/streak_master.png';
import focusAdeptBadge from '../assets/badges/focus_adept.png';
import apiClient from '../services/apiClient';

const BADGE_MAP = {
  quest_novice: questNoviceBadge,
  streak_master: streakMasterBadge,
  focus_adept: focusAdeptBadge,
  habit_forger: streakMasterBadge,
  level_25: questNoviceBadge,
  arc_finisher: focusAdeptBadge,
};

export const Achievements = () => {
  const [filter, setFilter] = useState('ALL');

  // Fetch live achievements from backend database
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const res = await apiClient.get('/achievements/');
      return res.data;
    },
    staleTime: 1000 * 10,
  });

  const displayList = achievements.length > 0 ? achievements.map((a) => ({
    id: a.code || a.id,
    name: a.name,
    desc: a.description || a.criteria_text,
    criteria: a.criteria_text,
    unlocked: Boolean(a.unlocked),
    xp: a.xp_bonus || 50,
    rarity: a.rarity || 'COMMON',
    img: BADGE_MAP[a.code] || questNoviceBadge,
  })) : [
    {
      id: 'quest_novice',
      name: 'Quest Novice',
      desc: 'Complete your first 10 quests.',
      criteria: '10 of 10 completed',
      unlocked: true,
      xp: 50,
      rarity: 'COMMON',
      img: questNoviceBadge
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      desc: 'Maintain an uninterrupted 7-day streak.',
      criteria: '7 of 7 days',
      unlocked: true,
      xp: 100,
      rarity: 'RARE',
      img: streakMasterBadge
    },
    {
      id: 'focus_adept',
      name: 'Focus Adept',
      desc: 'Conquer 10 deep focus sessions.',
      criteria: '10 of 10 sessions',
      unlocked: true,
      xp: 100,
      rarity: 'RARE',
      img: focusAdeptBadge
    },
    {
      id: 'habit_forger',
      name: 'Habit Forger',
      desc: 'Achieve a 21-day continuous habit streak.',
      criteria: '14 of 21 days',
      unlocked: false,
      progressPct: 66,
      xp: 150,
      rarity: 'EPIC',
      img: streakMasterBadge
    },
  ];

  const filtered = displayList.filter((a) => {
    if (filter === 'UNLOCKED') return a.unlocked;
    if (filter === 'LOCKED') return !a.unlocked;
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Hall of Achievements</span>
            <Trophy className="w-5 h-5 text-cyan" />
          </h1>
          <p className="text-xs text-text-2 mt-0.5">
            Milestones and badges unlocked through relentless discipline.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10">
          {['ALL', 'UNLOCKED', 'LOCKED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-cyan text-jet font-bold shadow-glow-cyan-sm'
                  : 'text-text-3 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ach) => (
          <Card
            key={ach.id}
            className={`p-5 flex flex-col justify-between border transition-all ${
              ach.unlocked
                ? 'bg-surface-1 border-amethyst/60 shadow-[0_0_20px_rgba(59,10,107,0.3)]'
                : 'bg-surface-1/40 border-white/[0.06] opacity-70'
            }`}
          >
            <div>
              {/* Badge Icon and Unlock status */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-16 h-16 flex items-center justify-center relative filter ${
                  ach.unlocked ? 'drop-shadow-[0_0_12px_rgba(123,63,207,0.8)]' : 'grayscale opacity-50'
                }`}>
                  <img src={ach.img} alt={ach.name} className="w-14 h-14 object-contain" />
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono">
                  {ach.unlocked ? (
                    <span className="flex items-center gap-1 text-success font-semibold px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-text-3 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Desc */}
              <h3 className={`text-base font-bold ${ach.unlocked ? 'text-white' : 'text-text-2'}`}>
                {ach.name}
              </h3>
              <p className="text-xs text-text-3 mt-1 leading-relaxed">
                {ach.desc}
              </p>
            </div>

            {/* Bottom: Criteria + XP Reward */}
            <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-text-3 text-[11px]">
                {ach.criteria}
              </span>
              <span className="text-cyan font-bold">
                +{ach.xp} XP
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
