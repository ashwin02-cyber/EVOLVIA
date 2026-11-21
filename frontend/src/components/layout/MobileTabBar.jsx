import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Target, Layers, Box } from 'lucide-react';

export const MobileTabBar = () => {
  const TABS = [
    { id: 'home', label: 'Home', path: '/', icon: Home },
    { id: 'quests', label: 'Quests', path: '/quests', icon: BookOpen },
    { id: 'focus', label: 'Focus', path: '/focus', icon: Target },
    { id: 'habits', label: 'Habits', path: '/habits', icon: Layers },
    { id: 'world', label: 'World', path: '/world', icon: Box },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-[#070310]/95 border-t border-amethyst/40 backdrop-blur-xl z-40 flex items-center justify-around px-2">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all ${
                isActive
                  ? 'text-cyan filter drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]'
                  : 'text-text-3 hover:text-text-2'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileTabBar;
