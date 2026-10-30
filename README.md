# GURU SMART — Sistem Manajemen Sekolah

Proyek ini telah dipisahkan dari satu file HTML menjadi file HTML, CSS, dan JavaScript agar lebih mudah dikelola dan di-hosting di GitHub Pages.

## Struktur folder

```text
GURU_SMART_GITHUB/
├── index.html       # Halaman utama
├── style.css        # Seluruh CSS aplikasi
├── app.js           # Seluruh JavaScript aplikasi (digabung satu file)
├── 404.html         # Halaman fallback GitHub Pages
├── README.md        # Petunjuk proyek
└── assets/          # Tempat gambar/file pendukung jika ditambahkan
```

## Menjalankan secara lokal

1. Ekstrak ZIP.
2. Buka folder proyek di VS Code.
3. Jalankan `index.html` menggunakan ekstensi Live Server (disarankan), atau unggah ke hosting statis.

## Hosting di GitHub Pages

1. Buat atau buka repository GitHub.
2. Unggah seluruh isi folder ini (bukan folder ZIP-nya) ke root repository.
3. Pastikan `index.html`, `style.css`, dan `app.js` berada sejajar di root repository.
4. Buka **Settings → Pages**.
5. Pada **Build and deployment**, pilih **Deploy from a branch**.
6. Pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
7. Tunggu proses deployment selesai, kemudian buka URL GitHub Pages repository.

## Catatan penting

- File CSS dan JavaScript asli dipisahkan tanpa sengaja menghapus fitur aplikasi.
- Library eksternal (Tailwind CDN, Chart.js, Supabase, Puter.js, QR, dan library lain yang memang dipakai sumber) tetap dimuat dari URL CDN yang ada di `index.html`/kode aplikasi; hosting memerlukan koneksi internet.
- Konfigurasi dan akses Supabase tetap mengikuti konfigurasi yang sudah ada pada file sumber. Untuk keamanan produksi, tinjau kebijakan RLS dan jangan pernah menaruh `service_role` key di sisi browser.
- GitHub Pages adalah hosting statis; proses backend/API harus tetap berjalan pada layanan backend masing-masing.
