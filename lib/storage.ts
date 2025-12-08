import imageCompression from 'browser-image-compression';
import { supabase } from './supabaseClient';
import type { UploadedImage } from '../types/data';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadContext {
  userId: string;
  entity: 'journals' | 'playbooks' | 'profiles';
  entityId: string | number;
}

const sanitizeFileName = (fileName: string) => {
  return fileName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.\-_]/g, '')
    .slice(-80);
};

export const uploadImageToStorage = async (file: File, context: UploadContext): Promise<UploadedImage> => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Only jpg, jpeg, png, webp, or gif files are allowed.');
  }

  const compressionOptions = {
    maxSizeMB: MAX_IMAGE_FILE_SIZE / (1024 * 1024),
    maxWidthOrHeight: 2400,
    useWebWorker: true,
    maxIteration: 10,
  };

  let processedFile = file;

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    processedFile = await imageCompression(file, compressionOptions);
    if (processedFile.size > MAX_IMAGE_FILE_SIZE) {
      throw new Error('Image is still too large after compression. Please choose a smaller file (max 5MB).');
    }
  }

  const timestamp = Date.now();
  const safeName = sanitizeFileName(processedFile.name || 'image');
  const path = `${context.userId}/${context.entity}/${context.entityId}/${timestamp}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from('user-content')
    .upload(path, processedFile, { contentType: processedFile.type, upsert: false });

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload image.');
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from('user-content')
    .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days

  if (signedError || !signedData?.signedUrl) {
    throw new Error(signedError?.message || 'Failed to retrieve uploaded image URL.');
  }

  return {
    url: signedData.signedUrl,
    path,
    created_at: new Date().toISOString(),
  };
};

export const deleteImageFromStorage = async (path: string) => {
  if (!path) return;
  await supabase.storage.from('user-content').remove([path]);
};


