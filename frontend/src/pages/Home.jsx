import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Hero from '../components/dashboard/Hero';
import ProfileCard from '../components/dashboard/ProfileCard';
import TodaysQuests from '../components/dashboard/TodaysQuests';
import EvoAICard from '../components/dashboard/EvoAICard';
import FocusWidget from '../components/dashboard/FocusWidget';
import ProgressWidget from '../components/dashboard/ProgressWidget';
import AchievementsWidget from '../components/dashboard/AchievementsWidget';
import QuestlineBanner from '../components/dashboard/QuestlineBanner';
import { SEED_DASHBOARD_DATA } from '../utils/constants';
import apiClient from '../services/apiClient';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const navigate = useNavigate();
  const { openNewQuest, openEvoAI, triggerLevelUp } = useOutletContext();
  const queryClient = useQueryClient();
  const { success } = useToast();
  const { syncProfile } = useAuth();

  // Local state initialized with authentic seed data for instantaneous visual fidelity
  const [dashboardData, setDashboardData] = useState(SEED_DASHBOARD_DATA);

  // TanStack Query to fetch live dashboard data when backend is ready
  const { data: serverData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/');
      return res.data;
    },
    staleTime: 1000 * 30,
    retry: 1,
  });

  // Sync server data into state
  useEffect(() => {
    if (serverData) {
      setDashboardData((prev) => ({
        ...prev,
        ...serverData,
        profile: { ...prev.profile, ...serverData.profile },
        today: { ...prev.today, ...serverData.today },
        progress: { ...prev.progress, ...serverData.progress },
      }));
    }
  }, [serverData]);

  // Listen for externally created quests
  useEffect(() => {
    const handleQuestCreated = (e) => {
      const newQuest = e.detail;
      setDashboardData((prev) => {
        const updatedItems = [newQuest, ...prev.today.items].slice(0, 5);
        return {
          ...prev,
          today: {
            ...prev.today,
            total: prev.today.total + 1,
            items: updatedItems,
          },
        };
      });
    };

    window.addEventListener('evolvia_quest_created', handleQuestCreated);
    return () => window.removeEventListener('evolvia_quest_created', handleQuestCreated);
  }, []);

  // Complete Quest handler
  const handleCompleteQuest = async (questId, targetStatus) => {
    const quest = dashboardData.today.items.find((q) => q.id === questId);
    if (!quest) return;

    // Optimistic UI update
    setDashboardData((prev) => {
      const updatedItems = prev.today.items.map((item) => {
        if (item.id === questId) {
          return {
            ...item,
            status: targetStatus ? 'COMPLETED' : 'TODO',
            is_completed: targetStatus,
          };
        }
        return item;
      });

      const newCompleted = updatedItems.filter((i) => i.is_completed).length;
      const xpDelta = targetStatus ? quest.xp_reward : -quest.xp_reward;
      const newTotalXP = (prev.profile.total_xp || 18950) + xpDelta;
      const newInLevel = (prev.profile.xp_in_level || 2450) + xpDelta;
      const newPct = Math.min(100, Math.round((newInLevel / (prev.profile.xp_needed || 3000)) * 100));

      return {
        ...prev,
        today: {
          ...prev.today,
          completed: newCompleted,
          items: updatedItems,
        },
        profile: {
          ...prev.profile,
          total_xp: newTotalXP,
          xp_in_level: newInLevel,
          progress_pct: newPct,
          quests_done: targetStatus ? prev.profile.quests_done + 1 : prev.profile.quests_done,
        },
      };
    });

    if (targetStatus) {
      success('Quest Completed! ⚡', `Objective fulfilled. +${quest.xp_reward} XP awarded.`);
    }

    // Call backend API
    try {
      if (targetStatus) {
        const res = await apiClient.post(`/quests/${questId}/complete/`);
        if (res.data.level_up) {
          triggerLevelUp(res.data.level_up);
        }
        if (res.data.profile) {
          syncProfile(res.data.profile);
        }
      } else {
        await apiClient.post(`/quests/${questId}/undo-complete/`);
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    } catch (e) {
      // Backend may be offline, optimistic update already in place
    }
  };

  return (
    <div className="space-y-5">
      {/* Hero Section */}
      <Hero
        onNewQuest={openNewQuest}
        onFocusSession={() => navigate('/focus')}
        onPlanMyDay={openEvoAI}
        onAIAssistant={openEvoAI}
      />

      {/* Row 1: Profile Card (39%), Today's Quests (33%), Evo AI Card (28%) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5 md:col-span-1">
          <ProfileCard profile={dashboardData.profile} />
        </div>
        <div className="lg:col-span-4 md:col-span-1">
          <TodaysQuests
            today={dashboardData.today}
            onCompleteQuest={handleCompleteQuest}
            onOpenQuestDetail={(q) => navigate(`/quests?id=${q.id}`)}
            onViewAll={() => navigate('/quests')}
          />
        </div>
        <div className="lg:col-span-3 md:col-span-2">
          <EvoAICard evo={dashboardData.evo} onOpenChat={openEvoAI} />
        </div>
      </div>

      {/* Row 2: Focus Arena (31%), My Progress (33%), Achievements (36%) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-4 md:col-span-1">
          <FocusWidget onOpenFocusPage={() => navigate('/focus')} />
        </div>
        <div className="lg:col-span-4 md:col-span-1">
          <ProgressWidget progress={dashboardData.progress} />
        </div>
        <div className="lg:col-span-4 md:col-span-2">
          <AchievementsWidget achievements={dashboardData.achievements} />
        </div>
      </div>

      {/* Row 3: Active Questline Banner (Full Width) */}
      <div>
        <QuestlineBanner questline={dashboardData.active_questline} />
      </div>
    </div>
  );
};

export default Home;
