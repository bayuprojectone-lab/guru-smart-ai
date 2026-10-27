# GURU SMART AI — perbaikan GitHub Pages

## Perbaikan utama
File HTML sebelumnya memanggil JavaScript menggunakan jalur `js/nama-file.js`, sedangkan repositori GitHub berisi file JavaScript di folder utama (root). Akibatnya skrip gagal dimuat (404) dan aplikasi tidak dapat diinisialisasi.

Paket ini menyesuaikan jalur skrip agar cocok dengan struktur repositori yang saat ini terlihat di GitHub: `index.html`, `style.css`, `app.js`, dan `inline-XX.js` berada di folder utama.

## Cara memasang
1. Unduh dan ekstrak ZIP.
2. Buka repositori https://github.com/bayuprojectone-lab/guru-smart-ai.
3. Unggah/ganti `index.html`, `style.css`, `app.js`, serta semua `inline-XX.js` dari ZIP ke root repositori. Jangan hapus folder `assets` atau file lain yang sudah ada jika masih digunakan.
4. Commit perubahan ke branch `main`.
5. Di Settings → Pages, pastikan sumber publikasi mengarah ke branch `main` dan folder `/(root)` (atau sesuaikan jika konfigurasi Anda berbeda).
6. Setelah deployment selesai, buka situs dengan hard refresh `Ctrl+F5`.

## Catatan
- File JavaScript dan CSS sekarang berada di root, sesuai link pada HTML hasil perbaikan.
- Aplikasi masih memakai CDN dan layanan eksternal (termasuk Supabase dan Puter); fitur terkait tetap membutuhkan koneksi internet serta konfigurasi layanan yang valid.
- ZIP ini memperbaiki ketidakcocokan jalur aset yang terlihat pada repositori; saya tidak dapat menguji login/fitur berbasis akun dari luar akun Anda.
