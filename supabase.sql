-- Storage bucket for user-generated content (screenshots, images)
insert into storage.buckets (id, name, public)
values ('user-content', 'user-content', false)
on conflict (id) do nothing;

-- RLS policies for private bucket
-- Users can upload to their own folder
create policy "Users can upload own images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'user-content' and (storage.foldername(name))[1] = auth.uid()::text);

-- Users can read their own images
create policy "Users can view own images"
on storage.objects for select
to authenticated
using (bucket_id = 'user-content' and (storage.foldername(name))[1] = auth.uid()::text);

-- Users can delete their own images
create policy "Users can delete own images"
on storage.objects for delete
to authenticated
using (bucket_id = 'user-content' and (storage.foldername(name))[1] = auth.uid()::text);

-- Image URLs on journal entries & playbooks
alter table if exists public.journal_entries
  add column if not exists image_urls jsonb default '[]'::jsonb;

alter table if exists public.playbooks
  add column if not exists image_urls jsonb default '[]'::jsonb;

-- =====================================================================
-- NOTEBOOKS RLS (to fix 403s on notebook_pages / notebook_resources)
-- =====================================================================

-- Enable Row Level Security on notebooks + children
alter table if exists public.notebooks enable row level security;
alter table if exists public.notebook_pages enable row level security;
alter table if exists public.notebook_resources enable row level security;

-- Notebooks: only owner can CRUD
create policy "Users can select own notebooks"
on public.notebooks for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert own notebooks"
on public.notebooks for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update own notebooks"
on public.notebooks for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own notebooks"
on public.notebooks for delete
to authenticated
using (user_id = auth.uid());

-- Notebook pages: access allowed only via parent notebook ownership
create policy "Users can select pages of own notebooks"
on public.notebook_pages for select
to authenticated
using (
  exists (
    select 1
    from public.notebooks n
    where n.id = notebook_pages.notebook_id
      and n.user_id = auth.uid()
  )
);

create policy "Users can insert pages into own notebooks"
on public.notebook_pages for insert
to authenticated
with check (
  exists (
    select 1
    from public.notebooks n
    where n.id = notebook_pages.notebook_id
      and n.user_id = auth.uid()
  )
);

create policy "Users can update pages of own notebooks"
on public.notebook_pages for update
to authenticated
using (
  exists (
    select 1
    from public.notebooks n
    where n.id = notebook_pages.notebook_id
      and n.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.notebooks n
    where n.id = notebook_pages.notebook_id
      and n.user_id = auth.uid()
  )
);

create policy "Users can delete pages of own notebooks"
on public.notebook_pages for delete
to authenticated
using (
  exists (
    select 1
    from public.notebooks n
    where n.id = notebook_pages.notebook_id
      and n.user_id = auth.uid()
  )
);

-- Notebook resources: same pattern as notebook pages
create policy "Users can select resources of own notebooks"
on public.notebook_resources for select
to authenticated
using (
  exists (
    select 1
    from public.notebooks n
    where n.id = notebook_resources.notebook_id
      and n.user_id = auth.uid()
  )
);

create policy "Users can insert resources into own notebooks"
on public.notebook_resources for insert
to authenticated
with check (
  exists (
    select 1
    from public.notebooks n
    where n.id = notebook_resources.notebook_id
      and n.user_id = auth.uid()
  )
);

create policy "Users can update resources of own notebooks"
on public.notebook_resources for update
to authenticated
using (
  exists (
    select 1
    from public.notebooks n
    where n.id = notebook_resources.notebook_id
      and n.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.notebooks n
    where n.id = notebook_resources.notebook_id
      and n.user_id = auth.uid()
  )
);

create policy "Users can delete resources of own notebooks"
on public.notebook_resources for delete
to authenticated
using (
  exists (
    select 1
    from public.notebooks n
    where n.id = notebook_resources.notebook_id
      and n.user_id = auth.uid()
  )
);

-- =====================================================================
-- TASKS TABLE & RLS
-- =====================================================================

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  column_id text not null check (column_id in ('backlog','this_week','in_progress','review','completed')),
  position integer,
  priority text,
  due_date date,
  task_type text,
  linked_playbook_id uuid references public.playbooks(id) on delete set null,
  linked_trade_id uuid references public.trades(id) on delete set null,
  linked_journal_id uuid references public.journal_entries(id) on delete set null,
  linked_notebook_id uuid references public.notebooks(id) on delete set null,
  result_notes text,
  is_recurring boolean default false,
  recurring_frequency text,
  created_at timestamptz default now(),
  updated_at timestamptz,
  completed_at timestamptz
);

alter table if exists public.tasks enable row level security;

create policy "Users can select own tasks"
on public.tasks for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert own tasks"
on public.tasks for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update own tasks"
on public.tasks for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own tasks"
on public.tasks for delete
to authenticated
using (user_id = auth.uid());
