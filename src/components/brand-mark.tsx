import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export function BrandMark({ width = 220 }: { width?: number }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Image
      style={[styles.image, { width, height: (width * 322) / 804 }]}
      contentFit="contain"
      source={
        isDark
          ? require('@/assets/images/logo-mark-dark.png')
          : require('@/assets/images/logo-mark.png')
      }
    />
  );
}

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
  },
});
