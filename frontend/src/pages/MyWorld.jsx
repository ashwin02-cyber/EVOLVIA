import React, { useState } from 'react';
import { Box, Shield, Zap, Flame, Target, Sparkles, Gem, Check } from 'lucide-react';
import Card from '../components/ui/Card';
import AvatarHexagon from '../components/ui/AvatarHexagon';
import LevelHexagon from '../components/ui/LevelHexagon';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const MyWorld = () => {
  const { profile } = useAuth();
  const { success, warning } = useToast();
  const [crystals, setCrystals] = useState(25);
  const [inventory, setInventory] = useState(['frame_cyan', 'freeze_1']);

  const REWARDS = [
    { id: 'freeze_streak', name: 'Streak Freeze Protocol', cost: 15, desc: 'Protects your streak from resetting if you miss 1 day.' },
    { id: 'frame_neon_amethyst', name: 'Amethyst Crest Frame', cost: 20, desc: 'Cosmetic holographic frame for your player profile.' },
    { id: 'title_strategist', name: 'Mastermind Title Tag', cost: 30, desc: 'Unlock the exclusive "Mastermind" title tag.' },
  ];

  const handlePurchase = (item) => {
    if (crystals < item.cost) {
      warning('Insufficient Crystals', 'Earn more crystals by leveling up and unlocking achievements.');
      return;
    }
    setCrystals((c) => c - item.cost);
    setInventory((inv) => [...inv, item.id]);
    success('Reward Unlocked! 💎', `"${item.name}" has been acquired.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Player Showcase Banner */}
      <Card className="p-7 relative overflow-hidden bg-[#0A0518]/90 border-amethyst/60 shadow-[0_0_35px_rgba(59,10,107,0.5)]">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <AvatarHexagon size={110} alt={profile?.display_name || 'Ashwin'} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {profile?.display_name || 'Ashwin Bhalaji'}
                </h1>
                <p className="text-xs text-cyan font-semibold mt-0.5">
                  Rank: {profile?.rank || 'Productivity Explorer'}
                </p>
              </div>

              {/* Crystal balance */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amethyst/30 border border-amethyst/70 text-purple-200">
                <Gem className="w-4 h-4 text-cyan" />
                <span className="font-mono font-bold text-sm text-cyan">{crystals}</span>
                <span className="text-xs">Crystals</span>
              </div>
            </div>

            {/* Overall Progression Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-mono mb-1 text-text-2">
                <span>Total XP: {profile?.total_xp?.toLocaleString() || '18,950'} XP</span>
                <span className="text-cyan font-bold">Level {profile?.level || 12}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amethyst-300 to-cyan shadow-glow-cyan-sm"
                  style={{ width: `${profile?.progress_pct || 82}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.08]">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[10px] text-text-3 uppercase font-medium">Quests Completed</div>
            <div className="text-xl font-bold font-mono text-white mt-1">24</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[10px] text-text-3 uppercase font-medium">Current Streak</div>
            <div className="text-xl font-bold font-mono text-[#FF4D6D] mt-1">7 Days</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[10px] text-text-3 uppercase font-medium">Consistency</div>
            <div className="text-xl font-bold font-mono text-cyan mt-1">86%</div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[10px] text-text-3 uppercase font-medium">Focus Hours</div>
            <div className="text-xl font-bold font-mono text-purple-300 mt-1">14.5 hrs</div>
          </div>
        </div>
      </Card>

      {/* Rewards & Cosmetics Store */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Gem className="w-4 h-4 text-cyan" />
          <span>Rewards & Crystals Shop</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REWARDS.map((item) => {
            const owned = inventory.includes(item.id);

            return (
              <Card key={item.id} className="p-5 flex flex-col justify-between bg-surface-1 border-amethyst/40">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-cyan">
                      <Gem className="w-3.5 h-3.5" />
                      <span>{item.cost}</span>
                    </div>
                  </div>
                  <p className="text-xs text-text-2 mt-2 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  {owned ? (
                    <div className="text-xs text-success font-semibold flex items-center gap-1.5 justify-center py-2">
                      <Check className="w-4 h-4" />
                      <span>Unlocked / Owned</span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePurchase(item)}
                      className="w-full"
                    >
                      Acquire ({item.cost} Crystals)
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyWorld;
