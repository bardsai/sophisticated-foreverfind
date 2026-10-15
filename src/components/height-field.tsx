import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChipOption } from '@/components/onboarding/chip-option';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

const MIN_CM = 100;
const MAX_CM = 250;

// height_cm has a DB check constraint (100–250) — validated here too so a
// bad value never reaches the request in the first place. See
// supabase/migrations/20260820021621_profile_details.sql.
export function heightRangeError(cmString: string): string | undefined {
  if (!cmString) return undefined;
  const cm = Number(cmString);
  if (!Number.isFinite(cm) || cm < MIN_CM || cm > MAX_CM) {
    return `Enter a height between ${MIN_CM}–${MAX_CM} cm (about 3'3"–8'2").`;
  }
  return undefined;
}

function cmToFeetInches(cm: number) {
  const totalInches = Math.round(cm / 2.54);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

function feetInchesToCm(feetText: string, inchesText: string): string {
  if (!feetText && !inchesText) return '';
  const feet = Number(feetText) || 0;
  const inches = Number(inchesText) || 0;
  return String(Math.round(feet * 30.48 + inches * 2.54));
}

export type HeightFieldProps = {
  valueCm: string;
  onChangeCm: (cm: string) => void;
  error?: string;
};

// height_cm is always the value of record — this only changes how it's
// *entered*. Feet/inches are derived from it on every render rather than
// tracked as separate state, so the two units can never drift out of sync.
export function HeightField({ valueCm, onChangeCm, error }: HeightFieldProps) {
  const [unit, setUnit] = useState<'cm' | 'ftin'>('cm');

  const cmNumber = Number(valueCm);
  const hasValidCm = valueCm !== '' && Number.isFinite(cmNumber);
  const { feet, inches } = hasValidCm ? cmToFeetInches(cmNumber) : { feet: 0, inches: 0 };
  const feetText = hasValidCm ? String(feet) : '';
  const inchesText = hasValidCm ? String(inches) : '';

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <ChipOption label="cm" selected={unit === 'cm'} onPress={() => setUnit('cm')} />
        <ChipOption label="ft / in" selected={unit === 'ftin'} onPress={() => setUnit('ftin')} />
      </View>

      {unit === 'cm' ? (
        <TextField
          label="Height (cm)"
          value={valueCm}
          onChangeText={(text) => onChangeCm(text.replace(/[^0-9]/g, ''))}
          placeholder="Height"
          keyboardType="number-pad"
          error={error}
          autoFocus
        />
      ) : (
        <>
          <View style={styles.ftInRow}>
            <TextField
              label="Feet"
              value={feetText}
              onChangeText={(text) =>
                onChangeCm(feetInchesToCm(text.replace(/[^0-9]/g, ''), inchesText))
              }
              placeholder="5"
              keyboardType="number-pad"
              containerStyle={styles.ftInField}
              autoFocus
            />
            <TextField
              label="Inches"
              value={inchesText}
              onChangeText={(text) =>
                onChangeCm(feetInchesToCm(feetText, text.replace(/[^0-9]/g, '')))
              }
              placeholder="3"
              keyboardType="number-pad"
              containerStyle={styles.ftInField}
            />
          </View>
          {error ? (
            <ThemedText type="small" themeColor="danger">
              {error}
            </ThemedText>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  ftInRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    width: '100%',
  },
  ftInField: {
    flex: 1,
    minWidth: 0,
  },
});
