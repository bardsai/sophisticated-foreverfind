import { File } from 'expo-file-system';
import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

// expo-file-system's File class only supports Android/iOS/tvOS — on web,
// expo-image-picker hands back a blob: URI that File can't read (it throws
// "this.validatePath is not a function" trying to treat it as a native
// path), so web reads the blob directly via fetch() instead.
export async function uploadAvatar(userId: string, asset: ImagePickerAsset): Promise<string> {
  const path = `${userId}/avatar`;
  const body =
    Platform.OS === 'web'
      ? await (await fetch(asset.uri)).blob()
      : await new File(asset.uri).bytes();

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, body, { contentType: asset.mimeType ?? 'image/jpeg', upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  // Cache-bust: the path is stable across re-uploads, so the URL alone
  // wouldn't change when the photo does.
  return `${data.publicUrl}?t=${Date.now()}`;
}
