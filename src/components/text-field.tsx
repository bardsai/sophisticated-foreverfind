import { useState, type Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MonaSans, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  ref?: Ref<TextInput>;
};

export function TextField({
  label,
  error,
  style,
  ref,
  onFocus,
  onBlur,
  secureTextEntry,
  ...rest
}: TextFieldProps) {
  const theme = useTheme();
  const focusProgress = useSharedValue(0);
  // secureTextEntry is static per field in this app's usage, so the initial
  // value is all `hidden` ever needs from the prop.
  const [hidden, setHidden] = useState(secureTextEntry);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? theme.danger
      : interpolateColor(focusProgress.value, [0, 1], [theme.border, theme.primary]),
  }));

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      <View style={styles.inputWrapper}>
        <AnimatedTextInput
          ref={ref}
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={hidden}
          style={[
            styles.input,
            secureTextEntry ? styles.inputWithToggle : null,
            { color: theme.text, backgroundColor: theme.backgroundElement },
            animatedBorderStyle,
            style,
          ]}
          onFocus={(e) => {
            // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are mutated via .value by design; the compiler doesn't know that.
            focusProgress.value = withTiming(1, { duration: 150 });
            onFocus?.(e);
          }}
          onBlur={(e) => {
            // eslint-disable-next-line react-hooks/immutability -- see onFocus above
            focusProgress.value = withTiming(0, { duration: 150 });
            onBlur?.(e);
          }}
          {...rest}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((current) => !current)}
            hitSlop={8}
            style={styles.toggle}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <ThemedText type="smallBold" themeColor="primary">
              {hidden ? 'Show' : 'Hide'}
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 16,
    fontFamily: MonaSans.medium,
    minHeight: 48,
    width: '100%',
  },
  inputWithToggle: {
    paddingRight: Spacing.four + Spacing.three,
  },
  toggle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: Spacing.three,
    justifyContent: 'center',
  },
});
