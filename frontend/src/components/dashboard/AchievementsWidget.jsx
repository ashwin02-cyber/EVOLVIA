import React from 'react';
import { Trophy, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import questNoviceBadge from '../../assets/badges/quest_novice.png';
import streakMasterBadge from '../../assets/badges/streak_master.png';
import focusAdeptBadge from '../../assets/badges/focus_adept.png';

export const AchievementsWidget = ({ achievements = [] }) => {
  const navigate = useNavigate();

  const BADGES = [
    {
      id: 'quest_novice',
      name: 'Quest Novice',
      criteria: 'Complete 10 quests',
      img: questNoviceBadge
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      criteria: '7-day streak',
      img: streakMasterBadge
    },
    {
      id: 'focus_adept',
      name: 'Focus Adept',
      criteria: '10 focus sessions',
      img: focusAdeptBadge
    }
  ];

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-[#0B0615]/80 border-amethyst/40">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-cyan" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Achievements
            </h2>
          </div>

          <button
            onClick={() => navigate('/achievements')}
            className="flex items-center gap-1 text-xs text-text-3 hover:text-cyan transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Achievement Tiles */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {BADGES.map((badge) => (
            <div
              key={badge.id}
              onClick={() => navigate('/achievements')}
              className="flex flex-col items-center text-center p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-amethyst/50 transition-all duration-200 cursor-pointer group"
            >
              {/* Hex Medal Artwork */}
              <div className="w-12 h-12 flex items-center justify-center relative mb-2 filter drop-shadow-[0_0_8px_rgba(123,63,207,0.7)] group-hover:scale-105 transition-transform duration-200">
                <img
                  src={badge.img}
                  alt={badge.name}
                  className="w-10 h-10 object-contain"
                />
              </div>

              {/* Title */}
              <div className="text-xs font-semibold text-white group-hover:text-cyan transition-colors line-clamp-1">
                {badge.name}
              </div>

              {/* Criteria */}
              <div className="text-[10px] text-text-3 mt-0.5 line-clamp-1">
                {badge.criteria}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default AchievementsWidget;
