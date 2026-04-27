import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

const enrichUserWithRole = async (authUser) => {
  if (!authUser?.id) return null;

  try {
    console.log('[AuthContext][Step A] Fetching profile role', { userId: authUser.id });
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle();
    console.log('[AuthContext][Step B] Profiles query result', { userId: authUser.id, data, error });

    if (error) {
      console.warn('Failed to fetch profile role. Falling back to student role.', {
        userId: authUser.id,
        reason: error.message || 'profile_query_failed',
      });
      const fallbackUser = { ...authUser, role: 'student' };
      console.log('[AuthContext][Step C] Final user with fallback role', fallbackUser);
      return fallbackUser;
    }

    if (!data || data.role == null) {
      console.warn('Profile missing or role not set. Falling back to student role.', {
        userId: authUser.id,
      });
    }

    const userWithRole = {
      ...authUser,
      role: data?.role ?? 'student',
    };
    console.log('[AuthContext][Step C] Final user with role', userWithRole);
    return userWithRole;
  } catch (_err) {
    console.warn('Unexpected profile role lookup failure. Falling back to student role.', {
      userId: authUser.id,
    });
    console.error('[AuthContext][Error] enrichUserWithRole failed', _err);
    const fallbackUser = { ...authUser, role: 'student' };
    console.log('[AuthContext][Step C] Final user with fallback role', fallbackUser);
    return fallbackUser;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription;

    const bootstrap = async () => {
      try {
        console.log('[AuthContext][Bootstrap] Session load started');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[AuthContext][Bootstrap] getSession returned', { session });
        if (!session?.user) {
          setUser(null);
        } else {
          const userWithRole = await enrichUserWithRole(session.user);
          setUser(userWithRole);
        }
      } catch (err) {
        // If Supabase env vars aren't set (or network fails), keep the UI usable.
        console.warn('Supabase getSession failed:', err);
        console.error('[AuthContext][Error] bootstrap failed', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    try {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        console.log('[AuthContext][AuthStateChange] Event received', { event: _event, session });
        if (!session?.user) {
          setUser(null);
          return;
        }
        const userWithRole = await enrichUserWithRole(session.user);
        setUser(userWithRole);
      });
      subscription = sub;
    } catch (err) {
      console.warn('Supabase onAuthStateChange failed:', err);
      console.error('[AuthContext][Error] onAuthStateChange setup failed', err);
    }

    return () => subscription?.unsubscribe?.();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
