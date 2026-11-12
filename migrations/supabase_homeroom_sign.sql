
-- =====================================================
-- GURU SMART AI PRO
-- TTD WALI KELAS (homeroom_sign)
-- SUPABASE / POSTGRES
-- =====================================================
-- Jalankan SEKALI di Supabase SQL Editor (aman dijalankan ulang / idempotent).
--
-- Menambah kolom penyimpanan TTD (tanda tangan) WALI KELAS pada tabel
-- school_profile. Upload dilakukan lewat dialog Cetak Kartu Siswa
-- (tombol "+ TTD Wali") dan hasilnya tampil pada:
--   - Panel Rapor Digital Siswa (blok tanda tangan Wali Kelas)
--   - Cetak/PDF Rapor Digital
--   - Halaman rapor digital (tautan share WhatsApp, rapor.html)
-- Kolom ini TIDAK ikut ke view publik (privasi sama seperti TTD kepala
-- sekolah dan stempel).

ALTER TABLE public.school_profile
  ADD COLUMN IF NOT EXISTS homeroom_sign TEXT;

-- =====================================================
-- SELESAI
-- =====================================================
