import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { FocusProvider } from './context/FocusContext';

import AppShell from './components/layout/AppShell';
import Home from './pages/Home';
import QuestBoard from './pages/QuestBoard';
import FocusArena from './pages/FocusArena';
import Habits from './pages/Habits';
import MyWorld from './pages/MyWorld';
import Achievements from './pages/Achievements';
import Leaderboard from './pages/Leaderboard';
import Analytics from './pages/Analytics';
import QuestlineDetail from './pages/QuestlineDetail';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins
      retry: 1,
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <FocusProvider>
            <BrowserRouter>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Main App Routes with Persistent Shell */}
                <Route path="/" element={<AppShell />}>
                  <Route index element={<Home />} />
                  <Route path="quests" element={<QuestBoard />} />
                  <Route path="focus" element={<FocusArena />} />
                  <Route path="habits" element={<Habits />} />
                  <Route path="world" element={<MyWorld />} />
                  <Route path="achievements" element={<Achievements />} />
                  <Route path="leaderboard" element={<Leaderboard />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="questlines/:id" element={<QuestlineDetail />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </FocusProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
