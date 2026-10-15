import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { type ReactElement } from 'react';
import { Pressable, View, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { BrandMark } from './brand-mark';

import {
  DiscoverTabIcon,
  MessagesTabIcon,
  ProfileTabIcon,
  RequestsTabIcon,
  type TabIconProps,
} from '@/components/tab-icons';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  return (
    <Tabs>
      <TabList asChild style={isWide ? styles.railWrapper : styles.tabListContainer}>
        <CustomTabList isWide={isWide}>
          <TabTrigger name="index" href="/" asChild>
            <TabButton label="Discover" Icon={DiscoverTabIcon} isWide={isWide} />
          </TabTrigger>
          <TabTrigger name="requests" href="/requests" asChild>
            <TabButton label="Requests" Icon={RequestsTabIcon} isWide={isWide} />
          </TabTrigger>
          <TabTrigger name="messages" href="/messages" asChild>
            <TabButton label="Messages" Icon={MessagesTabIcon} isWide={isWide} />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton label="Profile" Icon={ProfileTabIcon} isWide={isWide} />
          </TabTrigger>
        </CustomTabList>
      </TabList>
      <TabSlot style={[styles.slot, isWide && styles.wideSlot]} />
    </Tabs>
  );
}

function TabButton({
  label,
  Icon,
  isFocused,
  isWide,
  ...props
}: TabTriggerSlotProps & {
  label: string;
  Icon: (props: TabIconProps) => ReactElement;
  isWide: boolean;
}) {
  const theme = useTheme();
  const color = isFocused ? theme.primary : theme.textSecondary;

  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      style={({ pressed }) => [
        styles.tabButton,
        isWide && styles.wideTabButton,
        isFocused && isWide && { backgroundColor: theme.backgroundSelected },
        pressed && styles.pressed,
      ]}>
      <Icon color={color} size={22} />
      <ThemedText
        type={isFocused ? 'smallBold' : 'small'}
        style={[styles.label, isWide && styles.wideLabel, { color }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function CustomTabList({
  isWide,
  style: tabListStyle,
  children,
  ...props
}: TabListProps & { isWide: boolean }) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View
      {...props}
      style={tabListStyle}>
      <ThemedView
        type="backgroundElement"
        style={[
          styles.innerContainer,
          isWide
            ? [styles.wideRail, { borderRightColor: theme.border }]
            : [
                styles.mobileTabBar,
                { paddingBottom: Spacing.two + insets.bottom, borderTopColor: theme.border },
              ],
        ]}>
        {isWide ? (
          <View style={styles.brandBlock}>
            <BrandMark width={144} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.brandCaption}>
              Thoughtful introductions
            </ThemedText>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.navLabel}>
              YOUR SPACE
            </ThemedText>
          </View>
        ) : null}
        <View style={[styles.tabs, isWide && styles.wideTabs]}>{children}</View>
        {isWide ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.railFooter}>
            Good connections take time.
          </ThemedText>
        ) : null}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    minHeight: 0,
  },
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  railWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 248,
    flexShrink: 0,
    zIndex: 1,
  },
  innerContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
  },
  mobileTabBar: {
    maxWidth: MaxContentWidth,
    borderTopLeftRadius: Spacing.three,
    borderTopRightRadius: Spacing.three,
  },
  wideRail: {
    flex: 1,
    width: '100%',
    maxWidth: undefined,
    flexDirection: 'column',
    padding: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    borderTopWidth: 0,
    borderRightWidth: 1,
  },
  brandBlock: {
    alignItems: 'flex-start',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  brandCaption: {
    marginTop: -Spacing.two,
  },
  navLabel: {
    marginTop: Spacing.three,
    fontSize: 11,
    letterSpacing: 1,
  },
  tabs: {
    flexDirection: 'row',
    flex: 1,
  },
  wideTabs: {
    flexDirection: 'column',
    flex: 0,
    gap: Spacing.one,
  },
  wideSlot: {
    marginLeft: 248,
  },
  railFooter: {
    marginTop: 'auto',
    paddingTop: Spacing.four,
  },
  wideTabButton: {
    flex: 0,
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
  },
  wideLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: Spacing.one,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
  },
});
