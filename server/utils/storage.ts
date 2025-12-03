import { supabaseAdmin, STORAGE_BUCKET } from '../lib/supabaseClient.js';

export const getSignedUrl = async (path: string, expiresIn = 60 * 60): Promise<string | null> => {
  if (!path) return null;
  const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) {
    return null;
  }
  return data.signedUrl;
};

export const downloadStorageObject = async (path: string): Promise<Buffer | null> => {
  if (!path) return null;
  const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).download(path);
  if (error || !data) {
    return null;
  }
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

