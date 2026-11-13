import type { CSSProperties } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MonaSans, Spacing } from '@/constants/theme';
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

function toDateInputValue(date?: Date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateInputValue(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
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
  const inputStyle: CSSProperties = {
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    minHeight: 48,
    borderWidth: 1.5,
    borderStyle: 'solid',
    borderColor: error ? theme.danger : theme.border,
    borderRadius: Spacing.two,
    padding: `${Spacing.two + 2}px ${Spacing.three}px`,
    backgroundColor: theme.backgroundElement,
    color: value ? theme.text : theme.textSecondary,
    fontSize: 16,
    fontFamily: MonaSans.medium,
    outline: 'none',
  };

  return (
    <ThemedView style={{ gap: Spacing.one, backgroundColor: 'transparent', width: '100%' }}>
      <ThemedText type="smallBold" themeColor="textSecondary">{label}</ThemedText>
      <input
        type="date"
        aria-label={label}
        autoComplete="bday"
        value={toDateInputValue(value ?? undefined)}
        min={toDateInputValue(minimumDate)}
        max={toDateInputValue(maximumDate)}
        onChange={(event) => onChange(fromDateInputValue(event.currentTarget.value))}
        style={inputStyle}
        aria-invalid={!!error}
        placeholder={placeholder}
      />
      {error ? <ThemedText type="small" themeColor="danger">{error}</ThemedText> : null}
    </ThemedView>
  );
}
