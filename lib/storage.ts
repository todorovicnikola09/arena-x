import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

const BUCKET = 'tournament-covers';

export async function uploadTournamentCover(
  localUri: string,
  tournamentId: string
): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const fileExtMatch = localUri.match(/\.(\w+)$/);
  const fileExt = fileExtMatch ? fileExtMatch[1] : 'jpg';
  const path = `${tournamentId}/cover.${fileExt}`;

  const contentType = fileExt === 'png' ? 'image/png' : 'image/jpeg';

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, decode(base64), {
      contentType,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}