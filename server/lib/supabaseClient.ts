import { createClient } from '@supabase/supabase-js';
import { appConfig } from '../config/env.js';

export const supabaseAdmin = createClient(appConfig.supabaseUrl, appConfig.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const STORAGE_BUCKET = appConfig.supabaseStorageBucket;

