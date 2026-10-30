# GURU SMART SERTIFIKAT — GitHub Pages

## Struktur
- `index.html` — halaman utama.
- `styles.css` — seluruh CSS dan font tertanam.
- `head.js` — skrip yang sebelumnya berada di bagian `<head>`.
- `app.js` — skrip utama aplikasi.

## Deploy ke GitHub Pages
1. Ekstrak ZIP ini.
2. Unggah seluruh isi folder (bukan folder luarnya) ke repository GitHub.
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/ (root)`, lalu **Save**.
6. Tunggu proses deploy selesai, lalu buka URL GitHub Pages.

## Catatan
- Jangan mengubah nama `index.html`, `styles.css`, `head.js`, atau `app.js`.
- Aplikasi masih memuat sejumlah library/CDN eksternal. Karena itu, beberapa fitur memerlukan koneksi internet.
- Konfigurasi Supabase dan layanan eksternal tetap mengikuti konfigurasi yang sudah ada pada kode sumber.
