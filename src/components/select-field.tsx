import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { OptionRow } from '@/components/onboarding/option-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Option } from '@/constants/onboarding-options';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SelectFieldProps = {
  label: string;
  value: string | null;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
}: SelectFieldProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.input, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
        <ThemedText style={{ color: selected ? theme.text : theme.textSecondary }}>
          {selected?.label ?? placeholder}
        </ThemedText>
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <ThemedView type="backgroundElement" style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <ThemedText type="smallBold">{label}</ThemedText>
            <Pressable onPress={() => setOpen(false)} hitSlop={8}>
              <ThemedText themeColor="primary" type="smallBold">
                Done
              </ThemedText>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.optionList}>
            {options.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                Icon={option.Icon}
                selected={value === option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              />
            ))}
          </ScrollView>
        </ThemedView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    minHeight: 48,
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    maxHeight: '75%',
    paddingBottom: Spacing.five,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  optionList: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
});
