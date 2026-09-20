import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import type { Profile } from '@/hooks/use-profile';
import { useProfile } from '@/hooks/use-profile';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { sendPushNotification } from '@/lib/notify';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'];
type MatchRow = Database['public']['Tables']['matches']['Row'] & {
  userA: Profile;
  userB: Profile;
};

const POLL_INTERVAL_MS = 4000;

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const theme = useTheme();
  const { session } = useSession();
  const userId = session!.user.id;
  const { profile: myProfile } = useProfile();

  const [otherPerson, setOtherPerson] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();
  const scrollRef = useRef<ScrollView>(null);

  const loadMessages = useCallback(async () => {
    if (!matchId) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });
    setMessages(data ?? []);
  }, [matchId]);

  const loadMatch = useCallback(async () => {
    if (!matchId) return;
    setLoading(true);
    const { data } = await supabase
      .from('matches')
      .select('*, userA:profiles!matches_user_a_id_fkey(*), userB:profiles!matches_user_b_id_fkey(*)')
      .eq('id', matchId)
      .single<MatchRow>();
    if (data) setOtherPerson(data.user_a_id === userId ? data.userB : data.userA);
    await loadMessages();
    setLoading(false);
  }, [matchId, userId, loadMessages]);

  useFocusEffect(
    useCallback(() => {
      loadMatch();
      const interval = setInterval(loadMessages, POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    }, [loadMatch, loadMessages]),
  );

  async function handleSend() {
    const trimmed = body.trim();
    if (!trimmed || !matchId) return;
    setSending(true);
    setError(undefined);
    const { error: sendError } = await supabase.rpc('send_message', {
      p_match_id: matchId,
      p_body: trimmed,
    });
    setSending(false);
    if (sendError) {
      setError(sendError.message);
      return;
    }
    if (otherPerson) {
      sendPushNotification('new_message', otherPerson.id, myProfile?.display_name);
    }
    setBody('');
    await loadMessages();
    scrollRef.current?.scrollToEnd({ animated: true });
  }

  if (loading) {
    return (
      <ThemedView style={styles.centerFlex}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.flex}>
      <Stack.Screen options={{ headerShown: true, title: otherPerson?.display_name ?? 'Chat' }} />
      <SafeAreaView style={styles.flex} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.select({ ios: 'padding', default: undefined })}
          keyboardVerticalOffset={Platform.select({ ios: 90, default: 0 })}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
            {messages.length === 0 ? (
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                Say hello 👋
              </ThemedText>
            ) : null}
            {messages.map((message) => {
              const isMine = message.sender_id === userId;
              return (
                <View
                  key={message.id}
                  style={[
                    styles.bubble,
                    isMine
                      ? { alignSelf: 'flex-end', backgroundColor: theme.primary }
                      : { alignSelf: 'flex-start', backgroundColor: theme.backgroundElement },
                  ]}>
                  <ThemedText style={isMine ? { color: theme.primaryText } : undefined}>
                    {message.body}
                  </ThemedText>
                </View>
              );
            })}
          </ScrollView>

          {error ? (
            <ThemedText themeColor="danger" type="small" style={styles.errorText}>
              {error}
            </ThemedText>
          ) : null}

          <View style={[styles.composer, { borderTopColor: theme.border }]}>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder="Message"
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[
                styles.composerInput,
                { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}
            />
            <Pressable
              onPress={handleSend}
              disabled={sending || !body.trim()}
              style={[
                styles.sendButton,
                { backgroundColor: theme.primary, opacity: sending || !body.trim() ? 0.5 : 1 },
              ]}>
              <ThemedText type="smallBold" style={{ color: theme.primaryText }}>
                Send
              </ThemedText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
  messageList: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
    flexGrow: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  errorText: {
    alignSelf: 'center',
    marginBottom: Spacing.one,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    padding: Spacing.three,
    borderTopWidth: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  composerInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 44,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  sendButton: {
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
});
