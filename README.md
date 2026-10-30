# GURU SMART — file datar tanpa folder

File utama hanya: `index.html`, `style.css`, dan `app.js`. Semua script lokal telah digabung menjadi satu `app.js`, dan dua font TTF disematkan langsung ke `style.css` sehingga tidak perlu file font terpisah.

## GitHub Pages
1. Unggah ketiga file ini langsung ke root repositori GitHub.
2. Buka **Settings → Pages**.
3. Pilih **Deploy from a branch**, branch `main`, folder `/(root)`, lalu **Save**.

Catatan: aplikasi masih memuat sejumlah pustaka eksternal dari CDN dan menggunakan layanan Supabase/Puter. Gabungan script mengubah posisi eksekusi kode lokal menjadi satu pemuatan di akhir halaman; lakukan pengujian fitur setelah dipasang. Jangan menaruh kunci rahasia di JavaScript publik.
