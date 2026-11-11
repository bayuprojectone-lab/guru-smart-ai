
-- =====================================================
-- GURU SMART AI PRO
-- DIGITAL RAPOR SHARES
-- CLOUDFLARE D1 / SQLITE COMPATIBLE
-- =====================================================

CREATE TABLE IF NOT EXISTS digital_rapor_shares (
    id TEXT PRIMARY KEY NOT NULL,
    share_token TEXT NOT NULL UNIQUE,
    student_id TEXT,
    student_name TEXT,
    school_id TEXT,
    teacher_id TEXT,
    rapor_data TEXT NOT NULL DEFAULT '{}',
    file_url TEXT,
    qr_code TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index untuk pencarian token
CREATE INDEX IF NOT EXISTS idx_digital_rapor_shares_token
ON digital_rapor_shares(share_token);

-- Index untuk pencarian siswa
CREATE INDEX IF NOT EXISTS idx_digital_rapor_shares_student
ON digital_rapor_shares(student_id);

-- Index untuk sekolah
CREATE INDEX IF NOT EXISTS idx_digital_rapor_shares_school
ON digital_rapor_shares(school_id);

-- Index untuk status aktif
CREATE INDEX IF NOT EXISTS idx_digital_rapor_shares_active
ON digital_rapor_shares(is_active);

-- Index waktu pembuatan
CREATE INDEX IF NOT EXISTS idx_digital_rapor_shares_created
ON digital_rapor_shares(created_at);

-- =====================================================
-- SELESAI
-- =====================================================
