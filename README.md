# GURU SMART SERTIFIKAT — Versi Terpisah untuk Hosting GitHub

Aplikasi manajemen sekolah (sertifikat, kartu pelajar, rapor, absensi, kelas, AI) yang kode **CSS** dan **JavaScript**-nya sudah dipisah dari HTML agar rapi, mudah dirawat, dan siap di-hosting **gratis** lewat **GitHub Pages**.

Semua kode dipindah **utuh tanpa diubah** — fungsi aplikasi sama persis dengan versi satu-berkas.

## Struktur Berkas

```
├── index.html          ← halaman utama (markup saja, ±20 KB)
├── css/
│   ├── style.css       ← seluruh CSS bagian head + font dasar kartu/sertifikat
│   └── style-body.css  ← CSS pratinjau kartu, tabel kelas & remot jari
├── js/
│   ├── boot.js         ← mesin akselerasi & deteksi HP
│   ├── gsai-bridge.js  ← jembatan AI (Puter) untuk chat, soal & gambar
│   ├── tw-config.js    ← konfigurasi Tailwind
│   ├── app.js          ← aplikasi utama: data, panel, cetak & ekspor
│   ├── fastboot.js     ← pemicu boot seketika
│   ├── gesture.js      ← remot jari (kendali gestur tangan)
│   └── addons.js       ← analisis nilai & pemantauan koneksi Supabase
├── .nojekyll           ← wajib ada agar GitHub menyajikan berkas apa adanya
└── README.md
```

## Cara Hosting ke GitHub Pages

### Cara 1 — Lewat situs GitHub (paling mudah, tanpa aplikasi)

1. Masuk ke <https://github.com>, lalu klik **+** (kanan atas) → **New repository**.
2. Beri nama repositori (contoh: `guru-smart-sertifikat`), pilih **Public**, lalu klik **Create repository**.
3. Di halaman repositori, klik tautan **uploading an existing file** (atau **Add file → Upload files**).
4. Seret **semua isi folder ini** ke area unggah: `index.html`, folder `css`, folder `js`, `README.md`, dan `.nojekyll`. Seret foldernya sekalian agar struktur folder ikut tersimpan.
5. Klik **Commit changes** dan tunggu proses unggah selesai.

> **Catatan `.nojekyll`:** berkas berawalan titik kadang tidak ikut terseret. Bila `.nojekyll` tidak ada di repositori: klik **Add file → Create new file**, ketik namanya `.nojekyll` (biarkan kosong), lalu **Commit changes**.

### Cara 2 — Lewat Git (opsional)

```bash
git init
git add .
git commit -m "Guru Smart Sertifikat"
git branch -M main
git remote add origin https://github.com/USERNAME/guru-smart-sertifikat.git
git push -u origin main
```

### Mengaktifkan GitHub Pages

1. Buka repositori → **Settings** → **Pages** (menu kiri).
2. Pada **Build and deployment**, pilih Source: **Deploy from a branch**.
3. Branch: **main**, Folder: **/ (root)** → klik **Save**.
4. Tunggu 1–2 menit lalu muat ulang halaman. Alamat aplikasi akan tampil, biasanya:

   `https://USERNAME.github.io/guru-smart-sertifikat/`

5. Buka alamat tersebut di HP maupun PC — aplikasinya sama persis dengan versi satu-berkas.

## Catatan Penting

- **Internet diperlukan** saat membuka aplikasi: Tailwind, Chart.js, Supabase, Puter AI, dan pustaka QR dimuat dari CDN — sama seperti versi aslinya.
- **Data tersimpan di perangkat** (localStorage) dan/atau Supabase bila dipakai — tidak ada perubahan cara penyimpanan.
- **`.nojekyll` harus tetap ada** di akar repositori agar GitHub Pages tidak memproses berkas dengan cara khusus.
- **Jangan mengubah nama folder** `css` dan `js` (atau nama berkasnya) tanpa menyesuaikan rujukan di `index.html`.
- Versi satu-berkas (`GURU_SMART_SERTIFIKAT_v20 (10).html`) tetap bisa dipakai seperti biasa; keduanya berisi kode yang sama persis.

## Fitur yang Sudah Disempurnakan (versi ini)

- **Tombol kembali di HP**: cukup **satu tekan** untuk kembali ke Dashboard — tanpa peringatan keluar, tanpa dialog "Ya/Tidak", aplikasi tidak ikut tertutup. Bila ada modal atau menu samping yang terbuka, tekanan pertama menutupnya dulu. Di PC, perilaku tombol kembali browser tetap seperti semula.
- **Ekspor PDF/Word/Excel di HP**: memakai **susunan dan teks yang sama** dengan ekspor di PC (pratinjau cetak HP memakai dokumen yang identik dengan PC).
- **Logo kartu pelajar dan logo kop surat saling lepas**: mengganti logo kartu tidak mengubah logo kop surat.
