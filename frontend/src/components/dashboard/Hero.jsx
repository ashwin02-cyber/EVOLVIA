import React from 'react';
import { Plus, Clock, Calendar, Sparkles } from 'lucide-react';
import heroSceneImg from '../../assets/images/hero_scene.png';
import Button from '../ui/Button';

export const Hero = ({
  onNewQuest,
  onFocusSession,
  onPlanMyDay,
  onAIAssistant
}) => {
  return (
    <section className="relative rounded-3xl overflow-hidden border border-amethyst/30 bg-[#090414]/70 mb-5 backdrop-blur-xl">
      {/* Right Artwork: Giant Purple Moon, Ruins, and Protagonist */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none select-none overflow-hidden">
        <img
          src={heroSceneImg}
          alt="Cyberpunk Moonlit Ruins"
          className="w-full h-full object-cover object-right"
        />
        {/* Subtle gradient overlay to blend into dark background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#090414] via-[#090414]/40 to-transparent" />
      </div>

      {/* Hero Left Content */}
      <div className="relative z-10 p-7 lg:p-9 max-w-2xl">
        {/* Display Title */}
        <h1 className="text-3xl lg:text-[44px] font-bold text-white tracking-tight leading-[1.15]">
          Ready for today’s{' '}
          <span className="text-cyan italic font-extrabold text-glow-cyan">
            Quest?
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-text-2 text-xs lg:text-sm mt-2.5 max-w-lg leading-relaxed">
          Turn your goals into quests, earn XP, level up and build your best self.
        </p>

        {/* 4 Hero Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={onNewQuest}
            className="shadow-glow-cyan-md"
          >
            New Quest
          </Button>

          <Button
            variant="ghost"
            size="md"
            icon={Clock}
            onClick={onFocusSession}
          >
            Focus Session
          </Button>

          <Button
            variant="ghost"
            size="md"
            icon={Calendar}
            onClick={onPlanMyDay}
          >
            Plan My Day
          </Button>

          <Button
            variant="ghost"
            size="md"
            icon={Sparkles}
            onClick={onAIAssistant}
          >
            AI Assistant
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
