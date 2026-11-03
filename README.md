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
