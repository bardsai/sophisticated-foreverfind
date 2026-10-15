import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';

import { AuthScreen } from '@/components/auth-screen';
import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { entranceAnimation, fadeInAnimation } from '@/constants/motion';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/supabase';
import { passwordError } from '@/lib/validation';

export default function UpdatePasswordScreen() {
  const { clearPasswordRecovery, signOut } = useSession();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const confirmRef = useRef<TextInput>(null);

  const fieldErrors = {
    password: passwordError(password),
    confirmPassword: confirmPassword !== password ? 'Passwords do not match' : undefined,
  };

  async function handleSubmit() {
    setTouched(true);
    setSubmitError(undefined);
    if (fieldErrors.password || fieldErrors.confirmPassword) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }
    // Lets the root layout's guards resume normally — onto (tabs) or
    // (onboarding), whichever this account already qualifies for.
    clearPasswordRecovery();
  }

  return (
    <AuthScreen
      title="Choose a new password"
      subtitle="This replaces your old password on ForeverFind."
      footer={
        <Pressable
          onPress={() => signOut()}
          hitSlop={8}
          accessibilityRole="button"
          style={styles.cancelAction}>
          <ThemedText themeColor="textSecondary" type="small">
            Cancel and sign out
          </ThemedText>
        </Pressable>
      }>
      <Animated.View entering={entranceAnimation(80)} style={styles.form}>
              <TextField
                label="New password"
                value={password}
                onChangeText={setPassword}
                error={touched ? fieldErrors.password : undefined}
                secureTextEntry
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                submitBehavior="submit"
              />
              <TextField
                ref={confirmRef}
                label="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={touched ? fieldErrors.confirmPassword : undefined}
                secureTextEntry
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              {submitError ? (
                <Animated.View entering={fadeInAnimation()}>
                  <ThemedText themeColor="danger" type="small">
                    {submitError}
                  </ThemedText>
                </Animated.View>
              ) : null}

              <PrimaryButton title="Update password" loading={loading} onPress={handleSubmit} />
      </Animated.View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  cancelAction: {
    minHeight: 44,
    justifyContent: 'center',
  },
});
