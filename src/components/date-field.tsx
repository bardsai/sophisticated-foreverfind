import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type DateFieldProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
};

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function DateField({
  label,
  value,
  onChange,
  error,
  placeholder = 'Select a date',
  maximumDate,
  minimumDate,
}: DateFieldProps) {
  const theme = useTheme();
  function openPicker() {
    const initialValue = value ?? maximumDate ?? new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initialValue,
        mode: 'date',
        maximumDate,
        minimumDate,
        onChange: (event, date) => {
          if (event.type === 'set' && date) onChange(date);
        },
      });
    }
  }

  const initialValue = value ?? maximumDate ?? new Date();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">{label}</ThemedText>
      {Platform.OS === 'ios' ? (
        <View style={[styles.pickerFrame, { borderColor: error ? theme.danger : theme.border, backgroundColor: theme.backgroundElement }]}>
          <DateTimePicker
            value={initialValue}
            mode="date"
            display="spinner"
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            onChange={(_event, date) => {
              if (date) onChange(date);
            }}
            style={styles.picker}
          />
        </View>
      ) : (
        <Pressable
          onPress={openPicker}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={[
            styles.input,
            {
              borderColor: error ? theme.danger : theme.border,
              backgroundColor: theme.backgroundElement,
            },
          ]}
          >
          <ThemedText style={{ color: value ? theme.text : theme.textSecondary }}>
            {value ? formatDate(value) : placeholder}
          </ThemedText>
        </Pressable>
      )}
      {error ? <ThemedText type="small" themeColor="danger">{error}</ThemedText> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one, backgroundColor: 'transparent', width: '100%' },
  pickerFrame: { borderWidth: 1.5, borderRadius: Spacing.two, overflow: 'hidden', minHeight: 164, justifyContent: 'center' },
  picker: { height: 164, alignSelf: 'stretch' },
  input: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
    minWidth: 0,
  },
});
