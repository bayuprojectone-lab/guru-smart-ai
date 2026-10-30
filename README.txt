# GURU SMART SERTIFIKAT — GitHub Hosting

File utama:
- `index.html` — halaman utama dan pemanggilan library eksternal.
- `style.css` — seluruh CSS dari file HTML asli.
- `app.js` — JavaScript aplikasi.

Cara hosting:
1. Buat repository GitHub baru.
2. Upload ketiga file ini ke root repository (jangan dimasukkan ke subfolder).
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main`, folder `/ (root)`, lalu **Save**.
6. Tunggu proses selesai, kemudian buka alamat GitHub Pages yang diberikan.

Catatan:
- Dua script boot awal dipertahankan di `index.html` agar proses awal aplikasi tetap berjalan seperti semula.
- Kode JavaScript utama dipindahkan ke `app.js`; CSS dipindahkan ke `style.css`.
- URL Supabase dan anon key yang memang sudah ada di file sumber tetap ikut terbawa. Pastikan kebijakan RLS Supabase benar dan jangan pernah memasukkan service_role key ke frontend.
- File ini tetap memerlukan koneksi internet untuk memuat library CDN dan layanan Supabase/Puter.
