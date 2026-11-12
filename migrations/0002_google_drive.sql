-- Token OAuth terenkripsi dan status folder Drive per akun Supabase.
CREATE TABLE IF NOT EXISTS drive_connections (
  user_id TEXT PRIMARY KEY,
  refresh_token_enc TEXT NOT NULL,
  root_folder_id TEXT,
  folders_json TEXT NOT NULL DEFAULT '{}',
  connected_email TEXT,
  connected_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS drive_oauth_states (
  nonce TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_drive_oauth_expiry ON drive_oauth_states(expires_at);
CREATE TABLE IF NOT EXISTS drive_backup_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  file_id TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  detail TEXT
);
CREATE INDEX IF NOT EXISTS idx_drive_backup_user ON drive_backup_log(user_id, created_at);
