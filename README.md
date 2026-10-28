# GURU SMART SERTIFIKAT v20 — Struktur Terpisah

## Isi folder
- `index.html` — struktur halaman aplikasi dan pemanggilan library eksternal.
- `style.css` — gabungan seluruh CSS inline dari file asli.
- `app.js` — gabungan seluruh JavaScript inline dari file asli, dalam urutan sumber.
- `README.md` — petunjuk penggunaan.

## Cara menjalankan
1. Simpan semua file dalam satu folder.
2. Buka `index.html` melalui browser.
3. Untuk fitur yang memerlukan koneksi internet, pastikan koneksi aktif.

## Catatan
File dipisahkan dari HTML sumber. Library eksternal yang sudah dipanggil oleh file asli tetap dipanggil dari `index.html`. Karena aplikasi menggunakan layanan eksternal, database, dan kemungkinan fitur browser tertentu, pengujian penuh perlu dilakukan pada lingkungan tempat aplikasi biasanya dijalankan.
