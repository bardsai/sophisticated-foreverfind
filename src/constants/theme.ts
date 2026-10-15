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
    text: '#211829',
    textSecondary: '#64576F',
    background: '#FCFAFD',
    backgroundElement: '#F5EFF8',
    backgroundSelected: '#E9DDF1',
    border: '#DCCFE5',
    primary: '#612C8A',
    primaryText: '#FFFFFF',
    accent: '#ED1E79',
    accentText: '#FFFFFF',
    danger: '#D4145A',
    tint: '#662D91',
  },
  dark: {
    text: '#F5EFF8',
    textSecondary: '#C1B3CE',
    background: '#100C14',
    backgroundElement: '#1D1624',
    backgroundSelected: '#30233A',
    border: '#44344F',
    primary: '#B78ADB',
    primaryText: '#211829',
    accent: '#FF78AA',
    accentText: '#211829',
    danger: '#FF779B',
    tint: '#B78ADB',
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
export const MaxAuthWidth = 460;
export const MaxFeedWidth = 1040;
export const MaxProfilePhotoWidth = 520;
