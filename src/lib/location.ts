import * as Location from 'expo-location';

import { supabase } from '@/lib/supabase';

export async function updateMyLocation(userId: string): Promise<void> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission was denied.');
  }

  const position = await Location.getCurrentPositionAsync({});
  const { error } = await supabase.from('profile_locations').upsert({
    id: userId,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });
  if (error) throw error;
}

export async function hasSharedLocation(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profile_locations')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  return !!data;
}
