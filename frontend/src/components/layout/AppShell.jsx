import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileTabBar from './MobileTabBar';
import QuestCreateModal from '../quests/QuestCreateModal';
import EvoDrawer from '../evo/EvoDrawer';
import LevelUpOverlay from '../effects/LevelUpOverlay';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AppShell = () => {
  const { profile, setProfile } = useAuth();
  const { info } = useToast();

  const [questModalOpen, setQuestModalOpen] = useState(false);
  const [evoDrawerOpen, setEvoDrawerOpen] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);

  const handleQuestCreated = (newQuest) => {
    // Dispatch custom event so pages can refresh their quest lists
    window.dispatchEvent(new CustomEvent('evolvia_quest_created', { detail: newQuest }));
  };

  const handleDailyRewardClaim = (xp) => {
    if (profile) {
      const newTotal = (profile.total_xp || 18950) + xp;
      setProfile((prev) => ({
        ...prev,
        total_xp: newTotal,
        xp_in_level: (prev.xp_in_level || 2450) + xp,
      }));
    }
  };

  return (
    <div className="min-h-screen cyber-bg flex flex-col md:flex-row text-text-1">
      {/* Desktop/Tablet Sidebar */}
      <div className="hidden md:block">
        <Sidebar onClaimDailyReward={handleDailyRewardClaim} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        <Header
          displayName={profile?.display_name?.split(' ')[0] || 'Ashwin'}
          unreadNotifications={1}
          onOpenNotifications={() => info('Notifications', 'Level 12 reached! Daily login bonus ready.')}
        />

        <main className="flex-1 p-4 lg:p-7 max-w-[1720px] w-full mx-auto">
          <Outlet
            context={{
              openNewQuest: () => setQuestModalOpen(true),
              openEvoAI: () => setEvoDrawerOpen(true),
              triggerLevelUp: (data) => setLevelUpData(data),
            }}
          />
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar />

      {/* Global Modals & Overlays */}
      <QuestCreateModal
        isOpen={questModalOpen}
        onClose={() => setQuestModalOpen(false)}
        onQuestCreated={handleQuestCreated}
      />

      <EvoDrawer
        isOpen={evoDrawerOpen}
        onClose={() => setEvoDrawerOpen(false)}
        onAddQuest={handleQuestCreated}
      />

      <LevelUpOverlay
        levelUpData={levelUpData}
        onClose={() => setLevelUpData(null)}
      />
    </div>
  );
};

export default AppShell;
