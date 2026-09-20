import type { Session } from '@supabase/supabase-js';
import { getQueryParams } from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { supabase } from '@/lib/supabase';

type SessionContextValue = {
  session: Session | null;
  isLoading: boolean;
  authLinkError: string | null;
  clearAuthLinkError: () => void;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const value = use(SessionContext);
  if (!value) {
    throw new Error('useSession must be used within a <SessionProvider />');
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authLinkError, setAuthLinkError] = useState<string | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const url = Linking.useLinkingURL();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Handles the confirmation/magic-link/password-recovery email redirect
  // (foreverfind://…): Supabase's default mailer can't be customized for
  // OTP-style codes without custom SMTP, so both signup confirmation and
  // password reset go through links instead. The tokens arrive in the URL
  // hash, which is why getQueryParams (merges query + hash) is used rather
  // than expo-linking's own parser. A recovery link is distinguished from a
  // signup link by its type=recovery param — onAuthStateChange's
  // PASSWORD_RECOVERY event only fires via the URL auto-detection path
  // (detectSessionInUrl), which doesn't apply on native, so it's checked
  // explicitly here instead.
  useEffect(() => {
    if (!url) return;

    async function handleAuthDeepLink(deepLinkUrl: string) {
      const { params } = getQueryParams(deepLinkUrl);
      if (params.error || params.error_description) {
        throw new Error(params.error_description ?? params.error);
      }
      if (!params.access_token || !params.refresh_token) return;

      const { error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      if (error) throw error;
      if (params.type === 'recovery') setIsPasswordRecovery(true);
    }

    handleAuthDeepLink(url).catch((err) => {
      setAuthLinkError(err instanceof Error ? err.message : 'That link could not be used.');
    });
  }, [url]);

  async function signOut() {
    await supabase.auth.signOut();
    setIsPasswordRecovery(false);
  }

  return (
    <SessionContext
      value={{
        session,
        isLoading,
        authLinkError,
        clearAuthLinkError: () => setAuthLinkError(null),
        isPasswordRecovery,
        clearPasswordRecovery: () => setIsPasswordRecovery(false),
        signOut,
      }}>
      {children}
    </SessionContext>
  );
}
