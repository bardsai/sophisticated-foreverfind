/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// Palette sampled from assets/images/logo.png: purple #662D91, magenta #ED1E79,
// rose #D4145A. Dark-mode variants are the same hues lightened for contrast
// against a near-black background rather than the raw brand colors.
export const Colors = {
  light: {
    text: '#1B1523',
    textSecondary: '#6B5F7A',
    background: '#FFFFFF',
    backgroundElement: '#F5F1FA',
    backgroundSelected: '#EBE0F5',
    border: '#E3D8EF',
    primary: '#662D91',
    primaryText: '#FFFFFF',
    accent: '#ED1E79',
    accentText: '#FFFFFF',
    danger: '#D4145A',
    tint: '#662D91',
  },
  dark: {
    text: '#F3EEFA',
    textSecondary: '#B6A9C7',
    background: '#0F0B15',
    backgroundElement: '#1C1526',
    backgroundSelected: '#2A2036',
    border: '#332941',
    primary: '#AB82D4',
    primaryText: '#1B1523',
    accent: '#FF6FA8',
    accentText: '#1B1523',
    danger: '#F1608F',
    tint: '#AB82D4',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Keys match the names registered by useFonts() in src/app/_layout.tsx.
// Custom fonts need one distinct family per weight — React Native doesn't
// synthesize weights from a single face the way it does for system fonts.
export const MonaSans = {
  regular: 'MonaSans-Regular',
  medium: 'MonaSans-Medium',
  semiBold: 'MonaSans-SemiBold',
  bold: 'MonaSans-Bold',
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// Web's custom tab bar (app-tabs.web.tsx) isn't a native chrome element like
// the other two, so screens must reserve space for it themselves. 90
// generously covers the bar's own content height plus a notched-device
// safe-area inset, since this constant can't read insets.bottom itself.
export const BottomTabInset = Platform.select({ ios: 50, android: 80, web: 90 }) ?? 0;
export const MaxContentWidth = 800;
