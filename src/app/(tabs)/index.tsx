import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileCard } from '@/components/profile-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxFeedWidth, Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import type { Profile } from '@/hooks/use-profile';
import { hasSharedLocation } from '@/lib/location';
import { birthdateBoundsForAgeRange } from '@/lib/profile-utils';
import { supabase } from '@/lib/supabase';

export default function DiscoverScreen() {
  const theme = useTheme();
  const { session } = useSession();
  const userId = session!.user.id;
  const { width } = useWindowDimensions();
  const numColumns = width >= 760 ? 3 : 2;

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const [distanceById, setDistanceById] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: preferences } = await supabase
      .from('partner_preferences')
      .select('min_age, max_age, max_distance_km')
      .eq('id', userId)
      .maybeSingle();
    const { maxBirthdate, minBirthdateExclusive } = birthdateBoundsForAgeRange(
      preferences?.min_age ?? null,
      preferences?.max_age ?? null,
    );

    let profileQuery = supabase
      .from('profiles')
      .select('*')
      .neq('id', userId)
      .order('created_at', { ascending: false });
    if (maxBirthdate) profileQuery = profileQuery.lte('birthdate', maxBirthdate);
    if (minBirthdateExclusive) profileQuery = profileQuery.gt('birthdate', minBirthdateExclusive);

    const [{ data: profileRows }, { data: requestRows }] = await Promise.all([
      profileQuery,
      supabase
        .from('match_requests')
        .select('target_id')
        .eq('requester_id', userId)
        .in('status', ['pending', 'admin_approved', 'target_accepted']),
    ]);

    let candidates = profileRows ?? [];
    let nextDistanceById = new Map<string, number>();

    // Distance only filters candidates down if the user has both a distance
    // preference AND has shared their own location — no location shared
    // means "unknown", not "zero candidates nearby", so it's skipped rather
    // than hiding everyone.
    if (preferences?.max_distance_km && (await hasSharedLocation(userId))) {
      const { data: nearby } = await supabase.rpc('nearby_profile_ids', {
        p_max_distance_km: preferences.max_distance_km,
      });
      const nearbyIds = new Set((nearby ?? []).map((n) => n.profile_id));
      nextDistanceById = new Map((nearby ?? []).map((n) => [n.profile_id, n.distance_km]));
      candidates = candidates.filter((p) => nearbyIds.has(p.id));
    }

    setProfiles(candidates);
    setDistanceById(nextDistanceById);
    setRequestedIds(new Set((requestRows ?? []).map((r) => r.target_id)));
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
        <FlatList
          key={numColumns}
          data={profiles}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <ThemedText type="title">Discover</ThemedText>
              <ThemedText themeColor="textSecondary">
                Thoughtful introductions, chosen with care.
              </ThemedText>
            </View>
          }
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator style={styles.loading} color={theme.primary} />
            ) : (
              <View style={styles.emptyState}>
                <ThemedText type="smallBold" style={styles.emptyText}>
                  No new introductions just yet
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                  Check back soon, or broaden your preferences to meet more people.
                </ThemedText>
                <Pressable
                  onPress={() => router.push('/edit-partner-preferences')}
                  accessibilityRole="button"
                  style={styles.emptyAction}>
                  <ThemedText type="smallBold" themeColor="primary">
                    Review preferences
                  </ThemedText>
                </Pressable>
              </View>
            )
          }
          renderItem={({ item }) => (
            <ProfileCard
              profile={item}
              requested={requestedIds.has(item.id)}
              distanceKm={distanceById.get(item.id)}
              onPress={() => router.push({ pathname: '/profile/[id]', params: { id: item.id } })}
            />
          )}
        />
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
    maxWidth: MaxFeedWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  row: {
    gap: Spacing.three,
  },
  loading: {
    marginTop: Spacing.six,
  },
  emptyState: {
    marginTop: Spacing.six,
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  emptyText: {
    textAlign: 'center',
  },
  emptyAction: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
});
