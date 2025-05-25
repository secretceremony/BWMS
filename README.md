# 📦 Biruni Warehouse Management System (BWMS) – PT Biruni Altha Ethan

## 1. 🎯 Latar Belakang
**PT Biruni Altha Ethan** adalah perusahaan penyedia komponen/sparepart alat berat dalam kondisi baru maupun rekondisi. Untuk menjaga daya saing harga, perusahaan ini membutuhkan **pengelolaan barang yang efisien dan terstruktur**.

Manajemen barang yang rapi akan:
* Membuat pekerjaan lebih terorganisir
* Meningkatkan akurasi data inventaris
* Mendukung pertumbuhan penjualan secara signifikan

---

## 2. 🎯 Tujuan
Membangun **aplikasi web** yang bertujuan untuk:
* Mempermudah pengelolaan inventaris secara menyeluruh
* Mencatat transaksi barang masuk dan keluar secara efisien
* Menyediakan laporan yang akurat untuk mendukung pengambilan keputusan bisnis

---

## 3. 🚀 Fitur Utama

Berikut adalah fitur-fitur yang tersedia dalam sistem ini:

* **🔐 Autentikasi**:
    * Login untuk peran Admin dan Manajer.
* **📊 Dashboard**:
    * Memberikan ringkasan visual mengenai status stok terkini, ringkasan transaksi (barang masuk dan keluar), dan ikhtisar performa bisnis.
* **📦 Manajemen Stok**:
    * **CRUD Produk**: Mengelola data produk (nama, deskripsi, harga, stok).
    * **Barang Masuk**: Mencatat setiap item yang masuk ke gudang.
    * **Barang Keluar**: Mencatat setiap item yang keluar dari gudang.
    * Stok otomatis terupdate setiap kali ada transaksi barang masuk atau keluar.
* **📝 Laporan**:
    * Menghasilkan laporan, termasuk laporan transaksi dan laporan stok barang.
* **👤 Manajemen Supplier**:
    * Melakukan operasi CRUD (Create, Read, Update, Delete) data supplier.
* **⏳ Riwayat Transaksi**:
    * Melihat riwayat lengkap transaksi barang masuk dan keluar untuk pelacakan yang mudah.

---

## 4. 👥 Peran Pengguna (User Roles)

| Peran       | Akses                                                                 |
|-------------|-----------------------------------------------------------------------|
| **Admin**   | Akses penuh ke semua fitur: pengelolaan produk, transaksi, stok, laporan, manajemen pemasok, dan riwayat. |
| **Manajer** | Hanya dapat melihat laporan transaksi, laporan stok, produk, dan riwayat.      |

---

## 5. 🛠 Teknologi yang Digunakan (Tech Stack)

Project ini dibangun sebagai aplikasi *fullstack* dengan menggunakan stack teknologi berikut:

| Layer       | Teknologi                        |
|-------------|----------------------------------|
| **Frontend**  | React (dengan Vite), Material-UI |
| **Backend**   | Express.js, Node.js               |
| **Database**  | PostgreSQL                        |
| **Autentikasi**| JWT (JSON Web Tokens)           |
| **Deployment**| Vercel (untuk *frontend*), Railway (untuk *backend*) |

---

## 6. 🚀 Memulai (Getting Started)

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi secara lokal.

### 🔧 Prasyarat

Pastikan Anda memiliki hal-hal berikut terinstal di sistem Anda:

* Node.js & npm
* PostgreSQL
* Git

### 📁 Struktur Proyek

```
project-root/
├── backend/    ← Direktori API Express.js
└── frontend/   ← Direktori Aplikasi React (Vite)
```

### 🖥 Menjalankan Backend (Express.js)

1.  Masuk ke direktori `backend`:
    ```bash
    cd backend
    ```
2.  Instal dependensi:
    ```bash
    npm install
    ```
3.  Jalankan server pengembangan:
    ```bash
    npm run dev
    ```
    Server akan berjalan di `http://localhost:5000`.

### 🌐 Menjalankan Frontend (Vite + React)

1.  Masuk ke direktori `frontend`:
    ```bash
    cd frontend
    ```
2.  Instal dependensi:
    ```bash
    npm install
    ```
3.  Jalankan server pengembangan:
    ```bash
    npm run dev
    ```
    Aplikasi akan tersedia di `http://localhost:5173`.