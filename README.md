# Dashboard Magang Mahasiswa

Project ini merupakan aplikasi **Dashboard Magang Mahasiswa** yang digunakan untuk menampilkan dan mengelola data mahasiswa serta informasi yang berkaitan dengan kegiatan magang.

Project ini dibuat menggunakan **Golang** untuk backend, **Astro + React** untuk frontend, dan **PostgreSQL** sebagai database.

<img width="959" height="434" alt="Screenshot 2026-08-31 165427" src="https://github.com/user-attachments/assets/d9570454-68d3-4175-9edc-55c1446038ec" />


## 👥 Tim Pengembang

| Nama       | Bagian   |
| ---------- | -------- |
| **ALAN RIFKI AZHAR NASUTION** | Backend  |
| **SITI ANISAH**  | Frontend |
| **ROSLINA PUSPITA**   | Frontend |

---

## 🛠️ Teknologi yang Digunakan

* Golang
* Gin
* GORM
* Astro
* React
* PostgreSQL
* Git & GitHub

---

# 🚀 Cara Menjalankan Project

## 1. Cek aplikasi yang dibutuhkan

Buka **PowerShell (Run as Administrator)** atau **CMD**.

Pastikan sudah terinstall:

```bash
git --version
go version
node -v
npm -v
psql --version
```

Kalau semua perintah menampilkan versi, berarti sudah siap digunakan.

---

## 2. Clone Project

Clone repository dari GitHub:

```bash
git clone https://github.com/rfalan/MahasiswaAstro.git
```

Masuk ke folder project:

```bash
cd MahasiswaAstro
```

---

# 🗄️ 3. Menyiapkan Database PostgreSQL

Di dalam project sudah tersedia file database:

```text
mahasiswa.sql
```

Pertama, pastikan **PostgreSQL sudah aktif**.

Kemudian buat database baru dengan nama:

```text
mahasiswa
```

Bisa melalui **pgAdmin, DBeaver, atau psql**.

### Menggunakan psql

Jalankan:

```bash
psql -U postgres
```

Masukkan password PostgreSQL.

Kemudian buat database:

```sql
CREATE DATABASE mahasiswa;
```

Keluar dari PostgreSQL:

```sql
\q
```

---

## 4. Masukkan file SQL ke database

Setelah database `mahasiswa` dibuat, masukkan file `mahasiswa.sql`.

Jika terminal berada di folder utama project:

```bash
psql -U postgres -d mahasiswa -f mahasiswa.sql
```

Atau gunakan lokasi file lengkap, misalnya:

```bash
psql -U postgres -d mahasiswa -f "D:\MAGANG_HUB\PROJECT\MahasiswaAstro\mahasiswa.sql"
```

Masukkan password PostgreSQL jika diminta.

Jika berhasil, data dan tabel dari file SQL akan masuk ke database `mahasiswa`.

Untuk mengecek tabel:

```bash
psql -U postgres -d mahasiswa
```

Kemudian:

```sql
\dt
```

---

# ⚙️ 5. Sesuaikan Password PostgreSQL

Buka file:

```text
api-mahasiswa/config/database.go
```

Cari bagian koneksi database.

Sesuaikan password dengan **password PostgreSQL yang ada di komputer masing-masing**.

Contoh:

```go
dsn := "host=localhost user=postgres password=PASSWORD_ANDA dbname=mahasiswa port=5432 sslmode=disable"
```

Jadi, bagian `PASSWORD_ANDA` diganti dengan password PostgreSQL lokal.

> Jangan memasukkan password asli ke GitHub.

---

# ▶️ 6. Menjalankan Backend

Buka PowerShell atau CMD baru.

Masuk ke folder backend:

```bash
cd D:\MAGANG_HUB\PROJECT\MahasiswaAstro\api-mahasiswa
```

Kemudian jalankan:

```bash
go run .
```

Jika berhasil, backend akan berjalan di:

```text
http://localhost:8080
```

Biarkan terminal ini tetap berjalan.

---

# 💻 7. Menjalankan Frontend

Buka **terminal baru**.

Masuk ke folder frontend:

```bash
cd D:\MAGANG_HUB\PROJECT\MahasiswaAstro\frontend
```

Install dependency:

```bash
npm install
```

Setelah selesai, jalankan:

```bash
npm run dev
```

Jika berhasil, buka:

```text
http://localhost:4321/
```

---

# 🔄 Urutan Menjalankan Project

Setiap kali ingin menjalankan project:

### Terminal 1 — Backend

```bash
cd D:\MAGANG_HUB\PROJECT\MahasiswaAstro\api-mahasiswa
go run .
```

### Terminal 2 — Frontend

```bash
cd D:\MAGANG_HUB\PROJECT\MahasiswaAstro\frontend
npm run dev
```

Kemudian buka:

**http://localhost:4321/**

---

## 📌 Catatan

Sebelum menjalankan project, pastikan:

* PostgreSQL sudah aktif.
* Database `mahasiswa` sudah dibuat.
* File `mahasiswa.sql` sudah dimasukkan ke database.
* Password PostgreSQL di `database.go` sudah disesuaikan.
* Backend sudah berjalan di port `8080`.
* Frontend sudah berjalan di port `4321`.

---
