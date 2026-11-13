-- Tambahkan kolom foto pada data guru (aman dijalankan berulang).
alter table public.teachers add column if not exists photo text;

-- GURU SMART SIBI: penyimpanan foto asli guru untuk profil publik QR.
-- Jalankan satu kali di Supabase SQL Editor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'teacher-photos',
  'teacher-photos',
  true,
  8388608,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do update
set public = true,
    file_size_limit = 8388608,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Teacher photos public read" on storage.objects;
create policy "Teacher photos public read"
on storage.objects for select
to public
using (bucket_id = 'teacher-photos');

drop policy if exists "Teacher photos owner insert" on storage.objects;
create policy "Teacher photos owner insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'teacher-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Teacher photos owner update" on storage.objects;
create policy "Teacher photos owner update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'teacher-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'teacher-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
