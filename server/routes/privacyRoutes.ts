import type { Response, NextFunction } from 'express';
import { Router } from 'express';
import { supabaseAdmin, STORAGE_BUCKET } from '../lib/supabaseClient.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const ensureAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.is_admin) {
    return res.status(403).json({ error: 'forbidden', message: 'Admin access required.' });
  }
  return next();
};

const collectUserFiles = async (prefix: string): Promise<string[]> => {
  const { data, error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).list(prefix, {
    limit: 1000,
    offset: 0,
  });
  if (error || !data) return [];

  const files: string[] = [];
  for (const item of data) {
    const currentPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.metadata?.size) {
      files.push(currentPath);
    } else {
      const nested = await collectUserFiles(currentPath);
      files.push(...nested);
    }
  }
  return files;
};

router.post('/request-deletion', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { reason } = req.body as { reason?: string };
    await supabaseAdmin.from('deletion_requests').insert({
      user_id: user.id,
      status: 'pending',
      reason: reason ?? null,
      created_at: new Date().toISOString(),
    });

    res.json({ status: 'queued' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Deletion request failed', error);
    res.status(500).json({ error: 'request_failed', message: 'Unable to record deletion request.' });
  }
});

router.get('/requests', ensureAdmin, async (_req, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('deletion_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) {
    return res.status(500).json({ error: 'fetch_failed', message: error.message });
  }
  return res.json({ data });
});

router.patch('/request/:requestId', ensureAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { requestId } = req.params;
  const { status, notes } = req.body as { status?: string; notes?: string };
  const { error } = await supabaseAdmin
    .from('deletion_requests')
    .update({
      status,
      notes: notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId);
  if (error) {
    return res.status(500).json({ error: 'update_failed', message: error.message });
  }
  return res.json({ status: 'updated' });
});

router.delete('/account', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { confirm } = req.body as { confirm?: boolean };
    if (!confirm) {
      return res.status(400).json({ error: 'confirmation_required', message: 'Please confirm account deletion.' });
    }

    const tables = [
      'trades',
      'journal_entries',
      'playbooks',
      'notebooks',
      'notebook_pages',
      'notebook_resources',
      'export_logs',
      'deletion_requests',
    ];

    await Promise.all(tables.map((table) => supabaseAdmin.from(table).delete().eq('user_id', user.id)));

    const files = await collectUserFiles(user.id);
    if (files.length) {
      await supabaseAdmin.storage.from(STORAGE_BUCKET).remove(files);
    }

    await supabaseAdmin.from('profiles').delete().eq('id', user.id);
    await supabaseAdmin.auth.admin.deleteUser(user.id);

    res.json({ status: 'deleted' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Self-service deletion failed', error);
    res.status(500).json({ error: 'deletion_failed', message: 'Unable to delete account.' });
  }
});

export default router;

