# SAMBA-Asset (Sistem Manajemen & Inventarisasi Aset Infrastruktur Jaringan)

[![Go Version](https://img.shields.io/badge/Go-1.22+-00ADD8?style=flat&logo=go)](https://golang.org/)
[![React Version](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📌 Ringkasan Eksekutif (Executive Summary)

**SAMBA-Asset** adalah aplikasi enterprise berbasis web dan PWA (*Progressive Web App*) yang dirancang khusus untuk memonitor, menginventarisasi, dan mengaudit aset infrastruktur jaringan dan perangkat IT secara nasional.

Sistem ini memudahkan tim operasional, teknisi lapangan, hingga manajemen dalam melacak persebaran perangkat, riwayat mutasi antar-lokasi, kondisi fisik, hingga status operasional aset dari level kantor cabang utama hingga rak perangkat di site mitra.

---

## 🚀 Fitur Utama & Keunggulan Sistem

### 1. Struktur Hierarki 3-Tingkat (3-Tier Infrastructure Hierarchy)
Pengorganisasian data terstruktur secara bertingkat:
- **Level 1 (Cabang Daerah)**: Mengelompokkan wilayah operasional (misal: *Branch Brebes, Branch Tegal, Branch Bandung, dll.*).
- **Level 2 (Site & Mitra)**: Titik instalasi atau nama mitra kerja (misal: *MAN 1 Brebes, RSUD Bumiayu, POP Pagojengan, dll.*).
- **Level 3 (Perangkat & Serial Number)**: Detail spesifik perangkat jaringan lengkap dengan nomor seri dan jumlah unit terpasang.

### 2. Standarisasi Parameter & Klasifikasi Lengkap
- **Jenis Asset**: `Aktif`, `Pasif`, `Interconnect`, `Power`.
- **Status Perangkat**: `Aktif`, `Nonaktif`, `Maintenance`, `Rusak`, `Retired`, `Hilang`.
- **Kondisi Fisik**: `Baik`, `Perlu Perbaikan`, `Rusak`.
- **Segmen Layanan**: Kustomisasi warna & kategori layanan (`Kemitraan`, `POP`, `Local Loop`, `Corporate`, dll.).

### 3. Otomatisasi Keterangan & Template 36+ Kategori
- Ketika memilih kategori perangkat (seperti *SFP, Firewall, Switch, OLT, Microwave, dll.*), kolom keterangan akan **terisi otomatis** dengan deskripsi standar fungsi teknis.
- Disediakan dropdown pemilih cepat 36 template dan textarea bebas untuk penulisan catatan tambahan.

### 4. Input Cepat Multi-Serial Number (Batch SN Detection)
- Memungkinkan teknisi menyalin (*paste*) puluhan Serial Number sekaligus (dipisahkan koma atau baris baru).
- Sistem secara otomatis menghitung jumlah unit (*unit count*) yang terdeteksi.

### 5. Audit Lapangan dengan Kamera & QR Code
- **QR Generator**: Setiap aset memiliki label QR Code unik berisi metadata spesifik.
- **Scanner Kamera Terintegrasi**: Teknisi lapangan dapat memindai QR Code langsung menggunakan kamera smartphone untuk verifikasi dan audit fisik aset secara *real-time*.

### 6. Mutasi & Transfer Aset Antar-Site
- Fitur mutasi perangkat antar site atau antar cabang dengan pencatatan riwayat perpindahan yang transparan untuk mencegah kehilangan unit.

### 7. Keamanan & Role-Based Access Control (RBAC)
- **Super Admin**: Hak akses penuh seluruh cabang nasional, manajemen user, dan konfigurasi master data.
- **Branch Admin**: Terisolasi hanya dapat mengelola site dan aset di cabang daerah yang ditugaskan.
- **Auditor**: Akses peninjauan (*Read-Only*) untuk kebutuhan inspeksi dan laporan audit.
- **Autentikasi & Verifikasi**: JWT (*JSON Web Token*) + OTP Verifikasi Email resmi via Google SMTP.

### 8. Laporan & Export Data (CSV / Excel)
- Unduh laporan rekapitulasi data aset lengkap dalam format CSV/Excel baik secara nasional maupun terfilter per-cabang dengan 1 klik.

### 9. Desain Responsif & PWA (Mobile-Optimized)
- Tampilan modern *dark-mode enterprise* yang responsif pada monitor desktop, tablet, maupun layar smartphone.
- Mendukung instalasi sebagai aplikasi mandiri di Google Chrome Android/iOS (PWA).

---

## 🛠️ Arsitektur Teknologi (Tech Stack)

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons | UI modern, cepat, dan ringan |
| **Scanner** | Html5-QRCode | PWA Camera Scanner terintegrasi |
| **Backend** | Go (Golang 1.22) + Gin Web Framework | Performa tinggi, efisien dalam konkurensi data |
| **Database** | PostgreSQL 16 Alpine | Relational database tangguh dengan indexing teroptimasi |
| **Otentikasi** | JWT (JSON Web Tokens) & Bcrypt | Standar keamanan enkripsi industri |
| **Deployment** | Docker & Docker Compose, Nginx | Kontainerisasi penuh & portabel di berbagai server |
| **Networking** | Cloudflare Zero-Trust Tunnel | Akses aman publik tanpa perlu membuka port IP publik VPS |

---

## 📁 Struktur Direktori Proyek

```
SAMBA-Asset/
├── backend/                  # Source code Go Backend REST API
│   ├── config/              # Inisialisasi Database PostgreSQL
│   ├── controllers/         # Handler logika bisnis
│   ├── handlers/            # Endpoint handlers API
│   ├── middleware/          # JWT Auth & Role Access Guards
│   ├── models/              # Struktur data & GORM Models
│   ├── routes/              # Routing endpoint API
│   ├── utils/               # Helper email SMTP, token, dan QR
│   ├── Dockerfile           # Dockerfile build backend Go
│   └── main.go              # Entry point aplikasi Go
├── frontend/                 # Source code React Frontend (SPA)
│   ├── src/
│   │   ├── components/      # Komponen UI (Hierarchy, Modal, QR, Managers)
│   │   ├── api.js           # Axios HTTP client ke backend
│   │   ├── App.jsx          # Root view & state orchestration
│   │   └── main.jsx         # React entry point
│   ├── public/              # Aset statis & PWA manifest
│   ├── Dockerfile           # Multi-stage build Nginx + Vite bundle
│   └── nginx.conf           # Konfigurasi reverse proxy frontend
├── init-db.sql              # Skema tabel awal & initial seed data
├── docker-compose.yml       # Orkestrasi 4 kontainer (DB, Backend, Frontend, Cloudflared)
├── .env.example             # Contoh variabel konfigurasi environment
└── README.md                # Dokumentasi proyek
```

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### Persyaratan Sistem (Prerequisites)
- **Docker Engine** (versi 24.0+)
- **Docker Compose** (versi 2.0+)
- **Git**

### Langkah Deployment Cepat (Production / Staging)

1. **Clone Repository:**
   ```bash
   git clone https://github.com/mrzkyky/SAMBA-ASSET.git
   cd SAMBA-ASSET
   ```

2. **Siapkan Konfigurasi Environment:**
   Salin `.env.example` ke `.env` dan sesuaikan kredensial email / domain:
   ```bash
   cp .env.example .env
   ```

3. **Jalankan dengan Docker Compose:**
   ```bash
   docker compose up -d --build
   ```

4. **Verifikasi Status Kontainer:**
   ```bash
   docker compose ps
   ```
   Pastikan keempat service berjalan aktif:
   - `asset-postgres` (Port Host 5437 -> 5432)
   - `asset-backend` (Port Host 8088 -> 8080)
   - `asset-frontend` (Port Host 3002 -> 80)
   - `asset-cloudflared` (Terkoneksi ke domain produksi)

---

## 📊 Daftar Endpoint API Utama

| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Publik | Login pengguna & penerbitan token JWT |
| `POST` | `/api/auth/register` | Publik | Pendaftaran akun baru |
| `POST` | `/api/auth/verify-email`| Publik | Verifikasi kode OTP 6-digit |
| `GET`  | `/api/hierarchy` | Semua Role | Mengambil hierarki 3-level (Cabang -> Site -> Aset) |
| `GET`  | `/api/stats` | Semua Role | Ringkasan KPI dan statistik inventaris |
| `GET`  | `/api/assets` | Semua Role | Daftar seluruh aset perangkat |
| `POST` | `/api/assets` | Super/Branch Admin | Tambah aset perangkat baru |
| `PUT`  | `/api/assets/:id` | Super/Branch Admin | Perbarui detail aset |
| `DELETE`| `/api/assets/:id` | Super/Branch Admin | Hapus data aset |
| `POST` | `/api/transfers` | Super/Branch Admin | Mutasi / pindah perangkat antar lokasi |
| `GET`  | `/api/assets/export` | Semua Role | Unduh file Laporan CSV data aset |
| `POST` | `/api/branches` | Super Admin | Tambah cabang operasional baru |
| `POST` | `/api/users` | Super Admin | Tambah / undang user baru |

---

## 🔒 Standar Keamanan & Keandalan
1. **Password Hashing**: Menggunakan algoritma *Bcrypt* dengan *salt rounds* standar enterprise.
2. **Strict RBAC Middleware**: Verifikasi hak akses ganda di level API backend untuk mencegah modifikasi data lintas cabang tanpa izin.
3. **Database Integrity**: Penerapan relasi *Foreign Key* dan mekanisme validasi integritas data pada PostgreSQL.
4. **HTTPS Encryption**: Seluruh lalu lintas terenkripsi secara otomatis melalui Cloudflare SSL/TLS.

---

## 👨‍💻 Tim Pengembang & Pemeliharaan
- **Proyek**: SAMBA-Asset Infrastructure Management System
- **Repository**: [https://github.com/mrzkyky/SAMBA-ASSET](https://github.com/mrzkyky/SAMBA-ASSET)
- **Status**: Production Ready ✅
