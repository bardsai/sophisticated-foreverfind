import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type StepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export function Stepper({ value, onChange, min = 0, max = 20 }: StepperProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={[
          styles.button,
          { backgroundColor: theme.backgroundElement, opacity: value <= min ? 0.4 : 1 },
        ]}>
        <ThemedText type="subtitle" themeColor="primary" style={styles.symbol}>
          –
        </ThemedText>
      </Pressable>
      <ThemedText type="title" style={styles.value}>
        {value}
      </ThemedText>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={[
          styles.button,
          { backgroundColor: theme.backgroundElement, opacity: value >= max ? 0.4 : 1 },
        ]}>
        <ThemedText type="subtitle" themeColor="primary" style={styles.symbol}>
          +
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.five,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    lineHeight: 32,
  },
  value: {
    minWidth: 48,
    textAlign: 'center',
  },
});
