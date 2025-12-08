import { supabase } from './supabaseClient';

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

/**
 * Updates the user's profile information in Supabase Auth metadata and the profiles table.
 * Prioritizes Auth metadata for immediate UI updates, but syncs to profiles table for consistency.
 */
export async function updateUserProfile(
  userId: string,
  updates: { fullName?: string; avatarUrl?: string }
): Promise<{ user: UserProfile; error?: string }> {
  try {
    // 1. Update Supabase Auth User Metadata (Source of truth for session)
    const { data: authData, error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: updates.fullName,
        avatar_url: updates.avatarUrl,
      },
    });

    if (authError) {
      console.error('Error updating auth metadata:', authError);
      return { 
        user: { id: userId, full_name: '', avatar_url: '' }, 
        error: authError.message 
      };
    }

    // 2. Upsert into profiles table (for backend consistency/other users to see)
    // We treat this as secondary - if it fails, we log it but don't block the UI update
    // because RLS might be strict or table might be missing in some dev envs.
    const profileUpdates = {
      id: userId,
      updated_at: new Date().toISOString(),
      ...(updates.fullName && { full_name: updates.fullName }),
      ...(updates.avatarUrl && { avatar_url: updates.avatarUrl }),
    };

    const { error: dbError } = await supabase
      .from('profiles')
      .upsert(profileUpdates)
      .select();

    if (dbError) {
      console.warn('Warning: Failed to sync profile to DB table:', dbError.message);
    }

    return {
      user: {
        id: userId,
        full_name: authData.user.user_metadata.full_name || '',
        avatar_url: authData.user.user_metadata.avatar_url,
      },
    };
  } catch (err: any) {
    console.error('Unexpected error updating profile:', err);
    return { 
      user: { id: userId, full_name: '', avatar_url: '' }, 
      error: err.message || 'An unexpected error occurred' 
    };
  }
}
