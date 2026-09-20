import { Image } from 'expo-image';
import { Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function BlockedUsersScreen() {
  const theme = useTheme();
  const { session } = useSession();
  const userId = session!.user.id;

  const [blocked, setBlocked] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    const { data: blockRows } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', userId);

    const blockedIds = (blockRows ?? []).map((b) => b.blocked_id);
    if (blockedIds.length === 0) {
      setBlocked([]);
      setLoading(false);
      return;
    }

    const { data: profileRows } = await supabase.from('profiles').select('*').in('id', blockedIds);
    setBlocked(profileRows ?? []);
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function unblock(blockedId: string) {
    setRemovingId(blockedId);
    await supabase.from('blocks').delete().eq('blocker_id', userId).eq('blocked_id', blockedId);
    setRemovingId(undefined);
    load();
  }

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: true, title: 'Blocked users' }} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          {loading ? <ActivityIndicator style={styles.loading} /> : null}

          {!loading && blocked.length === 0 ? (
            <ThemedText themeColor="textSecondary" style={styles.empty}>
              You haven&apos;t blocked anyone.
            </ThemedText>
          ) : null}

          {blocked.map((profile) => (
            <View
              key={profile.id}
              style={[styles.row, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}>
                {profile.primary_photo_url ? (
                  <Image source={{ uri: profile.primary_photo_url }} style={styles.avatarImage} />
                ) : null}
              </View>
              <ThemedText type="smallBold" style={styles.rowName} numberOfLines={1}>
                {profile.display_name}
              </ThemedText>
              <Pressable onPress={() => unblock(profile.id)} disabled={removingId === profile.id}>
                <ThemedText type="small" themeColor="primary">
                  Unblock
                </ThemedText>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.two,
  },
  loading: {
    marginTop: Spacing.six,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  rowName: {
    flex: 1,
  },
});
