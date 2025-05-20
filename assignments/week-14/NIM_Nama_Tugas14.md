# 📌 Laporan Progres Mingguan - **Sistem Manajemen Gudang Biruni**

**Kelompok**: 7
**Anggota**:
- Adhyasta Firdaus (10231005)
- Ansellma Tita Pakartiwuri Putri (10231017)
- Dhiya Afifah (10231031)
- Gabriel Karmen Sanggalangi (10231039)

**Mitra**: PT. Biruni Altha Etam
**Pekan ke-**: 14
**Tanggal**: 20 Mei 2025

---

## 📈 Ringkasan Progres

Pada minggu ini, kami berhasil menyelesaikan .

---

## ✅ Tugas yang Diselesaikan

* **Add Report**: Menambahkan fitur add report agar user dapat membuat laporan transaksi barang Masuk/Keluar.
* **Fillter Report**:  mengimplementasikan fitur fillter report untuk membantu user dalam mencari laporan dari kriteria tertentu
* **Edit Report**: Menambahkan fitur eksport laporan untuk membantu pengguna dalam membuat laporan dengan format tertentu
* **Eksport Report**: Menambahkan fitur eksport laporan untuk membantu pengguna dalam membuat laporan dengan format tertentu
* **Visualization Dashboard**: Menambahkan fitur eksport laporan untuk membantu pengguna dalam membuat laporan dengan format tertentu
* **Notifikasi Stok Menipis**: Menambahkan fitur eksport laporan untuk membantu pengguna dalam membuat laporan dengan format tertentu


---

## ⚡ Tantangan & Solusi

| *Tantangan*                                                      | *Solusi*                                                                                             |
| :----------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| Pengujian integrasi (integration testing) gagal.                   | Memeriksa dan memperbaiki penggunaan metode HTTP (GET/POST) yang tidak sesuai, dan menyesuaikannya dengan benar sesuai dokumentasi API. |
| Gagal menambah barang karena data yang dikirimkan tidak lengkap. | Melakukan debugging pada sisi backend dan frontend untuk mengidentifikasi data yang tidak terkirim atau diterima dengan benar, kemudian memperbaiki definisi variabel/konstanta di modul Stock Management agar data yang dikirim/diterima lengkap. |

---

## 📅 Rencana Minggu Depan

* **Penyempurnaan Fitur Laporan**: Mengembangkan fitur CRUD untuk laporan, termasuk menampilkan dataset total laporan yang dibuat dan total transaksi.
* **Penyempurnaan Halaman Register**: Melanjutkan pengembangan Halaman Register, termasuk implementasi alur persetujuan admin dan notifikasi.
* **Penyempurnaan Dashboard**: Meningkatkan tampilan dan fungsionalitas halaman Dashboard agar lebih informatif.
* **Implementasi RBAC**: Mengimplementasikan Role-Based Access Control (RBAC) untuk membedakan hak akses antara pengguna dengan peran Manager dan Admin.

---

## 🤝 Kontribusi Anggota

* **Adhyasta Firdaus**: Menyempurnakan fitur CRUD Stock Management, menambahkan fitur dan API untuk Register pada controller, serta menambahkan konfigurasi terkait autentikasi.
* **Dhiya Afifah**: Menyesuaikan layout aplikasi agar mobile-friendly, serta memperbaiki form Tambah Barang pada Stock Management.
* **Ansellma Tita Pakartiwuri Putri**: Membantu tim frontend dalam penyesuaian layout agar mobile-friendly, serta membantu implementasi error handling pada desain UI/UX, menulis MD Week 12.
* **Gabriel Karmen Sanggalangi**: Melakukan analisis error handling, membantu debugging kode , serta melakukan integration test.

## 🖼️ Tangkapan Layar / Demo

Berikut adalah tangkapan layar yang menunjukkan fitur-fitur dan progres yang telah kami selesaikan pada minggu ini, meliputi Add report, Fillter Report, Edit Report, Eksport Report, Visualization Dashboard, serta Notifikasi Stok Menipis.

### 1. CRUD Report Management
- **Menambahkan Report**
<img src="2.png" alt="Tambah Report">
>
- **Hasil Penambahan Report pada Tabel**
<img src="3.png" alt="Hasil penambahan report pada tabel">
>
- **Filter Report**
<img src="4.png" alt="Fillter Report">
>
- **Hasil Fillter Report**
<img src="5.png" alt="Menghapus Barang">
>


### 2. Dashboard
- **Data Visualization**
<img src="6.png" alt="Hasil Mengedit dan Menghapus Barang">
>
- **Notifikasi Stock Menipis**
<img src="6.png" alt="Hasil Mengedit dan Menghapus Barang">
---


### 3. Endpoint Dasar

# 📦 Warehouse Management System - Dokumentasi API

### 🛠️ Authentication Endpoints
| Route             | Method | Access  | Deskripsi                                     |
| :---------------- | :----- | :------ | :-------------------------------------------- |
| `/register`       | POST   | Public  | Mendaftarkan pengguna baru.                  |
| `/login`          | POST   | Public  | Melakukan proses login pengguna.            |

---

### 📦 Stock Management Endpoints
| Route               | Method | Access  | Deskripsi                                           |
| :------------------ | :----- | :------ | :---------------------------------------------------- |
| `/stock`            | GET    | Private | Mengambil semua data stok barang. Support search, filter, sort. |
| `/stock/:id`        | GET    | Private | Mengambil satu data stok berdasarkan ID.              |
| `/stock`            | POST   | Private | Menambahkan data stok barang baru ke sistem.          |
| `/stock/:id`        | PUT    | Private | Mengubah seluruh field stok berdasarkan ID.           |
| `/stock/:id`        | DELETE | Private | Menghapus data stok barang berdasarkan ID.             |
| `/stock/incoming`   | POST   | Private | Mencatat transaksi barang masuk.                      |
| `/stock/outgoing`   | POST   | Private | Mencatat transaksi barang keluar.               
| `/history`   | POST   | Private | Mengambil riwayat masuk/keluar.                     |

---

### 6. Pengujian Integrasi (Integration Test)

- **Get Stock by ID**
  <img src="getstockbyid.jpg" alt="Get Stock by ID">
Pengujian GET `/api/stock/7` untuk mengambil data stok dengan ID 7.
- **Get All Stock**
  <img src="getallstock.jpg" alt="Get All Stock">
Pengujian GET `/api/stock/` untuk mengambil semua data stok.
- **Add New Item**
  <img src="createstock.jpg" alt="Add New Item">
 Pengujian POST `/api/stock/` untuk menambahkan data stok baru.
- **Update Existing Stock**
  <img src="updatestock.jpg" alt="Update Existing Stock">
 Pengujian PUT `/api/stock/7` untuk mengubah data stok dengan ID 7.
- **Delete Existing Stock**
  <img src="deletestock.jpg" alt="Delete Existing Stock">
Pengujian DELETE `/api/stock/7` untuk menghapus data stok dengan ID 7.
- **Added Incoming Stock**
  <img src="incoming.jpg" alt="Added Incoming Stock">
Berhasil menambahkan transaksi barang masuk menggunakan POST `/api/stock/incoming`.
- **Added Outgoing Stock**
  <img src="outgoing.jpg" alt="Added Outgoing Stock">
Berhasil menambahkan transaksi barang keluar menggunakan POST `/api/stock/outgoing`.
- **Registering New Account**
  <img src="register.jpg" alt="Registering New Account">
Berhasil mendaftarkan akun baru menggunakan POST `/api/register`.
- **Viewing History**
  <img src="gethistory.jpg" alt="RViewing History">
Berhasil menampilkan riwayat barang masuk/keluar menggunakan GET `/api/history`.

---