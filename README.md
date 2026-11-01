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


## Perbaikan cetak PDF di HP
Versi terbaru memakai iframe di halaman aplikasi yang sama untuk pratinjau/cetak PDF, bukan membuka tab `about:blank`. Setelah dialog cetak/PDF ditutup, aplikasi kembali ke panel yang sedang aktif. Jika browser tidak otomatis menutup pratinjau, tersedia tombol **Kembali ke Aplikasi**.

## Foto Siswa Sejajar Barcode di Sertifikat
`app.js` kini otomatis menambahkan **foto siswa pada baris barcode (QR) sertifikat** (halaman Cetak Sertifikat) untuk semua motif — Asli (Klasik), Klasik Emas, Selendang, Bintang Emas, Batik Nusantara, Floral Elegan, Modern Geometris, Garis Formal, dan Merah Putih.

- Foto diambil dari kolom foto pada **Data Siswa** (`photo_url`). Siswa yang belum punya foto dicetak tanpa kotak foto — tampilan sertifikat tidak berubah.
- Foto diberi bingkai putih membulat + garis emas + garis aksen mengikuti warna sertifikat yang dipilih.
- **Sejajar dengan barcode**: pita vertikal foto sama persis dengan pita gambar QR, sehingga foto dan QR berada pada satu baris lurus di kiri–kanan sertifikat.
- **Sertifikat bawaan (Asli)**: foto ditempatkan menutup lencana "Nomor Sertifikat:" saja sehingga **tidak menumpang tindih garis frame** (garis emas diagonal & sudut merah) dan **nomor sertifikat di pita kuning tetap terbaca utuh**.
- Foto dimuat paralel dengan TTD/stempel/QR, dipadatkan (sisi maks 900 px) dan di-cache sehingga pratinjau maupun cetak PDF tetap cepat.
- Perubahan bersifat **minimal** (hanya penyesuaian posisi blok foto v23); seluruh kode dan fitur lain tidak diubah.

## Nomor di Bawah QR, Foto 3x4 & Nama di Bawah Foto (v25)
Perubahan pada halaman **Cetak Sertifikat**, berlaku untuk seluruh contoh sertifikat — Asli (Klasik), Klasik Emas, Selendang, Bintang Emas, Batik Nusantara, Floral Elegan, Modern Geometris, Garis Formal, dan Merah Putih:

- **Nomor sertifikat pindah ke paling bawah kiri, tepat di bawah QR code.** Pada sertifikat bawaan (Asli) nomor tampil berwarna putih di atas pita merah bawah; pada motif buatan tampil sebagai tinta gelap di bawah QR. Nomor kosong = tidak ditampilkan, sama seperti sebelumnya.
- Teks nomor pada posisi lama (pita kuning kanan-bawah) dihapus bersama pita kuning + lencana merah penampungnya supaya tidak tersisa hiasan kosong.
- **Foto siswa berukuran 3x4 (rasio 3:4)** di seluruh contoh sertifikat, tetap sejajar dengan pita QR, dan berada di kanan-bawah **di dalam garis frame** (tidak menumpang garis emas maupun sudut merah).
- **Nama siswa ditampilkan di bawah foto** (huruf besar). Nama yang sangat panjang otomatis dimampatkan agar tetap berada di dalam pita/bingkai.
- Siswa tanpa foto: nama tetap tidak muncul dan sertifikat tampil seperti sediakala. Seluruh perubahan tetap terbatas pada blok pembuat sertifikat (`buildStudentCertificate`); kode dan fitur lain tidak diubah.

## Urutan Menu Panel (v26)
Hanya **urutan item** pada array `menus` di `app.js` yang disusun ulang — teks, ikon, dan hak akses (roles) setiap menu tidak berubah, demikian pula seluruh kode lain. Urutan panel kini:

1. Dashboard · 2. Asisten AI Guru · 3. Buku Pelajaran (SIBI) · 4. Data Guru · 5. Data Siswa · 6. Kelas · 7. Cetak Sertifikat · 8. Cetak Rapor · 9. Penilaian · 10. Absensi · 11. Absensi Kegiatan · 12. Jadwal Piket · 13. Jadwal · 14. Mata Pelajaran · 15. Kuis Kelas · 16. Perangkat Ajar · 17. Materi Ajar · 18. Tugas · 19. Keuangan SPP · 20. Backup, Riwayat & Keamanan · 21. Pengaturan.

Urutan ini berlaku untuk semua peran (admin, guru, siswa) karena sidebar memakai satu array yang sama; menu yang disembunyikan per peran tetap disembunyikan seperti sebelumnya.
