-- GURU SMART SIBI: penyimpanan fleksibel D1 untuk tabel aplikasi.
-- Setiap record dipisahkan menurut tabel logis dan ID pengguna terverifikasi.
CREATE TABLE IF NOT EXISTS app_records (
  table_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  record_id TEXT NOT NULL,
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (table_name, user_id, record_id)
);
CREATE INDEX IF NOT EXISTS idx_app_records_user_table ON app_records(user_id, table_name);
CREATE INDEX IF NOT EXISTS idx_app_records_table_user ON app_records(table_name, user_id);
