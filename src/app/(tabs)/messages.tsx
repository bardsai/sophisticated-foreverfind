import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { Profile } from '@/hooks/use-profile';

type MatchRow = Database['public']['Tables']['matches']['Row'] & {
  userA: Profile;
  userB: Profile;
};
type Message = Database['public']['Tables']['messages']['Row'];

type ConversationRow = {
  matchId: string;
  otherPerson: Profile;
  lastMessage?: Message;
};

export default function MessagesScreen() {
  const theme = useTheme();
  const { session } = useSession();
  const userId = session!.user.id;

  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: matchRows } = await supabase
      .from('matches')
      .select('*, userA:profiles!matches_user_a_id_fkey(*), userB:profiles!matches_user_b_id_fkey(*)')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    const matches = (matchRows as MatchRow[] | null) ?? [];
    const matchIds = matches.map((m) => m.id);

    const { data: messageRows } = matchIds.length
      ? await supabase
          .from('messages')
          .select('*')
          .in('match_id', matchIds)
          .order('created_at', { ascending: false })
      : { data: [] as Message[] };

    const lastByMatch = new Map<string, Message>();
    for (const message of messageRows ?? []) {
      if (!lastByMatch.has(message.match_id)) lastByMatch.set(message.match_id, message);
    }

    setConversations(
      matches.map((m) => ({
        matchId: m.id,
        otherPerson: m.user_a_id === userId ? m.userB : m.userA,
        lastMessage: lastByMatch.get(m.id),
      })),
    );
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title">Messages</ThemedText>

          {loading ? <ActivityIndicator style={styles.loading} /> : null}

          {!loading && conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                Your conversations start with a match
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                When you match with someone, you can get to know each other here.
              </ThemedText>
              <PrimaryButton
                title="Discover people"
                onPress={() => router.push('/')}
                style={styles.emptyAction}
              />
            </View>
          ) : null}

          {conversations.map((c) => (
            <Pressable
              key={c.matchId}
              onPress={() => router.push({ pathname: '/chat/[matchId]', params: { matchId: c.matchId } })}
              style={[styles.row, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}>
                {c.otherPerson.primary_photo_url ? (
                  <Image source={{ uri: c.otherPerson.primary_photo_url }} style={styles.avatarImage} />
                ) : null}
              </View>
              <View style={styles.rowText}>
                <ThemedText type="smallBold" numberOfLines={1}>
                  {c.otherPerson.display_name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {c.lastMessage?.body ?? 'Say hello 👋'}
                </ThemedText>
              </View>
            </Pressable>
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
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  loading: {
    marginTop: Spacing.six,
  },
  empty: {
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.six,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: Spacing.two,
    width: '100%',
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
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
});
