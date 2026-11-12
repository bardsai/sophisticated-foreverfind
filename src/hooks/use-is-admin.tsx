import { useEffect, useState } from 'react';

import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/supabase';

export function useIsAdmin() {
  const { session } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!session) {
      setIsAdmin(false);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setIsAdmin(data?.role === 'admin');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session]);

  return { isAdmin, loading };
}
