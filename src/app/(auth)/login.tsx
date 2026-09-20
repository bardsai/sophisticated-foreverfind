import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { BrandMark } from '@/components/brand-mark';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { entranceAnimation, fadeInAnimation } from '@/constants/motion';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { emailError, passwordError } from '@/lib/validation';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const fieldErrors = {
    email: emailError(email),
    password: passwordError(password),
  };

  async function handleLogin() {
    setTouched(true);
    setSubmitError(undefined);
    if (fieldErrors.email || fieldErrors.password) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) setSubmitError(error.message);
    // On success, onAuthStateChange flips the session and the root layout's
    // Stack.Protected guard swaps to the (tabs) group automatically.
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
                Welcome back
              </ThemedText>
              <ThemedText themeColor="textSecondary" style={styles.centerText}>
                Log in to see your introductions
              </ThemedText>
            </Animated.View>

            <Animated.View entering={entranceAnimation(160)} style={styles.form}>
              <TextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                error={touched ? fieldErrors.email : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                submitBehavior="submit"
              />
              <TextField
                ref={passwordRef}
                label="Password"
                value={password}
                onChangeText={setPassword}
                error={touched ? fieldErrors.password : undefined}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />

              <Link href="/forgot-password" style={styles.forgotPasswordLink}>
                <ThemedText themeColor="primary" type="small">
                  Forgot password?
                </ThemedText>
              </Link>

              {submitError ? (
                <Animated.View entering={fadeInAnimation()}>
                  <ThemedText themeColor="danger" type="small">
                    {submitError}
                  </ThemedText>
                </Animated.View>
              ) : null}

              <PrimaryButton title="Log in" loading={loading} onPress={handleLogin} />
            </Animated.View>

            <ThemedView style={styles.footerRow}>
              <ThemedText themeColor="textSecondary">Don&apos;t have an account?</ThemedText>
              <Link href="/sign-up" replace>
                <ThemedText themeColor="primary" type="smallBold">
                  Sign up
                </ThemedText>
              </Link>
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
  form: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
  },
});
