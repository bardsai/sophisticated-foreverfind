import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

import type { IconProps } from '@/components/onboarding/icons';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TagProps = {
  label: string;
  Icon?: ComponentType<IconProps>;
};

export function Tag({ label, Icon }: TagProps) {
  const theme = useTheme();

  return (
    <View style={[styles.chip, { backgroundColor: theme.backgroundElement }]}>
      {Icon ? <Icon color={theme.primary} size={14} /> : null}
      <ThemedText type="small">{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
  },
});
