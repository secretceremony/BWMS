# 📦 Proyek Sistem Manajemen Inventory – PT Biruni Altha Ethan

## 1. 🎯 Latar Belakang
**PT Biruni Altha Ethan** adalah perusahaan penyedia komponen/sparepart alat berat dalam kondisi baru maupun rekondisi. Dengan harga yang kompetitif, perusahaan ini membutuhkan **pengelolaan barang yang baik dan terstruktur**.

Manajemen barang yang rapi akan:
- Menjadikan pekerjaan lebih terorganisir
- Meningkatkan keakuratan data
- Mendukung peningkatan penjualan secara signifikan

---

## 2. 🎯 Tujuan
Membangun **aplikasi web** untuk:
- Membantu pengelolaan inventory
- Mencatat transaksi secara efisien
- Menyediakan laporan yang mendukung pengambilan keputusan bisnis

---

## 3. 🚀 Fitur MVP (Minimum Viable Product)

- **🔐 Autentikasi**
  - Login untuk admin dan manager

- **📦 Manajemen Produk**
  - CRUD produk (nama, deskripsi, harga, stok)

- **📈 Manajemen Stok**
  - Stok otomatis terupdate saat terjadi transaksi

- **📊 Dashboard**
  - Ringkasan penjualan dan status stok terkini

- **📝 Laporan**
  - Laporan penjualan harian & bulanan
  - Laporan ketersediaan stok

---

## 4. 👥 User Roles

| Role    | Akses                                                                 |
|---------|-----------------------------------------------------------------------|
| **Admin**   | Akses penuh ke semua fitur: produk, transaksi, stok, dan semua laporan |
| **Manager** | Hanya dapat melihat laporan transaksi, laporan stok, dan produk      |

---

## 5. 🛠 Tech Stack

| Layer       | Teknologi                        |
|-------------|----------------------------------|
| **Frontend**  | React (Vite), Material-UI         |
| **Backend**   | Express.js, Node.js               |
| **Database**  | PostgreSQL                        |
| **Auth**      | JWT                               |
| **Deployment**| Vercel (frontend), Railway (backend) |

---


# 🛠 Fullstack App - Vite + Express + PostgreSQL + JWT

Project ini merupakan aplikasi fullstack dengan stack sebagai berikut:

- *Frontend*: React (Vite) + Material UI
- *Backend*: Express.js + Node.js
- *Database*: PostgreSQL
- *Authentication*: JWT
- *Deployment*: Vercel (frontend), Railway (backend)

---

## 🚀 Getting Started - Jalankan Secara Lokal

### 🔧 Prasyarat

- Node.js & npm
- PostgreSQL
- Git

---

## 📁 Struktur Project


project-root/
├── backend/      ← Express.js API
└── frontend/     ← Vite + React App


---

## 🖥 Menjalankan Backend (Express.js)

### 1. Masuk ke folder backend
bash
cd backend


### 2. Install dependencies
bash
npm install


### 3. Jalankan server
bash
npm run dev


Server akan berjalan di http://localhost:5000

---

## 🌐 Menjalankan Frontend (Vite + React)

### 1. Masuk ke folder frontend
bash
cd frontend


### 2. Install dependencies
bash
npm install


### 4. Jalankan development server
bash
npm run dev


Aplikasi akan muncul di http://localhost:5173

---

## 🔐 Fitur Autentikasi (JWT)

- Register/Login akan menghasilkan JWT token
- Token dikirim melalui Authorization header
- Middleware auth.js memverifikasi token untuk endpoint yang dilindungi

