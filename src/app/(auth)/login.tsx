import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth-screen';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { fadeInAnimation, entranceAnimation } from '@/constants/motion';
import { Spacing } from '@/constants/theme';
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
    <AuthScreen
      title="Welcome back"
      subtitle="Log in to see your introductions."
      footer={
        <>
          <ThemedText themeColor="textSecondary">New to ForeverFind?</ThemedText>
          <Link href="/sign-up" replace>
            <ThemedText themeColor="primary" type="smallBold">
              Create an account
            </ThemedText>
          </Link>
        </>
      }>
      <Animated.View entering={entranceAnimation(80)} style={styles.form}>
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
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
  },
});
