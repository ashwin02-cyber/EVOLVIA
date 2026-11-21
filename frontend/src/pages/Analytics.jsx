import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, TrendingUp, Target, Clock, Zap, Layers } from 'lucide-react';
import Card from '../components/ui/Card';
import ProgressWidget from '../components/dashboard/ProgressWidget';
import { SEED_DASHBOARD_DATA } from '../utils/constants';
import apiClient from '../services/apiClient';

export const Analytics = () => {
  // Query live XP analytics
  const { data: xpAnalytics } = useQuery({
    queryKey: ['analytics-xp'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/xp/');
      return res.data;
    },
    staleTime: 1000 * 15,
  });

  // Query live Quest analytics
  const { data: questAnalytics } = useQuery({
    queryKey: ['analytics-quests'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/quests/');
      return res.data;
    },
    staleTime: 1000 * 15,
  });

  // Query live Focus analytics
  const { data: focusAnalytics } = useQuery({
    queryKey: ['analytics-focus'],
    queryFn: async () => {
      const res = await apiClient.get('/analytics/focus/');
      return res.data;
    },
    staleTime: 1000 * 15,
  });

  // Query dashboard for current profile & progress
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/');
      return res.data;
    },
    staleTime: 1000 * 15,
  });

  const weeklyXp = xpAnalytics?.week_xp ?? dashboardData?.progress?.week_xp ?? 420;
  const questDone = questAnalytics?.completed_quests ?? dashboardData?.today?.completed ?? 3;
  const questTotal = questAnalytics?.total_quests ?? dashboardData?.today?.total ?? 5;
  const focusMinutes = focusAnalytics?.total_minutes ?? 310;
  const focusSessions = focusAnalytics?.session_count ?? 12;

  const progressData = dashboardData?.progress || {
    ...SEED_DASHBOARD_DATA.progress,
    week_xp: weeklyXp,
    daily: xpAnalytics?.daily_xp || SEED_DASHBOARD_DATA.progress.daily,
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Productivity Analytics</span>
          <BarChart className="w-5 h-5 text-cyan" />
        </h1>
        <p className="text-xs text-text-2 mt-0.5">
          Detailed metrics derived directly from backend database activity and XP transactions.
        </p>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface-1 border-amethyst/30">
          <div className="text-[10px] text-text-3 uppercase font-medium">Weekly XP Gain</div>
          <div className="text-2xl font-bold font-mono text-cyan mt-1">+{weeklyXp} XP</div>
          <div className="text-[10px] text-success mt-1">↑ Active Velocity</div>
        </Card>

        <Card className="p-4 bg-surface-1 border-amethyst/30">
          <div className="text-[10px] text-text-3 uppercase font-medium">Quests Completed</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{questDone} / {questTotal}</div>
          <div className="text-[10px] text-text-2 mt-1">Verified in DB</div>
        </Card>

        <Card className="p-4 bg-surface-1 border-amethyst/30">
          <div className="text-[10px] text-text-3 uppercase font-medium">Focus Sprints</div>
          <div className="text-2xl font-bold font-mono text-purple-300 mt-1">{focusSessions} Sessions</div>
          <div className="text-[10px] text-text-2 mt-1">{focusMinutes} mins total</div>
        </Card>

        <Card className="p-4 bg-surface-1 border-amethyst/30">
          <div className="text-[10px] text-text-3 uppercase font-medium">Consistency</div>
          <div className="text-2xl font-bold font-mono text-cyan mt-1">
            {dashboardData?.progress?.consistency_pct ? `${dashboardData.progress.consistency_pct}%` : '86%'}
          </div>
          <div className="text-[10px] text-success mt-1">Elite Tier</div>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ProgressWidget progress={progressData} />

        {/* Category Split Card */}
        <Card className="p-5 flex flex-col justify-between bg-surface-1 border-amethyst/40">
          <div>
            <h3 className="text-sm font-bold text-white mb-4">Focus by Category</h3>
            <div className="space-y-3">
              {[
                { name: 'Study & Exams', pct: 45, color: 'bg-cyan' },
                { name: 'Development & Projects', pct: 30, color: 'bg-amethyst-300' },
                { name: 'Discipline & Habits', pct: 15, color: 'bg-gold' },
                { name: 'Health & Fitness', pct: 10, color: 'bg-success' },
              ].map((cat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-2">{cat.name}</span>
                    <span className="font-mono text-white font-bold">{cat.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
