import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

const getEmailNameFallback = (email) => {
  if (typeof email !== 'string' || email.trim().length === 0) return null;
  const localPart = email.split('@')?.[0]?.trim();
  if (!localPart) return null;
  const cleaned = localPart.split('.')?.[0]?.trim();
  return cleaned || null;
};

const enrichUserWithRole = async (authUser) => {
  if (!authUser?.id) return null;
  const emailFallbackName = getEmailNameFallback(authUser?.email);
  const resolvedFallbackName = emailFallbackName || 'there';

  try {
    console.log('[AuthContext][Step A] Fetching profile role', { userId: authUser.id });
    const { data, error } = await supabase
      .from('profiles')
      .select('role, first_name')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      console.error('[AuthContext][Role Query Error] Failed to fetch role, falling back to student.', {
        userId: authUser.id,
        reason: error.message || 'profile_query_failed',
      });
      const fallbackUser = { ...authUser, role: 'student', first_name: resolvedFallbackName };
      console.log('[AuthContext][Step C] Final user with fallback role', fallbackUser);
      return fallbackUser;
    }

    if (!data) {
      console.warn('[AuthContext][Role Missing Profile] No profile row found, falling back to student.', {
        userId: authUser.id,
      });
      const fallbackUser = { ...authUser, role: 'student', first_name: resolvedFallbackName };
      console.log('[AuthContext][Step C] Final user with fallback role', fallbackUser);
      return fallbackUser;
    }

    if (data.role == null) {
      console.warn('[AuthContext][Role Missing Value] Profile has no role, falling back to student.', {
        userId: authUser.id,
      });
      const fallbackUser = { ...authUser, role: 'student', first_name: data.first_name ?? resolvedFallbackName };
      console.log('[AuthContext][Step C] Final user with fallback role', fallbackUser);
      return fallbackUser;
    }

    const userWithRole = {
      ...authUser,
      role: data.role,
      first_name: data.first_name ?? resolvedFallbackName,
    };
    console.log('[AuthContext][Role Success] Role fetched successfully', {
      userId: authUser.id,
      role: data.role,
      first_name: data.first_name ?? resolvedFallbackName,
    });
    console.log('[AuthContext][Step C] Final user with role', userWithRole);
    return userWithRole;
  } catch (_err) {
    console.warn('Unexpected profile role lookup failure. Falling back to student role.', {
      userId: authUser.id,
    });
    console.error('[AuthContext][Error] enrichUserWithRole failed', _err);
    const fallbackUser = { ...authUser, role: 'student', first_name: resolvedFallbackName };
    console.log('[AuthContext][Step C] Final user with fallback role', fallbackUser);
    return fallbackUser;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFetchingProfileRef = useRef(false);
  const lastUserIdRef = useRef(null);

  useEffect(() => {
    let isActive = true;
    let authEventId = 0;
    let subscription;
    const loadingSafetyTimeout = setTimeout(() => {
      if (isActive) {
        console.warn('[AuthContext] Loading safety timeout reached. Forcing loading=false.');
        setLoading(false);
      }
    }, 10000);

    try {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const eventId = ++authEventId;
        try {
          console.log('[AuthContext][AuthStateChange] Event received', { event: _event, session });
          if (_event === 'SIGNED_OUT') {
            console.log('[AuthContext] SIGNED_OUT handled');
            if (!isActive || eventId !== authEventId) return;
            lastUserIdRef.current = null;
            setUser(null);
            isFetchingProfileRef.current = false;
            setLoading(false);
            return;
          }

          if (!session?.user?.id) {
            console.log('[AuthContext] Skipping profile fetch due to missing session');
            if (!isActive || eventId !== authEventId) return;
            lastUserIdRef.current = null;
            setUser(null);
            isFetchingProfileRef.current = false;
            return;
          }

          if (lastUserIdRef.current === session.user.id) {
            console.log('[AuthContext] Skipping duplicate SIGNED_IN event');
            if (isActive && eventId === authEventId) setLoading(false);
            return;
          }

          if (isFetchingProfileRef.current) {
            console.log('[AuthContext] Profile fetch already in progress');
            if (isActive && eventId === authEventId) setLoading(false);
            return;
          }

          isFetchingProfileRef.current = true;
          console.log('[AuthContext] Profile fetch started', { userId: session.user.id, event: _event });
          const userWithRole = await enrichUserWithRole(session.user);
          if (!isActive || eventId !== authEventId) return;
          setUser(userWithRole);
          lastUserIdRef.current = session.user.id;
          console.log('[AuthContext] Profile fetch completed', { userId: session.user.id, event: _event });
        } catch (err) {
          if (!isActive || eventId !== authEventId) return;
          console.error('[AuthContext][Error] onAuthStateChange handler failed', err);
          lastUserIdRef.current = null;
          setUser(null);
        } finally {
          isFetchingProfileRef.current = false;
          // Safety net: never leave the app in a loading state.
          if (isActive && eventId === authEventId) setLoading(false);
        }
      });
      subscription = sub;
    } catch (err) {
      console.warn('Supabase onAuthStateChange failed:', err);
      console.error('[AuthContext][Error] onAuthStateChange setup failed', err);
    }

    return () => {
      isActive = false;
      isFetchingProfileRef.current = false;
      lastUserIdRef.current = null;
      clearTimeout(loadingSafetyTimeout);
      subscription?.unsubscribe?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
