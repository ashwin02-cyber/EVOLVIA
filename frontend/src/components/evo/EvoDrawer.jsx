import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, X, Send, PlusCircle, Loader2, Calendar, 
  Zap, Target, BarChart2, ChevronRight, Check, AlertCircle,
  RefreshCw, Clock, Dumbbell
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import evoRobotImg from '../../assets/images/evo_robot.png';
import apiClient from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

// ─── Quick action definitions ─────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: 'plan', label: 'Plan My Day', icon: Calendar, message: null, isPlanTrigger: true },
  { id: 'quests', label: 'Suggest Quests', icon: Zap, message: 'Suggest 3 specific quests I can add based on my current level and pending work.' },
  { id: 'focus', label: 'Improve My Focus', icon: Target, message: 'Give me practical focus strategies for my current workload and streak.' },
  { id: 'prioritize', label: 'Help Me Prioritize', icon: BarChart2, message: 'Help me prioritize my pending quests. Which should I tackle first and why?' },
];

// ─── Difficulty color map ────────────────────────────────────────────────────
const DIFF_COLORS = {
  EASY: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  MEDIUM: 'text-cyan bg-cyan/10 border-cyan/30',
  HARD: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  EPIC: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
};

// ─── Mode Badge ──────────────────────────────────────────────────────────────
const ModeBadge = ({ mode }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
    mode === 'gemini'
      ? 'text-cyan border-cyan/40 bg-cyan/10'
      : 'text-purple-400 border-purple-400/40 bg-purple-400/10'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${mode === 'gemini' ? 'bg-cyan animate-pulse' : 'bg-purple-400'}`} />
    {mode === 'gemini' ? 'Gemini AI' : 'Basic Mode'}
  </span>
);

// ─── Typing Indicator ────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-start gap-2.5">
    <div className="w-6 h-6 rounded-full bg-cyan/15 border border-cyan/30 flex items-center justify-center shrink-0">
      <Sparkles className="w-3 h-3 text-cyan" />
    </div>
    <div className="bg-[#150929] border border-amethyst/50 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan/60 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-cyan/60 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-cyan/60 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

// ─── Message Bubble ──────────────────────────────────────────────────────────
const MessageBubble = ({ msg, onAddSuggestion, onAcceptPlan, acceptingPlan }) => {
  const isUser = msg.sender === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-2`}>
      {/* Bubble */}
      <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''} max-w-[90%]`}>
        {!isUser && (
          <div className="w-6 h-6 rounded-full bg-cyan/15 border border-cyan/30 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3 h-3 text-cyan" />
          </div>
        )}
        <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-glass ${
          isUser
            ? 'bg-cyan text-jet font-semibold rounded-br-none shadow-glow-cyan-sm'
            : 'bg-[#150929] border border-amethyst/50 text-text-1 rounded-bl-none'
        }`}>
          {msg.text}
        </div>
      </div>

      {/* Mode badge for Evo messages */}
      {!isUser && msg.mode && (
        <div className="ml-8">
          <ModeBadge mode={msg.mode} />
        </div>
      )}

      {/* Quest Suggestions */}
      {!isUser && msg.suggestions && msg.suggestions.length > 0 && !msg.isPlan && (
        <div className="ml-8 w-full space-y-1.5">
          <div className="text-[10px] font-semibold text-text-3 uppercase tracking-wider">
            Suggested Quests:
          </div>
          {msg.suggestions.map((s, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-white/[0.03] border border-amethyst/40 flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">{s.title}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${DIFF_COLORS[s.difficulty] || DIFF_COLORS.MEDIUM}`}>
                    {s.difficulty}
                  </span>
                  <span className="text-[10px] text-cyan font-mono">{s.estimated_minutes}min</span>
                </div>
              </div>
              <button
                onClick={() => onAddSuggestion(s)}
                className="px-2.5 py-1 rounded-lg bg-cyan text-jet text-xs font-bold flex items-center gap-1 shadow-glow-cyan-sm hover:bg-[#33EBFF] active:scale-95 shrink-0 transition-all"
              >
                <PlusCircle className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Plan Blocks */}
      {!isUser && msg.isPlan && msg.planBlocks && msg.planBlocks.length > 0 && (
        <div className="ml-8 w-full space-y-1.5">
          <div className="text-[10px] font-semibold text-text-3 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Your Day Plan <ModeBadge mode={msg.mode} />
          </div>
          <div className="space-y-1">
            {msg.planBlocks.map((block, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg border text-xs ${
                  block.is_break
                    ? 'bg-white/[0.02] border-white/[0.06] text-text-3'
                    : 'bg-[#0D0820] border-amethyst/40 text-text-1'
                }`}
              >
                <span className="font-mono text-[10px] text-cyan shrink-0 w-11">{block.start}</span>
                <span className={`flex-1 truncate font-medium ${block.is_break ? 'italic text-text-3' : ''}`}>
                  {block.title}
                </span>
                {!block.is_break && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${DIFF_COLORS[block.difficulty] || DIFF_COLORS.MEDIUM}`}>
                    {block.difficulty}
                  </span>
                )}
                <span className="text-[10px] text-text-3 shrink-0">{block.estimated_minutes}m</span>
              </div>
            ))}
          </div>
          
          {!msg.planAccepted && (
            <button
              onClick={() => onAcceptPlan(msg.id, msg.planBlocks)}
              disabled={acceptingPlan}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-cyan text-jet text-xs font-bold flex items-center justify-center gap-1.5 shadow-glow-cyan-sm hover:bg-[#33EBFF] active:scale-95 disabled:opacity-50 transition-all"
            >
              {acceptingPlan ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Creating Quests...</span></>
              ) : (
                <><Check className="w-3.5 h-3.5" /><span>Accept Plan & Create Quests</span></>
              )}
            </button>
          )}
          {msg.planAccepted && (
            <div className="flex items-center gap-2 text-xs text-success font-semibold py-1">
              <Check className="w-3.5 h-3.5" />
              <span>Plan accepted! {msg.createdCount || 0} quests added to Quest Board.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Plan My Day Panel ───────────────────────────────────────────────────────
const PlanDayPanel = ({ onClose, onPlanGenerated }) => {
  const [minutes, setMinutes] = useState(180);
  const [focusAreas, setFocusAreas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const areas = focusAreas.trim() ? focusAreas.split(',').map(a => a.trim()).filter(Boolean) : [];
      const res = await apiClient.post('/ai/plan-day/', { available_minutes: minutes, focus_areas: areas });
      onPlanGenerated(res.data);
    } catch (e) {
      setError('Could not generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-3 bg-[#0A0515] border-b border-white/[0.06]">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan" />
          Plan My Day
        </h4>
        <button onClick={onClose} className="text-text-3 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2.5">
        <div>
          <label className="text-[10px] font-semibold text-text-3 uppercase tracking-wider block mb-1">
            Available Time: <span className="text-cyan">{minutes} minutes</span>
          </label>
          <input
            type="range"
            min={30} max={480} step={15}
            value={minutes}
            onChange={e => setMinutes(Number(e.target.value))}
            className="w-full accent-cyan"
          />
          <div className="flex justify-between text-[9px] text-text-3 mt-0.5">
            <span>30m</span><span>2h</span><span>4h</span><span>6h</span><span>8h</span>
          </div>
        </div>
        
        <div>
          <label className="text-[10px] font-semibold text-text-3 uppercase tracking-wider block mb-1">
            Focus Areas (optional, comma-separated)
          </label>
          <input
            type="text"
            value={focusAreas}
            onChange={e => setFocusAreas(e.target.value)}
            placeholder="e.g. study, programming, reading"
            className="w-full px-3 py-2 rounded-xl bg-surface-2 border border-amethyst/40 focus:border-cyan focus:outline-none text-xs text-text-1 placeholder-text-3"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
      
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-cyan text-jet text-xs font-bold flex items-center justify-center gap-1.5 shadow-glow-cyan-sm hover:bg-[#33EBFF] active:scale-95 disabled:opacity-50 transition-all"
      >
        {loading ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Generating...</span></>
        ) : (
          <><Sparkles className="w-3.5 h-3.5" /><span>Generate My Plan</span></>
        )}
      </button>
    </div>
  );
};

// ─── Main EvoDrawer Component ────────────────────────────────────────────────
export const EvoDrawer = ({ isOpen, onClose, onAddQuest }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'evo',
      text: "Greetings! I'm Evo, your AI productivity companion. I can help you plan your day, prioritize quests, and optimize your focus. What would you like to work on?",
      mode: null,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPlanPanel, setShowPlanPanel] = useState(false);
  const [acceptingPlan, setAcceptingPlan] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  // Query AI status
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

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when drawer opens; handle Escape key
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const sendMessage = useCallback(async (textToSend = null) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;
    if (text.length > 1000) {
      toastError('Message too long', 'Keep messages under 1000 characters.');
      return;
    }

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/chat/', { message: text });
      const evoMsg = {
        id: Date.now() + 1,
        sender: 'evo',
        text: res.data.reply,
        suggestions: res.data.suggestions || [],
        mode: res.data.mode,
      };
      setMessages(prev => [...prev, evoMsg]);
    } catch (err) {
      // Frontend fallback if network completely down
      const fallbackMsg = {
        id: Date.now() + 1,
        sender: 'evo',
        text: "I'm having trouble connecting to the backend. Please ensure the server is running and try again.",
        suggestions: [],
        mode: 'fallback',
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, toastError]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (action) => {
    if (action.isPlanTrigger) {
      setShowPlanPanel(true);
      return;
    }
    sendMessage(action.message);
  };

  const handlePlanGenerated = (planData) => {
    setShowPlanPanel(false);
    const planMsg = {
      id: Date.now(),
      sender: 'evo',
      text: `Here's your personalized day plan! ${planData.blocks.filter(b => !b.is_break).length} focused work blocks across ${Math.round(planData.blocks.reduce((acc, b) => acc + b.estimated_minutes, 0) / 60 * 10) / 10} hours.`,
      isPlan: true,
      planBlocks: planData.blocks,
      mode: planData.mode,
      planAccepted: false,
    };
    setMessages(prev => [...prev, planMsg]);
  };

  const handleAcceptPlan = async (msgId, blocks) => {
    if (acceptingPlan) return;
    setAcceptingPlan(true);

    const workBlocks = blocks.filter(b => !b.is_break);

    try {
      const res = await apiClient.post('/ai/plan-day/accept/', { items: workBlocks });
      const count = res.data.created_count || 0;

      setMessages(prev => prev.map(m =>
        m.id === msgId
          ? { ...m, planAccepted: true, createdCount: count }
          : m
      ));

      success(`Plan Accepted! ⚡`, `${count} quests added to your Quest Board.`);

      // Invalidate quest + dashboard caches
      await queryClient.invalidateQueries({ queryKey: ['quests'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      if (onAddQuest) {
        res.data.created?.forEach(q => onAddQuest(q));
      }
    } catch (e) {
      toastError('Plan Acceptance Failed', 'Could not create quests from the plan.');
    } finally {
      setAcceptingPlan(false);
    }
  };

  const handleAddSuggestion = async (suggestion) => {
    try {
      const res = await apiClient.post('/quests/', {
        title: suggestion.title,
        difficulty: suggestion.difficulty || 'MEDIUM',
        estimated_minutes: suggestion.estimated_minutes || 30,
        status: 'TODO',
      });
      success('Quest Added! ⚡', `"${suggestion.title}" saved to your Quest Board.`);
      await queryClient.invalidateQueries({ queryKey: ['quests'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (onAddQuest) onAddQuest(res.data);
    } catch (e) {
      toastError('Add Quest Failed', 'Could not add quest to the database.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Evo AI Assistant">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 w-full max-w-[420px] h-full bg-[#0A0515] border-l border-amethyst/60 shadow-[0_0_60px_rgba(59,10,107,0.5)] flex flex-col overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0D0820] shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9">
                  <div className="w-9 h-9 rounded-full bg-cyan/15 border border-cyan/40 flex items-center justify-center">
                    <img src={evoRobotImg} alt="Evo AI" className="w-7 h-7 object-contain" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-cyan shadow-glow-cyan-sm border border-[#0D0820]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Evo AI Assistant
                    <Sparkles className="w-3.5 h-3.5 text-cyan" />
                  </h3>
                  <div className="mt-0.5">
                    <ModeBadge mode={aiMode} />
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-text-3 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] transition-all"
                aria-label="Close Evo AI"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* ── Plan Day Panel (conditional) ── */}
            <AnimatePresence>
              {showPlanPanel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden shrink-0"
                >
                  <PlanDayPanel
                    onClose={() => setShowPlanPanel(false)}
                    onPlanGenerated={handlePlanGenerated}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Quick Actions ── */}
            <div className="px-3 py-2 border-b border-white/[0.05] bg-[#080411] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-cyan/10 hover:border-cyan/40 border border-white/[0.08] text-[10px] text-text-2 hover:text-cyan whitespace-nowrap transition-all disabled:opacity-40 shrink-0"
                  >
                    <Icon className="w-3 h-3" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── Message Thread ── */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  onAddSuggestion={handleAddSuggestion}
                  onAcceptPlan={handleAcceptPlan}
                  acceptingPlan={acceptingPlan}
                />
              ))}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Input Footer ── */}
            <div className="p-3 border-t border-white/[0.08] bg-[#0D0820] shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Evo to plan, prioritize, or advise... (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  style={{ resize: 'none', maxHeight: '100px', overflowY: 'auto' }}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-2 border border-amethyst/50 focus:border-cyan focus:outline-none text-xs text-text-1 placeholder-text-3 transition-colors leading-relaxed"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl bg-cyan text-jet flex items-center justify-center shadow-glow-cyan-sm hover:bg-[#33EBFF] disabled:opacity-40 active:scale-95 transition-all shrink-0"
                  aria-label="Send message"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>
              <p className="text-[9px] text-text-3 mt-1.5 text-center">
                Evo AI · {aiMode === 'gemini' ? 'Powered by Google Gemini' : 'Basic Mode — Set GEMINI_API_KEY to enable full AI'}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EvoDrawer;
