import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Layers, Plus, Flame, CheckCircle2, Circle, Calendar, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

export const Habits = () => {
  const { success, error } = useToast();
  const { syncProfile } = useAuth();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitTime, setNewHabitTime] = useState('08:00');
  const [checkingId, setCheckingId] = useState(null);

  // Fetch live habits from backend database
  const { data: habits = [], isLoading, refetch } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const res = await apiClient.get('/habits/');
      return res.data;
    },
    staleTime: 1000 * 5,
  });

  const toggleHabit = async (habit) => {
    if (checkingId === habit.id) return;
    setCheckingId(habit.id);

    try {
      const res = await apiClient.post(`/habits/${habit.id}/check-in/`);
      if (res.data.already_checked_in) {
        success('Already Checked In', `"${habit.name}" was already completed today.`);
      } else {
        success('Habit Check-in Complete! 🔥', `+${res.data.xp_awarded || 10} XP awarded. Streak: ${res.data.streak} days.`);
      }
      if (res.data.profile) {
        syncProfile(res.data.profile);
      }
      await queryClient.invalidateQueries({ queryKey: ['habits'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await refetch();
    } catch (err) {
      error('Check-in Failed', 'Could not record habit check-in in database.');
    } finally {
      setCheckingId(null);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      await apiClient.post('/habits/', {
        name: newHabitName.trim(),
        target_time: newHabitTime ? `${newHabitTime}:00` : null,
      });
      success('Habit Formed!', `"${newHabitName.trim()}" added to daily tracking.`);
      setNewHabitName('');
      setModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['habits'] });
      await refetch();
    } catch (err) {
      error('Creation Failed', 'Could not save new habit.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Daily Habits</span>
            <Layers className="w-5 h-5 text-cyan" />
          </h1>
          <p className="text-xs text-text-2 mt-0.5">
            Consistent habits forge unbreakable discipline. Check in daily to maintain streaks.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={() => setModalOpen(true)}>
          New Habit
        </Button>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        {habits.map((habit) => {
          const isDone = habit.completed_today || habit.completedToday;
          const streak = habit.current_streak ?? habit.streak ?? 0;
          const weekHistory = habit.week_history || [true, true, true, true, true, true, isDone];
          const isBusy = checkingId === habit.id;

          return (
            <Card
              key={habit.id}
              className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-1 border-amethyst/40"
            >
              {/* Left: Checkbox + Name + Target */}
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  onClick={() => toggleHabit(habit)}
                  disabled={isBusy}
                  className="transition-transform active:scale-90 shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-success fill-success/20 shadow-[0_0_10px_rgba(46,229,157,0.4)]" />
                  ) : (
                    <Circle className="w-6 h-6 text-text-3 hover:text-cyan" />
                  )}
                </button>

                <div>
                  <h3 className={`text-sm font-bold ${isDone ? 'text-white' : 'text-text-1'}`}>
                    {habit.name}
                  </h3>
                  <div className="text-[11px] text-text-3 mt-0.5">
                    Target: {habit.target_time ? habit.target_time.slice(0, 5) : 'Anytime'}
                  </div>
                </div>
              </div>

              {/* Right: Streak Flame + 7-Day Mini Dots */}
              <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
                {/* 7-Day Dots */}
                <div className="flex items-center gap-1.5">
                  {weekHistory.map((done, idx) => (
                    <div
                      key={idx}
                      title={`Day ${idx + 1}`}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        done
                          ? 'bg-cyan shadow-glow-cyan-sm'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>

                {/* Streak Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amethyst/20 border border-amethyst/50 text-cyan">
                  <Flame className="w-4 h-4 text-cyan fill-cyan" />
                  <span className="text-xs font-mono font-bold">{streak}d</span>
                </div>
              </div>
            </Card>
          );
        })}

        {habits.length === 0 && (
          <div className="p-8 text-center text-xs text-text-3 border border-dashed border-white/10 rounded-2xl">
            No habits active. Form a new habit to begin tracking your discipline!
          </div>
        )}
      </div>

      {/* New Habit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Forge New Habit"
        subtitle="Small daily actions compound into elite results"
      >
        <form onSubmit={handleCreateHabit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-2 mb-1.5 uppercase tracking-wider">
              Habit Name
            </label>
            <input
              type="text"
              required
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="e.g. Read 20 pages (Tech / Sci-Fi)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-1 border border-amethyst/60 focus:border-cyan text-sm text-text-1 placeholder-text-3"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-2 mb-1.5 uppercase tracking-wider">
              Target Execution Time
            </label>
            <input
              type="time"
              value={newHabitTime}
              onChange={(e) => setNewHabitTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-1 border border-amethyst/60 focus:border-cyan text-sm text-text-1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Form Habit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Habits;
