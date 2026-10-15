import { makeRedirectUri } from 'expo-auth-session';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth-screen';
import { ThemedText } from '@/components/themed-text';
import { fadeInAnimation } from '@/constants/motion';
import { Spacing } from '@/constants/theme';
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
    <AuthScreen
      title="Check your email"
      subtitle={
        isRecovery
          ? `We sent a password reset link to ${email}. Open it on this device to choose a new password.`
          : `We sent a confirmation link to ${email}. Open it on this device to finish creating your account.`
      }
      footer={
        <View style={styles.footerRow}>
          <ThemedText themeColor="textSecondary">Didn&apos;t get it?</ThemedText>
          <Pressable
            onPress={handleResend}
            disabled={cooldown > 0 || resending}
            hitSlop={8}
            style={styles.resendButton}>
            <ThemedText
              themeColor={cooldown > 0 || resending ? 'textSecondary' : 'primary'}
              type="smallBold">
              {resending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend link'}
            </ThemedText>
          </Pressable>
        </View>
      }>
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
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  resendButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
