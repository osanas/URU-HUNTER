-- Twilio subaccounts for each user
create table if not exists public.twilio_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  twilio_account_sid text not null,
  twilio_auth_token text not null,
  friendly_name text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id)
);

alter table public.twilio_accounts enable row level security;

create policy "twilio_accounts_select" on public.twilio_accounts for select using (auth.uid() = user_id);
create policy "twilio_accounts_insert" on public.twilio_accounts for insert with check (auth.uid() = user_id);
create policy "twilio_accounts_update" on public.twilio_accounts for update using (auth.uid() = user_id);
