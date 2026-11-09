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


## Tampilan Scan Data Digital Guru dan Simpan PDF
- Hasil scan QR dengan parameter `src=g` sekarang menampilkan dokumen identitas guru tersendiri, tidak menggunakan kartu digital siswa.
- Desain dokumen mengikuti gaya Rapor Digital: kop sekolah, judul Data Digital Guru, foto guru, biodata terstruktur, dan footer verifikasi.
- Tombol **Simpan Data Guru sebagai PDF** membuka dialog cetak browser; pilih **Save as PDF / Simpan sebagai PDF**. Tombol tidak ikut tercetak.
- Mode siswa dan sertifikat tetap menggunakan tampilan sebelumnya.


## Data Digital Guru — kelengkapan biodata (V2)
Halaman scan QR Guru menampilkan semua kolom formulir Data Guru: foto profil, nama lengkap, NIP, bidang/mata pelajaran, jenis kelamin, nomor HP/WhatsApp, email, tanggal lahir, dan alamat lengkap. Kolom yang tidak diisi tidak ditampilkan.


## v36 — Percepatan logo Kartu Digital Siswa dan Guru
- Menampilkan logo dari cache lokal seketika saat halaman digital dibuka.
- Menyimpan logo terbaru yang berhasil dimuat untuk kunjungan berikutnya.
- Logo dari dialog cetak kartu siswa dipreload dan disimpan sebagai cache.
- Tidak mengubah fitur, desain, QR, database, atau file lain.


## v37 — Panel Sertifikat Ringkas & Elegan + Font Berbeda per Jenis

Halaman **Cetak Sertifikat** disegarkan menjadi lebih ringkas dan elegan tanpa
mengubah fitur, data, maupun alur kerja lama:

**Panel baru (ringkas & elegan)**
- Header ramping bergradasi gelap dengan aksen emas dan garis emas tipis.
- Satu kartu form berisi 4 bagian akordeon slim (badge emas, garis pemisah
  halus) — tidak lagi berkotak-kotak terpisah, sehingga lebih pendek dan
  rapi. Pratinjau tetap menempel (sticky) di kanan pada layar besar.
- Pemilihan **jenis sertifikat** kini berupa 4 kartu pilihan 2×2 yang
  langsung terlihat fontnya, bukan dropdown biasa. Kartu aktif ditandai
  gradien ungu + centang. Label "Font judul: …" menunjukkan font aktif.
- Warna swatch lebih ringkas, tombol aksi bergradasi (biru = pratinjau,
  emas = cetak). Mode gelap didukung penuh.

**Setiap jenis sertifikat berfont beda** (panel, pratinjau, dan cetak/PDF):
- SERTIFIKAT PENGHARGAAN → **Playfair Display** (serif klasik elegan)
- SERTIFIKAT PRESTASI    → **Cinzel** (kapital ukir ala piagam)
- SERTIFIKAT KELULUSAN   → **Cormorant Garamond** (serif sastra halus)
- SERTIFIKAT PESERTA     → **Montserrat** (sans modern bersih)

Font diambil dari Google Fonts secara otomatis saat panel dibuka (satu kali,
ringan). Bila offline, otomatis memakai cadangan serif/sans bawaan sehingga
tampilan tetap rapi. Pada lembar sertifikat, font unik dipakai oleh teks
judul "SERTIFIKAT" dan pita "PIAGAM …"; lebar pita tetap menyesuaikan otomatis.
Dokumen cetak/PDF ikut menyertakan font yang sama.

Cukup unggah ulang `app.js` ke hosting (file lain tidak berubah).


## v38 — Font Teks Nama & Teks Sertifikat ala Piagam Umum (Banyak Gaya)

Teks pada lembar sertifikat kini memakai kombinasi font seperti sertifikat/
piagam pada umumnya, dan pengguna dapat memilih dari banyak gaya:

**Font teks nama siswa (script/kaligrafi elegan) — 10 pilihan:**
Great Vibes (bawaan), Alex Brush, Pinyon Script, Allura, Parisienne,
Sacramento, Dancing Script, Berkshire Swash, Tangerine, Petit Formal Script.
- Nama yang ditulis KAPITAL semua otomatis diubah Title Case (Ahmad Fauzan)
  agar cantik & mudah dibaca di font script — persis piagam umum.
- Ukuran nama otomatis diskalakan per font agar setara dan tetap di dalam
  bingkai (nama panjang otomatis mengecil, fit v20 tetap bekerja).

**Font teks isi sertifikat (serif klasik) — 8 pilihan:**
EB Garamond (bawaan), Cormorant Garamond, Libre Baskerville, Libre Caslon
Text, Crimson Text, Lora, Playfair Display, Spectral.
- Meliputi: "Diberikan Kepada :", "Sebagai :", teks kegiatan (kini italic
  elegan), nama sekolah & kelas, NIS, kementerian, tempat/tanggal, kepala
  sekolah, dan NIP.

**Panel — akordeon baru "3 · Gaya Font":**
- Dua kisi kartu: "Font teks nama siswa" & "Font teks isi sertifikat".
- Setiap kartu ditampilkan dengan font-nya sendiri + deskripsi singkat;
  kartu aktif ditandai gradien ungu + centang.
- Pilihan tersimpan otomatis (localStorage) dan langsung tercermin di
  pratinjau, thumbnail motif, serta dokumen cetak/PDF.
- Judul "SERTIFIKAT" & pita "PIAGAM …" tetap memakai font khas jenis
  sertifikat (fitur v37) — tidak berubah oleh pilihan font nama/isi.
- Semua font dimuat sekali dari Google Fonts; saat offline otomatis
  memakai cadangan serif/cursive bawaan sehingga tampilan tetap rapi.


## v39 — Nama Diturunkan + Teks Profesional ala Piagam Resmi

**Posisi nama lebih lega (permintaan: jangan mepet teks di atasnya):**
- Nama siswa diturunkan (garis dasar 24150 → 25200) sehingga huruf besar/
  kaligrafi nama tidak lagi menempel pada label di atasnya.
- Seluruh kluster tengah & bawah ikut bergeser proporsional — "Sebagai :",
  teks kegiatan, nama sekolah & kelas, kementerian, tempat/tanggal, blok
  tanda tangan (TTD, stempel), nama kepala sekolah, dan NIP — agar jarak
  antar-baris tetap seimbang dan tidak ada yang bertabrakan.
- Nama kepala sekolah kini ikut memakai font isi terpilih (sebelumnya masih
  serif bawaan).

**Teks profesional tambahan (ala piagam resmi):**
- Pengantar sebelum nama: "Dengan bangga dan penuh penghargaan," di atas
  label "Diberikan Kepada :" (italic, mengikuti font isi).
- Kalimat penutup resmi sebelum blok tanda tangan: "Demikian sertifikat ini
  diberikan untuk dapat dipergunakan sebagaimana mestinya."
- Berlaku di SEMUA motif buatan, pratinjau, dan cetak/PDF. Sertifikat asli
  bawaan tetap tidak diubah (prinsip v20).


## v40 — NIS & "Dengan Bangga…" Naik Satu Alenia + Font Diperbanyak (20 Nama / 14 Isi)

**Anti tumpuk-teks (permintaan: NOMOR INDUK SISWA & "penuh bangga" dinaikkan
satu alenia):**
- Baris "NOMOR INDUK SISWA : …" naik dari y 18800 → 18400 (tetap aman di
  bawah ornamen pembatas pita PIAGAM).
- Baris pengantar "Dengan bangga dan penuh penghargaan," naik dari
  y 20050 → 19550.
- Hasilnya jarak "Dengan bangga…" ke "Diberikan Kepada :" yang semula
  bertumpuk kini terbuka lega, dan seluruh kluster atas (NOMOR INDUK →
  pengantar → label → nama besar) bernapas tanpa ada teks yang menempel.

**Banyak jenis font baru (permintaan: tambahkan banyak jenis font lagi):**
- Font teks nama: 10 → **20 gaya script**. Penambahan: Italianno,
  Herr Von Muellerhoff, Mrs Saint Delafield, Monsieur La Doulaise,
  Rouge Script, Euphoria Script, Norican, Yesteryear, Kaushan Script,
  Satisfy.
- Font teks isi: 8 → **14 serif klasik**. Penambahan: Cardo,
  Old Standard TT, Marcellus, Prata, Bodoni Moda, Gentium Book Plus.
- Semua font baru otomatis diuji: diterapkan ke teks nama & seluruh teks
  isi sertifikat, ikut konversi Title Case (v38b) & penskalaan otomatis.
- URL Google Fonts (pratinjau panel + cetak/PDF) diperbarui memuat seluruh
  34 keluarga font; saat offline tetap ada cadangan serif/cursive.

**Panel tetap ringkas & elegan:**
- Kedua kisi font kini memiliki tinggi maksimum dengan gulungan halus
  (scrollbar tipis) sehingga panel tidak memanjang meski pilihan bertambah.
- Label jumlah pilihan diperbarui: "20 gaya" untuk nama & "14 font" untuk isi.


## v41 — Pemberitahuan "Tekan sekali lagi untuk keluar" Dihapus (Tampilan HP)

- Notifikasi/pemberitahuan "Tekan sekali lagi untuk keluar dari aplikasi."
  yang muncul di tampilan HP (saat tombol Kembali ditekan sampai dasar
  riwayat) DIHAPUS sesuai permintaan — tidak ada lagi pemberitahuan apa pun.
- KODE LAIN TETAP: tombol Kembali HP tetap membuka panel sebelumnya, modal
  & PDF tetap ditangani seperti sebelumnya, dan pengaman keluar (guard)
  tetap berjalan hanya tanpa pemberitahuan — aplikasi tidak tertutup
  tiba-tama karena satu sentuhan.
- Keluar aplikasi tetap melalui tombol "Keluar" di sidebar (dengan dialog
  konfirmasi seperti semula).

---

# Integrasi Google Drive pribadi per guru (V41)

Modul ini menambahkan koneksi Google Drive terpisah untuk setiap akun Supabase. Modul UI ditambahkan di bagian akhir `app.js`; fitur lama dan alur database yang sudah ada tetap dipertahankan.

## Cara kerja
- Guru login seperti biasa, lalu membuka tombol **Google Drive** di pojok kanan bawah dan memilih **Hubungkan akun Google**.
- Worker menjalankan OAuth Authorization Code dengan akses `drive.file`. Token refresh disimpan terenkripsi AES-GCM di D1, bukan di browser atau HTML.
- Worker membuat folder `GURU SMART AI` di Drive guru. Data tabel disimpan ke subfolder berdasarkan nama tabel; file dari Supabase Storage disalin ke subfolder berdasarkan nama bucket.
- Perubahan insert/upsert/update/delete yang berhasil maupun gagal karena gangguan jaringan masuk antrean lokal per pengguna, lalu dikirim ke Drive jika akun Drive terhubung. Antrean dicoba kembali ketika online dan setiap 30 detik. Ketika pembacaan Supabase kembali berhasil setelah mode pemulihan aktif, sistem mencoba menyinkronkan record cadangan kembali ke Supabase: record yang belum ada ditambahkan; record yang memiliki `updated_at` hanya diperbarui jika versi Drive lebih baru.
- Ketika Supabase gagal membaca tabel, aplikasi mencoba merekonstruksi data dari log backup Drive dan mengembalikannya sebagai hasil baca sementara. Fitur pemulihan dari Google Drive dinonaktifkan; modul tetap menyediakan backup otomatis dan backup manual ke Drive.
- Worker memverifikasi identitas dari access token Supabase. Jika layanan Auth Supabase sedang gangguan, Worker dapat memverifikasi JWT secara lokal menggunakan `SUPABASE_JWT_SECRET`.

## 1. Jalankan migrasi D1 baru

Pastikan binding D1 `DB` sudah benar di `wrangler.toml`, lalu jalankan:

```bash
npx wrangler d1 migrations apply guru-smart-sibi --remote
```

Migrasi `0002_google_drive.sql` menambahkan tabel koneksi OAuth, nonce OAuth sekali pakai, dan log backup. Jangan menghapus migrasi `0001_init.sql`.

## 2. Buat kredensial Google OAuth

1. Buka Google Cloud Console dan pilih/buat project.
2. Aktifkan **Google Drive API**.
3. Konfigurasikan OAuth consent screen. Tambahkan scope `https://www.googleapis.com/auth/drive.file` dan `https://www.googleapis.com/auth/userinfo.email`.
4. Buat OAuth Client ID bertipe **Web application**.
5. Tambahkan Authorized redirect URI yang persis sama dengan:

```text
https://NAMA-WORKER-ANDA.workers.dev/api/drive/oauth/callback
```

Jika Worker menggunakan domain khusus, gunakan domain Worker tersebut. URI harus sama persis dengan `GOOGLE_REDIRECT_URI`.

## 3. Atur Variables dan Secrets Cloudflare Worker

Di Cloudflare Dashboard → Workers & Pages → `guru-smart-ai` → Settings → Variables and Secrets, atur:

**Variables**
- `GOOGLE_CLIENT_ID` = OAuth Client ID dari Google Cloud.
- `GOOGLE_REDIRECT_URI` = URL callback Worker di atas.
- `SUPABASE_URL` = URL project Supabase.
- `SUPABASE_ANON_KEY` = anon/publishable key Supabase.

**Secrets (jangan masukkan ke HTML atau GitHub)**
- `GOOGLE_CLIENT_SECRET` = OAuth Client Secret.
- `SUPABASE_JWT_SECRET` = JWT Secret project Supabase (bukan anon key dan bukan service_role key).
- `OAUTH_STATE_SECRET` = rahasia acak untuk menandatangani state OAuth. Buat dengan `openssl rand -hex 32`.
- `DRIVE_TOKEN_ENCRYPTION_KEY` = kunci AES 32 byte dalam format Base64. Buat dengan `openssl rand -base64 32`.

Jangan membagikan atau mengunggah nilai Secret ke percakapan, file HTML, atau repositori publik.

## 4. Atur URL Worker di frontend

Di `app.js`, cari `GURU_SMART_D1_API_URL` dan ganti alamat placeholder `https://guru-smart-ai.YOUR-SUBDOMAIN.workers.dev` dengan URL Worker yang benar. URL ini harus sama untuk endpoint D1 dan Google Drive. Unggah kembali `app.js` dan seluruh berkas proyek ke hosting.

## 5. Deploy dan uji

```bash
npx wrangler deploy
```

Tes `/api/health` dan `/api/d1-health`. Setelah itu login menggunakan akun guru uji, hubungkan Google Drive, dan pastikan folder `GURU SMART AI` muncul pada Drive akun tersebut. Buat satu perubahan data uji, tunggu antrean terkirim, lalu periksa subfolder tabel terkait.

Uji pemulihan di lingkungan uji terlebih dahulu. Jangan sengaja mematikan atau memenuhi database produksi. Periksa Worker Logs untuk kegagalan OAuth, token, kuota Google Drive, dan backup.

## Catatan batasan dan keselamatan data
- Backup perubahan database berjalan setelah operasi tulis berhasil; antrean lokal menjaga perubahan saat koneksi terputus. Jika browser ditutup sebelum antrean sempat terkirim, antrean tetap berada pada penyimpanan lokal browser/perangkat itu.
- Pemulihan data tabel merekonstruksi event insert/upsert/update/delete dan snapshot yang sudah ada di Drive. Sinkronisasi balik sengaja tidak menimpa record Supabase yang lebih baru; record tanpa `id` dilewati, dan update record yang tidak memiliki `updated_at` tidak dilakukan otomatis demi menghindari konflik. Tombol backup manual mengirim tabel yang sudah tersedia di cache lokal perangkat; buka/kunjungi panel data yang diperlukan lebih dulu agar cache terisi.
- File yang diunggah melalui `sb.storage.from(...).upload(...)` disalin ke Drive jika ukuran file maksimal 15 MB. Pemulihan file mencoba mengunggahnya kembali ke bucket Supabase menggunakan sesi guru. Pastikan bucket dan kebijakan Storage Supabase tetap tersedia.
- Perubahan yang dibuat di luar aplikasi (langsung di Supabase Dashboard atau aplikasi lain) tidak otomatis masuk ke Drive.
- Ini adalah backup dan pemulihan berbasis event/cache, bukan replikasi transaksi database penuh atau pengganti backup resmi Supabase. Lakukan backup Supabase berkala dan uji pemulihan sebelum dipakai sebagai satu-satunya salinan.
- File backup disimpan di Drive akun guru yang menghubungkan OAuth. Jangan menghubungkan akun Google bersama untuk beberapa guru jika data harus terpisah.
- Akun Google yang mencabut izin atau menghapus file backup perlu menghubungkan ulang Drive dari panel untuk melanjutkan backup.


## Google Drive — konfigurasi Worker (V41)

**Catatan pemeriksaan V41:** panel Google Drive pada `app.js` memanggil API Cloudflare Worker (`/api/drive/oauth/start`, `/api/drive/status`, `/api/drive/backup`, `/api/drive/restore` (dinonaktifkan pada antarmuka aplikasi), `/api/drive/file-backup`, `/api/drive/storage-list`, dan `/api/drive/storage-file`). Kode pada paket ini tidak memanggil Supabase Edge Function bernama `drive-start` atau `drive-upload`. Fungsi-fungsi yang setara sudah berada di `src/index.js`; karena itu jangan membuat Edge Function duplikat atau mengubah SQL OAuth tanpa alasan. Perbaikan utama paket ini adalah mengarahkan panel ke Worker `guru-smart-ai.bayuprojectone.workers.dev`, bukan alamat Pages yang keliru.

### 1. Siapkan D1

Pastikan binding `DB` pada `wrangler.toml` menunjuk database D1 yang benar. Terapkan seluruh migrasi (termasuk tabel OAuth/Drive dari `0002_google_drive.sql`):

```bash
npx wrangler d1 migrations apply guru-smart-sibi --remote
```

### 2. Pasang Secrets dan Variables pada Cloudflare Worker

Atur Variables/Secrets berikut pada Worker `guru-smart-ai`:

- `SUPABASE_URL` — URL project Supabase.
- `SUPABASE_ANON_KEY` — anon/publishable key, bukan service-role key.
- `SUPABASE_JWT_SECRET` — JWT signing secret project Supabase (dibutuhkan sebagai fallback verifikasi saat Auth tidak dapat dijangkau).
- `GOOGLE_CLIENT_ID` — OAuth Client ID jenis Web application.
- `GOOGLE_CLIENT_SECRET` — OAuth Client Secret (Secret).
- `GOOGLE_REDIRECT_URI` — `https://guru-smart-ai.bayuprojectone.workers.dev/api/drive/oauth/callback`.
- `OAUTH_STATE_SECRET` — rahasia acak panjang untuk menandatangani state OAuth.
- `DRIVE_TOKEN_ENCRYPTION_KEY` — Base64 dari tepat 32 byte acak untuk enkripsi refresh token.

Contoh membuat dua secret acak di terminal lokal (jangan kirim hasilnya ke chat dan jangan commit ke Git):

```bash
openssl rand -hex 32
openssl rand -base64 32
```

Gunakan hasil acak pertama untuk `OAUTH_STATE_SECRET` dan hasil Base64 kedua untuk `DRIVE_TOKEN_ENCRYPTION_KEY`. Masukkan secret melalui Cloudflare Dashboard atau `npx wrangler secret put NAMA_SECRET`.

### 3. Callback Google

Di OAuth Client jenis Web application, tambahkan URI callback persis seperti nilai `GOOGLE_REDIRECT_URI` di atas pada **Authorized redirect URIs**. Jangan menaruh Client Secret di frontend.

### 4. Deploy dan tes

```bash
npx wrangler deploy
```

Tes endpoint publik tanpa token:

- `https://guru-smart-ai.bayuprojectone.workers.dev/api/health`
- `https://guru-smart-ai.bayuprojectone.workers.dev/api/d1-health`

Keduanya harus merespons `ok: true`; endpoint D1 harus menunjukkan `d1: connected`. Setelah login ke aplikasi, buka menu Backup, Riwayat & Keamanan → Google Drive Pribadi. Tombol Hubungkan akun Google akan memanggil Worker dan membuka persetujuan Google. Status dan backup memerlukan sesi Supabase yang valid.

### 5. Endpoint yang digunakan panel

| Metode | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/drive/oauth/start` | Membuat URL persetujuan OAuth dengan state bertanda tangan |
| GET | `/api/drive/oauth/callback` | Menukar authorization code dan menyimpan refresh token terenkripsi |
| GET | `/api/drive/status` | Status koneksi dan ringkasan backup akun |
| POST | `/api/drive/backup` | Menyimpan event/snapshot data ke Drive |
| POST | `/api/drive/file-backup` | Backup file Supabase Storage (maks. 15 MB per file) |
| GET | `/api/drive/restore` (dinonaktifkan pada antarmuka aplikasi) | Membaca backup data akun |
| GET | `/api/drive/storage-list` | Daftar file Storage yang dicadangkan |
| GET | `/api/drive/storage-file` | Mengunduh file backup milik akun yang login |

Semua endpoint selain callback OAuth diverifikasi memakai access token sesi Supabase. Refresh token Google disimpan terenkripsi di D1; token rahasia tidak dikirim ke browser. Backup Drive per pengguna bergantung pada D1 dan konfigurasi secrets di atas.
