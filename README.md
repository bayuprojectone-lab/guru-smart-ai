# GURU SMART AI — GitHub + Cloudflare Workers + D1

Frontend GURU SMART AI tetap menggunakan Supabase seperti sebelumnya. Cloudflare Worker menjalankan replika/cadangan Supabase ke Cloudflare D1 secara otomatis di cloud. Komputer pengguna tidak perlu menyala.

## Arsitektur dan batasan penting

- **Supabase = database utama (source of truth)** untuk aplikasi berjalan.
- **Cloudflare D1 = replika/cadangan**. Worker membaca data Supabase dan melakukan upsert ke D1 setiap 15 menit.
- Cron Triggers berjalan di infrastruktur Cloudflare, bukan di browser atau PC pengguna.
- Baris yang sudah tersalin tidak otomatis dihapus dari D1 jika dihapus di Supabase. Ini disengaja agar penghapusan tidak ikut menghancurkan cadangan.
- Ini adalah mekanisme **backup satu arah yang aman**, bukan sinkronisasi dua arah aktif. Perubahan di D1 tidak otomatis ditulis kembali ke Supabase. Pemulihan balik perlu prosedur terkontrol dan pemetaan skema per tabel agar tidak menimpa data baru.
- Replika menyimpan setiap baris sebagai JSON di `replica_rows`; belum mengubah aplikasi lama untuk membaca/menulis D1. Aplikasi tetap memakai Supabase.

## Struktur

```text
GURU-SMART-AI/
├── database/
│   └── schema.sql
├── src/
│   └── index.js
├── public/
│   ├── index.html
│   ├── style.css
│   └── js/
│       ├── app.js
│       ├── supabase.js
│       └── auth.js
├── wrangler.toml
└── README.md
```

## 1. Persiapan Cloudflare

Install Node.js LTS, lalu buka terminal di folder proyek:

```bash
npm install -D wrangler
npx wrangler login
```

Buat database:

```bash
npx wrangler d1 create guru-smart-db
```

Salin `database_id` hasil perintah tersebut ke `wrangler.toml`, mengganti `GANTI_DENGAN_DATABASE_ID_DARI_CLOUDFLARE`.

Buat tabel di D1:

```bash
npx wrangler d1 execute guru-smart-db --remote --file=database/schema.sql
```

## 2. Pasang rahasia Supabase (WAJIB)

Worker membutuhkan URL project dan **service_role key** Supabase agar dapat membaca tabel meskipun RLS aktif. Key ini hanya disimpan sebagai Cloudflare Secret, jangan pernah ditulis di HTML, JavaScript publik, GitHub, atau README.

```bash
npx wrangler secret put SUPABASE_URL
```

Masukkan URL project Supabase, misalnya `https://PROJECT.supabase.co`.

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Masukkan service_role key dari Supabase Dashboard → Project Settings → API. Jangan bagikan key ini kepada siapa pun. Jika pernah terunggah ke repository publik, segera rotasi key.

## 3. Tabel yang direplikasi

Worker mereplikasi tabel yang ditemukan dipakai oleh aplikasi saat paket ini disiapkan:

- `users`
- `avatars`
- `piket`
- `attendance`
- `activity_records`
- `students`
- `school_profile`
- `activity_attendance`
- `kuis_kelas`
- `kuis_buzzer`

**Syarat:** setiap tabel harus memiliki kolom primary key bernama `id` yang stabil dan query `order=id.asc` harus diizinkan. Jika ada tabel yang tidak memiliki kolom `id`, sinkronisasi akan berhenti dengan pesan error (tidak melewati baris diam-diam). Periksa daftar tabel dan primary key pada Supabase sebelum mengandalkan backup ini.

## 4. Deploy

```bash
npx wrangler deploy
```

Cron `*/15 * * * *` akan menjalankan sinkronisasi otomatis setiap 15 menit. Setelah deploy, proses berjalan di Cloudflare meskipun PC mati, browser ditutup, atau pengguna logout.

## 5. Pemeriksaan

- `https://DOMAIN-ANDA/api/health` — memeriksa Worker dan D1.
- `https://DOMAIN-ANDA/api/sync/status` — melihat waktu, status, jumlah baris, dan pesan sinkronisasi terakhir.

Sinkronisasi pertama dapat memerlukan waktu lebih lama. Periksa status setelah 15–30 menit. Jika gagal, lihat pesan pada endpoint status dan log Worker di Cloudflare Dashboard.

## 6. Prosedur pemulihan

D1 menyimpan replika dalam bentuk JSON pada `replica_rows`. Jangan menjalankan restore massal langsung ke Supabase tanpa memeriksa struktur kolom, relasi foreign key, urutan tabel, dan konflik data terlebih dahulu. Pemulihan harus dibuat per tabel dengan dry-run, validasi jumlah/hash, transaksi/batch terkontrol, serta backup Supabase terbaru sebelum menulis balik.

## Keamanan dan batasan operasional

1. Aktifkan RLS dan policy yang benar pada Supabase. Jangan menaruh service_role key di frontend.
2. Batasi akses Cloudflare Dashboard dan GitHub repository.
3. D1 replika bukan pengganti backup terpisah/versioned; pertimbangkan ekspor backup berkala ke penyimpanan terpisah.
4. Cron 15 menit berarti perubahan terakhir sebelum kegagalan dapat belum ikut tersalin. Frekuensi, ukuran halaman, batas baris, dan biaya tunduk pada limit paket Cloudflare/Supabase.
5. Sinkronisasi tidak menghapus baris yang sudah ada di D1. Ini melindungi cadangan dari penghapusan tak sengaja, tetapi perlu kebijakan retensi untuk mengelola ukuran database.
6. Uji dengan salinan database terlebih dahulu. Jangan menganggap sistem siap produksi sebelum semua tabel, primary key, jumlah baris, dan hasil restore diverifikasi.
