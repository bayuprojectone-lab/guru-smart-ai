# GURU SMART - Sistem Manajemen Sekolah

Versi ini berisi frontend statis yang siap ditempatkan pada root GitHub Pages. Semua fitur asli pada `app.js` dipertahankan; peningkatan login hanya menyentuh UI dan tidak mengganti handler autentikasi.

## Struktur file

- `index.html` — kerangka halaman dan metadata.
- `style.css` — seluruh CSS dari file HTML asli.
- `app.js` — seluruh JavaScript dan pemanggilan library eksternal, dijalankan berurutan.
- `login-enhance.js` — badge portal dan tombol tampil/sembunyikan password (enhancement UI saja).
- `assets/guru-smart-logo.svg` — logo lokal agar tidak bergantung pada URL gambar eksternal yang dapat kedaluwarsa.
- `.nojekyll` — menonaktifkan pemrosesan Jekyll untuk deployment statis.
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

## Cetak Absensi Bisa Pilih Bulan (v30)
Perubahan pada tombol **Cetak** di panel **Absensi** — kode dan fitur lain tidak disentuh:

- **Tombol Cetak kini membuka dialog "Pilih Bulan"**: guru memilih **Bulan** (Januari–Desember) dan **Tahun** sesuai data absensi yang akan dicetak, lalu menekan **Cetak Sekarang**. Bulan bawaan = bulan yang sedang tampil di tabel; daftar tahun diambil otomatis dari tahun-tahun yang ada di data absensi.
- **Data diambil langsung dari penyimpanan untuk bulan terpilih** (bukan dari sel tabel di layar) — jadi guru bisa mencetak bulan lama/mana pun **tanpa harus mengubah tanggal di tabel**, dan tabel absensi di layar **tidak berubah sama sekali**.
- Hasil cetak tetap format yang sama: kop sekolah, judul **DAFTAR HADIR SISWA**, baris "Kelas: X | Bulan: <nama bulan Indonesia>", tabel tanggal 1–akhir bulan (jumlah hari otomatis sesuai bulan terpilih), rekap **H/S/I/A**, tanda tangan Kepala Sekolah + Wali Kelas.
- Pencetakan untuk **Semua kelas** maupun kelas tertentu tetap berfungsi; dua catatan absen pada tanggal sama diambil yang paling baru (sama seperti perilaku tabel).
- Fungsi cetak lama tetap utuh di kode; `style.css` dan `index.html` tidak berubah.

## Export Excel Juga Pilih Bulan (v31)
Perubahan pada tombol **Export Excel** di panel **Absensi** — melengkapi v30, kode lain tidak disentuh:

- **Tombol Export Excel kini membuka dialog pilih bulan yang sama** dengan Cetak. Judul dialog menjadi **"Cetak & Export Absensi - Pilih Bulan"** dan kini berisi 3 tombol: **Batal**, **Cetak Sekarang**, dan **Unduh Excel**.
- **Data diambil langsung dari penyimpanan untuk bulan/tahun terpilih** (bukan dari sel tabel di layar) — guru bisa mengunduh rekap bulan lama tanpa mengubah tanggal di tabel; tabel absensi di layar tetap tidak berubah.
- File Excel memakai struktur yang sama persis dengan export lama: baris kop sekolah, judul **DAFTAR HADIR SISWA**, baris "Kelas: X | Bulan: <nama bulan Indonesia>", kolom tanggal 1–akhir bulan (otomatis sesuai bulan terpilih), dan kolom **Total H/S/I/A**; nama file mengikuti bulan terpilih (`Absensi_2025-09.xlsx`).
- **Mode Semua kelas** maupun kelas tertentu tetap berfungsi; kalau kelas belum punya siswa muncul peringatan dan dialog tetap terbuka; jika modul Excel belum termuat (offline), muncul pesan seperti sebelumnya.
- Fungsi export lama (`exportAttendanceExcel`) tetap utuh di kode; `style.css` dan `index.html` tidak berubah.

## Backend API Cloudflare Worker (hosting statis tetap dipertahankan)

Frontend tetap di GitHub Pages atau hosting statis yang sekarang. Worker berjalan terpisah sebagai API; jangan pindahkan `index.html`, `style.css`, atau `app.js` ke Worker.

### File tambahan
- `worker.js` — endpoint `GET /api/health` dan `POST /api/ai/chat`.
- `wrangler.toml` — konfigurasi deploy Worker.
- `api-client.js` — helper frontend opsional (`window.GuruSmartAPI`). Tidak mengubah jalur AI lama secara otomatis.

### Deploy Worker
1. Pasang Node.js, lalu buka terminal di folder proyek.
2. Login Cloudflare: `npx wrangler login`.
3. Atur `ALLOWED_ORIGINS` di `wrangler.toml` menjadi origin GitHub Pages/domain frontend Anda, misalnya `https://username.github.io` (tanpa path repo). Untuk uji coba boleh `*`, tetapi produksi sebaiknya batasi origin.
4. Tambahkan kunci AI sebagai secret, bukan di JavaScript: `npx wrangler secret put OPENAI_API_KEY`.
5. Deploy: `npx wrangler deploy`.
6. Uji `https://NAMA-WORKER.NAMA-AKUN.workers.dev/api/health` dan pastikan menghasilkan JSON dengan `ok: true`.
7. Di `index.html`, ganti nilai kosong pada `window.GURU_SMART_API_BASE` dengan URL Worker, lalu upload kembali `index.html` dan `api-client.js` ke hosting statis yang sama.

### Menggunakan API dari frontend
```js
// Cek backend
const status = await window.GuruSmartAPI.health();

// Contoh chat melalui backend (butuh OPENAI_API_KEY di Worker)
const jawaban = await window.GuruSmartAPI.chat([
  { role: 'system', content: 'Anda adalah asisten guru yang membantu pembelajaran.' },
  { role: 'user', content: 'Buat contoh tujuan pembelajaran tentang pecahan.' }
]);
```

**Catatan integrasi:** helper API disediakan dan dimuat, tetapi fitur Asisten AI yang sekarang menggunakan Puter AI tidak dialihkan otomatis. Pengalihan perlu dilakukan pada fungsi AI yang dipilih setelah endpoint dan kebijakan akses diuji, agar fitur yang ada tidak rusak. API Worker ini tidak memerlukan token rahasia di frontend. `API_TOKEN` tidak diaktifkan secara default karena token bersama yang ditanam di aplikasi publik bukan perlindungan yang aman; untuk penggunaan produksi dengan data sekolah, tambahkan autentikasi pengguna dan pembatasan penggunaan/rate limit.

### Catatan keamanan
- Jangan pernah menaruh `OPENAI_API_KEY`, Supabase `service_role` key, atau rahasia server dalam `app.js`, `index.html`, `api-client.js`, maupun repository publik.
- CORS membatasi browser berdasarkan origin, tetapi bukan autentikasi. Tambahkan autentikasi dan rate limiting sebelum membuka endpoint berbiaya kepada publik.
- Worker ini hanya menangani API AI chat contoh. Supabase dan aset statis tetap memakai konfigurasi sebelumnya.


## Perbaikan paket (GitHub Pages + login premium)

- Menghapus deklarasi `DOCTYPE` ganda dan memperbaiki elemen `link` preload yang sebelumnya memiliki penutup HTML tidak valid.
- Semua referensi frontend memakai path relatif (`./...`) agar bekerja pada URL project Pages seperti `https://akun.github.io/nama-repo/`.
- Logo utama kini tersedia lokal di `assets/guru-smart-logo.svg`, tidak bergantung pada URL gambar eksternal bertoken.
- UI login premium neumorphism: panel soft-shadow, input inset, tombol premium, badge cloud, dan kontrol tampil/sembunyikan password. ID form (`loginForm`, `registerForm`, dan input terkait) tetap sama agar fungsi login/daftar lama tidak terputus.
- 20 blok JavaScript inline telah diperiksa dengan `node --check`; struktur HTML dan file aset disertakan dalam ZIP.

### Deploy yang benar

1. **Extract ZIP**, lalu upload seluruh isi folder (termasuk `.nojekyll` dan folder `assets`) ke **root** repository GitHub. Jangan upload ZIP sebagai satu file.
2. Pastikan `index.html` berada di root, bukan di dalam folder bertingkat.
3. GitHub → **Settings → Pages** → Deploy from a branch → `main` → `/ (root)` → Save.
4. Tunggu Actions/Pages berstatus sukses, lalu buka URL Pages. Lakukan hard refresh `Ctrl+Shift+R` atau tes di jendela Incognito.
5. Tes login, registrasi, navigasi menu, penyimpanan Supabase, cetak/ekspor, kamera/QR, dan fitur AI.

### Jika halaman tetap putih / gagal login

- Buka DevTools → Console dan Network. Error `404` untuk `app.js`, `style.css`, atau `assets/guru-smart-logo.svg` biasanya berarti file tidak berada di root atau path salah.
- Error CDN berarti koneksi jaringan/extension memblokir library eksternal; aplikasi ini tetap membutuhkan internet untuk Tailwind, Supabase, Chart.js, QR, dan library lainnya.
- Login memerlukan project Supabase dan tabel/policy RLS yang sesuai. GitHub Pages hanya meng-host frontend, bukan database/Worker.
- Cloudflare Worker (file `worker.js`) **terpisah** dari GitHub Pages. Deploy Worker sendiri menggunakan Wrangler; set `ALLOWED_ORIGINS` ke origin Pages yang tepat (mis. `https://akun.github.io`) sebelum digunakan. Jangan taruh `OPENAI_API_KEY` atau secret Worker dalam `app.js`.
- Worker AI tidak otomatis menggantikan jalur AI bawaan frontend; konfigurasi `window.GURU_SMART_API_BASE` hanya jika memang ingin menghubungkan endpoint Worker.
