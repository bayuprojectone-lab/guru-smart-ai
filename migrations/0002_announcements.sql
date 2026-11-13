-- GURU SMART AI - Migrasi D1: Pemberitahuan & Pengumuman
-- Database: guru-smart-ai-data-base
-- Jalankan sebagai migrasi Cloudflare D1 setelah 0001_init.sql dan 0002_google_drive.sql.
-- JANGAN jalankan file migrasi Supabase (supabase_*.sql) pada D1.

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_announcements_created_at
  ON announcements (created_at DESC);
