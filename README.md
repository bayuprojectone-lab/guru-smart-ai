# GURU SMART SIBI — perbaikan struktur GitHub Pages

## Frontend utama
File `index.html`, `app.js`, dan `style.css` di folder root berasal dari Kode 1 (`GURU_SMART_SIBI_PREMIUM_NEUMORPHISM.zip`). Tampilan dan logika aplikasi tidak ditulis ulang. Perbaikan struktur: satu deklarasi DOCTYPE dan file frontend diletakkan di root agar cocok dengan GitHub Pages yang menerbitkan folder root.

## Isi paket
- `index.html`, `app.js`, `style.css`: frontend Kode 1.
- `src/index.js`, `wrangler.toml`, `database/schema.sql`: backend Cloudflare Worker dan skema D1 dari paket integrasi sebelumnya.

## Upload ke GitHub Pages
1. Ekstrak ZIP ini di komputer.
2. Upload isi folder ZIP (bukan folder pembungkus) ke root repository GitHub.
3. Pastikan `index.html`, `app.js`, dan `style.css` terlihat langsung di root repository.
4. Buka Settings → Pages. Pilih Deploy from a branch, branch yang dipakai (mis. `main`), folder `/ (root)`, lalu Save.
5. Tunggu deployment selesai dan lakukan hard refresh pada website.

## Catatan warna merah di editor
`app.js` merupakan loader yang menyimpan potongan kode asli dalam string JavaScript. Editor dapat memberi warna merah/warna string pada blok yang sangat panjang walaupun sintaks JavaScript valid. File `app.js` pada paket ini lolos pemeriksaan sintaks Node.js. Warna merah saja bukan bukti error runtime. Jika ada garis merah bergelombang atau pesan error, lihat tab Problems atau konsol browser untuk pesan spesifik.

## Cloudflare Worker
Deploy Worker secara terpisah melalui dashboard Cloudflare sesuai `README_WORKER.md`/panduan Worker yang ada di paket sebelumnya. Jangan unggah `src/index.js` sebagai file frontend GitHub Pages. Variabel rahasia Supabase harus disetel sebagai Worker secrets, bukan ditulis ke file publik.
