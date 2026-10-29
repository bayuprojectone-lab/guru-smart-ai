# GURU SMART — Struktur File

## Isi folder
- `index.html` — struktur halaman dan pemanggilan library eksternal.
- `style.css` — CSS yang diekstrak dari elemen `<style>` pada HTML asli.
- `app.js` — JavaScript inline yang digabungkan dari HTML asli.
- `README.md` — petunjuk penggunaan.

## Cara menjalankan
1. Simpan semua file dalam satu folder.
2. Buka `index.html` melalui browser atau deploy seluruh folder ke hosting statis.
3. Pastikan koneksi internet tersedia karena beberapa library dimuat dari CDN.

## Catatan penting
File sumber berisi banyak skrip yang awalnya dijalankan pada posisi berbeda di halaman. Pada pemisahan ini, skrip inline digabungkan ke `app.js` dan dijalankan di akhir halaman. Karena aplikasi berukuran besar dan memiliki urutan inisialisasi kompleks, uji semua fitur utama setelah pemisahan. Jika ada fitur yang bergantung pada waktu eksekusi skrip sebelumnya, perlu penyesuaian urutan.
