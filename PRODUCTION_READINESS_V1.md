# GURU SMART AI — Production Hardening V1

Paket ini mempertahankan fitur aplikasi yang sudah ada dan menambahkan penguatan backend yang relatif aman tanpa mengubah skema data sekolah yang belum diaudit.

## Perubahan pada V1

1. CORS memakai daftar origin eksplisit dari `ALLOWED_ORIGINS`. Origin yang tidak terdaftar tidak mendapat izin browser (`Access-Control-Allow-Origin: null`). Permintaan non-browser tanpa header `Origin` tetap dapat digunakan.
2. Menambahkan header keamanan pada respons JSON: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, dan `Permissions-Policy`.
3. Membatasi payload JSON endpoint D1 hingga 2 MB dan jumlah record insert/upsert hingga 200 record per permintaan.
4. Menambahkan endpoint `GET /api/readiness` untuk memeriksa kelengkapan konfigurasi Worker tanpa mengungkap nilai secret.
5. Memperbarui versi backend menjadi `3.1.0-production-hardening`.

## WAJIB sebelum deploy

### 1. Sesuaikan CORS

Di Cloudflare Worker → Settings → Variables and Secrets, atur `ALLOWED_ORIGINS` menjadi origin frontend yang benar, misalnya:

`https://NAMA-USERNAME.github.io,https://domain-sekolah-anda.id`

Nilai harus berupa origin saja (skema + host), tanpa path seperti `/guru-smart-ai`. Jika frontend memakai domain berbeda, tambahkan domain itu. Jangan menambahkan wildcard `*`.

### 2. Pastikan secrets tersedia

- `SUPABASE_ANON_KEY`
- `SUPABASE_JWT_SECRET` (jika memakai fallback verifikasi JWT lokal)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `OAUTH_STATE_SECRET`
- `DRIVE_TOKEN_ENCRYPTION_KEY`

Jangan pernah menaruh secret di `wrangler.toml`, frontend, GitHub, atau membagikannya melalui chat.

### 3. Jalankan migrasi D1

Pastikan nama database dan ID pada `wrangler.toml` cocok dengan database milik akun Cloudflare Anda. Terapkan migrasi:

```bash
npx wrangler d1 migrations apply guru-smart-ai-data-base --remote
```

Lalu deploy:

```bash
npx wrangler deploy
```

### 4. Uji endpoint

- `/api/health` — memastikan Worker hidup.
- `/api/d1-health` — memastikan D1 terhubung dan tabel inti tersedia.
- `/api/readiness` — memastikan variabel dan secret yang dibutuhkan sudah dikonfigurasi.

`/api/readiness` hanya memeriksa keberadaan konfigurasi. Status hijau bukan bukti bahwa Supabase, Google OAuth, Google Drive, atau seluruh fitur sudah lulus uji integrasi.

## Batasan penting — belum boleh dianggap siap produksi penuh

Audit ini menemukan bahwa backend D1 `app_records` memisahkan record berdasarkan `user_id`, bukan `school_id`. Dengan demikian, arsitektur multi-sekolah (multi-tenant) belum dibuktikan dan belum boleh dipasarkan sebagai isolasi data antar sekolah.

Paket ini juga tidak menambahkan atau mengubah kebijakan RLS Supabase karena skema lengkap seluruh tabel, relasi, trigger, dan kebijakan yang sedang dipakai tidak tersedia untuk divalidasi. Menambahkan kebijakan generik tanpa audit dapat memblokir fitur lama atau justru membuka data.

Endpoint restore Google Drive saat ini mengumpulkan event backup dalam satu invokasi Worker dengan batas subrequest. Ini belum merupakan job queue lintas invokasi dan belum menyelesaikan restore backup besar. Jangan mengandalkan fitur restore ini sebagai satu-satunya strategi pemulihan.

## Gerbang wajib sebelum menerima data sekolah sungguhan

- Audit semua tabel Supabase: RLS aktif, kebijakan SELECT/INSERT/UPDATE/DELETE, Storage policies, dan akses berdasarkan sekolah.
- Buktikan tidak ada kebocoran data antar akun dan antar sekolah dengan dua sekolah uji.
- Implementasikan model `school_id` yang konsisten beserta migrasi data dan pengujian regresi sebelum mengaktifkan multi-tenant.
- Implementasikan restore bertahap melalui antrean lintas invokasi (misalnya Cloudflare Queues/Workflow atau mekanisme job persisten yang sesuai), dengan checkpoint, idempotensi, dan status pekerjaan.
- Uji backup dan restore pada salinan database uji; verifikasi jumlah record, file, relasi, dan checksum.
- Tambahkan rate limiting, alert, retensi log, pemantauan error, dan prosedur respons insiden.
- Uji beban, aksesibilitas, browser/HP, serta pemulihan bencana.
- Lengkapi kontak pengelola, prosedur permintaan/penghapusan data, persetujuan sekolah/orang tua bila diwajibkan, dan dokumen pemrosesan data.

**Kesimpulan:** V1 ini adalah paket hardening dan pemeriksaan konfigurasi, bukan sertifikasi keamanan atau jaminan production-ready. Lakukan pengujian di staging sebelum mengganti deployment aktif.
