# GURU SMART SIBI — Gabungan ZIP 1 + tampilan Cloudflare Ready ZIP 2

## Komposisi
- `app.js` memakai ZIP 1 sebagai basis agar logika dan fitur aplikasi ZIP 1 tetap dipakai.
- `index.html` dan `style.css` memakai frontend ZIP 2 (Cloudflare Ready). Struktur HTML dan stylesheet kedua ZIP diperiksa; stylesheet sama dan struktur HTML praktis identik.
- `src/index.js` dan `wrangler.toml` dipertahankan dari ZIP 2 untuk deployment Cloudflare Worker.

## Upload frontend ke GitHub Pages
1. Ekstrak ZIP ini.
2. Upload isi folder hasil ekstrak ke root repository GitHub.
3. Pastikan `index.html`, `app.js`, dan `style.css` berada langsung di root.
4. Buka Settings → Pages, pilih Deploy from a branch, branch `main`, folder `/(root)`, lalu Save.

## Deploy Cloudflare Worker
1. Hubungkan repository ke Cloudflare Workers & Pages.
2. Root directory: `/`.
3. Build command: kosongkan.
4. Deploy command: `npx wrangler deploy`.
5. Worker menggunakan `src/index.js` sesuai `wrangler.toml`.

## Konfigurasi Supabase Worker
Di Cloudflare Worker → Settings → Variables and Secrets, atur:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Gunakan anon/publishable key, jangan pernah memasukkan `service_role` key ke frontend atau membagikannya.

## Catatan
Worker pada paket ini menyediakan endpoint status/health check. Operasi data aplikasi tetap menggunakan koneksi Supabase yang ada pada frontend.
Setelah deploy, uji login, penyimpanan, menu, cetak, ekspor, QR/kamera, dan fitur lain yang digunakan.
