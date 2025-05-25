# 📚 API Documentation – Biruni Warehouse Management System (BWMS) - PT Biruni Altha Ethan

Dokumentasi ini menjelaskan semua *endpoint* API yang tersedia untuk berinteraksi dengan sistem manajemen inventaris.

---

## 1. 🔑 Autentikasi

Semua *endpoint* yang memerlukan autentikasi dilindungi dengan JWT (JSON Web Tokens). Untuk mengaksesnya, Anda harus menyertakan token JWT yang valid dalam *header* `Authorization` sebagai *Bearer Token*.

### `POST /api/register`
* **Deskripsi**: Mendaftarkan pengguna baru. Role default adalah 'manager' jika tidak disebutkan atau tidak valid.
* **Akses**: Public
* **Request Body (JSON)**:
    ```json
    {
        "username": "string (wajib)",
        "email": "string (wajib, harus unik)",
        "password": "string (wajib)",
        "role": "string (opsional, 'admin' atau 'manager'. Default: 'manager')"
    }
    ```
* **Response (201 Created) (JSON)**:
    ```json
    {
        "message": "Registrasi berhasil!",
        "user": {
            "id": "uuid",
            "email": "string",
            "username": "string",
            "role": "string"
        }
    }
    ```
* **Response (400 Bad Request) (JSON)**:
    ```json
    {
        "error": "Email, username, dan password dibutuhkan."
    }
    ```
    ATAU
    ```json
    {
        "error": "Email sudah terdaftar."
    }
    ```
    ATAU
    ```json
    {
        "error": "Username sudah digunakan."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan saat registrasi."
    }
    ```

### `POST /api/login`
* **Deskripsi**: Mengautentikasi pengguna dan mengembalikan token JWT serta data pengguna.
* **Akses**: Public
* **Request Body (JSON)**:
    ```json
    {
        "email": "string (wajib)",
        "password": "string (wajib)"
    }
    ```
* **Response (200 OK) (JSON)**:
    ```json
    {
        "message": "Login berhasil!",
        "token": "string (JWT)",
        "user": {
            "id": "uuid",
            "email": "string",
            "username": "string",
            "role": "string"
        }
    }
    ```
* **Response (400 Bad Request) (JSON)**:
    ```json
    {
        "error": "Email dan password dibutuhkan."
    }
    ```
* **Response (401 Unauthorized) (JSON)**:
    ```json
    {
        "error": "Email atau password salah."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan saat login."
    }
    ```

### `GET /api/auth/logout`
* **Deskripsi**: Secara konseptual, logout untuk JWT dilakukan di sisi klien dengan menghapus token. Endpoint ini hanya mengembalikan pesan sukses.
* **Akses**: Authenticated (tidak wajib secara teknis, tapi ini adalah endpoint yang biasanya ada)
* **Response (200 OK) (JSON)**:
    ```json
    {
        "message": "Logout berhasil."
    }
    ```

---

## 2. 👤 Manajemen Pengguna (User Management)

*Catatan: Endpoint ini umumnya hanya dapat diakses oleh **Admin**.*

### `GET /api/users`
* **Deskripsi**: Mendapatkan daftar semua pengguna terdaftar.
* **Akses**: Admin
* **Response (200 OK) (JSON)**:
    ```json
    [
        {
            "id": "uuid",
            "username": "string",
            "email": "string",
            "role": "string"
        }
    ]
    ```
* **Response (403 Forbidden) (JSON)**:
    ```json
    {
        "error": "Hanya admin yang boleh mengakses."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Gagal mengambil data user."
    }
    ```

### `POST /api/users`
* **Deskripsi**: Menambah pengguna baru (hanya oleh Admin). Role default 'manager' jika tidak disediakan.
* **Akses**: Admin
* **Request Body (JSON)**:
    ```json
    {
        "username": "string (wajib)",
        "email": "string (wajib)",
        "password": "string (wajib)",
        "role": "string (opsional, 'admin' atau 'manager'. Default: 'manager')"
    }
    ```
* **Response (201 Created) (JSON)**:
    ```json
    {
        "id": "uuid",
        "username": "string",
        "email": "string",
        "role": "string"
    }
    ```
* **Response (400 Bad Request) (JSON)**:
    ```json
    {
        "error": "Username, email, dan password wajib diisi."
    }
    ```
* **Response (403 Forbidden) (JSON)**:
    ```json
    {
        "error": "Hanya admin yang boleh mengakses."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Gagal menambah user."
    }
    ```

### `PUT /api/users/:id`
* **Deskripsi**: Memperbarui detail pengguna (hanya oleh Admin).
* **Akses**: Admin
* **Parameters**: `id` (UUID) - ID pengguna yang akan diperbarui.
* **Request Body (JSON)**:
    ```json
    {
        "username": "string (wajib)",
        "email": "string (wajib)",
        "role": "string (wajib, 'admin' atau 'manager')"
    }
    ```
* **Response (200 OK) (JSON)**:
    ```json
    {
        "id": "uuid",
        "username": "string",
        "email": "string",
        "role": "string"
    }
    ```
* **Response (403 Forbidden) (JSON)**:
    ```json
    {
        "error": "Hanya admin yang boleh mengakses."
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "error": "User tidak ditemukan."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Gagal update user."
    }
    ```

### `DELETE /api/users/:id`
* **Deskripsi**: Menghapus pengguna (hanya oleh Admin).
* **Akses**: Admin
* **Parameters**: `id` (UUID) - ID pengguna yang akan dihapus.
* **Response (200 OK) (JSON)**:
    ```json
    {
        "message": "User berhasil dihapus."
    }
    ```
* **Response (403 Forbidden) (JSON)**:
    ```json
    {
        "error": "Hanya admin yang boleh mengakses."
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "error": "User tidak ditemukan."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Gagal hapus user."
    }
    ```

---

## 3. 👤 Profil Pengguna (Authenticated User Profile)

*Catatan: Endpoint ini untuk pengguna yang sedang login untuk melihat dan mengelola profil mereka sendiri.*

### `GET /api/user/profile`
* **Deskripsi**: Mendapatkan detail profil pengguna yang sedang login.
* **Akses**: Authenticated
* **Response (200 OK) (JSON)**:
    ```json
    {
        "user": {
            "id": "uuid",
            "email": "string",
            "username": "string",
            "role": "string"
        }
    }
    ```

### `PUT /api/user/profile`
* **Deskripsi**: Memperbarui username dan email pengguna yang sedang login. Mengembalikan token baru jika ada perubahan.
* **Akses**: Authenticated
* **Request Body (JSON)**:
    ```json
    {
        "username": "string (wajib)",
        "email": "string (wajib)"
    }
    ```
* **Response (200 OK) (JSON)**:
    ```json
    {
        "message": "Profil berhasil diperbarui!",
        "user": {
            "id": "uuid",
            "username": "string",
            "email": "string",
            "role": "string"
        },
        "token": "string (JWT baru)"
    }
    ```
* **Response (400 Bad Request) (JSON)**:
    ```json
    {
        "error": "Username dan email dibutuhkan."
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "error": "User tidak ditemukan atau sudah dihapus."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan saat memperbarui profil."
    }
    ```

### `PUT /api/user/change-password`
* **Deskripsi**: Mengubah password pengguna yang sedang login.
* **Akses**: Authenticated
* **Request Body (JSON)**:
    ```json
    {
        "currentPassword": "string (wajib)",
        "newPassword": "string (wajib)"
    }
    ```
* **Response (200 OK) (JSON)**:
    ```json
    {
        "message": "Password berhasil diubah!",
        "user": {
            "id": "uuid",
            "username": "string",
            "email": "string",
            "role": "string"
        },
        "token": "string (JWT baru)"
    }
    ```
* **Response (400 Bad Request) (JSON)**:
    ```json
    {
        "error": "Password lama dan baru dibutuhkan."
    }
    ```
* **Response (401 Unauthorized) (JSON)**:
    ```json
    {
        "error": "Password saat ini tidak sesuai."
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "error": "User tidak ditemukan."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan saat mengubah password."
    }
    ```

---

## 4. 📦 Manajemen Produk (Stock Items)

*Catatan: Anda menamai tabel `stock` di database Anda, jadi ini adalah manajemen item/produk yang ada di gudang.*

### `GET /api/stock`
* **Deskripsi**: Mendapatkan daftar semua item stok dengan opsi filter, *sort*, dan *search*.
* **Akses**: Admin, Manager
* **Query Parameters (Optional)**:
    * `category`: `string` - Filter berdasarkan kategori produk.
    * `supplier`: `string` - Filter berdasarkan pemasok.
    * `sort`: `string` - Urutan data. Pilihan: `stokTerbanyak`, `stokTerkecil`. Default: `id ASC`.
    * `q`: `string` - *Search term* untuk nama, part number, id, remarks, category, atau supplier.
    * `status`: `string` - Filter berdasarkan status item.
    * `uom`: `string` - Filter berdasarkan unit of measure (UOM).
* **Response (200 OK) (JSON)**:
    ```json
    [
        {
            "id": "uuid",
            "name": "string",
            "part_number": "string",
            "category": "string",
            "quantity": "integer", // Ini adalah 'stock' di FE
            "supplier": "string",
            "status": "string",
            "uom": "string",
            "remarks": "string",
            "price": "number"
        }
    ]
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat mengambil data stock"
    }
    ```

### `GET /api/stock/:id`
* **Deskripsi**: Mendapatkan detail item stok berdasarkan ID.
* **Akses**: Admin, Manager
* **Parameters**: `id` (UUID) - ID item stok.
* **Response (200 OK) (JSON)**:
    ```json
    {
        "id": "uuid",
        "name": "string",
        "part_number": "string",
        "category": "string",
        "quantity": "integer",
        "supplier": "string",
        "status": "string",
        "uom": "string",
        "remarks": "string",
        "price": "number"
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "message": "Item stock tidak ditemukan"
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat mengambil data stock"
    }
    ```

### `POST /api/stock`
* **Deskripsi**: Menambahkan item stok baru.
* **Akses**: Admin
* **Request Body (JSON)**:
    ```json
    {
        "name": "string (wajib)",
        "part_number": "string (wajib, harus unik jika ada constraint)",
        "category": "string (wajib)",
        "quantity": "integer (wajib, >= 0)",
        "supplier": "string (wajib)",
        "status": "string (wajib)",
        "uom": "string (wajib)",
        "remarks": "string (opsional)",
        "price": "number (wajib, >= 0)"
    }
    ```
* **Response (201 Created) (JSON)**:
    ```json
    {
        "id": "uuid",
        "name": "string",
        "part_number": "string",
        "category": "string",
        "quantity": "integer",
        "supplier": "string",
        "status": "string",
        "uom": "string",
        "remarks": "string",
        "price": "number"
    }
    ```
* **Response (400 Bad Request) (JSON)**:
    ```json
    {
        "error": "Field yang dibutuhkan (name, part_number, category, quantity, supplier, status, uom, price) tidak lengkap."
    }
    ```
* **Response (409 Conflict) (JSON)**:
    ```json
    {
        "error": "Part Number '...' already exists."
    }
    ```
    ATAU
    ```json
    {
        "error": "Duplicate entry violates unique constraint."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat menambah data stock"
    }
    ```

### `PUT /api/stock/:id`
* **Deskripsi**: Memperbarui detail item stok yang ada.
* **Akses**: Admin
* **Parameters**: `id` (UUID) - ID item stok.
* **Request Body (JSON)**:
    ```json
    {
        "name": "string (opsional)",
        "part_number": "string (opsional, harus unik jika berubah)",
        "category": "string (opsional)",
        "quantity": "integer (opsional, >= 0)",
        "supplier": "string (opsional)",
        "status": "string (opsional)",
        "uom": "string (opsional)",
        "remarks": "string (opsional)",
        "price": "number (opsional, >= 0)"
    }
    ```
* **Response (200 OK) (JSON)**:
    ```json
    {
        "id": "uuid",
        "name": "string",
        "part_number": "string",
        "category": "string",
        "quantity": "integer",
        "supplier": "string",
        "status": "string",
        "uom": "string",
        "remarks": "string",
        "price": "number"
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "message": "Item stock tidak ditemukan"
    }
    ```
* **Response (409 Conflict) (JSON)**:
    ```json
    {
        "error": "Part Number '...' already exists."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat mengupdate data stock"
    }
    ```

### `DELETE /api/stock/:id`
* **Deskripsi**: Menghapus item stok.
* **Akses**: Admin
* **Parameters**: `id` (UUID) - ID item stok.
* **Response (200 OK) (JSON)**:
    ```json
    {
        "message": "Item stock berhasil dihapus"
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "message": "Item stock tidak ditemukan"
    }
    ```
* **Response (409 Conflict) (JSON)**:
    ```json
    {
        "error": "Cannot delete stock item because it has associated history records."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat menghapus data stock"
    }
    ```

---

## 5. 📦 Transaksi Stok (Barang Masuk & Keluar)

### `POST /api/stock/incoming`
* **Deskripsi**: Mencatat transaksi barang masuk. Stok produk akan otomatis bertambah.
* **Akses**: Admin
* **Request Body (JSON)**:
    ```json
    {
        "itemId": "uuid (wajib)",
        "quantity": "integer (wajib, >= 1)",
        "remarks": "string (opsional)",
        "transactionDate": "string (wajib, format YYYY-MM-DD atau ISO Date string)",
        "source": "string (opsional, misal: 'Pembelian', 'Retur')",
        "documentRef": "string (opsional, misal: 'PO-123', 'INV-ABC')",
        "location": "string (opsional, misal: 'Gudang Utama', 'Area Penerimaan')"
    }
    ```
* **Response (200 OK) (JSON)**:
    ```json
    {
        "id": "uuid",
        "stock": "integer (stok terbaru setelah transaksi)"
    }
    ```
* **Response (400 Bad Request) (JSON)**:
    ```json
    {
        "error": "Field yang dibutuhkan (itemId, quantity, transactionDate) tidak lengkap atau quantity tidak valid."
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "error": "Item stock tidak ditemukan."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat mencatat barang masuk."
    }
    ```

### `POST /api/stock/outgoing`
* **Deskripsi**: Mencatat transaksi barang keluar. Stok produk akan otomatis berkurang.
* **Akses**: Admin
* **Request Body (JSON)**:
    ```json
    {
        "itemId": "uuid (wajib)",
        "quantity": "integer (wajib, >= 1)",
        "remarks": "string (opsional)",
        "transactionDate": "string (wajib, format YYYY-MM-DD atau ISO Date string)",
        "source": "string (opsional, misal: 'Penjualan', 'Pengiriman')",
        "documentRef": "string (opsional, misal: 'DO-456', 'INV-XYZ')",
        "location": "string (opsional, misal: 'Area Pengiriman', 'Showroom')"
    }
    ```
* **Response (200 OK) (JSON)**:
    ```json
    {
        "id": "uuid",
        "stock": "integer (stok terbaru setelah transaksi)"
    }
    ```
* **Response (400 Bad Request) (JSON)**:
    ```json
    {
        "error": "Field yang dibutuhkan (itemId, quantity, transactionDate) tidak lengkap atau quantity tidak valid."
    }
    ```
    ATAU
    ```json
    {
        "error": "Stok tidak mencukupi untuk transaksi ini."
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "error": "Item stock tidak ditemukan."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat mencatat barang keluar."
    }
    ```

---

## 6. ⏳ Riwayat Stok (Stock History / Reports)

*Catatan: Dalam kode Anda, `getAllReports` dari `reportsController` dan `getStockHistory` dari `stockController` tampaknya melayani tujuan yang sama (riwayat transaksi). Saya akan menggabungkan menjadi satu bagian riwayat/laporan transaksi utama.*

### `GET /api/history/stock`
* **Deskripsi**: Mendapatkan riwayat lengkap semua transaksi stok (barang masuk dan keluar). Mendukung filter dan pencarian.
* **Akses**: Admin, Manager
* **Query Parameters (Optional)**:
    * `startDate`: `YYYY-MM-DD` - Filter transaksi setelah atau pada tanggal ini.
    * `endDate`: `YYYY-MM-DD` - Filter transaksi sebelum atau pada tanggal ini.
    * `type`: `enum('incoming', 'outgoing')` - Filter berdasarkan jenis transaksi.
    * `item_id`: `uuid` - Filter berdasarkan ID item.
* **Response (200 OK) (JSON)**:
    ```json
    [
        {
            "id": "uuid",
            "item_id": "uuid",
            "quantity_change": "integer",
            "transaction_type": "string ('incoming' atau 'outgoing')",
            "transaction_date": "datetime",
            "remarks": "string",
            "created_at": "datetime",
            "source": "string",
            "document_ref": "string",
            "location": "string",
            "item_name": "string",
            "part_number": "string",
            "category": "string",
            "supplier": "string",
            "price": "number"
        }
    ]
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat mengambil data riwayat stock."
    }
    ```

### `GET /api/history/stock/:id`
* **Deskripsi**: Mendapatkan detail transaksi riwayat stok berdasarkan ID.
* **Akses**: Admin, Manager
* **Parameters**: `id` (UUID) - ID riwayat transaksi.
* **Response (200 OK) (JSON)**:
    ```json
    {
        "id": "uuid",
        "item_id": "uuid",
        "quantity_change": "integer",
        "transaction_type": "string ('incoming' atau 'outgoing')",
        "transaction_date": "datetime",
        "remarks": "string",
        "created_at": "datetime",
        "source": "string",
        "document_ref": "string",
        "location": "string",
        "item_name": "string",
        "part_number": "string",
        "category": "string",
        "supplier": "string",
        "price": "number"
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "message": "Laporan tidak ditemukan"
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat mengambil data laporan"
    }
    ```

### `PUT /api/history/stock/:id`
* **Deskripsi**: Memperbarui detail entri riwayat stok. Ini akan menyesuaikan stok produk yang terkait.
* **Akses**: Admin
* **Parameters**: `id` (UUID) - ID riwayat transaksi yang akan diperbarui.
* **Request Body (JSON)**:
    ```json
    {
        "item_id": "uuid (wajib)",
        "quantity_change": "integer (wajib, bisa positif atau negatif)",
        "transaction_type": "string (wajib, 'incoming' atau 'outgoing')",
        "transaction_date": "string (wajib, format YYYY-MM-DD atau ISO Date string)",
        "remarks": "string (opsional)",
        "source": "string (opsional)",
        "document_ref": "string (opsional)",
        "location": "string (opsional)"
    }
    ```
* **Response (200 OK) (JSON)**:
    ```json
    {
        "id": "uuid",
        "item_id": "uuid",
        "quantity_change": "integer",
        "transaction_type": "string",
        "transaction_date": "datetime",
        "remarks": "string",
        "created_at": "datetime",
        "source": "string",
        "document_ref": "string",
        "location": "string",
        "item_name": "string",
        "part_number": "string",
        "category": "string",
        "supplier": "string",
        "price": "number"
    }
    ```
* **Response (400 Bad Request) (JSON)**:
    ```json
    {
        "error": "Field yang dibutuhkan (item_id, quantity_change, transaction_type, transaction_date) tidak lengkap."
    }
    ```
    ATAU
    ```json
    {
        "error": "Stok tidak mencukupi untuk perubahan ini"
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "message": "Laporan tidak ditemukan"
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat mengupdate laporan"
    }
    ```

### `DELETE /api/history/stock/:id`
* **Deskripsi**: Menghapus entri riwayat stok. Ini akan membatalkan efek pada stok produk yang terkait.
* **Akses**: Admin
* **Parameters**: `id` (UUID) - ID riwayat transaksi yang akan dihapus.
* **Response (200 OK) (JSON)**:
    ```json
    {
        "message": "Laporan berhasil dihapus"
    }
    ```
* **Response (400 Bad Request) (JSON)**:
    ```json
    {
        "error": "Tidak dapat menghapus laporan ini karena akan menyebabkan stok negatif"
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "message": "Laporan tidak ditemukan"
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat menghapus laporan"
    }
    ```

---

## 7. 👤 Manajemen Pemasok

### `GET /api/suppliers`
* **Deskripsi**: Mendapatkan daftar semua pemasok yang terdaftar.
* **Akses**: Admin
* **Response (200 OK) (JSON)**:
    ```json
    [
        {
            "id": "uuid",
            "name": "string",
            "contact_person": "string",
            "phone": "string",
            "email": "string",
            "address": "string",
            "created_at": "datetime",
            "updated_at": "datetime"
        }
    ]
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat mengambil data supplier"
    }
    ```

### `GET /api/suppliers/:id`
* **Deskripsi**: Mendapatkan detail pemasok berdasarkan ID.
* **Akses**: Admin
* **Parameters**: `id` (UUID) - ID pemasok.
* **Response (200 OK) (JSON)**:
    ```json
    {
        "id": "uuid",
        "name": "string",
        "contact_person": "string",
        "phone": "string",
        "email": "string",
        "address": "string",
        "created_at": "datetime",
        "updated_at": "datetime"
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "message": "Supplier tidak ditemukan"
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat mengambil data supplier"
    }
    ```

### `POST /api/suppliers`
* **Deskripsi**: Menambahkan pemasok baru.
* **Akses**: Admin
* **Request Body (JSON)**:
    ```json
    {
        "name": "string (wajib, harus unik)",
        "contact_person": "string (opsional)",
        "phone": "string (opsional)",
        "email": "string (opsional)",
        "address": "string (opsional)"
    }
    ```
* **Response (201 Created) (JSON)**:
    ```json
    {
        "id": "uuid",
        "name": "string",
        "contact_person": "string",
        "phone": "string",
        "email": "string",
        "address": "string",
        "created_at": "datetime",
        "updated_at": "datetime"
    }
    ```
* **Response (400 Bad Request) (JSON)**:
    ```json
    {
        "error": "Nama supplier wajib diisi."
    }
    ```
* **Response (409 Conflict) (JSON)**:
    ```json
    {
        "error": "Supplier dengan nama tersebut sudah ada."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat menambah supplier baru"
    }
    ```

### `PUT /api/suppliers/:id`
* **Deskripsi**: Memperbarui detail pemasok.
* **Akses**: Admin
* **Parameters**: `id` (UUID) - ID pemasok.
* **Request Body (JSON)**:
    ```json
    {
        "name": "string (wajib, harus unik jika berubah)",
        "contact_person": "string (opsional)",
        "phone": "string (opsional)",
        "email": "string (opsional)",
        "address": "string (opsional)"
    }
    ```
* **Response (200 OK) (JSON)**:
    ```json
    {
        "id": "uuid",
        "name": "string",
        "contact_person": "string",
        "phone": "string",
        "email": "string",
        "address": "string",
        "created_at": "datetime",
        "updated_at": "datetime"
    }
    ```
* **Response (400 Bad Request) (JSON)**:
    ```json
    {
        "error": "Nama supplier wajib diisi."
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "message": "Supplier tidak ditemukan"
    }
    ```
* **Response (409 Conflict) (JSON)**:
    ```json
    {
        "error": "Supplier dengan nama tersebut sudah ada."
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat mengupdate supplier"
    }
    ```

### `DELETE /api/suppliers/:id`
* **Deskripsi**: Menghapus pemasok. Tidak dapat dihapus jika masih terkait dengan item stok.
* **Akses**: Admin
* **Parameters**: `id` (UUID) - ID pemasok.
* **Response (200 OK) (JSON)**:
    ```json
    {
        "message": "Supplier berhasil dihapus",
        "id": "uuid"
    }
    ```
* **Response (400 Bad Request) (JSON)**:
    ```json
    {
        "error": "Supplier tidak dapat dihapus karena masih digunakan dalam data stok",
        "itemCount": "integer"
    }
    ```
* **Response (404 Not Found) (JSON)**:
    ```json
    {
        "message": "Supplier tidak ditemukan"
    }
    ```
* **Response (500 Internal Server Error) (JSON)**:
    ```json
    {
        "error": "Terjadi kesalahan server saat menghapus supplier"
    }
    ```