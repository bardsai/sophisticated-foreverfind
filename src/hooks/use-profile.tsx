import { createContext, use, useCallback, useEffect, useState, type PropsWithChildren } from 'react';

import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

type ProfileContextValue = {
  profile: Profile | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfile() {
  const value = use(ProfileContext);
  if (!value) {
    throw new Error('useProfile must be used within a <ProfileProvider />');
  }
  return value;
}

export function ProfileProvider({ children }: PropsWithChildren) {
  const { session } = useSession();
  const userId = session?.user.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data ?? null);
    setIsLoading(false);
  }, [userId]);

  // Inlined rather than calling refresh() from here: fetching on mount is a
  // separate concern from the imperative refresh() consumers call after an
  // update, and the effect should own its own async call. Nothing to do
  // without a userId — callers only ever consult `isLoading` alongside a
  // truthy session (see RootNavigator's `ready` check), so there's no
  // stale-profile state to clean up here. `isLoading` starts true and this
  // only needs to flip it false once the fetch resolves — userId doesn't
  // change from one signed-in user to another without a full sign-out in
  // between, so there's no case that needs re-arming it to true here.
  useEffect(() => {
    if (!userId) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        setProfile(data ?? null);
        setIsLoading(false);
      });
  }, [userId]);

  return <ProfileContext value={{ profile, isLoading, refresh }}>{children}</ProfileContext>;
}
