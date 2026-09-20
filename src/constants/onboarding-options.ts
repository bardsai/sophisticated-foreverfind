import {
  ArtIcon,
  CookingIcon,
  DashCircleIcon,
  FashionIcon,
  FilmIcon,
  FitnessIcon,
  ManIcon,
  MusicIcon,
  NonBinaryIcon,
  OutdoorsIcon,
  PhotographyIcon,
  ReadingIcon,
  TravelIcon,
  VolunteeringIcon,
  WineDiningIcon,
  WomanIcon,
  type IconProps,
} from '@/components/onboarding/icons';

export type Option = { value: string; label: string; Icon?: React.ComponentType<IconProps> };

export const GENDER_OPTIONS: Option[] = [
  { value: 'man', label: 'Man', Icon: ManIcon },
  { value: 'woman', label: 'Woman', Icon: WomanIcon },
  { value: 'non_binary', label: 'Non-binary', Icon: NonBinaryIcon },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', Icon: DashCircleIcon },
];

export const PHYSIQUE_OPTIONS: Option[] = [
  { value: 'slim', label: 'Slim' },
  { value: 'athletic', label: 'Athletic' },
  { value: 'average', label: 'Average' },
  { value: 'curvy', label: 'Curvy' },
  { value: 'muscular', label: 'Muscular' },
  { value: 'plus_size', label: 'Plus size' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const EDUCATION_OPTIONS: Option[] = [
  { value: 'high_school', label: 'High school' },
  { value: 'some_college', label: 'Some college' },
  { value: 'bachelors', label: "Bachelor's degree" },
  { value: 'masters', label: "Master's degree" },
  { value: 'doctorate', label: 'Doctorate' },
  { value: 'trade_professional', label: 'Trade or professional certification' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const RELIGION_OPTIONS: Option[] = [
  { value: 'christian', label: 'Christian' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'other', label: 'Other' },
  { value: 'none', label: 'Not religious' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const MARITAL_STATUS_OPTIONS: Option[] = [
  { value: 'never_married', label: 'Never married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
];

export const WANTS_CHILDREN_OPTIONS: Option[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_sure', label: 'Not sure' },
];

export const GENOTYPE_OPTIONS: Option[] = [
  { value: 'AA', label: 'AA' },
  { value: 'AS', label: 'AS' },
  { value: 'SS', label: 'SS' },
  { value: 'AC', label: 'AC' },
  { value: 'SC', label: 'SC' },
  { value: 'CC', label: 'CC' },
  { value: 'unknown', label: "I don't know" },
];

export const INTEREST_OPTIONS: Option[] = [
  { value: 'Travel', label: 'Travel', Icon: TravelIcon },
  { value: 'Cooking', label: 'Cooking', Icon: CookingIcon },
  { value: 'Reading', label: 'Reading', Icon: ReadingIcon },
  { value: 'Fitness', label: 'Fitness', Icon: FitnessIcon },
  { value: 'Music', label: 'Music', Icon: MusicIcon },
  { value: 'Art', label: 'Art', Icon: ArtIcon },
  { value: 'Photography', label: 'Photography', Icon: PhotographyIcon },
  { value: 'Outdoors', label: 'Outdoors', Icon: OutdoorsIcon },
  { value: 'Film', label: 'Film', Icon: FilmIcon },
  { value: 'Wine & Dining', label: 'Wine & Dining', Icon: WineDiningIcon },
  { value: 'Volunteering', label: 'Volunteering', Icon: VolunteeringIcon },
  { value: 'Fashion', label: 'Fashion', Icon: FashionIcon },
];

export const QUALITY_OPTIONS: Option[] = [
  { value: 'Kind', label: 'Kind' },
  { value: 'Ambitious', label: 'Ambitious' },
  { value: 'Family-oriented', label: 'Family-oriented' },
  { value: 'Funny', label: 'Funny' },
  { value: 'Adventurous', label: 'Adventurous' },
  { value: 'Intelligent', label: 'Intelligent' },
  { value: 'Honest', label: 'Honest' },
  { value: 'Supportive', label: 'Supportive' },
  { value: 'Confident', label: 'Confident' },
  { value: 'Easy-going', label: 'Easy-going' },
  { value: 'Spiritual', label: 'Spiritual' },
  { value: 'Financially stable', label: 'Financially stable' },
];

export const DEAL_BREAKER_OPTIONS: Option[] = [
  { value: 'Smoking', label: 'Smoking' },
  { value: 'Excessive drinking', label: 'Excessive drinking' },
  { value: 'Dishonesty', label: 'Dishonesty' },
  { value: 'No ambition', label: 'No ambition' },
  { value: 'Poor communication', label: 'Poor communication' },
  { value: 'Different life goals', label: 'Different life goals' },
  { value: 'Long distance', label: 'Long distance' },
  { value: 'Different values', label: 'Different values' },
  { value: 'Anger issues', label: 'Anger issues' },
  { value: 'Unemployment', label: 'Unemployment' },
];

// Presets rather than a raw km input — most people can't estimate distance
// in kilometers accurately, and a wrong guess here just means bad matches
// rather than a hard error, so coarse buckets are the better trade-off.
export const DISTANCE_OPTIONS: Option[] = [
  { value: '25', label: 'Nearby (within 25 km)' },
  { value: '100', label: 'Within 100 km' },
  { value: '300', label: 'Within my region (300 km)' },
  { value: '', label: "Anywhere — distance doesn't matter" },
];
