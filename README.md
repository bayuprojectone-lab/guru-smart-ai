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

## Stempel Lebih Besar & Foto Hemat Penyimpanan (v27)
Perubahan pada **Cetak Sertifikat** dan **upload foto**:

- **Stempel di sertifikat diperbesar lagi** (v6 dulu 5500 → kini **7000**, +27%), tetap transparan dan tetap berpusat di area TTD kepala sekolah — tumbuh merata ke segala arah sehingga tidak menabrak QR (kiri), foto siswa (kanan), maupun teks tanggal (atas).
- **Foto siswa lebih irit**: saat disimpan di Data Siswa, foto otomatis dikecilkan ke **sisi maks 800px** (sebelumnya 1600px) dengan kualitas JPEG **0.85** — file hasil sekitar **4x lebih kecil**, kualitas justru sedikit dinaikkan agar tidak pecah (cetakan foto 3x4 pada sertifikat hanya butuh ±400px).
- **Foto profil/guru lebih irit**: upload foto profil (Pengaturan Akun) kini **dikompres dulu** (sisi maks 800px, JPEG 0.85) sebelum masuk Supabase Storage — sebelumnya file mentah dari HP (bisa 3–6 MB) langsung diunggah. Bila kompresi gagal, file asli tetap diunggah seperti sebelumnya.
- Foto guru di panel **Data Guru** memang sudah terkompres sejak awal (sisi maks 400px) — tidak diubah.
- Foto lama yang sudah tersimpan tidak berubah otomatis; foto baru yang diunggah mulai sekarang yang lebih hemat. Seluruh perubahan tetap bersifat minimal; kode dan fitur lain tidak disentuh.

## TTD Lebih Besar & Biodata Siswa Saat Scan (v28)
Perubahan pada **Cetak Sertifikat** dan **Scan QR**:

- **TTD di sertifikat diperbesar lagi** (v6 dulu 6200x4392 → kini **7400x5240**, +19%), tetap berpusat tepat di area tanda tangan — tumbuh merata sehingga tetap tidak menabrak QR (kiri), foto siswa (kanan), maupun teks tanggal (atas). Kombinasi kini: TTD 7400 + stempel 7000 + foto 3x4.
- **Scan kartu pelajar / sertifikat kini menampilkan BIODATA SISWA LENGKAP**: hasil scan di halaman **Absensi** maupun **Absensi Kegiatan** menampilkan kartu berisi **foto siswa**, nama, NIS, kelas, jenis kelamin, tempat/tanggal lahir, dan alamat — plus label sumber QR (via Kartu Pelajar / via Sertifikat) dan status absen.
- Kartu biodata tetap muncul walau siswa bukan anggota tabel kelas yang sedang dipilih (catatan merah tetap tampil di bawahnya).
- Waktu tampil hasil scan diperpanjang 1–2 detik → **6 detik** agar biodata sempat dibaca, lalu kamera otomatis lanjut memindai seperti sebelumnya.
- Data biodata diambil langsung dari tabel siswa (nama, NIS, kelas, JK, TTL, alamat, foto) — teks otomatis di-escape. QR tidak dikenal tetap ditolak seperti sebelumnya. Seluruh perubahan bersifat minimal; kode dan fitur lain tidak disentuh.

## Scan QR dari HP Membuka Profil Siswa Elegan (v29)
Perubahan pada **QR Kartu Pelajar & QR Sertifikat** plus satu **halaman profil baru** — kode dan fitur lain tidak disentuh:

- **QR kini berisi URL profil siswa.** Saat QR pada kartu pelajar maupun sertifikat dipindai memakai **kamera HP (di luar aplikasi)**, browser otomatis membuka halaman **PROFIL SISWA ELEGAN**: foto siswa dalam bingkai emas, nama besar huruf serif, chip NIS & kelas, serta biodata lengkap (NIS, kelas, jenis kelamin, tempat/tanggal lahir berformat Indonesia, alamat) + pita "KARTU PELAJAR DIGITAL" / jenis sertifikat, kegiatan/prestasi & nomor sertifikat untuk hasil scan sertifikat.
- **Tanpa login & super cepat**: halaman profil dirender oleh script awal di `app.js` (pola yang sama dengan mode Buzzer) dengan CSS lengkap miliknya sendiri — latar gradasi biru-ungu dengan cahaya lembut, kartu kaca (glassmorphism), animasi masuk halus, medali topi wisuda emas, sorot kilau pada foto, dan avatar inisial yang tetap anggun bila siswa belum berfoto.
- **Foto siswa ikut tampil**: URL foto publik dipadatkan menjadi path saja di dalam QR agar QR tetap ramping; halaman profil menyusun ulang URL lengkapnya secara otomatis.
- **Aplikasi tetap normal**: membuka alamat aplikasi tanpa `#profil=` tidak berubah sedikit pun; mode Buzzer (`#join-`) juga tetap berjalan.
- **Scanner di dalam aplikasi tetap bekerja**: hasil scan URL profil kini juga dikenali di panel Absensi & Absensi Kegiatan (NIS dibaca dari URL, label "via Kartu Pelajar"/"via Sertifikat" tetap muncul, absensi tercatat seperti biasa). **QR JSON lama pada kartu yang sudah dicetak tetap didukung penuh.**
- Resolusi gambar QR kartu dinaikkan 180 → 260 px (ukuran fisik QR di kartu TIDAK berubah — modul lebih tajam untuk cetak & scan). QR sertifikat tetap 360 px.
- **Catatan**: QR memuat biodata yang terbaca siapa pun yang memindai (sesuai fungsi kartu). Kartu/certifikat sebaiknya dicetak ulang dari alamat hosting (GitHub Pages) agar URL di dalam QR adalah alamat online; QR lama (JSON) tetap terbaca scanner aplikasi namun tidak membuka halaman profil web.
