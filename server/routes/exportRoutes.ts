import archiver from 'archiver';
import { PassThrough } from 'node:stream';
import type { Response } from 'express';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import type { Json } from '@supabase/supabase-js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabaseClient.js';
import { logExport } from '../lib/exportLogger.js';
import { getCacheBuffer, setCacheBuffer } from '../lib/cache.js';
import { toCsv } from '../utils/csv.js';
import { renderHtmlToPdf } from '../utils/pdf.js';
import { downloadStorageObject, getSignedUrl } from '../utils/storage.js';
import {
  allJournalsHtml,
  journalHtml,
  parseImageList,
  playbookHtml,
} from '../utils/templates.js';

const router = Router();
router.use(requireAuth);

const standardLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest) => req.user?.id ?? req.ip ?? 'anonymous',
  message: { error: 'rate_limited', message: 'Too many export requests. Try again later.' },
});

const heavyLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: AuthenticatedRequest) => req.user?.id ?? req.ip ?? 'anonymous',
  message: { error: 'rate_limited', message: 'Heavy export limit reached. Try again tomorrow.' },
});

const CACHE_TTL_MS = 60 * 60 * 1000;

const sanitizeFileName = (value: string) => value.replace(/[^a-z0-9-_]+/gi, '_');

const formatDateLabel = (value?: string | null) => {
  if (!value) return new Date().toLocaleDateString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getProfileName = async (userId: string): Promise<string | undefined> => {
  const { data } = await supabaseAdmin.from('profiles').select('full_name').eq('id', userId).maybeSingle();
  return data?.full_name ?? undefined;
};

router.get('/trades', standardLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const format = (req.query.format as string)?.toLowerCase() === 'json' ? 'json' : 'csv';
    const startDate = req.query.start_date as string | undefined;
    const endDate = req.query.end_date as string | undefined;

    let query = supabaseAdmin.from('trades').select('*').eq('user_id', user.id).order('entry_date', { ascending: false });
    if (startDate) query = query.gte('entry_date', startDate);
    if (endDate) query = query.lte('entry_date', endDate);

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'fetch_failed', message: error.message });
    }

    await logExport({
      userId: user.id,
      type: `trades_${format}`,
      metadata: { startDate, endDate, rowCount: data?.length ?? 0 },
    });

    if (format === 'json') {
      res
        .setHeader('Content-Type', 'application/json')
        .setHeader('Content-Disposition', `attachment; filename="trades-${Date.now()}.json"`)
        .send(JSON.stringify(data ?? [], null, 2));
      return;
    }

    const csv = toCsv(data ?? []);
    res
      .setHeader('Content-Type', 'text/csv')
      .setHeader('Content-Disposition', `attachment; filename="trades-${Date.now()}.csv"`)
      .send(csv);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Trades export failed', error);
    res.status(500).json({ error: 'export_failed', message: 'Unable to export trades.' });
  }
});

router.get('/journal/:journalId', standardLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const journalId = req.params.journalId;

    const { data: entry, error } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('id', journalId)
      .single();

    if (error || !entry) {
      return res.status(404).json({ error: 'not_found', message: 'Journal entry not found.' });
    }

    const images = parseImageList(entry.image_urls as Json | null);
    const signedImages = (
      await Promise.all(
        images.map(async (img) => (await getSignedUrl(img.path ?? '')) ?? img.url ?? null)
      )
    ).filter((url): url is string => Boolean(url));

    const author = await getProfileName(user.id);
    const html = journalHtml({
      title: entry.title ?? 'Untitled Entry',
      dateLabel: formatDateLabel(entry.date ?? entry.created_at),
      content: entry.content ?? '',
      author,
      imageUrls: signedImages,
    });

    const pdf = await renderHtmlToPdf(html);

    await logExport({
      userId: user.id,
      type: 'journal_pdf',
      metadata: { journalId },
    });

    res
      .setHeader('Content-Type', 'application/pdf')
      .setHeader(
        'Content-Disposition',
        `attachment; filename="journal-${sanitizeFileName(entry.title ?? 'entry')}.pdf"`
      )
      .send(pdf);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Journal export failed', error);
    res.status(500).json({ error: 'export_failed', message: 'Unable to export journal entry.' });
  }
});

router.get('/journals/all', heavyLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const cacheKey = `journals_all:${user.id}`;
    const cached = getCacheBuffer(cacheKey);
    if (cached) {
      res
        .setHeader('Content-Type', 'application/pdf')
        .setHeader('Content-Disposition', `attachment; filename="journals-${Date.now()}.pdf"`)
        .send(cached.value);
      await logExport({
        userId: user.id,
        type: 'journals_pdf_cached',
        metadata: cached.metadata ?? { cached: true },
      });
      return;
    }

    const { data: entries, error } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'fetch_failed', message: error.message });
    }

    const author = await getProfileName(user.id);
    const formattedEntries =
      entries?.map((entry) => {
        const images = parseImageList(entry.image_urls as Json | null);
        return {
          title: entry.title ?? 'Untitled Entry',
          dateLabel: formatDateLabel(entry.date ?? entry.created_at),
          content: entry.content ?? '',
          images: images.map((img) => img.path).filter(Boolean) as string[],
          rawImages: images,
        };
      }) ?? [];

    const signedPayload = await Promise.all(
      formattedEntries.map(async (entry) => {
        const signed = (
          await Promise.all(
            entry.rawImages.map(async (img) => (await getSignedUrl(img.path ?? '')) ?? img.url ?? null)
          )
        ).filter((url): url is string => Boolean(url));
        return { ...entry, images: signed };
      })
    );

    const html = allJournalsHtml({
      author,
      entries: signedPayload.map(({ rawImages, ...rest }) => rest),
    });

    const pdf = await renderHtmlToPdf(html);
    await logExport({ userId: user.id, type: 'journals_pdf', metadata: { count: entries?.length ?? 0 } });
    setCacheBuffer(cacheKey, pdf, CACHE_TTL_MS, { count: entries?.length ?? 0 });

    res
      .setHeader('Content-Type', 'application/pdf')
      .setHeader('Content-Disposition', `attachment; filename="journals-${Date.now()}.pdf"`)
      .send(pdf);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('All journals export failed', error);
    res.status(500).json({ error: 'export_failed', message: 'Unable to export journals.' });
  }
});

router.get('/playbook/:playbookId', standardLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const playbookId = req.params.playbookId;

    const { data: playbook, error } = await supabaseAdmin
      .from('playbooks')
      .select('*')
      .eq('user_id', user.id)
      .eq('id', playbookId)
      .single();

    if (error || !playbook) {
      return res.status(404).json({ error: 'not_found', message: 'Playbook not found.' });
    }

    const images = parseImageList(playbook.image_urls as Json | null);
    const signedImages = (
      await Promise.all(
        images.map(async (img) => (await getSignedUrl(img.path ?? '')) ?? img.url ?? null)
      )
    ).filter((url): url is string => Boolean(url));

    const rulesArray: Array<{ text: string }> = Array.isArray(playbook.rules)
      ? (playbook.rules as Array<{ text: string }>)
      : [];

    const author = await getProfileName(user.id);
    const html = playbookHtml({
      title: playbook.title ?? 'Untitled Playbook',
      description: playbook.description ?? '',
      tags: Array.isArray(playbook.tags) ? playbook.tags : [],
      rules: rulesArray,
      author,
      imageUrls: signedImages,
    });

    const pdf = await renderHtmlToPdf(html);
    await logExport({ userId: user.id, type: 'playbook_pdf', metadata: { playbookId } });

    res
      .setHeader('Content-Type', 'application/pdf')
      .setHeader(
        'Content-Disposition',
        `attachment; filename="playbook-${sanitizeFileName(playbook.title ?? 'export')}.pdf"`
      )
      .send(pdf);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Playbook export failed', error);
    res.status(500).json({ error: 'export_failed', message: 'Unable to export playbook.' });
  }
});

const buildArchiveBuffer = async (
  payload: Record<string, unknown>,
  imagePaths: string[]
): Promise<Buffer> => {
  const archive = archiver('zip', { zlib: { level: 9 } });
  const stream = new PassThrough();
  const chunks: Buffer[] = [];

  const completion = new Promise<Buffer>((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
    archive.on('error', reject);
  });

  archive.pipe(stream);

  archive.append(JSON.stringify(payload, null, 2), { name: 'data.json' });
  archive.append(
    `Ryzen Trading Journal Backup\nExported: ${new Date().toISOString()}\nFiles: data.json, README.txt, images/*\n`,
    { name: 'README.txt' }
  );

  for (const pathValue of imagePaths) {
    const buffer = await downloadStorageObject(pathValue);
    if (buffer) {
      const fileName = `images/${sanitizeFileName(pathValue)}`;
      archive.append(buffer, { name: fileName });
    }
  }

  await archive.finalize();
  return completion;
};

router.get('/full-backup', heavyLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user } = req;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const cacheKey = `full_backup:${user.id}`;
    const cached = getCacheBuffer(cacheKey);
    if (cached) {
      res
        .setHeader('Content-Type', 'application/zip')
        .setHeader('Content-Disposition', `attachment; filename="ryzen-backup-${Date.now()}.zip"`)
        .send(cached.value);
      await logExport({
        userId: user.id,
        type: 'full_backup_cached',
        metadata: cached.metadata ?? { cached: true },
      });
      return;
    }

    const [profile, trades, journals, playbooks, notebooks, notebookPages, notebookResources] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabaseAdmin.from('trades').select('*').eq('user_id', user.id),
      supabaseAdmin.from('journal_entries').select('*').eq('user_id', user.id),
      supabaseAdmin.from('playbooks').select('*').eq('user_id', user.id),
      supabaseAdmin.from('notebooks').select('*').eq('user_id', user.id),
      supabaseAdmin.from('notebook_pages').select('*').eq('user_id', user.id),
      supabaseAdmin.from('notebook_resources').select('*').eq('user_id', user.id),
    ]);

    const payload = {
      export_date: new Date().toISOString(),
      profile: profile.data ?? null,
      trades: trades.data ?? [],
      journal_entries: journals.data ?? [],
      playbooks: playbooks.data ?? [],
      notebooks: notebooks.data ?? [],
      notebook_pages: notebookPages.data ?? [],
      notebook_resources: notebookResources.data ?? [],
    };

    const collectImages = (records: Array<{ image_urls?: Json | null }>) => {
      const paths = new Set<string>();
      records.forEach((record) => {
        const images = parseImageList(record.image_urls ?? null);
        images.forEach((img) => {
          if (img.path) paths.add(img.path);
        });
      });
      return Array.from(paths);
    };

    const imagePaths = [
      ...collectImages(journals.data ?? []),
      ...collectImages(playbooks.data ?? []),
      ...collectImages(trades.data ?? []),
    ];

    const zipBuffer = await buildArchiveBuffer(payload as Record<string, unknown>, imagePaths);

    await logExport({ userId: user.id, type: 'full_backup', metadata: { images: imagePaths.length } });
    setCacheBuffer(cacheKey, zipBuffer, CACHE_TTL_MS, { images: imagePaths.length });

    res
      .setHeader('Content-Type', 'application/zip')
      .setHeader('Content-Disposition', `attachment; filename="ryzen-backup-${Date.now()}.zip"`)
      .send(zipBuffer);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Full backup export failed', error);
    res.status(500).json({ error: 'export_failed', message: 'Unable to generate full backup.' });
  }
});

export default router;

