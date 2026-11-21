import React, { useState } from 'react';
import { BarChart2, Crown, Medal, Award, Flame, Zap } from 'lucide-react';
import Card from '../components/ui/Card';
import AvatarHexagon from '../components/ui/AvatarHexagon';
import LevelHexagon from '../components/ui/LevelHexagon';

export const Leaderboard = () => {
  const [tab, setTab] = useState('weekly'); // 'weekly' | 'all'

  const PLAYERS = [
    { rank: 1, name: 'Vikram Thorne', level: 16, rankTitle: 'Quest Adept', xp: 26400, streak: 18, isMe: false },
    { rank: 2, name: 'Elena Rostova', level: 14, rankTitle: 'Productivity Explorer', xp: 21800, streak: 12, isMe: false },
    { rank: 3, name: 'Ashwin Bhalaji', level: 12, rankTitle: 'Productivity Explorer', xp: 18950, streak: 7, isMe: true },
    { rank: 4, name: 'Marcus Vance', level: 11, rankTitle: 'Productivity Explorer', xp: 17200, streak: 9, isMe: false },
    { rank: 5, name: 'Sora Tanaka', level: 10, rankTitle: 'Productivity Explorer', xp: 16500, streak: 6, isMe: false },
    { rank: 6, name: 'Zane Sterling', level: 8, rankTitle: 'Apprentice', xp: 12400, streak: 4, isMe: false },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Global Leaderboard</span>
            <Crown className="w-5 h-5 text-gold" />
          </h1>
          <p className="text-xs text-text-2 mt-0.5">
            Compete with fellow operators. Ranked strictly by verified progression XP.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10">
          <button
            onClick={() => setTab('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'weekly' ? 'bg-cyan text-jet shadow-glow-cyan-sm' : 'text-text-3 hover:text-white'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'all' ? 'bg-cyan text-jet shadow-glow-cyan-sm' : 'text-text-3 hover:text-white'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* Podium Top 3 */}
      <div className="grid grid-cols-3 gap-3 items-end pt-4 pb-2">
        {/* Rank 2 */}
        <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#0F0820]/80 border border-white/10 backdrop-blur-md">
          <div className="w-6 h-6 rounded-full bg-slate-400 text-jet font-bold text-xs flex items-center justify-center mb-2">
            2
          </div>
          <div className="font-bold text-xs text-white truncate max-w-full">
            {PLAYERS[1].name}
          </div>
          <div className="text-[11px] font-mono text-cyan mt-1">
            {PLAYERS[1].xp.toLocaleString()} XP
          </div>
          <div className="text-[10px] text-text-3 mt-0.5">Lvl {PLAYERS[1].level}</div>
        </div>

        {/* Rank 1 (Tallest) */}
        <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-[#180A30]/90 border border-gold/40 shadow-[0_0_25px_rgba(255,200,87,0.2)] backdrop-blur-md -translate-y-2">
          <Crown className="w-6 h-6 text-gold mb-1" />
          <div className="w-7 h-7 rounded-full bg-gold text-jet font-extrabold text-xs flex items-center justify-center mb-2 shadow-lg">
            1
          </div>
          <div className="font-bold text-sm text-white truncate max-w-full">
            {PLAYERS[0].name}
          </div>
          <div className="text-xs font-mono font-bold text-cyan mt-1">
            {PLAYERS[0].xp.toLocaleString()} XP
          </div>
          <div className="text-[10px] text-gold font-semibold mt-0.5">Lvl {PLAYERS[0].level}</div>
        </div>

        {/* Rank 3 */}
        <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#0F0820]/80 border border-amber-700/40 backdrop-blur-md">
          <div className="w-6 h-6 rounded-full bg-amber-600 text-jet font-bold text-xs flex items-center justify-center mb-2">
            3
          </div>
          <div className="font-bold text-xs text-white truncate max-w-full">
            {PLAYERS[2].name}
          </div>
          <div className="text-[11px] font-mono text-cyan mt-1">
            {PLAYERS[2].xp.toLocaleString()} XP
          </div>
          <div className="text-[10px] text-cyan font-semibold mt-0.5">You (Lvl {PLAYERS[2].level})</div>
        </div>
      </div>

      {/* Rankings List */}
      <div className="space-y-2">
        {PLAYERS.map((player) => (
          <Card
            key={player.rank}
            className={`p-3.5 flex items-center justify-between gap-4 border-amethyst/30 ${
              player.isMe ? 'bg-cyan/10 border-cyan/60 shadow-glow-cyan-sm' : 'bg-surface-1'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <span className={`w-6 text-center font-mono font-bold text-sm ${player.rank <= 3 ? 'text-gold' : 'text-text-3'}`}>
                #{player.rank}
              </span>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{player.name}</span>
                  {player.isMe && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan text-jet font-extrabold uppercase">
                      YOU
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-text-3 mt-0.5">{player.rankTitle}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-text-3">Lvl {player.level}</span>
              <span className="text-cyan font-bold">{player.xp.toLocaleString()} XP</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
