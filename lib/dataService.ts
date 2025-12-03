import { supabase } from './supabaseClient';
import type {
  JournalEntry,
  Playbook,
  Notebook,
  NotebookPage,
  NotebookResource,
} from '../types/data';

// ============ JOURNAL ENTRIES ============

export async function fetchJournalEntries(userId: string): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title ?? 'Untitled',
    preview: row.preview ?? '',
    date: row.date ?? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    content: row.content ?? '',
    user_id: row.user_id,
    created_at: row.created_at,
    images: row.image_urls ?? [],
  }));
}

export async function createJournalEntry(
  userId: string,
  entry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>
): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      title: entry.title,
      preview: entry.preview,
      // Do not send `date` – derive it from created_at so we don't depend on a `date` column
      content: entry.content,
      image_urls: entry.images ?? [],
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    preview: data.preview ?? '',
    date:
      // Prefer explicit date column if your schema has it, otherwise derive from created_at
      data.date ??
      new Date(data.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    content: data.content ?? '',
    user_id: data.user_id,
    created_at: data.created_at,
    images: data.image_urls ?? [],
  };
}

export async function updateJournalEntry(
  entryId: string,
  updates: Partial<Pick<JournalEntry, 'title' | 'content' | 'preview' | 'images'>>
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.preview !== undefined) payload.preview = updates.preview;
  if (updates.images !== undefined) payload.image_urls = updates.images;

  const { error } = await supabase
    .from('journal_entries')
    .update(payload)
    .eq('id', entryId);

  if (error) throw error;
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', entryId);

  if (error) throw error;
}

// ============ PLAYBOOKS ============

export async function fetchPlaybooks(userId: string): Promise<Playbook[]> {
  const { data, error } = await supabase
    .from('playbooks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title ?? 'Untitled',
    description: row.description ?? '',
    tags: row.tags ?? [],
    rules: row.rules ?? [],
    user_id: row.user_id,
    created_at: row.created_at,
    images: row.image_urls ?? [],
  }));
}

export async function createPlaybook(
  userId: string,
  playbook: Omit<Playbook, 'id' | 'user_id' | 'created_at'>
): Promise<Playbook> {
  const { data, error } = await supabase
    .from('playbooks')
    .insert({
      user_id: userId,
      title: playbook.title,
      description: playbook.description,
      tags: playbook.tags,
      rules: playbook.rules,
      image_urls: playbook.images ?? [],
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    description: data.description ?? '',
    tags: data.tags ?? [],
    rules: data.rules ?? [],
    user_id: data.user_id,
    created_at: data.created_at,
    images: data.image_urls ?? [],
  };
}

export async function updatePlaybook(
  playbookId: string,
  updates: Partial<Pick<Playbook, 'title' | 'description' | 'tags' | 'rules' | 'images'>>
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.rules !== undefined) payload.rules = updates.rules;
  if (updates.images !== undefined) payload.image_urls = updates.images;

  const { error } = await supabase
    .from('playbooks')
    .update(payload)
    .eq('id', playbookId);

  if (error) throw error;
}

export async function deletePlaybook(playbookId: string): Promise<void> {
  const { error } = await supabase
    .from('playbooks')
    .delete()
    .eq('id', playbookId);

  if (error) throw error;
}

// ============ NOTEBOOKS ============

export async function fetchNotebooks(userId: string): Promise<Notebook[]> {
  // Fetch notebooks
  const { data: notebooksData, error: notebooksError } = await supabase
    .from('notebooks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (notebooksError) throw notebooksError;

  if (!notebooksData || notebooksData.length === 0) {
    return [];
  }

  const notebookIds = notebooksData.map((nb) => nb.id);

  // Fetch pages for all notebooks
  const { data: pagesData, error: pagesError } = await supabase
    .from('notebook_pages')
    .select('*')
    .in('notebook_id', notebookIds)
    .order('created_at', { ascending: true });

  if (pagesError) throw pagesError;

  // Fetch resources for all notebooks
  const { data: resourcesData, error: resourcesError } = await supabase
    .from('notebook_resources')
    .select('*')
    .in('notebook_id', notebookIds)
    .order('created_at', { ascending: true });

  if (resourcesError) throw resourcesError;

  // Group pages and resources by notebook_id
  const pagesByNotebook: Record<string, NotebookPage[]> = {};
  const resourcesByNotebook: Record<string, NotebookResource[]> = {};

  (pagesData ?? []).forEach((page) => {
    if (!pagesByNotebook[page.notebook_id]) {
      pagesByNotebook[page.notebook_id] = [];
    }
    pagesByNotebook[page.notebook_id].push({
      id: page.id,
      title: page.title ?? '',
      content: page.content ?? '',
      created_at: page.created_at,
      notebook_id: page.notebook_id,
    });
  });

  (resourcesData ?? []).forEach((res) => {
    if (!resourcesByNotebook[res.notebook_id]) {
      resourcesByNotebook[res.notebook_id] = [];
    }
    resourcesByNotebook[res.notebook_id].push({
      id: res.id,
      title: res.title ?? '',
      url: res.url ?? '',
      notebook_id: res.notebook_id,
      created_at: res.created_at,
    });
  });

  return notebooksData.map((nb) => ({
    id: nb.id,
    title: nb.title ?? 'Untitled',
    color: nb.color ?? 'bg-zinc-500',
    pages: pagesByNotebook[nb.id] ?? [],
    resources: resourcesByNotebook[nb.id] ?? [],
    user_id: nb.user_id,
    created_at: nb.created_at,
  }));
}

export async function createNotebook(
  userId: string,
  title: string
): Promise<Notebook> {
  // Pick a random color
  const colors = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-amber-500'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const { data, error } = await supabase
    .from('notebooks')
    .insert({ user_id: userId, title, color })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    color: data.color,
    pages: [],
    resources: [],
    user_id: data.user_id,
    created_at: data.created_at,
  };
}

export async function deleteNotebook(notebookId: string): Promise<void> {
  // Cascade delete pages and resources first (if not handled by DB FK cascade)
  await supabase.from('notebook_pages').delete().eq('notebook_id', notebookId);
  await supabase.from('notebook_resources').delete().eq('notebook_id', notebookId);

  const { error } = await supabase
    .from('notebooks')
    .delete()
    .eq('id', notebookId);

  if (error) throw error;
}

export async function createNotebookPage(
  notebookId: string,
  userId: string
): Promise<NotebookPage> {
  const { data, error } = await supabase
    .from('notebook_pages')
    .insert({
      notebook_id: notebookId,
      user_id: userId,
      title: 'Untitled Page',
      content: '',
    })
    .select()
    .single();

  if (error) {
    // Log full error so we can see exact Postgres / RLS message in the browser console
    console.error('createNotebookPage error:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content ?? '',
    created_at: data.created_at,
    notebook_id: data.notebook_id,
  };
}

export async function updateNotebookPage(
  pageId: string,
  updates: { title?: string; content?: string }
): Promise<void> {
  const { error } = await supabase
    .from('notebook_pages')
    .update(updates)
    .eq('id', pageId);

  if (error) throw error;
}

export async function deleteNotebookPage(pageId: string): Promise<void> {
  const { error } = await supabase
    .from('notebook_pages')
    .delete()
    .eq('id', pageId);

  if (error) throw error;
}

export async function createNotebookResource(
  notebookId: string,
  resource: { title: string; url: string }
): Promise<NotebookResource> {
  const { data, error } = await supabase
    .from('notebook_resources')
    .insert({ notebook_id: notebookId, title: resource.title, url: resource.url })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    url: data.url ?? '',
    notebook_id: data.notebook_id,
    created_at: data.created_at,
  };
}

export async function deleteNotebookResource(resourceId: string): Promise<void> {
  const { error } = await supabase
    .from('notebook_resources')
    .delete()
    .eq('id', resourceId);

  if (error) throw error;
}

