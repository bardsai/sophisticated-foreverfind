import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const REASONS = [
  'Fake profile',
  'Harassment or abuse',
  'Inappropriate photos',
  'Spam or scam',
  'Underage user',
  'Other',
];

export type ReportModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => void;
  submitting: boolean;
};

export function ReportModal({ visible, onClose, onSubmit, submitting }: ReportModalProps) {
  const theme = useTheme();
  const [reason, setReason] = useState<string>();
  const [details, setDetails] = useState('');

  function handleClose() {
    setReason(undefined);
    setDetails('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <ThemedView type="backgroundElement" style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <ThemedText type="smallBold">Report this person</ThemedText>
          <Pressable onPress={handleClose} hitSlop={8}>
            <ThemedText themeColor="textSecondary" type="smallBold">
              Cancel
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.reasonList}>
          {REASONS.map((option) => {
            const selected = reason === option;
            return (
              <Pressable
                key={option}
                onPress={() => setReason(option)}
                style={[
                  styles.reasonRow,
                  {
                    borderColor: selected ? theme.primary : theme.border,
                    backgroundColor: selected ? theme.backgroundSelected : theme.background,
                  },
                ]}>
                <ThemedText themeColor={selected ? 'primary' : 'text'}>{option}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <TextField
          label="Additional details (optional)"
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={3}
          maxLength={1000}
          style={styles.detailsInput}
        />

        <PrimaryButton
          title="Submit report"
          loading={submitting}
          disabled={!reason}
          onPress={() => reason && onSubmit(reason, details.trim())}
        />
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reasonList: {
    gap: Spacing.two,
  },
  reasonRow: {
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two + 2,
    paddingHorizontal: Spacing.three,
  },
  detailsInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
});
