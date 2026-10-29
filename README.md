# GURU SMART — Struktur File Terpisah

## Isi folder
- `index.html` — struktur halaman dan pemanggilan pustaka eksternal.
- `style.css` — seluruh CSS yang sebelumnya tertanam di HTML.
- `app.js` — kode JavaScript inline yang dipindahkan dari HTML.
- `README.md` — panduan ini.

## Menjalankan
1. Letakkan semua file di folder yang sama.
2. Buka `index.html` di browser untuk pengujian awal.
3. Untuk pengujian/deploy yang lebih konsisten, gunakan server statis seperti Netlify atau jalankan server lokal.
4. Saat deploy, unggah keempat file dalam folder yang sama (atau unggah ZIP setelah diekstrak).

## Catatan penting
- Aplikasi ini masih memuat beberapa pustaka dari CDN dan layanan online; koneksi internet diperlukan untuk fitur yang menggunakannya.
- Kode JavaScript diekstrak ke `app.js` dan CSS ke `style.css`; urutan blok JavaScript asli dipertahankan dalam file hasil ekstraksi.
- Karena skrip inline awalnya berjalan di beberapa titik halaman, pemindahan ke `app.js` dapat memengaruhi fitur yang bergantung pada waktu eksekusi tertentu. Uji fitur login, database, cetak/sertifikat, QR, dan AI setelah pemisahan.
- Konfigurasi backend/Supabase yang sudah ada di sumber tidak diubah. Jangan menganggap kunci publik/anon sebagai rahasia server; jangan pernah menaruh service-role key di frontend.
