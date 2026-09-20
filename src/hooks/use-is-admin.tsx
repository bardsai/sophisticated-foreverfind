import { useEffect, useState } from 'react';

import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/supabase';

export function useIsAdmin() {
  const { session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Every caller only uses this alongside an authenticated session (it's
  // consulted from screens already behind the auth gate), so there's no
  // signed-out state to reset here — see ProfileProvider for the same
  // pattern.
  useEffect(() => {
    if (!session) return;
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.role === 'admin');
        setLoading(false);
      });
  }, [session]);

  return { isAdmin, loading };
}
