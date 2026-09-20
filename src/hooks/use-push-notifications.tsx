import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/supabase';

// Registers this device for push and stores the Expo push token on the
// user's profile. Best-effort: push tokens require a physical device and an
// EAS project, so this silently no-ops on web/simulators or if permission is
// denied rather than surfacing an error — nothing else in the app depends
// on it succeeding.
export function usePushNotifications() {
  const { session } = useSession();
  const userId = session?.user.id;

  useEffect(() => {
    if (!userId || !Device.isDevice) return;

    (async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const existing = await Notifications.getPermissionsAsync();
      let status = existing.status;
      if (status !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        status = requested.status;
      }
      if (status !== 'granted') return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) return;

      try {
        const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
        await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
      } catch {
        // No push token this session (simulator, Expo Go on a build that
        // doesn't support remote push, etc.) — fine, just skip.
      }
    })();
  }, [userId]);
}
