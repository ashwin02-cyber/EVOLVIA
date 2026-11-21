import React from 'react';
import { Zap, Flame, Target, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';
import AvatarHexagon from '../ui/AvatarHexagon';
import LevelHexagon from '../ui/LevelHexagon';

export const ProfileCard = ({ profile = {} }) => {
  const {
    display_name = 'Ashwin Bhalaji',
    title_tagline = 'Productivity Explorer',
    level = 12,
    xp_in_level = 2450,
    xp_needed = 3000,
    progress_pct = 82,
    quests_done = 24,
    current_streak = 7,
    consistency_pct = 86,
    is_verified = true
  } = profile;

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-[#0B0615]/80 border-amethyst/40">
      <div className="flex items-start gap-4">
        {/* Hexagonal Avatar */}
        <AvatarHexagon size={82} alt={display_name} />

        {/* User Details */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-white truncate">
                {display_name}
              </h2>
              {is_verified && (
                <div className="w-4 h-4 rounded-full bg-cyan/20 border border-cyan/60 flex items-center justify-center text-cyan shadow-glow-cyan-sm">
                  <CheckCircle2 className="w-3 h-3 fill-cyan text-jet" />
                </div>
              )}
            </div>

            {/* Level Hexagon */}
            <LevelHexagon level={level} size={54} />
          </div>

          <p className="text-xs text-text-2 -mt-1">{title_tagline}</p>

          {/* XP Bar & Numbers */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-white font-medium">
                {xp_in_level.toLocaleString()} <span className="text-text-3">/</span> {xp_needed.toLocaleString()} XP
              </span>
              <span className="text-cyan font-bold">{progress_pct}%</span>
            </div>

            {/* Glowing Gradient Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-white/[0.07] overflow-hidden p-[1px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan shadow-glow-cyan-sm transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress_pct))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Stats Along the Bottom */}
      <div className="grid grid-cols-3 gap-2 pt-4 mt-3 border-t border-white/[0.06]">
        {/* Quests Done */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan/15 border border-cyan/30 flex items-center justify-center text-cyan shrink-0">
            <Zap className="w-3.5 h-3.5 fill-cyan text-cyan" />
          </div>
          <div>
            <div className="text-sm font-bold font-mono text-white leading-tight">
              {quests_done}
            </div>
            <div className="text-[10px] text-text-3 uppercase tracking-wider font-medium leading-tight">
              Quests Done
            </div>
          </div>
        </div>

        {/* Day Streak */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FF4D6D]/15 border border-[#FF4D6D]/30 flex items-center justify-center text-[#FF4D6D] shrink-0">
            <Flame className="w-3.5 h-3.5 fill-[#FF4D6D] text-[#FF4D6D]" />
          </div>
          <div>
            <div className="text-sm font-bold font-mono text-white leading-tight">
              {current_streak}
            </div>
            <div className="text-[10px] text-text-3 uppercase tracking-wider font-medium leading-tight">
              Day Streak
            </div>
          </div>
        </div>

        {/* Consistency */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amethyst/30 border border-amethyst/60 flex items-center justify-center text-purple-300 shrink-0">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-sm font-bold font-mono text-white leading-tight">
              {consistency_pct}%
            </div>
            <div className="text-[10px] text-text-3 uppercase tracking-wider font-medium leading-tight">
              Consistency
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCard;
