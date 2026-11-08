-- GURU SMART SIBI: logo sekolah untuk halaman biodata digital publik (hasil scan QR).
-- Jalankan SEKALI di Supabase SQL Editor (aman dijalankan ulang / idempotent).
--
-- v31: Tabel school_profile dipakai BANYAK akun guru (tiap akun punya baris
-- sendiri). Selama ini halaman biodata hasil scan mengambil "limit=1" TANPA
-- filter sehingga mendapat baris akun lain -> logo di Data Digital Guru/Siswa
-- tidak pernah ikut berubah meski logo sekolah sudah diganti.
-- Solusi: view publik kini juga mengekspos kolom user_id, dan QR digital baru
-- membawa parameter sp=(user_id) sehingga halaman biodata mengambil baris
-- profil sekolah yang TEPAT milik akun pembuat QR. QR lama tetap berfungsi
-- (difilter otomatis berdasarkan nama sekolah yang dibawa QR).
--
-- Halaman biodata digital dibuka tanpa login (oleh siapa pun yang memindai QR),
-- sedangkan tabel school_profile dilindungi RLS per pengguna. View ini dieksekusi
-- dengan hak pemilik (bypass RLS) dan HANYA mengekspos kolom yang aman:
-- nama sekolah, alamat, logo, dan user_id (id teknis akun, bukan data pribadi).
-- Data kepala sekolah, NIP, TTD, dan stempel TIDAK ikut terbuka.

-- 1) Pastikan kolom logo kartu tersedia (dipakai fitur Cetak Kartu Siswa).
alter table public.school_profile add column if not exists card_logo text;

-- 2) View publik berisi kolom aman saja + user_id (untuk pemilihan baris yang tepat).
create or replace view public.school_profile_public as
  select id, name, address, logo_left, logo_right, card_logo, user_id
  from public.school_profile;

-- 3) Izinkan pembacaan publik (anonim) terhadap view saja.
grant select on public.school_profile_public to anon, authenticated;
