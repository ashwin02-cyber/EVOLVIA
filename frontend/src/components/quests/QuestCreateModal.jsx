import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { DIFFICULTY_XP } from '../../utils/xp';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export const QuestCreateModal = ({ isOpen, onClose, onQuestCreated }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Study');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const xpReward = DIFFICULTY_XP[difficulty] || 50;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      error('Title Required', 'Please enter a title for your quest.');
      return;
    }

    setLoading(true);
    const newQuest = {
      title: title.trim(),
      description: description.trim(),
      difficulty,
      estimated_minutes: parseInt(estimatedMinutes) || 30,
      due_at: dueDate ? new Date(dueDate).toISOString() : null,
      xp_reward: xpReward,
      status: 'TODO',
      is_completed: false
    };

    try {
      const res = await apiClient.post('/quests/', newQuest);
      success('Quest Forged! ⚡', `"${title}" has been added to your quest log.`);
      await queryClient.invalidateQueries({ queryKey: ['quests'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (onQuestCreated) onQuestCreated(res.data);
    } catch (err) {
      // Local fallback creation
      const localQuest = { ...newQuest, id: Date.now() };
      success('Quest Forged! ⚡', `"${title}" has been added to your quest log.`);
      if (onQuestCreated) onQuestCreated(localQuest);
    } finally {
      setLoading(false);
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Forge New Quest"
      subtitle="Define your objective, difficulty, and rewards"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-text-2 mb-1.5 uppercase tracking-wider">
            Quest Objective
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Complete Java Assignment"
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-1 border border-amethyst/60 focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan text-sm text-text-1 placeholder-text-3"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-text-2 mb-1.5 uppercase tracking-wider">
            Briefing & Notes
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key milestones or resources required..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-1 border border-amethyst/60 focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan text-sm text-text-1 placeholder-text-3 resize-none"
          />
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-xs font-semibold text-text-2 mb-1.5 uppercase tracking-wider">
            Difficulty Tier & Reward
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'EASY', label: 'Easy', xp: 25 },
              { id: 'MEDIUM', label: 'Medium', xp: 50 },
              { id: 'HARD', label: 'Hard', xp: 100 },
              { id: 'EPIC', label: 'Epic', xp: 150 },
            ].map((d) => (
              <button
                type="button"
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`py-2 px-2 rounded-xl text-center border transition-all duration-200 ${
                  difficulty === d.id
                    ? 'bg-cyan/15 border-cyan text-cyan font-bold shadow-glow-cyan-sm'
                    : 'bg-white/[0.03] border-white/10 text-text-2 hover:bg-white/[0.06]'
                }`}
              >
                <div className="text-xs">{d.label}</div>
                <div className="text-[10px] font-mono text-cyan mt-0.5">+{d.xp} XP</div>
              </button>
            ))}
          </div>
        </div>

        {/* Category & Estimate */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-2 mb-1.5 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-1 border border-amethyst/60 focus:border-cyan focus:outline-none text-xs text-text-1"
            >
              <option value="Study">Study / Exams</option>
              <option value="Projects">Projects / Dev</option>
              <option value="Fitness">Fitness / Health</option>
              <option value="Discipline">Discipline / Habit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-2 mb-1.5 uppercase tracking-wider">
              Est. Minutes
            </label>
            <input
              type="number"
              min={5}
              max={480}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-1 border border-amethyst/60 focus:border-cyan focus:outline-none text-xs text-text-1 font-mono"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" loading={loading}>
            Forge Quest (+{xpReward} XP)
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default QuestCreateModal;
