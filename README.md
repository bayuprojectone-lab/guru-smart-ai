# GURU SMART SERTIFIKAT

Proyek ini sudah dipisahkan dari satu file HTML menjadi:
- `index.html` — struktur halaman aplikasi.
- `style.css` — seluruh CSS dan font yang sebelumnya tertanam di HTML.
- `app.js` — seluruh JavaScript inline aplikasi dalam satu file.
- `assets/` — folder untuk aset tambahan bila nanti diperlukan.

## Menjalankan secara lokal
1. Ekstrak ZIP.
2. Buka folder proyek menggunakan VS Code.
3. Jalankan `index.html` dengan ekstensi Live Server, atau gunakan server lokal statis.
4. Koneksi internet diperlukan karena beberapa library masih dimuat dari CDN dan aplikasi memakai layanan Supabase/Puter sesuai konfigurasi aslinya.

## Hosting di GitHub Pages
1. Buat repository GitHub baru.
2. Upload **isi folder ini** (bukan folder ZIP-nya) ke root repository.
3. Pastikan `index.html`, `style.css`, dan `app.js` berada sejajar di root repository.
4. Buka **Settings → Pages**.
5. Pada **Build and deployment**, pilih **Deploy from a branch**.
6. Pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
7. Tunggu proses deploy selesai, kemudian buka URL GitHub Pages yang diberikan GitHub.

## Catatan penting
- Jangan mengubah nama `index.html`, `style.css`, atau `app.js` tanpa memperbarui referensinya.
- Aplikasi ini masih menggunakan layanan eksternal/CDN, termasuk Supabase dan Puter.js. Hosting di GitHub Pages hanya meng-host file frontend; GitHub Pages tidak menyediakan database/backend.
- Konfigurasi Supabase yang sudah ada pada kode sumber dipertahankan. Pastikan tabel, kebijakan RLS, dan izin akses Supabase sudah benar.
- Gunakan hanya Supabase **anon/publishable key** pada frontend. Jangan pernah memasukkan `service_role` key, password database, atau rahasia server ke file publik GitHub.
- Jika ada fitur yang gagal setelah deploy, periksa Console browser (F12 → Console) dan pengaturan URL/redirect serta kebijakan Supabase.
- File `app.js` telah diperiksa sintaks JavaScript-nya (`node --check`) dan tidak menunjukkan kesalahan sintaks.

## Struktur folder
```text
GURU_SMART_SERTIFIKAT_GITHUB/
├── index.html
├── style.css
├── app.js
├── README.md
└── assets/
```
