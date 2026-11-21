import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../services/apiClient';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const FocusContext = createContext(null);

export const FocusProvider = ({ children }) => {
  const [activeSession, setActiveSession] = useState(null);
  const [mode, setMode] = useState('POMODORO'); // POMODORO | DEEP_WORK | STUDY | CUSTOM
  const [plannedSeconds, setPlannedSeconds] = useState(1500); // 25 mins
  const [remainingSeconds, setRemainingSeconds] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [linkedQuestId, setLinkedQuestId] = useState(null);
  const timerRef = useRef(null);
  const { success, warning } = useToast();
  const auth = useAuth();
  const syncProfile = auth?.syncProfile;

  // Restore active focus session from backend database on mount or page refresh
  useEffect(() => {
    const restoreActiveSession = async () => {
      try {
        const res = await apiClient.get('/focus/sessions/active/');
        if (res.data && res.data.id) {
          const sess = res.data;
          setActiveSession(sess);
          setMode(sess.mode);
          setPlannedSeconds(sess.planned_seconds);

          const startedAt = new Date(sess.started_at).getTime();
          const now = Date.now();
          const elapsedSecs = Math.max(0, Math.floor((now - startedAt) / 1000) - (sess.paused_total_seconds || 0));
          const rem = Math.max(0, sess.planned_seconds - elapsedSecs);

          setRemainingSeconds(rem);
          setIsRunning(sess.status === 'RUNNING' || sess.status === 'PAUSED');
          setIsPaused(sess.status === 'PAUSED');
        }
      } catch (err) {
        // No active session
      }
    };

    restoreActiveSession();
  }, []);

  // Mode durations
  const MODE_DURATIONS = {
    POMODORO: 25 * 60,
    DEEP_WORK: 50 * 60,
    STUDY: 45 * 60,
    CUSTOM: 30 * 60
  };

  const selectMode = (newMode, customSecs = null) => {
    setMode(newMode);
    const secs = customSecs || MODE_DURATIONS[newMode] || 1500;
    setPlannedSeconds(secs);
    if (!isRunning) {
      setRemainingSeconds(secs);
    }
  };

  // Sound chime via Web Audio API
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      // AudioContext may be blocked before gesture
    }
  };

  // Start focus session
  const startSession = async (questId = null) => {
    try {
      const res = await apiClient.post('/focus/sessions/', {
        mode,
        planned_seconds: plannedSeconds,
        quest: questId || linkedQuestId
      });
      setActiveSession(res.data);
    } catch (err) {
      // Offline fallback: create local session
      setActiveSession({
        id: 'local-' + Date.now(),
        started_at: new Date().toISOString(),
        planned_seconds: plannedSeconds
      });
    }
    setIsRunning(true);
    setIsPaused(false);
    success('Focus Arena Engaged', `${Math.round(plannedSeconds / 60)} minutes of deep focus initiated.`);
  };

  const pauseSession = async () => {
    if (!isRunning || isPaused) return;
    if (activeSession && !activeSession.id.toString().startsWith('local')) {
      try {
        await apiClient.post(`/focus/sessions/${activeSession.id}/pause/`);
      } catch (e) {
        // ignore
      }
    }
    setIsPaused(true);
  };

  const resumeSession = async () => {
    if (!isRunning || !isPaused) return;
    if (activeSession && !activeSession.id.toString().startsWith('local')) {
      try {
        await apiClient.post(`/focus/sessions/${activeSession.id}/resume/`);
      } catch (e) {
        // ignore
      }
    }
    setIsPaused(false);
  };

  const abandonSession = async () => {
    if (activeSession && !activeSession.id.toString().startsWith('local')) {
      try {
        await apiClient.post(`/focus/sessions/${activeSession.id}/abandon/`);
      } catch (e) {
        // ignore
      }
    }
    setIsRunning(false);
    setIsPaused(false);
    setActiveSession(null);
    setRemainingSeconds(plannedSeconds);
    warning('Session Abandoned', 'Focus session cancelled without XP.');
  };

  const completeSession = useCallback(async () => {
    playChime();
    let earnedXP = Math.floor((plannedSeconds / 60) * (5 / 3));

    if (activeSession && !activeSession.id.toString().startsWith('local')) {
      try {
        const res = await apiClient.post(`/focus/sessions/${activeSession.id}/complete/`);
        if (res.data.xp_awarded) {
          earnedXP = res.data.xp_awarded;
        }
        if (res.data.profile && syncProfile) {
          syncProfile(res.data.profile);
        }
      } catch (e) {
        // ignore
      }
    }

    setIsRunning(false);
    setIsPaused(false);
    setActiveSession(null);
    setRemainingSeconds(plannedSeconds);
    success('Focus Session Completed! ⚡', `Incredible discipline! You earned +${earnedXP} XP.`);
  }, [activeSession, plannedSeconds, success]);

  // Countdown loop
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, completeSession]);

  return (
    <FocusContext.Provider
      value={{
        activeSession,
        mode,
        plannedSeconds,
        remainingSeconds,
        isRunning,
        isPaused,
        linkedQuestId,
        setLinkedQuestId,
        selectMode,
        startSession,
        pauseSession,
        resumeSession,
        abandonSession,
        completeSession,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
};
