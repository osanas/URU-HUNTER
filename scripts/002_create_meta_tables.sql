-- Meta (Facebook & Instagram) accounts for each user
-- Permet aux clients de connecter leurs Pages Facebook et comptes Instagram
-- Une Page Facebook peut avoir un compte Instagram lié (instagram_account_id)
create table if not exists public.meta_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('facebook', 'instagram')),
  page_id text not null,
  page_name text,
  access_token text not null,
  instagram_account_id text,
  instagram_username text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, page_id)
);

-- Index pour les requêtes par user
create index if not exists meta_accounts_user_id_idx on public.meta_accounts(user_id);
create index if not exists meta_accounts_platform_idx on public.meta_accounts(platform);

alter table public.meta_accounts enable row level security;

create policy "meta_accounts_select" on public.meta_accounts for select using (auth.uid() = user_id);
create policy "meta_accounts_insert" on public.meta_accounts for insert with check (auth.uid() = user_id);
create policy "meta_accounts_update" on public.meta_accounts for update using (auth.uid() = user_id);
create policy "meta_accounts_delete" on public.meta_accounts for delete using (auth.uid() = user_id);
