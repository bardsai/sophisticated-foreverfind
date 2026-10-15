import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PrimaryButtonProps = {
  title: string;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ title, loading, disabled, onPress, style }: PrimaryButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={() => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared values are mutated via .value by design; the compiler doesn't know that.
        scale.value = withTiming(0.97, { duration: 100 });
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability -- see onPressIn above
        scale.value = withTiming(1, { duration: 150 });
      }}
      style={[
        styles.button,
        { backgroundColor: theme.primary, opacity: isDisabled ? 0.6 : 1 },
        animatedStyle,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={theme.primaryText} />
      ) : (
        <ThemedText type="smallBold" style={{ color: theme.primaryText }}>
          {title}
        </ThemedText>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Spacing.five,
    paddingVertical: Spacing.three,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
