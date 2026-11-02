-- GURU SMART AI - Cloudflare D1 schema
-- Apply: npx wrangler d1 execute guru-smart-db --remote --file=database/schema.sql

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT NOT NULL DEFAULT 'unknown',
  action TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor);

CREATE TABLE IF NOT EXISTS app_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Generic replica store: source rows are retained as JSON, keyed by table + primary key.
-- Missing source rows are NOT automatically deleted from D1, preserving recovery copies.
CREATE TABLE IF NOT EXISTS replica_rows (
  table_name TEXT NOT NULL,
  row_key TEXT NOT NULL,
  payload TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  source_updated_at TEXT,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  PRIMARY KEY (table_name, row_key)
);
CREATE INDEX IF NOT EXISTS idx_replica_rows_table ON replica_rows(table_name);
CREATE INDEX IF NOT EXISTS idx_replica_rows_last_seen ON replica_rows(last_seen_at);

CREATE TABLE IF NOT EXISTS sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL,
  tables_total INTEGER NOT NULL DEFAULT 0,
  rows_copied INTEGER NOT NULL DEFAULT 0,
  message TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_sync_runs_started ON sync_runs(started_at);
