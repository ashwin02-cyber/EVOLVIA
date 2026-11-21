import React from 'react';
import { Scroll, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import Card from '../ui/Card';

export const TodaysQuests = ({
  today = { total: 5, completed: 3, items: [] },
  onCompleteQuest,
  onOpenQuestDetail,
  onViewAll
}) => {
  const { total = 5, completed = 3, items = [] } = today;

  return (
    <Card className="p-5 flex flex-col justify-between h-full bg-[#0B0615]/80 border-amethyst/40">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scroll className="w-4 h-4 text-purple-300" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Today's Quests
            </h2>
          </div>
          <span className="text-xs text-text-2 font-mono">
            {completed} of {total} completed
          </span>
        </div>

        {/* 5-Segment Progress Bar matching reference image */}
        <div className="grid grid-cols-5 gap-1.5 my-3">
          {Array.from({ length: total || 5 }).map((_, idx) => {
            const isFilled = idx < completed;
            return (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isFilled
                    ? 'bg-cyan shadow-glow-cyan-sm'
                    : 'bg-white/[0.08]'
                }`}
              />
            );
          })}
        </div>

        {/* Quest Items List */}
        <div className="space-y-2 mt-3">
          {items.map((quest) => {
            const isDone = quest.is_completed || quest.status === 'COMPLETED';

            return (
              <div
                key={quest.id}
                onClick={() => onOpenQuestDetail && onOpenQuestDetail(quest)}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-amethyst/50 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Interactive Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCompleteQuest) onCompleteQuest(quest.id, !isDone);
                    }}
                    className="shrink-0 transition-transform active:scale-90"
                    aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-success fill-success/20 shadow-[0_0_8px_rgba(46,229,157,0.4)]" />
                    ) : (
                      <Circle className="w-4 h-4 text-text-3 group-hover:text-cyan transition-colors" />
                    )}
                  </button>

                  {/* Quest Title */}
                  <span
                    className={`text-xs font-medium truncate transition-colors ${
                      isDone
                        ? 'text-text-2 line-through decoration-text-3/60'
                        : 'text-text-1 group-hover:text-white'
                    }`}
                  >
                    {quest.title}
                  </span>
                </div>

                {/* Right: XP Tag + Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono font-semibold text-cyan px-2 py-0.5 rounded-md bg-cyan/10 border border-cyan/20">
                    +{quest.xp_reward} XP
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-text-3 group-hover:text-cyan transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View all link */}
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-[11px] text-text-3 hover:text-cyan font-medium text-center mt-3 transition-colors"
        >
          View all quests →
        </button>
      )}
    </Card>
  );
};

export default TodaysQuests;
