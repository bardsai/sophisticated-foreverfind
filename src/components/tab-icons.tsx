import { Circle, Path, Svg } from 'react-native-svg';

export type TabIconProps = {
  color: string;
  size?: number;
};

const stroke = {
  fill: 'none',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// Web equivalents of the native tab bar's SF Symbols (person.2, tray,
// bubble.left, person.crop.circle) — NativeTabs handles those natively, but
// web needs real icon assets, so these are hand-drawn to match in the same
// style already used for the onboarding option icons.

export function DiscoverTabIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={9} cy={8} r={3.2} stroke={color} {...stroke} />
      <Path d="M3.5 19c0-3.5 2.5-5.5 5.5-5.5s5.5 2 5.5 5.5" stroke={color} {...stroke} />
      <Circle cx={16.7} cy={9} r={2.6} stroke={color} {...stroke} />
      <Path d="M14.6 13.3c2.7.2 4.5 2 4.9 4.7" stroke={color} {...stroke} />
    </Svg>
  );
}

export function RequestsTabIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 12l1.5-6h13L20 12" stroke={color} {...stroke} />
      <Path d="M4 12h4l1.5 3h5L16 12h4" stroke={color} {...stroke} />
      <Path d="M4 12v5a1 1 0 001 1h14a1 1 0 001-1v-5" stroke={color} {...stroke} />
    </Svg>
  );
}

export function MessagesTabIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9l-4 4v-4H6a2 2 0 01-2-2V6z"
        stroke={color}
        {...stroke}
      />
    </Svg>
  );
}

export function ProfileTabIcon({ color, size = 22 }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} stroke={color} {...stroke} />
      <Circle cx={12} cy={9.5} r={3} stroke={color} {...stroke} />
      <Path d="M6.5 18.5c1-3 3-4.5 5.5-4.5s4.5 1.5 5.5 4.5" stroke={color} {...stroke} />
    </Svg>
  );
}
