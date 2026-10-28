# GURU SMART — berkas untuk GitHub

## Struktur berkas
- `index.html` — halaman utama aplikasi.
- `styles.css` — seluruh CSS yang dipisahkan dari HTML.
- `app.js` — gabungan 19 blok JavaScript inline dari versi hasil pemisahan, dengan urutan asal.

## Cara upload ke GitHub
1. Upload `index.html`, `styles.css`, dan `app.js` ke folder utama (root) repository.
2. Pastikan ketiga nama berkas sama persis dan berada pada folder yang sama.
3. Commit perubahan. Jika menggunakan GitHub Pages, arahkan Pages ke branch/folder tempat `index.html` berada.

## Catatan
- Pustaka eksternal seperti Supabase, Tailwind, QR, Chart.js, dan lainnya tetap dimuat dari CDN sesuai struktur HTML.
- JavaScript dimuat dengan `defer` setelah HTML selesai diparsing. Ini membantu elemen halaman tersedia saat kode berjalan, tetapi seluruh fitur belum diuji di browser setelah penggabungan. Uji login, data Supabase, cetak sertifikat, QR, dan fitur utama setelah upload.
