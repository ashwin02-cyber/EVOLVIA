import React, { useState } from 'react';
import { BarChart2, ChevronsUp, Target, ChevronDown } from 'lucide-react';
import Card from '../ui/Card';

export const ProgressWidget = ({ progress = {} }) => {
  const [range, setRange] = useState('This Week');
  const [showDropdown, setShowDropdown] = useState(false);

  const {
    week_xp = 420,
    goal_pct = 68,
    daily_xp = [
      { day: 'Mon', xp: 60 },
      { day: 'Tue', xp: 40 },
      { day: 'Wed', xp: 65 },
      { day: 'Thu', xp: 110 },
      { day: 'Fri', xp: 75 },
      { day: 'Sat', xp: 45 },
      { day: 'Sun', xp: 25 },
    ]
  } = progress;

  const maxXP = Math.max(...daily_xp.map((d) => d.xp), 120);

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-[#0B0615]/80 border-amethyst/40">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              My Progress
            </h2>
          </div>

          {/* Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-text-2 hover:text-white transition-colors"
            >
              <span>{range}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-1 w-28 rounded-xl bg-surface-2 border border-amethyst/60 shadow-xl py-1 z-20 backdrop-blur-md">
                {['This Week', 'Last Week', 'This Month'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setRange(opt);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                      range === opt ? 'text-cyan bg-cyan/10 font-medium' : 'text-text-2 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content: 7-bar chart on left + 2 metric tiles on right */}
        <div className="grid grid-cols-5 gap-3 items-end mt-2">
          {/* 7 Vertical Gradient Bars (Columns 1-3) */}
          <div className="col-span-3 flex items-end justify-between gap-1.5 h-28 pt-2">
            {daily_xp.map((item, idx) => {
              const heightPct = Math.min(100, Math.max(12, Math.round((item.xp / maxXP) * 100)));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-cyan font-mono leading-none mb-1">
                    {item.xp}
                  </div>

                  {/* Gradient Bar */}
                  <div className="w-full rounded-t-md bg-white/[0.04] overflow-hidden flex flex-col justify-end h-20">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-amethyst-300 via-cyan-500 to-cyan transition-all duration-700 group-hover:brightness-125 shadow-glow-cyan-sm"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span className="text-[10px] text-text-3 font-medium">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Metric Tiles (Columns 4-5) */}
          <div className="col-span-2 flex flex-col justify-end gap-2.5">
            {/* Tile 1: +420 XP This Week */}
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan/15 border border-cyan/30 flex items-center justify-center text-cyan shrink-0">
                <ChevronsUp className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold font-mono text-white leading-tight">
                  +{week_xp} XP
                </div>
                <div className="text-[10px] text-text-3 leading-tight truncate">
                  This Week
                </div>
              </div>
            </div>

            {/* Tile 2: 68% Goal Completion */}
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amethyst/30 border border-amethyst/60 flex items-center justify-center text-purple-300 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold font-mono text-white leading-tight">
                  {goal_pct}%
                </div>
                <div className="text-[10px] text-text-3 leading-tight truncate">
                  Goal Completion
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProgressWidget;
