-- =====================================================
-- GURU SMART AI PRO
-- TTD WALI KELAS (homeroom_sign)
-- SUPABASE / POSTGRES
-- =====================================================
-- Cara pakai:
--   1. Buka https://supabase.com -> project Anda -> ikon SQL Editor.
--   2. Tempel SELURUH isi file ini -> klik RUN.
--   3. Aman dijalankan ulang (idempotent), tidak akan menduplikasi kolom.
--
-- Fungsi: menambah kolom penyimpanan TTD (tanda tangan) WALI KELAS pada
-- tabel school_profile. Upload dilakukan lewat dialog Cetak Kartu Siswa
-- (tombol "+ TTD Wali"), lalu tampil pada:
--   - Panel Rapor Digital Siswa (blok tanda tangan Wali Kelas)
--   - Cetak/PDF Rapor Digital
--   - Halaman rapor digital (tautan share WhatsApp, rapor.html)
-- Kolom ini TIDAK ikut ke view publik (privasi sama seperti TTD kepala
-- sekolah dan stempel).

-- 1) Tambahkan kolom TTD wali kelas
ALTER TABLE public.school_profile
  ADD COLUMN IF NOT EXISTS homeroom_sign TEXT;

-- 2) Keterangan kolom (hanya dokumentasi, aman dijalankan berulang)
COMMENT ON COLUMN public.school_profile.homeroom_sign IS
  'Tanda tangan Wali Kelas (URL gambar) untuk blok tanda tangan Rapor Digital';

-- 3) Verifikasi: harus mengembalikan 1 baris (homeroom_sign | text)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'school_profile'
  AND column_name  = 'homeroom_sign';

-- =====================================================
-- SELESAI. Langkah setelah SQL dijalankan:
--   - Buka Cetak Kartu Siswa -> tombol "+ TTD Wali" -> unggah gambar TTD.
--   - Jika sebelumnya TTD wali sudah pernah diunggah (masih tersimpan di
--     perangkat), unggah ULANG SEKALI agar tersimpan permanen di database
--     dan tampil di semua perangkat/akun yang sama.
--   - (Opsional) Bila upload masih gagal setelah kolom dibuat, cek kebijakan
--     keamanan tabel di SQL Editor:
--       SELECT policyname, cmd FROM pg_policies
--       WHERE schemaname='public' AND tablename='school_profile';
-- =====================================================
