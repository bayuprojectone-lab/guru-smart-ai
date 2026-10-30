# GURU SMART — GitHub Pages

Paket ini disusun agar `index.html` berada langsung di root repository GitHub.

## Struktur
- `index.html` — halaman utama
- `css/style.css` — seluruh CSS gabungan
- `js/script.js` — seluruh JavaScript gabungan

## Cara hosting di GitHub Pages
1. Buat repository baru di GitHub.
2. Ekstrak ZIP ini di komputer.
3. Upload **isi folder** (bukan folder pembungkusnya) ke root repository. Pastikan `index.html` terlihat sejajar dengan folder `css` dan `js`.
4. Buka **Settings → Pages**.
5. Pada **Build and deployment**, pilih **Deploy from a branch**.
6. Pilih branch `main` dan folder `/ (root)`, lalu klik **Save**.
7. Tunggu proses deployment selesai. Alamat situs akan muncul di halaman Settings → Pages.

Catatan: Aplikasi ini masih menggunakan sejumlah layanan/CDN eksternal dan backend yang sudah tercantum pada kode. Pastikan konfigurasi layanan tersebut aktif dan mengizinkan domain GitHub Pages Anda.
