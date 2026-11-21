import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Filter, LayoutGrid, List, CheckCircle2, Circle, Clock, Tag, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

export const QuestBoard = () => {
  const { openNewQuest } = useOutletContext();
  const { success, error } = useToast();
  const { syncProfile } = useAuth();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [actionInProgress, setActionInProgress] = useState({});

  // Query live quests from backend database
  const { data: quests = [], isLoading, refetch } = useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const res = await apiClient.get('/quests/');
      return res.data;
    },
    staleTime: 1000 * 5,
  });

  // Listen for externally created quests
  useEffect(() => {
    const handleQuestCreated = () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    };
    window.addEventListener('evolvia_quest_created', handleQuestCreated);
    return () => window.removeEventListener('evolvia_quest_created', handleQuestCreated);
  }, [queryClient]);

  const toggleStatus = async (quest) => {
    if (actionInProgress[quest.id]) return;
    setActionInProgress((prev) => ({ ...prev, [quest.id]: true }));

    const isCurrentlyDone = quest.status === 'COMPLETED';

    try {
      if (isCurrentlyDone) {
        const res = await apiClient.post(`/quests/${quest.id}/undo-complete/`);
        success('Quest Reopened', `"${quest.title}" returned to To-Do.`);
      } else {
        const res = await apiClient.post(`/quests/${quest.id}/complete/`);
        if (!res.data.already_completed) {
          success('Quest Completed! ⚡', `+${res.data.xp_awarded || quest.xp_reward} XP added to your total.`);
        }
        if (res.data.profile) {
          syncProfile(res.data.profile);
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['quests'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await refetch();
    } catch (err) {
      error('Action Failed', 'Could not update quest status.');
    } finally {
      setActionInProgress((prev) => ({ ...prev, [quest.id]: false }));
    }
  };

  const handleDeleteQuest = async (questId, questTitle) => {
    try {
      await apiClient.delete(`/quests/${questId}/`);
      success('Quest Terminated', `"${questTitle}" removed from quest log.`);
      await queryClient.invalidateQueries({ queryKey: ['quests'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      error('Deletion Failed', 'Could not delete quest.');
    }
  };

  const filteredQuests = quests.filter((q) => {
    const matchesDiff = filterDifficulty === 'ALL' || q.difficulty === filterDifficulty;
    const matchesCat = filterCategory === 'ALL' || (q.category && (q.category.name === filterCategory || q.category === filterCategory));
    const matchesSearch = !search || q.title.toLowerCase().includes(search.toLowerCase());
    return matchesDiff && matchesCat && matchesSearch;
  });

  const COLUMNS = [
    { id: 'TODO', title: 'To Do', color: 'text-text-2' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'text-cyan' },
    { id: 'COMPLETED', title: 'Completed', color: 'text-success' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Quest Board
          </h1>
          <p className="text-xs text-text-2 mt-0.5">
            Manage your daily objectives, assignments, and epic goals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center rounded-xl bg-white/[0.04] p-1 border border-white/10">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'board' ? 'bg-cyan text-jet font-bold shadow-glow-cyan-sm' : 'text-text-3 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'list' ? 'bg-cyan text-jet font-bold shadow-glow-cyan-sm' : 'text-text-3 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button variant="primary" size="sm" icon={Plus} onClick={openNewQuest}>
            New Quest
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-surface-1 border border-amethyst/30">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter quests..."
          className="px-3 py-1.5 rounded-xl bg-surface-2 border border-white/10 text-xs text-text-1 placeholder-text-3 focus:outline-none focus:border-cyan"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['ALL', 'EASY', 'MEDIUM', 'HARD', 'EPIC'].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDifficulty(d)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterDifficulty === d
                  ? 'bg-cyan text-jet font-bold shadow-glow-cyan-sm'
                  : 'text-text-3 hover:text-text-1 hover:bg-white/5'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {COLUMNS.map((col) => {
            const colQuests = filteredQuests.filter((q) => {
              if (col.id === 'TODO') return q.status === 'TODO' || !q.status;
              return q.status === col.id;
            });

            return (
              <div key={col.id} className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                    {col.title}
                  </h3>
                  <span className="text-xs font-mono text-text-3 px-2 py-0.5 rounded-md bg-white/[0.04]">
                    {colQuests.length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[300px] p-2 rounded-2xl bg-white/[0.01] border border-white/[0.04]">
                  {colQuests.map((quest) => (
                    <Card
                      key={quest.id}
                      className="p-4 bg-[#0E071C]/80 border-amethyst/50 hover:border-cyan/50 cursor-pointer space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <button
                            onClick={() => toggleStatus(quest)}
                            disabled={actionInProgress[quest.id]}
                            className="mt-0.5 transition-transform active:scale-90 shrink-0"
                          >
                            {quest.status === 'COMPLETED' ? (
                              <CheckCircle2 className="w-4 h-4 text-success fill-success/20" />
                            ) : (
                              <Circle className="w-4 h-4 text-text-3 hover:text-cyan" />
                            )}
                          </button>
                          <span
                            className={`text-xs font-bold truncate ${
                              quest.status === 'COMPLETED' ? 'line-through text-text-3' : 'text-white'
                            }`}
                          >
                            {quest.title}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuest(quest.id, quest.title);
                          }}
                          className="text-text-3 hover:text-danger p-1 rounded transition-colors"
                          title="Delete Quest"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {quest.description && (
                        <p className="text-[11px] text-text-2 leading-relaxed line-clamp-2">
                          {quest.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px]">
                        <span className="text-cyan font-mono font-bold px-2 py-0.5 rounded bg-cyan/10">
                          +{quest.xp_reward} XP
                        </span>
                        <span className="text-text-3 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{quest.estimated_minutes ? `${quest.estimated_minutes}m` : '30m'}</span>
                        </span>
                      </div>
                    </Card>
                  ))}

                  {colQuests.length === 0 && (
                    <div className="h-28 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-xs text-text-3">
                      No quests in {col.title}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredQuests.map((quest) => (
            <Card
              key={quest.id}
              className="p-3.5 flex items-center justify-between gap-4 bg-surface-1 border-amethyst/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => toggleStatus(quest)}
                  disabled={actionInProgress[quest.id]}
                  className="shrink-0"
                >
                  {quest.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-4 h-4 text-success fill-success/20" />
                  ) : (
                    <Circle className="w-4 h-4 text-text-3 hover:text-cyan" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${quest.status === 'COMPLETED' ? 'line-through text-text-3' : 'text-white'}`}>
                    {quest.title}
                  </div>
                  <div className="text-[10px] text-text-3 flex items-center gap-2 mt-0.5">
                    <span>{quest.category?.name || quest.category || 'Discipline'}</span>
                    <span>•</span>
                    <span>{quest.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-mono font-bold text-cyan px-2 py-0.5 rounded bg-cyan/10">
                  +{quest.xp_reward} XP
                </span>
                <Badge variant={quest.status === 'COMPLETED' ? 'success' : 'outline'} size="xs">
                  {quest.status}
                </Badge>
                <button
                  onClick={() => handleDeleteQuest(quest.id, quest.title)}
                  className="text-text-3 hover:text-danger p-1 rounded transition-colors"
                  title="Delete Quest"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestBoard;
