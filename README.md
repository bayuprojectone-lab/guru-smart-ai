# GURU SMART - Sistem Manajemen Sekolah

Versi ini memisahkan aplikasi menjadi empat file agar mudah di-hosting melalui GitHub Pages.

## Struktur file

- `index.html` — kerangka halaman dan metadata.
- `style.css` — seluruh CSS dari file HTML asli.
- `app.js` — seluruh JavaScript dan pemanggilan library eksternal, dijalankan berurutan.
- `README.md` — panduan ini.

## Cara upload ke GitHub

1. Buat repository baru di GitHub.
2. Upload keempat file ini ke folder utama (root) repository.
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
6. Tunggu proses selesai. Website akan tersedia pada alamat GitHub Pages repository tersebut.

## Catatan penting

- Aplikasi masih menggunakan layanan/library eksternal melalui CDN dan koneksi internet diperlukan.
- Konfigurasi Supabase yang sudah ada di kode sumber tetap dipertahankan. Pastikan tabel dan kebijakan **Row Level Security (RLS)** Supabase sudah benar. Jangan pernah menaruh `service_role key` atau rahasia server di JavaScript publik.
- Jika aplikasi menggunakan fitur AI atau layanan pihak ketiga, periksa kembali batas akses, domain yang diizinkan, dan kebijakan API masing-masing layanan.
- Setelah upload, uji login, penyimpanan data, menu, cetak, ekspor, kamera/QR, dan fitur AI dari alamat GitHub Pages.
- Jika browser menampilkan versi lama, lakukan hard refresh (`Ctrl + Shift + R`).

## Menjalankan lokal

Buka `index.html` melalui server lokal (misalnya ekstensi Live Server di VS Code). Untuk hasil yang paling mendekati hosting, jangan hanya membuka file dengan skema `file://`.

## Perbaikan tombol Kembali HP pada PDF

`app.js` sudah ditambahkan penanda riwayat sebelum pratinjau/cetak PDF dibuka. Pada browser HP yang menampilkan PDF di tab yang sama, tombol Kembali diarahkan kembali ke panel aplikasi yang sedang aktif. Fitur dan kode panel lain tetap dipertahankan.
