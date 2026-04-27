import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

const enrichUserWithRole = async (authUser) => {
  if (!authUser?.id) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      console.warn('Failed to fetch profile role. Falling back to student role.', {
        userId: authUser.id,
        reason: error.message || 'profile_query_failed',
      });
      return { ...authUser, role: 'student' };
    }

    if (!data || data.role == null) {
      console.warn('Profile missing or role not set. Falling back to student role.', {
        userId: authUser.id,
      });
    }

    return {
      ...authUser,
      role: data?.role ?? 'student',
    };
  } catch (_err) {
    console.warn('Unexpected profile role lookup failure. Falling back to student role.', {
      userId: authUser.id,
    });
    return { ...authUser, role: 'student' };
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription;

    const bootstrap = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setUser(null);
        } else {
          const userWithRole = await enrichUserWithRole(session.user);
          setUser(userWithRole);
        }
      } catch (err) {
        // If Supabase env vars aren't set (or network fails), keep the UI usable.
        console.warn('Supabase getSession failed:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();

    try {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
