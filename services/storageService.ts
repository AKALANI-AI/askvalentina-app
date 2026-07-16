// Powered by OnSpace.AI
// ASK VALENTINA — Photo Storage Service

import { Platform } from 'react-native';
import { getSupabaseClient } from '@/template';
import { decode } from 'base64-arraybuffer';

const supabase = getSupabaseClient();
const BUCKET = 'reading-photos';

/**
 * Upload a single photo to Supabase Storage.
 * Returns the public URL on success, or null on failure.
 */
export async function uploadPhoto(
  localUri: string,
  folder: string = 'client'
): Promise<{ url: string | null; error: string | null }> {
  try {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = localUri.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${folder}/${timestamp}_${random}.${ext}`;

    let uploadError: any = null;

    if (Platform.OS === 'web') {
      // Web: use fetch + blob
      const response = await fetch(localUri);
      const blob = await response.blob();
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, blob, {
          contentType: blob.type || 'image/jpeg',
          upsert: false,
        });
      uploadError = error;
    } else {
      // Mobile: convert to base64 then arraybuffer
      const response = await fetch(localUri);
      const blob = await response.blob();
      const reader = new FileReader();

      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const arrayBuffer = decode(base64);
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, arrayBuffer, {
          contentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
          upsert: false,
        });
      uploadError = error;
    }

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return { url: publicData.publicUrl, error: null };
  } catch (err: any) {
    console.error('Upload exception:', err);
    return { url: null, error: err.message || 'Failed to upload photo' };
  }
}

/**
 * Upload multiple photos in parallel.
 * Returns an array of public URLs (skips failures).
 */
export async function uploadMultiplePhotos(
  localUris: string[],
  folder: string = 'subject'
): Promise<{ urls: string[]; errors: string[] }> {
  const results = await Promise.all(
    localUris.map((uri) => uploadPhoto(uri, folder))
  );

  const urls: string[] = [];
  const errors: string[] = [];

  for (const result of results) {
    if (result.url) {
      urls.push(result.url);
    }
    if (result.error) {
      errors.push(result.error);
    }
  }

  return { urls, errors };
}
