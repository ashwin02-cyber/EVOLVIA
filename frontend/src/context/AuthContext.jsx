import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { SEED_DASHBOARD_DATA } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(SEED_DASHBOARD_DATA.profile);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await apiClient.get('/profile/');
      setProfile(res.data);
      setUser({
        username: res.data.username,
        email: res.data.email,
        displayName: res.data.display_name,
      });
      setIsAuthenticated(true);
    } catch (err) {
      // If offline or unauthenticated, we keep seed data for preview
      if (!localStorage.getItem('evolvia_access_token')) {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      let token = localStorage.getItem('evolvia_access_token');
      if (!token) {
        // Auto-authenticate default player Ashwin on cold boot for seamless backend persistence
        try {
          const res = await apiClient.post('/auth/login/', {
            identifier: 'ashwin',
            password: 'evolvia123'
          });
          localStorage.setItem('evolvia_access_token', res.data.access);
          localStorage.setItem('evolvia_refresh_token', res.data.refresh);
          token = res.data.access;
        } catch (e) {
          // offline
        }
      }

      if (token) {
        await fetchProfile();
      } else {
        setIsLoading(false);
      }
    };

    initAuth();

    const handleExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('evolvia_auth_expired', handleExpired);
    return () => window.removeEventListener('evolvia_auth_expired', handleExpired);
  }, [fetchProfile]);

  const syncProfile = useCallback((newProfileData) => {
    if (newProfileData) {
      setProfile((prev) => ({
        ...prev,
        ...newProfileData
      }));
    }
  }, []);

  const login = async (identifier, password) => {
    const res = await apiClient.post('/auth/login/', { identifier, password });
    localStorage.setItem('evolvia_access_token', res.data.access);
    localStorage.setItem('evolvia_refresh_token', res.data.refresh);
    if (res.data.user) {
      setUser(res.data.user);
      if (res.data.user.profile) {
        setProfile(res.data.user.profile);
      }
    }
    setIsAuthenticated(true);
    await fetchProfile();
    return res.data;
  };

  const register = async (userData) => {
    const res = await apiClient.post('/auth/register/', userData);
    localStorage.setItem('evolvia_access_token', res.data.access);
    localStorage.setItem('evolvia_refresh_token', res.data.refresh);
    setUser(res.data.user);
    if (res.data.user?.profile) {
      setProfile(res.data.user.profile);
    }
    setIsAuthenticated(true);
    return res.data;
  };

  const logout = async () => {
    const refresh = localStorage.getItem('evolvia_refresh_token');
    if (refresh) {
      try {
        await apiClient.post('/auth/logout/', { refresh });
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('evolvia_access_token');
    localStorage.removeItem('evolvia_refresh_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (updates) => {
    const res = await apiClient.patch('/profile/', updates);
    setProfile(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        setProfile,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        fetchProfile,
        syncProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
