import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Card from '../ui/Card';
import evoRobotImg from '../../assets/images/evo_robot.png';
import apiClient from '../../services/apiClient';

export const EvoAICard = ({
  evo = { tip: 'Need a plan for your exams, projects or daily goals?' },
  onOpenChat
}) => {
  const { tip = 'Need a plan for your exams, projects or daily goals?' } = evo;

  // Reuse the same query key as EvoDrawer so the cache is shared
  const { data: aiStatus } = useQuery({
    queryKey: ['ai-status'],
    queryFn: async () => {
      const res = await apiClient.get('/ai/status/');
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const aiMode = aiStatus?.mode || 'fallback';
  const isGemini = aiMode === 'gemini';

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-[#0B0615]/80 border-amethyst/40">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Evo AI
            </h2>
          </div>

          {/* AI Mode Status Pill */}
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${
            isGemini
              ? 'bg-cyan/10 border-cyan/30 text-cyan'
              : 'bg-purple-400/10 border-purple-400/30 text-purple-400'
          }`}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isGemini ? 'bg-cyan shadow-glow-cyan-sm animate-pulse' : 'bg-purple-400'
              }`}
            />
            <span>{isGemini ? 'Gemini AI' : 'Basic Mode'}</span>
          </div>
        </div>

        {/* Mascot & Speech Bubble */}
        <div className="flex items-center gap-3 my-2">
          {/* Floating Robot Companion */}
          <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-cyan/20 rounded-full blur-xl animate-pulse-slow" />
            <img
              src={evoRobotImg}
              alt="Evo AI Robot Companion"
              className="w-14 h-14 object-contain relative z-10 animate-float filter drop-shadow-[0_0_10px_rgba(0,229,255,0.7)]"
            />
          </div>

          {/* Speech Bubble */}
          <div className="flex-1 relative rounded-2xl bg-[#140826]/90 border border-amethyst/60 p-3 text-xs text-text-2 leading-relaxed shadow-glass">
            <p>{tip}</p>
          </div>
        </div>
      </div>

      {/* Action Button: Chat with Evo */}
      <button
        onClick={onOpenChat}
        className="w-full mt-3 py-2 px-4 rounded-xl bg-cyan text-jet font-semibold text-xs flex items-center justify-center gap-2 shadow-glow-cyan-sm hover:bg-[#33EBFF] hover:shadow-glow-cyan-md active:scale-[0.98] transition-all duration-200 select-none"
      >
        <MessageSquare className="w-3.5 h-3.5 fill-current" />
        <span>Chat with Evo</span>
      </button>
    </Card>
  );
};

export default EvoAICard;
