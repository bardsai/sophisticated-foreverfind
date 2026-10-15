import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/primary-button';
import { PageHeading } from '@/components/page-heading';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { sendPushNotification } from '@/lib/notify';
import { calculateAge } from '@/lib/profile-utils';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type MatchRequestRow = Database['public']['Tables']['match_requests']['Row'] & {
  requester: Profile;
  target: Profile;
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Awaiting review',
  admin_approved: 'Approved — awaiting response',
  admin_declined: 'Declined',
  target_accepted: 'Matched',
  target_declined: 'Declined',
  withdrawn: 'Withdrawn',
};

export default function RequestsScreen() {
  const theme = useTheme();
  const { session } = useSession();
  const userId = session!.user.id;

  const [requests, setRequests] = useState<MatchRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    const { data: requestRows } = await supabase
      .from('match_requests')
      .select('*, requester:profiles!match_requests_requester_id_fkey(*), target:profiles!match_requests_target_id_fkey(*)')
      .or(`requester_id.eq.${userId},target_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    setRequests((requestRows as MatchRequestRow[] | null) ?? []);
    setLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function respond(request: MatchRequestRow, accept: boolean) {
    setActingId(request.id);
    const { error } = await supabase.rpc('respond_to_request', {
      p_request_id: request.id,
      p_accept: accept,
    });
    if (!error && accept) {
      sendPushNotification('new_match', request.requester_id, request.target.display_name);
    }
    setActingId(undefined);
    load();
  }

  async function withdraw(requestId: string) {
    setActingId(requestId);
    await supabase.rpc('withdraw_request', { p_request_id: requestId });
    setActingId(undefined);
    load();
  }

  const needsResponse = requests.filter(
    (r) => r.target_id === userId && r.status === 'admin_approved',
  );
  const sent = requests.filter((r) => r.requester_id === userId);

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <PageHeading
            title="Requests"
            subtitle="Follow the progress of requests you send and receive."
          />

          {loading ? <ActivityIndicator style={styles.loading} /> : null}

          {!loading && needsResponse.length > 0 ? (
            <Section title="Needs your response">
              {needsResponse.map((r) => (
                <PersonRow key={r.id} profile={r.requester}>
                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={() => respond(r, false)}
                      disabled={actingId === r.id}
                      style={[styles.actionButton, { borderColor: theme.border }]}>
                      <ThemedText type="smallBold" themeColor="textSecondary">
                        Decline
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={() => respond(r, true)}
                      disabled={actingId === r.id}
                      style={[styles.actionButton, { backgroundColor: theme.primary }]}>
                      <ThemedText type="smallBold" style={{ color: theme.primaryText }}>
                        Accept
                      </ThemedText>
                    </Pressable>
                  </View>
                </PersonRow>
              ))}
            </Section>
          ) : null}

          {!loading && sent.length > 0 ? (
            <Section title="Sent">
              {sent.map((r) => (
                <PersonRow key={r.id} profile={r.target}>
                  <View style={styles.statusColumn}>
                    <ThemedText type="small" themeColor="textSecondary">
                      {STATUS_LABEL[r.status] ?? r.status}
                    </ThemedText>
                    {r.status === 'pending' ? (
                      <Pressable onPress={() => withdraw(r.id)} disabled={actingId === r.id}>
                        <ThemedText type="small" themeColor="danger">
                          Withdraw
                        </ThemedText>
                      </Pressable>
                    ) : null}
                  </View>
                </PersonRow>
              ))}
            </Section>
          ) : null}

          {!loading && needsResponse.length === 0 && sent.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText type="smallBold" style={styles.emptyTitle}>
                No introductions in progress
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                Send a request from someone&apos;s profile and we&apos;ll keep you updated here.
              </ThemedText>
              <PrimaryButton
                title="Discover people"
                onPress={() => router.push('/')}
                style={styles.emptyAction}
              />
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {title.toUpperCase()}
      </ThemedText>
      <View style={styles.sectionList}>{children}</View>
    </View>
  );
}

function PersonRow({
  profile,
  onPress,
  children,
}: {
  profile: Profile;
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  const theme = useTheme();
  const RowWrapper = onPress ? Pressable : View;

  return (
    <RowWrapper
      onPress={onPress}
      style={[styles.row, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}>
        {profile.primary_photo_url ? (
          <Image source={{ uri: profile.primary_photo_url }} style={styles.avatarImage} />
        ) : null}
      </View>
      <ThemedText type="smallBold" style={styles.rowName} numberOfLines={1}>
        {profile.display_name}
        {profile.birthdate ? `, ${calculateAge(profile.birthdate)}` : ''}
      </ThemedText>
      {children}
    </RowWrapper>
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
    gap: Spacing.five,
  },
  loading: {
    marginTop: Spacing.six,
  },
  section: {
    gap: Spacing.two,
  },
  sectionList: {
    gap: Spacing.two,
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
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  actionButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  statusColumn: {
    alignItems: 'flex-end',
    gap: 2,
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
});
