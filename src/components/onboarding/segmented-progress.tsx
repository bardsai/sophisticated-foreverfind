import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type SegmentedProgressProps = {
  step: number;
  total: number;
};

export function SegmentedProgress({ step, total }: SegmentedProgressProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            { backgroundColor: index <= step ? theme.primary : theme.border },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 5,
  },
  segment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
  },
});
