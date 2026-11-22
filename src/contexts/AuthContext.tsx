import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  fetchSupabaseProfile,
  getActiveUserSession,
  loginUser,
  logoutUser,
  requestPasswordReset,
  signUpUser,
  updateUserPassword,
  updateUserProfile,
} from '../lib/storage';
import type { UserProfile, UserRole } from '../types/curriculum';

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  authMode: 'supabase' | 'local-dev';
  signUp: (params: {
    email: string;
    password: string;
    username: string;
    fullName: string;
    role?: UserRole;
  }) => Promise<{ ok: boolean; needsEmailVerification?: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ ok: boolean; message: string }>;
  updateProfile: (
    updates: Partial<Pick<UserProfile, 'username' | 'fullName' | 'bio' | 'avatarUrl' | 'learningGoal' | 'dailyGoalMinutes' | 'preferredPace' | 'theme'>>
  ) => Promise<{ ok: boolean; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const authMode = isSupabaseConfigured ? 'supabase' : 'local-dev';

  useEffect(() => {
    let mounted = true;
    getActiveUserSession()
      .then((profile) => {
        if (mounted) setUser(profile);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    if (isSupabaseConfigured && supabase) {
      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const profile = await fetchSupabaseProfile(session.user.id, session.user.email || '');
          if (mounted) setUser(profile);
        } else {
          setUser(null);
        }
      });
      return () => {
        mounted = false;
        listener.subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const signUp = useCallback(
    async (params: {
      email: string;
      password: string;
      username: string;
      fullName: string;
      role?: UserRole;
    }) => {
      const res = await signUpUser(params);
      if (res.user && !res.needsEmailVerification) {
        setUser(res.user);
      }
      return {
        ok: Boolean(res.user),
        needsEmailVerification: res.needsEmailVerification,
        error: res.error,
      };
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginUser(email, password);
    if (res.user) setUser(res.user);
    return { ok: Boolean(res.user), error: res.error };
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    return requestPasswordReset(email);
  }, []);

  const updateProfile = useCallback(
    async (
      updates: Partial<Pick<UserProfile, 'username' | 'fullName' | 'bio' | 'avatarUrl' | 'learningGoal' | 'dailyGoalMinutes' | 'preferredPace' | 'theme'>>
    ) => {
      if (!user) return { ok: false, error: 'You must be signed in.' };
      const res = await updateUserProfile(user.id, updates);
      if (res.user) setUser(res.user);
      return { ok: Boolean(res.user), error: res.error };
    },
    [user]
  );

  const changePassword = useCallback(async (newPassword: string) => {
    return updateUserPassword(newPassword);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authMode,
        signUp,
        login,
        logout,
        resetPassword,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
