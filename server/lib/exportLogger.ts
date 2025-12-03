import { supabaseAdmin } from './supabaseClient.js';

export const logExport = async (params: {
  userId: string;
  type: string;
  metadata?: Record<string, unknown>;
}) => {
  const payload = {
    user_id: params.userId,
    export_type: params.type,
    metadata: params.metadata ?? null,
  };
  await supabaseAdmin.from('export_logs').insert(payload);
};

