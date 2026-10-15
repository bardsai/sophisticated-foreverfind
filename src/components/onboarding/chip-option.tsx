import type { ComponentType } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import type { IconProps } from '@/components/onboarding/icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ChipOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  Icon?: ComponentType<IconProps>;
};

export function ChipOption({ label, selected, onPress, Icon }: ChipOptionProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.backgroundElement,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}>
      {Icon ? <Icon color={selected ? theme.primaryText : theme.primary} size={15} /> : null}
      <ThemedText
        type={selected ? 'smallBold' : 'small'}
        style={{ color: selected ? theme.primaryText : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: Spacing.three,
    borderRadius: 22,
    borderWidth: 1.5,
  },
});
