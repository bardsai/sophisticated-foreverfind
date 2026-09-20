import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import { type ReactElement } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

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
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton label="Discover" Icon={DiscoverTabIcon} />
          </TabTrigger>
          <TabTrigger name="requests" href="/requests" asChild>
            <TabButton label="Requests" Icon={RequestsTabIcon} />
          </TabTrigger>
          <TabTrigger name="messages" href="/messages" asChild>
            <TabButton label="Messages" Icon={MessagesTabIcon} />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton label="Profile" Icon={ProfileTabIcon} />
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({
  label,
  Icon,
  isFocused,
  ...props
}: TabTriggerSlotProps & { label: string; Icon: (props: TabIconProps) => ReactElement }) {
  const theme = useTheme();
  const color = isFocused ? theme.primary : theme.textSecondary;

  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <Icon color={color} size={22} />
      <ThemedText type="small" style={[styles.label, { color }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function CustomTabList(props: TabListProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.tabListContainer}>
      <ThemedView
        type="backgroundElement"
        style={[styles.innerContainer, { paddingBottom: Spacing.two + insets.bottom }]}>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingTop: Spacing.two,
    borderTopLeftRadius: Spacing.three,
    borderTopRightRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.one,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
  },
});
