# GURU SMART AI — Struktur Proyek

Proyek ini dipisahkan dari file HTML sumber menjadi file HTML, CSS, dan JavaScript.

## Struktur
- `index.html` — halaman utama aplikasi.
- `style.css` — kumpulan aturan CSS yang sebelumnya berada dalam tag `<style>`.
- `js/app.js` — blok JavaScript inline terbesar dari file sumber.
- `js/inline-XX.js` — blok JavaScript inline lainnya; dipanggil dari `index.html` sesuai urutan semula.
- `README.md` — panduan singkat ini.

## Menjalankan
1. Ekstrak ZIP ke satu folder.
2. Buka folder proyek menggunakan server lokal atau hosting web statis.
3. Jalankan `index.html`.

**Catatan:** Aplikasi menggunakan sejumlah pustaka CDN dan layanan eksternal (antara lain Tailwind CSS, Supabase, Puter AI, Chart.js, QRCode, dan XLSX). Koneksi internet tetap diperlukan. Konfigurasi layanan dan akses akun mengikuti yang ada di kode sumber.

## Penting
File dibuat dengan mempertahankan urutan blok skrip inline di lokasi masing-masing pada HTML agar ketergantungan dan proses inisialisasi sedekat mungkin dengan sumber asli. Uji kembali semua fitur setelah dipasang di hosting.
