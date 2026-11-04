-- Jalankan file ini satu kali di Supabase SQL Editor sebelum menggunakan Share WhatsApp Rapor Digital.
create extension if not exists pgcrypto;
create table if not exists public.digital_rapor_shares (
  id uuid primary key default gen_random_uuid(),
  token uuid not null unique default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 year')
);
create index if not exists digital_rapor_shares_token_idx on public.digital_rapor_shares(token);
alter table public.digital_rapor_shares enable row level security;
drop policy if exists "Guru can create own digital rapor links" on public.digital_rapor_shares;
create policy "Guru can create own digital rapor links" on public.digital_rapor_shares for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Guru can view own digital rapor links" on public.digital_rapor_shares;
create policy "Guru can view own digital rapor links" on public.digital_rapor_shares for select to authenticated using (auth.uid() = user_id);
grant insert, select on public.digital_rapor_shares to authenticated;
create or replace function public.get_digital_rapor_share(p_token uuid)
returns jsonb language sql security definer set search_path = public as $$
  select payload from public.digital_rapor_shares
  where token = p_token and expires_at > now() limit 1;
$$;
revoke all on function public.get_digital_rapor_share(uuid) from public;
grant execute on function public.get_digital_rapor_share(uuid) to anon, authenticated;
