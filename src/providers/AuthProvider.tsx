import { Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';
import { Profile } from '../types/profile';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    acceptedTerms: boolean,
  ) => Promise<{ signedIn: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  async function loadProfile(userId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,first_name,last_name,accepted_terms_at,avatar_url,bio')
        .eq('id', userId)
        .maybeSingle();

    if (error || !data) {
      setProfile(null);
      return;
    }

      setProfile({
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        acceptedTermsAt: data.accepted_terms_at,
        avatarUrl: data.avatar_url ?? '',
        bio: data.bio ?? '',
      });
  }

  async function refreshProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProfile(null);
      return;
    }

    await loadProfile(user.id);
  }

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }
      setSession(data.session);
      if (data.session?.user?.id) {
        void loadProfile(data.session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user?.id) {
        void loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message);
    }
  }

  async function signUp(firstName: string, lastName: string, email: string, password: string, acceptedTerms: boolean) {
    if (!acceptedTerms) {
      throw new Error('You need to accept the Terms and Conditions to create an account.');
    }

    const acceptedTermsAt = new Date().toISOString();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          accepted_terms_at: acceptedTermsAt,
        },
      },
    });
    if (error) {
      throw new Error(error.message);
    }

    return { signedIn: Boolean(data.session) };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
