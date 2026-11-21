import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Swords, CheckCircle2, Circle, Lock, ArrowLeft, Award, Sparkles, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import portalImg from '../assets/images/questline_portal.png';
import apiClient from '../services/apiClient';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const QuestlineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { syncProfile } = useAuth();
  const [completingId, setCompletingId] = useState(null);

  // Fetch live questline data from backend database
  const { data: questline, isLoading, refetch } = useQuery({
    queryKey: ['questline', id],
    queryFn: async () => {
      if (id && id !== 'active') {
        try {
          const res = await apiClient.get(`/questlines/${id}/`);
          return res.data;
        } catch (e) {
          // Fall through to active questline
        }
      }
      const res = await apiClient.get('/questlines/active/');
      return res.data;
    },
    staleTime: 1000 * 5,
  });

  const milestones = questline?.milestones || [
    { id: 1, title: 'Complete Java Assignment', xp_reward: 50, status: 'COMPLETED', is_completed: true },
    { id: 2, title: 'Study Cyber Forensics (2 hrs)', xp_reward: 50, status: 'COMPLETED', is_completed: true },
    { id: 3, title: 'Database Schema Normalization Drill', xp_reward: 50, status: 'COMPLETED', is_completed: true },
    { id: 4, title: 'Operating Systems Memory Management Mock', xp_reward: 50, status: 'ACTIVE', is_completed: false },
    { id: 5, title: 'Final Comprehensive Exam Simulation', xp_reward: 50, status: 'LOCKED', is_completed: false },
  ];

  const completedCount = milestones.filter((m) => m.is_completed || m.status === 'COMPLETED').length;
  const progressPct = questline?.progress_pct ?? Math.round((completedCount / milestones.length) * 100);

  const completeMilestone = async (milestoneId, xp) => {
    if (completingId || !questline) return;
    setCompletingId(milestoneId);

    try {
      const res = await apiClient.post(`/questlines/${questline.id}/milestones/${milestoneId}/complete/`);
      if (!res.data.already_completed) {
        success('Milestone Conquered! ⚡', `+${xp} XP awarded. Advancing questline arc.`);
        if (res.data.questline_completed) {
          success('Questline Arc Conquered! 🏆', `Epic Arc complete! +${questline.bonus_xp || 350} bonus XP awarded.`);
        }
      }
      if (res.data.profile) {
        syncProfile(res.data.profile);
      }
      await queryClient.invalidateQueries({ queryKey: ['questline'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await refetch();
    } catch (err) {
      error('Action Failed', 'Could not record milestone completion in database.');
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-text-3 hover:text-cyan transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Command Center</span>
      </button>

      {/* Questline Header Banner */}
      <Card className="relative p-6 lg:p-8 bg-[#0B0518]/90 border-amethyst/60 overflow-hidden shadow-[0_0_35px_rgba(59,10,107,0.5)]">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none">
          <img src={portalImg} alt="Questline Portal" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0518] to-transparent" />
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <Swords className="w-5 h-5 text-cyan" />
            <span className="text-xs font-semibold text-text-3 uppercase tracking-wider">
              Epic Questline Arc
            </span>
            <Badge variant="amethyst" size="xs">
              {questline?.rarity || 'EPIC'}
            </Badge>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            {questline?.title || 'Exam Preparation Arc'}
          </h1>
          <p className="text-xs text-text-2 mt-2 leading-relaxed">
            {questline?.description || 'A structured sequence of high-leverage study sessions designed to master core computer science curricula and conquer semester examinations.'}
          </p>

          {/* Progress Bar */}
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-text-2">
              <span>Milestones: {completedCount} of {milestones.length}</span>
              <span className="text-cyan font-bold">{progressPct}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-cyan shadow-glow-cyan-sm transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Milestones Sequence */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan" />
          <span>Milestone Path</span>
        </h2>

        <div className="space-y-3">
          {milestones.map((milestone, idx) => {
            const isCompleted = milestone.is_completed || milestone.status === 'COMPLETED';
            const isActive = milestone.status === 'ACTIVE' && !isCompleted;
            const isLocked = milestone.status === 'LOCKED' && !isCompleted;
            const isBusy = completingId === milestone.id;

            return (
              <Card
                key={milestone.id}
                className={`p-4 flex items-center justify-between gap-4 border-amethyst/30 transition-all ${
                  isActive
                    ? 'bg-cyan/[0.06] border-cyan/50 shadow-glow-cyan-sm'
                    : isCompleted
                    ? 'bg-surface-1'
                    : 'bg-surface-1/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-success fill-success/20" />
                    ) : isActive ? (
                      <div className="w-6 h-6 rounded-full border-2 border-cyan text-cyan flex items-center justify-center animate-pulse">
                        {idx + 1}
                      </div>
                    ) : (
                      <Lock className="w-5 h-5 text-text-3" />
                    )}
                  </div>

                  <div>
                    <h3 className={`text-xs font-bold ${isCompleted ? 'text-white' : isActive ? 'text-cyan' : 'text-text-3'}`}>
                      {milestone.title}
                    </h3>
                    <div className="text-[10px] text-text-3 font-mono mt-0.5">
                      Stage {idx + 1} • +{milestone.xp_reward || milestone.xp || 50} XP
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isActive && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isBusy}
                      loading={isBusy}
                      onClick={() => completeMilestone(milestone.id, milestone.xp_reward || milestone.xp || 50)}
                    >
                      Complete Milestone
                    </Button>
                  )}
                  {isCompleted && (
                    <span className="text-xs font-semibold text-success font-mono">
                      Completed ✓
                    </span>
                  )}
                  {isLocked && (
                    <span className="text-xs text-text-3 font-mono">
                      Locked
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestlineDetail;
