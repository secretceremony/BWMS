# 📘 User Manual – Biruni Warehouse Management System (BWMS)

## 1. Pendahuluan
Panduan ini ditujukan bagi pengguna sistem BWMS, yaitu **Admin** dan **Manajer**, untuk membantu memahami cara menggunakan fitur-fitur yang tersedia dalam sistem pengelolaan gudang.

---

## 2. Hak Akses Pengguna

| Role      | Akses Fitur                                                                 |
|-----------|------------------------------------------------------------------------------|
| **Admin** | Mengelola data barang, supplier, transaksi, laporan, lokasi, dan akun       |
| **Manajer** | Melihat laporan, dashboard, riwayat transaksi, notifikasi, dan analisis stok |

---

## 3. Panduan Penggunaan Fitur

### 🔐 Login
- **Langkah:**
  1. Masukkan email dan password.
  2. Klik tombol **Login**.
- **Jika gagal:** Periksa kembali kredensial atau hubungi Admin.

---

### 📦 Manajemen Stok Barang (Admin)
- **Menu:** `Stok Barang`
- **Fitur:**
  - **Tambah Barang:** Isi nama, kategori, jumlah, supplier, dan lokasi → klik **Simpan**
  - **Ubah Barang:** Klik **Edit**, ubah informasi, lalu **Simpan**
  - **Hapus Barang:** Klik **Hapus** → konfirmasi
  - **Cari & Filter:** Gunakan kolom pencarian atau filter berdasarkan kategori/supplier

---

### 📥 Barang Masuk (Admin)
- **Menu:** `Barang Masuk`
- **Langkah:**
  1. Pilih item dari daftar
  2. Masukkan jumlah, tanggal, dan supplier
  3. Klik **Simpan**
- **Catatan:** Stok akan otomatis bertambah dan dicatat dalam riwayat transaksi

---

### 📤 Barang Keluar (Admin)
- **Menu:** `Barang Keluar`
- **Langkah:**
  1. Pilih item
  2. Masukkan jumlah, tanggal, dan tujuan pengiriman
  3. Klik **Simpan**
- **Catatan:** Sistem akan memvalidasi ketersediaan stok

---

### 📜 Riwayat Transaksi (Admin & Manajer)
- **Menu:** `Riwayat`
- **Fungsi:**
  - Menampilkan log transaksi barang masuk dan keluar
  - Gunakan filter tanggal, barang, atau jenis transaksi
  - Klik detail untuk melihat catatan lengkap

---

### 🧾 Laporan (Admin & Manajer)
- **Menu:** `Laporan`
- **Langkah:**
  1. Pilih jenis laporan (stok / transaksi)
  2. Atur filter: kategori, tanggal, supplier
  3. Klik **Tampilkan**
  4. Ekspor ke PDF / Excel jika diperlukan
  5. Manajer dapat mencetak atau mengirim laporan melalui email

---

### 📊 Dashboard (Admin & Manajer)
- Menampilkan:
  - Total stok barang
  - Barang masuk & keluar terbaru
  - Grafik pergerakan stok
  - Notifikasi penting (stok menipis, transaksi besar)

---

### 📍 Manajemen Lokasi Penyimpanan (Admin)
- **Menu:** `Lokasi`
- **Fitur:**
  - Tambah lokasi baru dengan nama dan kapasitas maksimal
  - Ubah nama atau kapasitas lokasi
  - Hapus lokasi jika tidak digunakan

---

### 👤 Pengelolaan Akun Pengguna (Admin)
- **Menu:** `Pengguna`
- **Fitur:**
  - Tambah pengguna baru (Admin/Manajer)
  - Ubah informasi akun (email, username, password)
  - Reset password
  - Hapus akun jika tidak aktif

---

### 🏢 Pengelolaan Supplier (Admin)
- **Menu:** `Supplier`
- **Fitur:**
  - Tambah supplier dengan nama, alamat, dan kontak
  - Edit informasi supplier
  - Hapus supplier jika tidak digunakan lagi
  - Gunakan filter nama/kategori untuk pencarian cepat

---

### 🔔 Notifikasi Otomatis (Manajer)
- Sistem memberikan notifikasi real-time untuk:
  - **Stok kritis** (di bawah ambang batas)
  - **Transaksi masuk/keluar besar**
  - **Laporan yang perlu ditinjau**

---

### 📈 Analisis Pergerakan Stok (Manajer)
- **Menu:** `Analisis`
- Menampilkan grafik tren pergerakan stok (harian, mingguan, bulanan)
- Membantu manajer melihat pola distribusi dan prediksi kebutuhan stok

---

## Logout
- Klik ikon profil di pojok kanan atas → pilih **Logout**
- Sistem akan keluar dan kembali ke halaman login

---

