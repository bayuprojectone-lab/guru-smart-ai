# GURU SMART SIBI — Paket GitHub Pages + Cloudflare Worker

Paket ini mempertahankan frontend utama Kode 1. `index.html`, `app.js`, dan `style.css` berada di root agar langsung cocok dengan GitHub Pages. Cloudflare Worker terpisah di `src/index.js` dan hanya menangani endpoint API.

## 1. Upload ke GitHub (frontend)

1. Ekstrak ZIP ini di komputer.
2. Buka repository GitHub yang dipakai untuk website GURU SMART SIBI.
3. Upload **isi folder hasil ekstrak** ke root repository, bukan folder pembungkusnya.
4. Pastikan tiga file berikut terlihat langsung di root: `index.html`, `app.js`, `style.css`.
5. Jika diminta, pilih **Commit changes**.
6. Di repository buka **Settings → Pages**. Pilih **Deploy from a branch**, branch `main` (atau branch utama yang digunakan), folder `/(root)`, lalu Save.

Jangan memindahkan frontend ke folder `public`. GitHub Pages menggunakan root repository pada konfigurasi ini.

## 2. Hubungkan repository ke Cloudflare Worker

1. Buka Cloudflare Dashboard → **Workers & Pages**.
2. Pilih Worker `guru-smart-ai` atau buat Worker baru dengan nama tersebut.
3. Pada pengaturan build/deployment repository, gunakan repository yang sama.
4. **Root directory:** `/` (root repository).
5. **Build command:** kosongkan / tidak perlu build.
6. **Deploy command:** `npx wrangler deploy`.
7. Simpan lalu deploy.

`wrangler.toml` sudah menunjuk ke `src/index.js`. Konfigurasi ini sengaja tidak memakai `assets.directory`, `public`, atau D1 sehingga tidak mengulang error folder `public` yang tidak ditemukan dan tidak membutuhkan database D1.

## 3. Pasang konfigurasi Supabase di Cloudflare

Di Cloudflare → Workers & Pages → `guru-smart-ai` → **Settings → Variables and Secrets**:

Tambahkan:

- `SUPABASE_URL` = URL Project Supabase, contoh format `https://PROJECT_REF.supabase.co`.
- `SUPABASE_ANON_KEY` = publishable/anon key dari Supabase Project Settings → API.

Simpan dan lakukan redeploy jika Cloudflare memintanya.

**Jangan pernah memasukkan `service_role` key ke frontend atau membagikannya.** Paket ini tidak membutuhkan `service_role` key dan tidak mengubah konfigurasi database Supabase.

## 4. Uji Worker

Buka alamat Worker berikut di browser:

- `https://guru-smart-ai.bayuprojectone.workers.dev/` — informasi layanan.
- `https://guru-smart-ai.bayuprojectone.workers.dev/api/health` — status Worker dan apakah variabel Supabase sudah dipasang.
- `https://guru-smart-ai.bayuprojectone.workers.dev/api/supabase-health` — pemeriksaan koneksi ke Supabase.

Hasil yang diharapkan pada endpoint terakhir: `"ok": true`, `"worker": "online"`, `"supabase": "connected"`.

## Catatan penting

- Tampilan dan fitur frontend Kode 1 tidak ditulis ulang. Kode aplikasi masih menggunakan Supabase JS secara langsung seperti sebelumnya; Worker menyediakan endpoint backend/health terpisah.
- Endpoint Worker dalam paket ini adalah endpoint pemeriksaan kesehatan read-only, bukan pengganti seluruh operasi CRUD Supabase aplikasi.
- Tidak ada schema D1 yang perlu dijalankan. Database yang dipakai aplikasi tetap Supabase.
- Jika terjadi error, buka Cloudflare → Worker → Logs/Observability dan periksa pesan runtime.
