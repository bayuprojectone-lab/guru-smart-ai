# GURU SMART - Sistem Manajemen Sekolah

Proyek ini sudah dipisahkan dari satu file HTML menjadi:
- `index.html` — struktur halaman dan pemanggilan pustaka eksternal.
- `style.css` — seluruh CSS, termasuk font Algerian yang sebelumnya tertanam.
- `app.js` — seluruh JavaScript inline dengan urutan aslinya.
- `README.md` — panduan hosting.

## Hosting di GitHub Pages
1. Ekstrak ZIP ini.
2. Unggah **isi folder** proyek ke root repository GitHub (sejajar, bukan folder bersarang).
3. Pastikan `index.html`, `style.css`, dan `app.js` berada di root repository.
4. Buka **Settings → Pages**.
5. Pada **Build and deployment**, pilih **Deploy from a branch**.
6. Pilih branch `main` dan folder `/ (root)`, lalu **Save**.
7. Tunggu proses deployment selesai dan buka URL GitHub Pages.

## Catatan penting
- Kode mempertahankan pustaka CDN dan konfigurasi layanan yang sudah ada di file sumber.
- Aplikasi tetap membutuhkan koneksi internet untuk pustaka CDN, Supabase, dan layanan eksternal.
- Jika memakai Supabase, pastikan tabel, autentikasi, dan kebijakan Row Level Security (RLS) sudah dikonfigurasi dengan benar. Jangan menaruh `service_role` key di kode browser.
- File JavaScript cukup besar karena beberapa aset/data tertanam di dalam kode sumber.
- Setelah upload, jika halaman kosong, buka Developer Tools → Console dan periksa error pertama. Jangan menghapus script CDN atau konfigurasi sebelum mengetahui errornya.

## Struktur
```text
GURU_SMART_SERTIFIKAT_GITHUB/
├── index.html
├── style.css
├── app.js
└── README.md
```
