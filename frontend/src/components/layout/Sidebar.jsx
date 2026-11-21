import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Target,
  Layers,
  Box,
  Trophy,
  BarChart2,
  BarChart,
  ChevronRight
} from 'lucide-react';
import logoImg from '../../assets/images/logo_crest.png';
import DailyReward from './DailyReward';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', path: '/', icon: Home },
  { id: 'quests', label: 'Quest Board', path: '/quests', icon: BookOpen },
  { id: 'focus', label: 'Focus Arena', path: '/focus', icon: Target },
  { id: 'habits', label: 'Habits', path: '/habits', icon: Layers },
  { id: 'world', label: 'My World', path: '/world', icon: Box },
  { id: 'achievements', label: 'Achievements', path: '/achievements', icon: Trophy },
  { id: 'leaderboard', label: 'Leaderboard', path: '/leaderboard', icon: BarChart2 },
  { id: 'analytics', label: 'Analytics', path: '/analytics', icon: BarChart },
];

export const Sidebar = ({ onClaimDailyReward }) => {
  const location = useLocation();

  return (
    <aside className="w-[238px] shrink-0 h-screen sticky top-0 flex flex-col bg-[#050505]/95 border-r border-amethyst/30 z-30 select-none overflow-y-auto no-scrollbar">
      {/* Brand Header Card */}
      <div className="p-4 pb-2">
        <div className="rounded-2xl bg-[#0D071B]/80 border border-amethyst/40 p-3.5 flex flex-col items-center justify-center text-center backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          {/* Logo Emblem */}
          <div className="w-10 h-10 mb-1 flex items-center justify-center filter drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]">
            <img src={logoImg} alt="EVOLVIA Emblem" className="w-8 h-8 object-contain" />
          </div>

          {/* Wordmark */}
          <div className="font-orbitron font-extrabold text-base tracking-[0.22em] text-white">
            EVOLVIA
          </div>
          <div className="text-[8.5px] font-semibold tracking-[0.16em] text-text-3 uppercase mt-0.5">
            PRODUCTIVITY <span className="text-cyan">×</span> GAMIFIED
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-3 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                isActive
                  ? 'bg-cyan/15 border border-cyan/70 text-cyan shadow-glow-cyan-sm font-semibold'
                  : 'text-text-2 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-cyan filter drop-shadow-[0_0_6px_rgba(0,229,255,0.7)]' : 'text-text-3 group-hover:text-cyan'
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-cyan shrink-0" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Daily Login Reward Card */}
      <DailyReward onClaimSuccess={onClaimDailyReward} />
    </aside>
  );
};

export default Sidebar;
