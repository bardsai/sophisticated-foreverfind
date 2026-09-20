import { Circle, Path, Svg } from 'react-native-svg';

export type IconProps = {
  color: string;
  size?: number;
};

const stroke = {
  fill: 'none',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function ManIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={10} cy={14} r={6} stroke={color} {...stroke} />
      <Path d="M14.5 9.5L20 4" stroke={color} {...stroke} />
      <Path d="M14 4h6v6" stroke={color} {...stroke} />
    </Svg>
  );
}

export function WomanIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={10} r={6} stroke={color} {...stroke} />
      <Path d="M12 16v6M9 19h6" stroke={color} {...stroke} />
    </Svg>
  );
}

export function NonBinaryIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={14} r={6} stroke={color} {...stroke} />
      <Path d="M12 8V4M9.3 5.3L12 8M14.7 5.3L12 8" stroke={color} {...stroke} />
    </Svg>
  );
}

export function DashCircleIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8} stroke={color} {...stroke} />
      <Path d="M9 12h6" stroke={color} {...stroke} />
    </Svg>
  );
}

export function TravelIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} stroke={color} {...stroke} />
      <Path d="M15.5 8.5l-2 5-5 2 2-5z" stroke={color} {...stroke} />
    </Svg>
  );
}

export function CookingIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 11h16v2a6 6 0 01-6 6h-4a6 6 0 01-6-6v-2z" stroke={color} {...stroke} />
      <Path d="M8 11V8M12 11V7M16 11V8" stroke={color} {...stroke} />
    </Svg>
  );
}

export function ReadingIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 5.5C4 5.5 7 4 12 5.5V19C7 17.5 4 19 4 19V5.5z" stroke={color} {...stroke} />
      <Path d="M20 5.5C20 5.5 17 4 12 5.5V19C17 17.5 20 19 20 19V5.5z" stroke={color} {...stroke} />
    </Svg>
  );
}

export function FitnessIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 12h16M4 9v6M20 9v6M7 7v10M17 7v10" stroke={color} {...stroke} />
    </Svg>
  );
}

export function MusicIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 18V5l10-2v13" stroke={color} {...stroke} />
      <Circle cx={6.5} cy={18} r={2.5} stroke={color} {...stroke} />
      <Circle cx={16.5} cy={16} r={2.5} stroke={color} {...stroke} />
    </Svg>
  );
}

export function ArtIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3a9 9 0 000 18c1 0 1.5-.7 1.5-1.5 0-.4-.15-.75-.4-1.05-.25-.3-.4-.65-.4-1.05 0-.8.7-1.4 1.5-1.4H16a5 5 0 005-5c0-4.4-4-8-9-8z"
        stroke={color}
        {...stroke}
      />
      <Circle cx={7.5} cy={10.5} r={1} fill={color} />
      <Circle cx={9.5} cy={7} r={1} fill={color} />
      <Circle cx={14} cy={6.5} r={1} fill={color} />
    </Svg>
  );
}

export function PhotographyIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 8h3l1.5-2h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"
        stroke={color}
        {...stroke}
      />
      <Circle cx={12} cy={13} r={3.5} stroke={color} {...stroke} />
    </Svg>
  );
}

export function OutdoorsIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 18l6-9 4 5 2-3 6 7z" stroke={color} {...stroke} />
    </Svg>
  );
}

export function FilmIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 9h16v9a1 1 0 01-1 1H5a1 1 0 01-1-1V9z" stroke={color} {...stroke} />
      <Path d="M4 9l1.5-4h13L20 9M8 5l2 4M13 5l2 4" stroke={color} {...stroke} />
    </Svg>
  );
}

export function WineDiningIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8 3h8l-1 6a3 3 0 01-6 0z" stroke={color} {...stroke} />
      <Path d="M12 12v6M9 21h6" stroke={color} {...stroke} />
    </Svg>
  );
}

export function VolunteeringIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={5} stroke={color} {...stroke} />
      <Path d="M9 12.5L7 21l5-3 5 3-2-8.5" stroke={color} {...stroke} />
    </Svg>
  );
}

export function FashionIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 4a2 2 0 100 4" stroke={color} {...stroke} />
      <Path d="M12 8l-9 6h18l-9-6z" stroke={color} {...stroke} />
      <Path d="M5 18h14" stroke={color} {...stroke} />
    </Svg>
  );
}

export function CheckIcon({ color, size = 13 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
