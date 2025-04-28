// backend/src/controllers/stockController.js
const pool = require("../db"); // Pastikan path benar ke db.js

// Mengambil semua data stock dengan filter, sort, dan search
const getAllStock = async (req, res) => {
  // Ambil parameter dari query string
  const { category, supplier, sort, q, status, uom } = req.query;

  let query = 'SELECT id, name, part_number, category, quantity, supplier, status, uom, remarks FROM stock';
  const queryParams = [];
  const conditions = [];

  // Tambahkan kondisi filtering
  if (category) {
    conditions.push(`category = $${queryParams.length + 1}`);
    queryParams.push(category);
  }
  if (supplier) {
    conditions.push(`supplier = $${queryParams.length + 1}`);
    queryParams.push(supplier);
  }
   if (status) {
    conditions.push(`status = $${queryParams.length + 1}`);
    queryParams.push(status);
  }
   if (uom) {
    conditions.push(`uom = $${queryParams.length + 1}`);
    queryParams.push(uom);
  }

  // Tambahkan kondisi search (mencari di beberapa kolom)
  if (q) {
    const searchTerm = `%${q}%`;
    // SESUAIKAN KOLOM PENCARIAN DAN TAMBAHKAN ::text PADA KOLOM NUMERIK
    conditions.push(`(name ILIKE $${queryParams.length + 1} OR id::text ILIKE $${queryParams.length + 2} OR part_number::text ILIKE $${queryParams.length + 3} OR remarks ILIKE $${queryParams.length + 4})`);
    // Pastikan jumlah parameter (sebanyak searchTerm di push) sesuai dengan jumlah placeholder $ di atas
    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  // Tambahkan sorting
  let orderBy = '';
  if (sort === 'stokTerbanyak') {
    orderBy = 'quantity DESC';
  } else if (sort === 'stokTerkecil') {
    orderBy = 'quantity ASC';
  }
  // Tambahkan sort default jika tidak ada sort spesifik
   else {
      orderBy = 'id ASC'; // Default sort by ID ascending
   }

  if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
  }


  console.log("Executing stock query:", query, queryParams); // Debug query
  try {
    const result = await pool.query(query, queryParams);
    // Mapping kolom quantity ke stock untuk kompatibilitas frontend
    const items = result.rows.map(row => ({
        ...row,
        stock: row.quantity // Mapping quantity ke stock
    }));
    res.json(items);
  } catch (err) {
    console.error('Error fetching stock:', err.message || err);
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil data stock' });
  }
};

// Mengambil data stock berdasarkan ID
const getStockById = async (req, res) => {
    const { id } = req.params;
    try {
        // Sesuaikan query dan kolom
        const result = await pool.query('SELECT id, name, part_number, category, quantity, supplier, status, uom, remarks FROM stock WHERE id = $1', [id]);
         if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Item stock tidak ditemukan' });
        }
         // Mapping kolom quantity ke stock
        const item = {
             ...result.rows[0],
             stock: result.rows[0].quantity
        };
        res.json(item);
    } catch (err) {
        console.error('Error fetching stock by ID:', err.message || err);
        res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil data stock' });
    }
};

// Menambah data stock baru
const createStock = async (req, res) => {
    // Sesuaikan kolom dengan body request
    const { name, part_number, category, quantity, supplier, status, uom, remarks } = req.body;

    try {
        // Basic validation
        if (!name || part_number === undefined || part_number === null || !category || quantity === undefined || quantity === null || !supplier || !status || !uom) { // Added check for undefined/null for numeric types
            return res.status(400).json({ error: "Field yang dibutuhkan (name, part_number, category, quantity, supplier, status, uom) tidak lengkap." });
        }

        // Sesuaikan query INSERT dan kolom
        const result = await pool.query(
            'INSERT INTO stock (name, part_number, category, quantity, supplier, status, uom, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, part_number, category, quantity, supplier, status, uom, remarks',
            [name, part_number, category, quantity, supplier, status, uom, remarks]
        );
        const newItem = result.rows[0];

         // Mapping kolom quantity ke stock untuk response
        const responseItem = {
            ...newItem,
            stock: newItem.quantity
        };

        res.status(201).json(responseItem); // 201 Created

    } catch (err) {
        console.error('Error creating stock:', err.message || err);
        // Tangani error UNIQUE violation jika part_number harus unik
        if (err.code === '23505') { // Kode error PostgreSQL untuk unique_violation
             return res.status(409).json({ error: 'Part Number sudah ada.' });
        }
        res.status(500).json({ error: 'Terjadi kesalahan server saat menambah data stock' });
    }
};

// Mengupdate data stock yang ada
const updateStock = async (req, res) => {
    const { id } = req.params;
    // Sesuaikan kolom dengan body request
    const { name, part_number, category, quantity, supplier, status, uom, remarks } = req.body;

    try {
         // Fetch item yang ada untuk validasi atau merge data
        const existingItemResult = await pool.query('SELECT * FROM stock WHERE id = $1', [id]);
        if (existingItemResult.rows.length === 0) {
            return res.status(404).json({ message: 'Item stock tidak ditemukan' });
        }
        const existingItem = existingItemResult.rows[0];


        // Gunakan nilai dari body atau nilai yang sudah ada jika tidak disediakan di body
        const updatedName = name !== undefined ? name : existingItem.name;
        const updatedPartNumber = part_number !== undefined ? part_number : existingItem.part_number;
        const updatedCategory = category !== undefined ? category : existingItem.category;
        const updatedQuantity = quantity !== undefined ? quantity : existingItem.quantity;
        const updatedSupplier = supplier !== undefined ? supplier : existingItem.supplier;
        const updatedStatus = status !== undefined ? status : existingItem.status;
        const updatedUom = uom !== undefined ? uom : existingItem.uom;
        const updatedRemarks = remarks !== undefined ? remarks : existingItem.remarks;


        // Sesuaikan query UPDATE dan kolom
        const result = await pool.query(
            'UPDATE stock SET name = $1, part_number = $2, category = $3, quantity = $4, supplier = $5, status = $6, uom = $7, remarks = $8 WHERE id = $9 RETURNING id, name, part_number, category, quantity, supplier, status, uom, remarks',
            [updatedName, updatedPartNumber, updatedCategory, updatedQuantity, updatedSupplier, updatedStatus, updatedUom, updatedRemarks, id]
        );

        const updatedItem = result.rows[0];

        // Mapping kolom quantity ke stock untuk response
        const responseItem = {
            ...updatedItem,
            stock: updatedItem.quantity
        };

        res.json(responseItem); // 200 OK

    } catch (err) {
        console.error('Error updating stock:', err.message || err);
         if (err.code === '23505') { // Kode error PostgreSQL untuk unique_violation
             return res.status(409).json({ error: 'Part Number sudah ada.' });
        }
        res.status(500).json({ error: 'Terjadi kesalahan server saat mengupdate data stock' });
    }
};

// Menghapus data stock
const deleteStock = async (req, res) => {
    const { id } = req.params;

    try {
        // Cek apakah item ada sebelum menghapus (opsional tapi baik)
        const checkItem = await pool.query('SELECT id FROM stock WHERE id = $1', [id]);
        if (checkItem.rows.length === 0) {
            return res.status(404).json({ message: 'Item stock tidak ditemukan' });
        }

        // Lakukan penghapusan
        await pool.query('DELETE FROM stock WHERE id = $1', [id]);

        res.json({ message: 'Item stock berhasil dihapus' }); // 200 OK

    } catch (err) {
        console.error('Error deleting stock:', err.message || err);
        res.status(500).json({ error: 'Terjadi kesalahan server saat menghapus data stock' });
    }
};


// Export semua fungsi controller stock
module.exports = {
  getAllStock,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
};