import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Perfil } from '@/lib/types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Perfil | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (nombre: string, email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (datos: { nombre?: string; telefono?: string | null }) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('perfiles').select('*').eq('id', userId).single();
    if (!error) setProfile(data as Perfil | null);
  }, []);

  useEffect(() => {
    let mounted = true;

    // Si el almacenamiento/local o la red se traban, no dejamos la app en loading forever.
    const fallo = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 4000);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          void fetchProfile(data.session.user.id);
        } else {
          setProfile(null);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setProfile(null);
      })
      .finally(() => {
        clearTimeout(fallo);
        if (mounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        void fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
     
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }, []);

  const signUp = useCallback(async (nombre: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });
    if (!error) {
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        const p = await supabase.from('perfiles').select('*').eq('id', data.session.user.id).single();
        setProfile((p.data as Perfil | null) ?? null);
        return { error: null };
      }
      // Si el proyecto requiere confirmación de correo, se inicia sesión igualmente.
      const retry = await supabase.auth.signInWithPassword({ email, password });
      if (retry.error) return { error: retry.error.message };
      setSession(retry.data.session);
      setUser(retry.data.session.user);
      const p = await supabase.from('perfiles').select('*').eq('id', retry.data.session.user.id).single();
      setProfile((p.data as Perfil | null) ?? null);
      return { error: null };
    }
    return { error: error.message };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  }, []);

  const updateProfile = useCallback(
    async (datos: { nombre?: string; telefono?: string | null }) => {
      if (!user) return { error: 'No hay sesión activa' };
      const updates: { nombre?: string; telefono?: string | null } = {};
      if (datos.nombre !== undefined) updates.nombre = datos.nombre;
      if (datos.telefono !== undefined) updates.telefono = datos.telefono;
      const { data, error } = await supabase
        .from('perfiles')
        .update(updates)
        .eq('id', user.id)
        .select('*')
        .single();
      if (error) return { error: error.message };
      setProfile((data as Perfil) ?? null);
      return { error: null };
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }),
    [session, user, profile, loading, signIn, signUp, signOut, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
