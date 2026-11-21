import React from 'react';
import { Swords, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import portalImg from '../../assets/images/questline_portal.png';
import Badge from '../ui/Badge';

export const QuestlineBanner = ({
  questline = {
    id: 'active',
    title: 'Exam Preparation Arc',
    rarity: 'EPIC',
    progress_pct: 60
  }
}) => {
  const navigate = useNavigate();
  const { id = 'active', title = 'Exam Preparation Arc', rarity = 'EPIC', progress_pct = 60 } = questline || {};

  return (
    <Card className="relative p-4 lg:p-5 bg-[#090414]/90 border-amethyst/50 overflow-hidden shadow-glass">
      {/* Background Portal Artwork in center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-40">
        <img
          src={portalImg}
          alt="Ancient Cyberpunk Portal"
          className="h-full w-auto max-w-none object-cover filter drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090414] via-transparent to-[#090414]" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Swords Icon + Questline Title + Rarity Badge */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amethyst/30 border border-amethyst/60 flex items-center justify-center text-cyan shadow-[0_0_15px_rgba(123,63,207,0.5)] shrink-0">
            <Swords className="w-5 h-5 text-cyan" />
          </div>

          <div>
            <div className="text-[11px] text-text-3 font-semibold uppercase tracking-wider">
              Active Questline
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-bold text-white">
                {title}
              </span>
              <Badge variant="amethyst" size="xs">
                {rarity}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right: Progress bar & Continue button */}
        <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end">
          {/* Progress % and Bar */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <span className="text-xs text-text-2">Progress</span>
            <div className="flex-1 h-2 rounded-full bg-white/[0.08] overflow-hidden p-[1px]">
              <div
                className="h-full rounded-full bg-cyan shadow-glow-cyan-sm transition-all duration-500"
                style={{ width: `${progress_pct}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-white">
              {progress_pct}%
            </span>
          </div>

          {/* Continue Button */}
          <button
            onClick={() => navigate(`/questlines/${id}`)}
            className="px-4 py-2 rounded-xl border border-cyan/70 text-cyan hover:bg-cyan/15 hover:shadow-glow-cyan-sm font-semibold text-xs flex items-center gap-1.5 transition-all duration-200 active:scale-95 shrink-0"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default QuestlineBanner;
