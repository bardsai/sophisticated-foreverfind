import { Image } from 'expo-image';
import { Redirect, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { useTheme } from '@/hooks/use-theme';
import { sendPushNotification } from '@/lib/notify';
import { calculateAge } from '@/lib/profile-utils';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type PendingRequest = Database['public']['Tables']['match_requests']['Row'] & {
  requester: Profile;
  target: Profile;
};
type OpenReport = Database['public']['Tables']['reports']['Row'] & {
  reporter: Profile;
  reported: Profile;
};
type PendingPhoto = Database['public']['Tables']['photo_reviews']['Row'] & {
  profile: Profile;
};

export default function AdminScreen() {
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [reports, setReports] = useState<OpenReport[]>([]);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: requestRows }, { data: reportRows }, { data: photoRows }] = await Promise.all([
      supabase
        .from('match_requests')
        .select(
          '*, requester:profiles!match_requests_requester_id_fkey(*), target:profiles!match_requests_target_id_fkey(*)',
        )
        .eq('status', 'pending')
        .order('created_at', { ascending: true }),
      supabase
        .from('reports')
        .select(
          '*, reporter:profiles!reports_reporter_id_fkey(*), reported:profiles!reports_reported_id_fkey(*)',
        )
        .eq('status', 'open')
        .order('created_at', { ascending: true }),
      supabase
        .from('photo_reviews')
        .select('*, profile:profiles!photo_reviews_profile_id_fkey(*)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true }),
    ]);
    setRequests((requestRows as PendingRequest[] | null) ?? []);
    setReports((reportRows as OpenReport[] | null) ?? []);
    setPhotos((photoRows as PendingPhoto[] | null) ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isAdmin) load();
    }, [isAdmin, load]),
  );

  async function review(request: PendingRequest, approve: boolean) {
    setActingId(request.id);
    const { error } = await supabase.rpc('admin_review_request', {
      p_request_id: request.id,
      p_approve: approve,
    });
    if (!error && approve) {
      sendPushNotification('request_approved', request.target_id);
    }
    setActingId(undefined);
    load();
  }

  async function resolveReport(reportId: string, suspend: boolean) {
    setActingId(reportId);
    await supabase.rpc('admin_resolve_report', {
      p_report_id: reportId,
      p_status: suspend ? 'actioned' : 'reviewed',
      p_suspend_reported: suspend,
    });
    setActingId(undefined);
    load();
  }

  async function reviewPhoto(reviewId: string, approve: boolean) {
    setActingId(reviewId);
    await supabase.rpc('admin_review_photo', { p_review_id: reviewId, p_approve: approve });
    setActingId(undefined);
    load();
  }

  if (adminLoading || loading) {
    return (
      <ThemedView style={styles.centerFlex}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!isAdmin) {
    // A non-admin has no legitimate reason to be here — send them back to
    // the app rather than stranding them on a screen with no tab bar and no
    // back target (this can otherwise be reached as the landing screen right
    // after login, before there's any navigation history to go back to).
    return <Redirect href="/" />;
  }

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: true, title: 'Admin' }} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Section title={`Pending requests (${requests.length})`}>
            {requests.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                No requests waiting for review.
              </ThemedText>
            ) : (
              requests.map((r) => (
                <RequestRow key={r.id} request={r} onReview={review} busy={actingId === r.id} />
              ))
            )}
          </Section>

          <Section title={`Open reports (${reports.length})`}>
            {reports.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                No open reports.
              </ThemedText>
            ) : (
              reports.map((r) => (
                <ReportCard key={r.id} report={r} onResolve={resolveReport} busy={actingId === r.id} />
              ))
            )}
          </Section>

          <Section title={`Pending photos (${photos.length})`}>
            {photos.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                No photos waiting for review.
              </ThemedText>
            ) : (
              photos.map((p) => (
                <PhotoReviewCard key={p.id} review={p} onReview={reviewPhoto} busy={actingId === p.id} />
              ))
            )}
          </Section>
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

function RequestRow({
  request,
  onReview,
  busy,
}: {
  request: PendingRequest;
  onReview: (request: PendingRequest, approve: boolean) => void;
  busy: boolean;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={styles.pairRow}>
        <PersonChip profile={request.requester} />
        <ThemedText themeColor="textSecondary">→</ThemedText>
        <PersonChip profile={request.target} />
      </View>
      <View style={styles.actionRow}>
        <Pressable
          onPress={() => onReview(request, false)}
          disabled={busy}
          style={[styles.actionButton, { borderColor: theme.border }]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Decline
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => onReview(request, true)}
          disabled={busy}
          style={[styles.actionButton, { backgroundColor: theme.primary }]}>
          <ThemedText type="smallBold" style={{ color: theme.primaryText }}>
            Approve
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function ReportCard({
  report,
  onResolve,
  busy,
}: {
  report: OpenReport;
  onResolve: (id: string, suspend: boolean) => void;
  busy: boolean;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={styles.pairRow}>
        <PersonChip profile={report.reporter} />
        <ThemedText themeColor="textSecondary">reported</ThemedText>
        <PersonChip profile={report.reported} />
      </View>
      <ThemedText type="smallBold">{report.reason}</ThemedText>
      {report.details ? (
        <ThemedText type="small" themeColor="textSecondary">
          {report.details}
        </ThemedText>
      ) : null}
      <View style={styles.actionRow}>
        <Pressable
          onPress={() => onResolve(report.id, false)}
          disabled={busy}
          style={[styles.actionButton, { borderColor: theme.border }]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Dismiss
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => onResolve(report.id, true)}
          disabled={busy}
          style={[styles.actionButton, { backgroundColor: theme.danger }]}>
          <ThemedText type="smallBold" style={{ color: theme.primaryText }}>
            Suspend user
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function PhotoReviewCard({
  review,
  onReview,
  busy,
}: {
  review: PendingPhoto;
  onReview: (id: string, approve: boolean) => void;
  busy: boolean;
}) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <PersonChip profile={review.profile} />
      <Image source={{ uri: review.photo_url }} style={styles.reviewPhoto} contentFit="cover" />
      <View style={styles.actionRow}>
        <Pressable
          onPress={() => onReview(review.id, false)}
          disabled={busy}
          style={[styles.actionButton, { borderColor: theme.border }]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Decline
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => onReview(review.id, true)}
          disabled={busy}
          style={[styles.actionButton, { backgroundColor: theme.primary }]}>
          <ThemedText type="smallBold" style={{ color: theme.primaryText }}>
            Approve
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

function PersonChip({ profile }: { profile: Profile }) {
  const theme = useTheme();
  return (
    <View style={styles.personChip}>
      <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}>
        {profile.primary_photo_url ? (
          <Image source={{ uri: profile.primary_photo_url }} style={styles.avatarImage} />
        ) : null}
      </View>
      <ThemedText type="small" numberOfLines={1} style={styles.personName}>
        {profile.display_name}
        {profile.birthdate ? `, ${calculateAge(profile.birthdate)}` : ''}
      </ThemedText>
    </View>
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
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  sectionList: {
    gap: Spacing.three,
  },
  empty: {
    textAlign: 'center',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  personChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minWidth: 0,
  },
  personName: {
    flexShrink: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  reviewPhoto: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
});
