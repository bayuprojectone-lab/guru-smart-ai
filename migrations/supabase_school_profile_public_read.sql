-- GURU SMART SIBI: logo sekolah untuk halaman biodata digital publik (hasil scan QR).
-- Jalankan SEKALI di Supabase SQL Editor.
--
-- Halaman biodata digital dibuka tanpa login (oleh siapa pun yang memindai QR),
-- sedangkan tabel school_profile dilindungi RLS per pengguna — sehingga logo
-- tidak bisa diambil halaman publik saat kartu lama dipindai (QR belum membawa logo).
-- View ini dieksekusi dengan hak pemilik (bypass RLS) dan HANYA mengekspos kolom
-- yang aman: nama sekolah + logo. Data kepala sekolah, NIP, TTD, dan stempel
-- TIDAK ikut terbuka. Aman dijalankan berulang (idempotent).

-- 1) Pastikan kolom logo kartu tersedia (dipakai fitur Cetak Kartu Siswa).
alter table public.school_profile add column if not exists card_logo text;

-- 2) View publik berisi kolom aman saja.
create or replace view public.school_profile_public as
  select id, name, address, logo_left, logo_right, card_logo
  from public.school_profile;

-- 3) Izinkan pembacaan publik (anonim) terhadap view saja.
grant select on public.school_profile_public to anon, authenticated;
