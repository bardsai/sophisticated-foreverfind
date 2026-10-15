import { Image } from 'expo-image';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/primary-button';
import { ReportModal } from '@/components/report-modal';
import { Tag } from '@/components/tag';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { INTEREST_OPTIONS } from '@/constants/onboarding-options';
import { MaxContentWidth, MaxProfilePhotoWidth, Spacing } from '@/constants/theme';
import type { Profile } from '@/hooks/use-profile';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { calculateAge, formatLocationLine } from '@/lib/profile-utils';
import { supabase } from '@/lib/supabase';

type RequestStatus =
  | 'none'
  | 'pending'
  | 'admin_approved'
  | 'target_accepted'
  | 'declined'
  | 'withdrawn';

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { session } = useSession();
  const userId = session!.user.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('none');
  const [submitting, setSubmitting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [{ data: profileRow }, { data: requestRows }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase
        .from('match_requests')
        .select('status')
        .eq('requester_id', userId)
        .eq('target_id', id)
        .in('status', ['pending', 'admin_approved', 'target_accepted'])
        .maybeSingle(),
    ]);
    setProfile(profileRow ?? null);
    setRequestStatus((requestRows?.status as RequestStatus) ?? 'none');
    setLoading(false);
  }, [id, userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleRequest() {
    if (!id) return;
    setSubmitting(true);
    setError(undefined);
    const { error: rpcError } = await supabase.rpc('request_match', { p_target_id: id });
    setSubmitting(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setRequestStatus('pending');
  }

  async function handleBlock() {
    if (!id) return;
    Alert.alert(
      `Block ${profile?.display_name ?? 'this person'}?`,
      "You won't see each other in Discover, and any pending request between you will no longer be actionable.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            setBlocking(true);
            setError(undefined);
            const { error: blockError } = await supabase
              .from('blocks')
              .insert({ blocker_id: userId, blocked_id: id });
            setBlocking(false);
            if (blockError) {
              setError(blockError.message);
              return;
            }
            router.back();
          },
        },
      ],
    );
  }

  async function handleReport(reason: string, details: string) {
    if (!id) return;
    setReporting(true);
    setError(undefined);
    const { error: reportError } = await supabase
      .from('reports')
      .insert({ reporter_id: userId, reported_id: id, reason, details: details || null });
    setReporting(false);
    if (reportError) {
      setError(reportError.message);
      return;
    }
    setReportModalOpen(false);
    Alert.alert('Report submitted', 'Thanks — our team will review this.');
  }

  if (loading || !profile) {
    return (
      <ThemedView style={styles.centerFlex}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  const locationLine = formatLocationLine(profile);

  const buttonLabel =
    requestStatus === 'none'
      ? 'Request introduction'
      : requestStatus === 'target_accepted'
        ? 'Matched'
        : 'Request sent';

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: true, title: profile.display_name }} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.photo, { backgroundColor: theme.backgroundSelected }]}>
            {profile.primary_photo_url ? (
              <Image
                source={{ uri: profile.primary_photo_url }}
                style={styles.photoImage}
                accessibilityLabel={`${profile.display_name}'s profile photo`}
              />
            ) : (
              <ThemedText themeColor="textSecondary">No photo</ThemedText>
            )}
          </View>

          <View style={styles.headerBlock}>
            <ThemedText type="title" style={styles.name}>
              {profile.display_name}
              {profile.birthdate ? `, ${calculateAge(profile.birthdate)}` : ''}
            </ThemedText>
            {locationLine ? (
              <ThemedText themeColor="textSecondary">{locationLine}</ThemedText>
            ) : null}
          </View>

          {profile.bio ? (
            <ThemedText style={styles.paddedBlock}>{profile.bio}</ThemedText>
          ) : null}

          {profile.interests.length ? (
            <View style={styles.tagRow}>
              {profile.interests.map((interest) => (
                <Tag
                  key={interest}
                  label={interest}
                  Icon={INTEREST_OPTIONS.find((o) => o.value === interest)?.Icon}
                />
              ))}
            </View>
          ) : null}

          {error ? (
            <ThemedText themeColor="danger" type="small" style={styles.paddedBlock}>
              {error}
            </ThemedText>
          ) : null}

          <PrimaryButton
            title={buttonLabel}
            loading={submitting}
            disabled={requestStatus !== 'none'}
            onPress={handleRequest}
            style={styles.paddedBlock}
          />

          <View style={[styles.secondaryActionRow, styles.paddedBlock]}>
            <Pressable onPress={() => setReportModalOpen(true)} hitSlop={8}>
              <ThemedText themeColor="textSecondary" type="small">
                Report
              </ThemedText>
            </Pressable>
            <Pressable onPress={handleBlock} disabled={blocking} hitSlop={8}>
              <ThemedText themeColor="danger" type="small">
                Block this person
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>

        <ReportModal
          visible={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          onSubmit={handleReport}
          submitting={reporting}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centerFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  photo: {
    width: '100%',
    maxWidth: MaxProfilePhotoWidth,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  headerBlock: {
    paddingHorizontal: Spacing.four,
    gap: 2,
  },
  name: {
    fontSize: 26,
    lineHeight: 32,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  paddedBlock: {
    marginHorizontal: Spacing.four,
  },
  secondaryActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
