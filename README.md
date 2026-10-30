# GURU SMART — GitHub Pages

Paket ini disusun agar dapat langsung di-hosting melalui GitHub Pages.

## Struktur repository (semua file di root)

- `index.html` — halaman utama yang otomatis dibuka GitHub Pages
- `style.css` — seluruh CSS aplikasi
- `script.js` — seluruh JavaScript aplikasi
- `.nojekyll` — menonaktifkan pemrosesan Jekyll untuk file statis

## Cara upload dan mengaktifkan GitHub Pages

1. Download ZIP dan ekstrak di komputer.
2. Buka repository GitHub yang akan digunakan.
3. Upload **isi folder hasil ekstrak** langsung ke halaman utama repository. Jangan upload folder pembungkusnya.
4. Pastikan `index.html`, `style.css`, `script.js`, dan `.nojekyll` terlihat langsung di root repository.
5. Buka **Settings → Pages**.
6. Pada **Build and deployment**, pilih **Deploy from a branch**.
7. Pilih branch `main` dan folder `/(root)`, lalu klik **Save**.
8. Tunggu proses deployment selesai, lalu buka alamat GitHub Pages yang ditampilkan di halaman Pages.

## Catatan

Aplikasi menggunakan layanan eksternal/CDN dan backend Supabase. Agar login dan fitur cloud berjalan, pastikan konfigurasi backend, kebijakan akses, serta URL/domain GitHub Pages sudah diizinkan pada layanan terkait. GitHub Pages hanya meng-host file frontend statis; GitHub Pages tidak menjalankan backend server.
