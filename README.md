# GURU SMART SIBI — Supabase utama + Cloudflare D1 failover

Paket ini mempertahankan antarmuka dan fitur aplikasi sebisa mungkin. Perilaku database yang disiapkan adalah **Supabase tetap menjadi database utama**. Cloudflare D1 hanya menerima **penulisan data baru (insert/upsert)** ketika Supabase secara eksplisit mengembalikan error yang menunjukkan kapasitas/database penuh. Data lama di Supabase tidak disalin atau dipindahkan otomatis.

## Perilaku failover
- Login, autentikasi, dan buzzer realtime tetap memakai Supabase.
- Semua operasi database dicoba ke Supabase terlebih dahulu.
- Hanya `insert` dan `upsert` untuk tabel aplikasi yang dialihkan ke D1 jika error menunjukkan disk/database penuh atau kapasitas/kuota penyimpanan habis.
- Error biasa seperti izin ditolak, validasi data, koneksi putus, atau tabel tidak ditemukan **tidak** memicu failover otomatis.
- Data yang berhasil masuk ke D1 ditambahkan ke hasil pembacaan daftar yang didukung ketika D1 tersedia. Data tersebut tetap berada di D1; paket ini tidak menyalinnya kembali ke Supabase.
- Tabel `users`, `avatars`, dan `kuis_buzzer` tidak dialihkan ke D1.

> Catatan: sistem tidak bisa mengetahui “penuh” berdasarkan perkiraan kapasitas saja. Failover berjalan saat respons Supabase berisi kode/pesan error kapasitas yang dikenali. Jika penyedia mengirim pesan berbeda, pesan itu perlu ditambahkan ke deteksi error.

## 1. Buat database D1
1. Buka Cloudflare Dashboard → **Storage & databases** → **D1 SQL Database**.
2. Buat database bernama `guru-smart-sibi`.
3. Salin **Database ID** dan ganti `GANTI_DENGAN_DATABASE_ID_D1` di `wrangler.toml`.

## 2. Buat tabel
Dari folder proyek, jalankan:

```bash
npx wrangler d1 migrations apply guru-smart-sibi --remote
```

Atau buka D1 Console dan jalankan `migrations/0001_init.sql`.

## 3. Konfigurasikan Worker
Di Cloudflare Dashboard → Workers & Pages → Worker `guru-smart-ai` → Settings → Variables and Secrets, atur:
- `SUPABASE_URL` = URL project Supabase yang dipakai aplikasi.
- `SUPABASE_ANON_KEY` = anon/publishable key Supabase, **bukan** `service_role`.

Lalu deploy:

```bash
npx wrangler deploy
```

Tes endpoint berikut pada domain Worker Anda:
- `/api/health`
- `/api/d1-health` — harus menunjukkan `"d1":"connected"`.

## 4. Hubungkan frontend
Buka `app.js`, cari `GURU_SMART_D1_API_URL`, lalu ganti placeholder `https://guru-smart-ai.YOUR-SUBDOMAIN.workers.dev` dengan URL Worker Anda yang sebenarnya. Unggah ulang `app.js` bersama `index.html` dan `style.css` ke hosting frontend.

Jika placeholder belum diganti, aplikasi tetap memakai Supabase dan tidak bisa mengalihkan data ke D1.

## 5. Uji failover dengan aman
1. Buat backup data sebelum uji.
2. Pastikan D1 terhubung (`/api/d1-health`).
3. Uji Worker dan frontend dengan data percobaan di lingkungan uji. Jangan sengaja memenuhi database produksi hanya untuk memicu failover.
4. Periksa log Worker dan D1 Console untuk memastikan record uji tersimpan di `app_records`.
5. Pastikan record D1 muncul saat membaca daftar yang didukung.

## Keamanan dan batasan
- Worker memverifikasi access token Supabase sebelum mengizinkan akses D1. Token tidak disimpan di D1.
- Record D1 dipisahkan berdasarkan ID pengguna dari token terverifikasi.
- D1 menjadi tempat penyimpanan tambahan untuk data baru yang gagal ditulis karena kapasitas Supabase; ini bukan replikasi dua arah.
- Bila D1 belum dikonfigurasi, penulisan yang gagal karena Supabase penuh tetap gagal dan aplikasi menampilkan error. Tidak ada penyimpanan failover sampai Worker, database, migrasi, dan URL frontend dikonfigurasi.
- Buzzer realtime tetap menggunakan Supabase.

## Panel tambahan: Rapor Digital Siswa

Paket ini menambahkan menu **Rapor Digital Siswa** sebagai panel terpisah. Menu Cetak Rapor dan kode fitur lama tidak diganti. Panel mengambil data dari tabel yang sudah dipakai aplikasi (`students`, `classes`, `grades`, `subjects`, `attendance`, dan `school_profile`), sehingga tidak memerlukan migrasi tabel baru.

Fitur panel:
- Filter kelas dan pemilihan siswa.
- Informasi identitas siswa, kelas, tahun pelajaran, dan semester.
- Rekap nilai per mata pelajaran, rata-rata, predikat, dan status KKM.
- Rekap kehadiran hadir, sakit, izin, dan alpa dari catatan absensi.
- Catatan perkembangan otomatis berdasarkan nilai yang tersedia.
- Cetak / simpan sebagai PDF melalui dialog cetak browser.
- Ekspor rekap nilai siswa ke CSV yang dapat dibuka di Excel.

Catatan: data rapor dihitung dari catatan nilai dan absensi yang sudah tersimpan. Pilihan tahun pelajaran/semester ditampilkan sebagai identitas periode rapor; pemisahan nilai per periode memerlukan kolom periode yang konsisten pada tabel nilai. Panel ini tidak mengubah atau menulis ulang data nilai, absensi, maupun data siswa.


Pembaruan tambahan: tampilan panel Rapor Digital bergaya teknologi futuristik dan tombol Share WhatsApp. Berbagi WhatsApp membuka chat dengan ringkasan rapor; file PDF harus dilampirkan manual setelah diunduh dari tombol Cetak/PDF.


## Rapor Digital melalui tautan WhatsApp
1. Di Supabase Dashboard, buka **SQL Editor**.
2. Jalankan seluruh isi file `migrations/supabase_digital_rapor_shares.sql` satu kali. File ini membuat penyimpanan tautan rapor dan fungsi baca publik berbasis token acak.
3. Unggah `app.js`, `rapor.html`, `index.html`, dan `style.css` ke hosting pada direktori yang sama.
4. Di halaman Rapor Digital, pilih siswa lalu klik **Share WhatsApp**. WhatsApp akan berisi tautan halaman rapor digital.
5. Siswa/orang tua membuka tautan untuk melihat biodata dan nilai, lalu menekan **Simpan Rapor (PDF)** untuk menyimpan.

Tautan menggunakan token acak dan berlaku satu tahun. Data rapor disimpan sebagai snapshot pada saat guru membagikannya; perubahan nilai setelah tautan dibuat tidak otomatis mengubah snapshot lama. Untuk membagikan nilai terbaru, buat tautan baru.


## Integrasi Rumah Pendidikan (rumah.pendidikan.go.id)

Panel baru **Rumah Pendidikan** ditambahkan ke menu sidebar (posisi: setelah menu Buku Pelajaran SIBI, tersedia untuk admin, guru, dan siswa). Panel berupa gerbang cepat menuju layanan resmi Kemendikdasmen pada portal Rumah Pendidikan beserta layanan turunannya, dengan kotak pencarian layanan. Seluruh tautan terbuka di tab baru sehingga data aplikasi tidak terganggu.

Layanan yang terhubung (26 tautan resmi):
- **Ruang & Portal Akun**: Portal Rumah Pendidikan, Masuk/Login, Akun belajar.id, Ruang GTK, Ruang Sekolah, Ruang Murid, Pusat Bantuan.
- **Karir & Kinerja GTK**: Pengelolaan Kinerja, Refleksi Kompetensi, Sertifikasi Pendidik (PPG), Seleksi Kepala Sekolah.
- **Belajar & Pengembangan**: Diklat (LMS), Pelatihan Mandiri, Komunitas, Video Inspirasi.
- **Kurikulum & Pembelajaran**: Perangkat Ajar, CP/ATP, Asesmen (AKM Kelas), Ide Praktik, Bukti Karya.
- **Administrasi & Data**: Rapor Pendidikan, ARKAS 4, BOSP, SIPLah, Portal Data, Pusat Perbukuan (SIBI).

Catatan teknis: panel dipasang sebagai modul tambahan terisolasi (langkah baru di akhir `app.js`), pola yang sama dengan panel Rapor Digital Siswa. Login, autentikasi, buzzer, Supabase/D1, dan seluruh fitur lama tidak diubah sama sekali. Tidak ada migrasi database atau konfigurasi tambahan yang diperlukan — cukup unggah `app.js` terbaru ke hosting bersama file lainnya. Login ke layanan pemerintah memakai akun belajar.id atau email pribadi masing-masing pengguna.


## Perbaikan Data Guru Digital (QR & foto asli)

Paket ini juga memperbaiki QR Data Guru Digital:
- QR diunduh sebagai PNG 1200×1200 dengan margin putih agar tidak terpotong.
- Tombol Buka Profil memakai tautan langsung dan tombol Salin Tautan memiliki fallback saat Clipboard API tidak tersedia.
- Foto guru baru diunggah ke Supabase Storage tanpa mengubah resolusi/kompresi file asli; URL publik disertakan di QR agar foto muncul saat dipindai.

**Penting — jalankan sekali di Supabase SQL Editor:** jalankan file `migrations/supabase_teacher_photos.sql` untuk membuat bucket publik `teacher-photos` dan kebijakan upload terbatas pada folder pengguna yang login. Setelah itu unggah ulang foto guru lama yang sebelumnya tersimpan sebagai dataURL agar foto tersedia di profil QR.


## Perbaikan QR dan Foto Profil Digital Guru
- QR Profil Digital Guru sekarang memastikan library QR benar-benar termuat sebelum menggambar QR; antrean QR lama juga di-flush setelah library siap.
- QR menggunakan koreksi error Medium dan ukuran 420 px agar tautan profil yang memuat foto lebih mudah dibuat dan dipindai.
- Foto guru lama berbentuk data URL akan dipindahkan ke bucket publik `teacher-photos` saat kartu QR dibuka, lalu tautan fotonya disimpan kembali pada data guru.
- Halaman profil publik memuat foto secara eager dan memakai URL foto publik dari Supabase Storage.

**Wajib satu kali:** jalankan seluruh isi `migrations/supabase_teacher_photos.sql` di Supabase SQL Editor. Pastikan bucket `teacher-photos` berstatus public. Setelah mengunggah file terbaru, lakukan hard refresh (Ctrl+Shift+R), buka Data Guru → Profil Digital & QR. Jika foto guru lama masih belum ada di data, edit guru dan unggah ulang foto asli, lalu Simpan.
