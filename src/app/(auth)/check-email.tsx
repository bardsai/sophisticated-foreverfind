import { makeRedirectUri } from 'expo-auth-session';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { BrandMark } from '@/components/brand-mark';
import { entranceAnimation, fadeInAnimation } from '@/constants/motion';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/supabase';

const RESEND_COOLDOWN_SECONDS = 60;

export default function CheckEmailScreen() {
  const { email, purpose } = useLocalSearchParams<{ email: string; purpose?: string }>();
  const isRecovery = purpose === 'recovery';
  const { authLinkError, clearAuthLinkError } = useSession();
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState<string>();
  const [justResent, setJustResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    if (!email || cooldown > 0) return;
    setResending(true);
    setResendError(undefined);
    clearAuthLinkError();
    const { error } = isRecovery
      ? await supabase.auth.resetPasswordForEmail(email, { redirectTo: makeRedirectUri() })
      : await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    if (error) {
      setResendError(error.message);
      return;
    }
    setJustResent(true);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.select({ ios: 'padding', default: undefined })}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <Animated.View entering={entranceAnimation()}>
              <BrandMark width={200} />
            </Animated.View>

            <Animated.View entering={entranceAnimation(80)} style={styles.titleBlock}>
              <ThemedText type="subtitle" style={styles.centerText}>
                Check your email
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.centerText}>
                {isRecovery
                  ? `We sent a password reset link to ${email}. Tap it on this device to choose a new password — you'll land right back here.`
                  : `We sent a confirmation link to ${email}. Tap it on this device to finish creating your account — you'll land right back here, signed in.`}
              </ThemedText>
            </Animated.View>

            {authLinkError ? (
              <Animated.View entering={fadeInAnimation()}>
                <ThemedText themeColor="danger" type="small" style={styles.centerText}>
                  {authLinkError}
                </ThemedText>
              </Animated.View>
            ) : null}
            {resendError ? (
              <Animated.View entering={fadeInAnimation()}>
                <ThemedText themeColor="danger" type="small" style={styles.centerText}>
                  {resendError}
                </ThemedText>
              </Animated.View>
            ) : null}
            {justResent && !resendError ? (
              <Animated.View entering={fadeInAnimation()}>
                <ThemedText themeColor="primary" type="small" style={styles.centerText}>
                  Link resent — check your inbox.
                </ThemedText>
              </Animated.View>
            ) : null}

            <ThemedView style={styles.footerRow}>
              <ThemedText themeColor="textSecondary">Didn&apos;t get it?</ThemedText>
              <Pressable onPress={handleResend} disabled={cooldown > 0 || resending} hitSlop={8}>
                <ThemedText
                  themeColor={cooldown > 0 ? 'textSecondary' : 'primary'}
                  type="smallBold">
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend link'}
                </ThemedText>
              </Pressable>
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
    gap: Spacing.five,
  },
  titleBlock: {
    gap: Spacing.one,
  },
  centerText: {
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
  },
});
