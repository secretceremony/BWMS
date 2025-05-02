// backend/src/controllers/stockController.js
const pool = require("../db"); // Pastikan path benar ke db.js

// Helper function to update stock quantity and optionally record history
// This is a core function used by both incoming and outgoing handlers
const updateStockQuantity = async (itemId, quantityChange, transactionType, remarks, transactionDate) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Start transaction

        // 1. Get current stock quantity
        // Use FOR UPDATE to lock the row to prevent race conditions during concurrent updates
        const currentStockResult = await client.query('SELECT quantity FROM stock WHERE id = $1 FOR UPDATE', [itemId]);
        if (currentStockResult.rows.length === 0) {
            throw new Error('Item stock not found');
        }
        const currentQuantity = currentStockResult.rows[0].quantity;
        const newQuantity = currentQuantity + quantityChange;

        // 2. Validate for outgoing transactions (ensure sufficient stock)
        if (transactionType === 'outgoing' && newQuantity < 0) {
            // Rollback immediately if stock is insufficient
            await client.query('ROLLBACK');
            throw new Error('Insufficient stock'); // Specific error for insufficient stock
        }

        // 3. Update stock quantity
        const updateResult = await client.query(
            'UPDATE stock SET quantity = $1 WHERE id = $2 RETURNING id, quantity',
            [newQuantity, itemId]
        );
        const updatedItem = updateResult.rows[0];


        // 4. Record history/transaction
        // Insert into the stock_history table
        await client.query(
            'INSERT INTO stock_history (item_id, quantity_change, transaction_type, transaction_date, remarks) VALUES ($1, $2, $3, $4, $5)',
            [itemId, quantityChange, transactionType, transactionDate, remarks]
        );

        await client.query('COMMIT'); // Commit transaction if all steps succeeded

        return {
            id: updatedItem.id,
            stock: updatedItem.quantity // Return updated stock (mapped from quantity)
        };

    } catch (error) {
        // If an error occurred before rollback (like DB error), ensure rollback happens
        if (client) {
             await client.query('ROLLBACK');
        }
        console.error(`Error updating stock quantity for item ${itemId}:`, error.message || error);
        throw error; // Re-throw the error to be caught by the controller function
    } finally {
        if (client) {
             client.release(); // Release the client back to the pool
        }
    }
};


// Mengambil semua data stock dengan filter, sort, dan search
const getAllStock = async (req, res) => {
  // Ambil parameter dari query string
  const { category, supplier, sort, q, status, uom } = req.query;

  let query = 'SELECT id, name, part_number, category, quantity, supplier, status, uom, remarks, price FROM stock'; // Added price
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
    conditions.push(`(name ILIKE $${queryParams.length + 1} OR id::text ILIKE $${queryParams.length + 2} OR part_number::text ILIKE $${queryParams.length + 3} OR remarks ILIKE $${queryParams.length + 4} OR category ILIKE $${queryParams.length + 5} OR supplier ILIKE $${queryParams.length + 6})`); // Added category and supplier to search
    // Pastikan jumlah parameter (sebanyak searchTerm di push) sesuai dengan jumlah placeholder $ di atas
    queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm); // Added 2 more search terms
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
        const result = await pool.query('SELECT id, name, part_number, category, quantity, supplier, status, uom, remarks, price FROM stock WHERE id = $1', [id]); // Added price
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

// Menambah data stock baru (Backend Generates ID)
const createStock = async (req, res) => {
    console.log("Received data for createStock:", req.body); // <-- Add this line
        // Expect data *without* ID in the body for creation
        // Removed 'id' from destructuring
        const { name, part_number, category, quantity, supplier, status, uom, remarks, price } = req.body; // Added price
    
        try {
            // Basic validation - Removed '!id' check
            if (!name || part_number === undefined || part_number === null || !category || quantity === undefined || quantity === null || !supplier || !status || !uom || price === undefined || price === null) {
                // Adjusted error message slightly to reflect that ID is not expected in body for creation
                return res.status(400).json({ error: "Field yang dibutuhkan (name, part_number, category, quantity, supplier, status, uom, price) tidak lengkap." });
            }
    
            // Sesuaikan query INSERT dan kolom - Removed 'id' column
            const result = await pool.query(
                'INSERT INTO stock (name, part_number, category, quantity, supplier, status, uom, remarks, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, part_number, category, quantity, supplier, status, uom, remarks, price', // Added price and RETURNING id
                [name, part_number, category, quantity, supplier, status, uom, remarks, price] // Removed id from parameter list
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
                 // Check constraint name specifically for part_number if needed
                 if (err.constraint === 'stock_part_number_key') { // Assuming this is the part_number unique constraint name
                     return res.status(409).json({ error: `Part Number '${part_number}' already exists.` });
                 }
                 // Fallback for other unique constraints if any
                 return res.status(409).json({ error: 'Duplicate entry violates unique constraint.' });
            }
            res.status(500).json({ error: 'Terjadi kesalahan server saat menambah data stock' });
        }
    };

// Mengupdate data stock yang ada (Full update, not just quantity)
const updateStock = async (req, res) => {
    console.log("Received data for updateStock:", req.body); // <-- Add this line
    const { id } = req.params;
    // Sesuaikan kolom dengan body request
    const { name, part_number, category, quantity, supplier, status, uom, remarks, price } = req.body; // Added price

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
        const updatedQuantity = quantity !== undefined ? quantity : existingItem.quantity; // Allow updating quantity here too
        const updatedSupplier = supplier !== undefined ? supplier : existingItem.supplier;
        const updatedStatus = status !== undefined ? status : existingItem.status;
        const updatedUom = uom !== undefined ? uom : existingItem.uom;
        const updatedRemarks = remarks !== undefined ? remarks : existingItem.remarks;
        const updatedPrice = price !== undefined ? price : existingItem.price; // Added price


        // Sesuaikan query UPDATE dan kolom
        const result = await pool.query(
            'UPDATE stock SET name = $1, part_number = $2, category = $3, quantity = $4, supplier = $5, status = $6, uom = $7, remarks = $8, price = $9 WHERE id = $10 RETURNING id, name, part_number, category, quantity, supplier, status, uom, remarks, price', // Added price
            [updatedName, updatedPartNumber, updatedCategory, updatedQuantity, updatedSupplier, updatedStatus, updatedUom, updatedRemarks, updatedPrice, id] // Added updatedPrice
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
             // Determine which constraint was violated based on the error detail
             // Assuming you have a unique constraint on part_number, e.g., 'stock_part_number_key'
             if (err.constraint === 'stock_part_number_key') {
                 // You might need to check if the part_number being set is different from the existing one
                 // If it's different and conflicts, return the error.
                 return res.status(409).json({ error: `Part Number '${part_number}' already exists.` });
             }
             // Generic unique violation error if constraint name is unknown
             return res.status(409).json({ error: 'Duplicate entry violates unique constraint.' });
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
        // Handle foreign key constraint violation if stock is referenced in history
        if (err.code === '23503') { // Kode error PostgreSQL for foreign_key_violation
             return res.status(409).json({ error: 'Cannot delete stock item because it has associated history records.' });
        }
        res.status(500).json({ error: 'Terjadi kesalahan server saat menghapus data stock' });
    }
};


// --- Record Incoming Goods Transaction ---
const recordIncomingGoods = async (req, res) => {
    // Expect itemId, quantity, remarks, transactionDate from the request body
    const { itemId, quantity, remarks, transactionDate } = req.body;

    try {
        // Basic validation
        if (!itemId || quantity === undefined || quantity === null || quantity <= 0 || !transactionDate) {
            return res.status(400).json({ error: "Field yang dibutuhkan (itemId, quantity, transactionDate) tidak lengkap atau quantity tidak valid." });
        }

        // Use the helper function to update stock and record history
        const updatedItem = await updateStockQuantity(itemId, quantity, 'incoming', remarks, transactionDate);

        // Return the updated item details
        res.json(updatedItem); // 200 OK

    } catch (err) {
        console.error('Error recording incoming goods:', err.message || err);
        // Handle specific errors from updateStockQuantity helper
        if (err.message === 'Item stock not found') {
             return res.status(404).json({ error: 'Item stock tidak ditemukan.' });
        }
        res.status(500).json({ error: 'Terjadi kesalahan server saat mencatat barang masuk.' });
    }
};

// --- Record Outgoing Goods Transaction ---
const recordOutgoingGoods = async (req, res) => {
    // Expect itemId, quantity, remarks, transactionDate from the request body
    const { itemId, quantity, remarks, transactionDate } = req.body;

    try {
        // Basic validation
        if (!itemId || quantity === undefined || quantity === null || quantity <= 0 || !transactionDate) {
            return res.status(400).json({ error: "Field yang dibutuhkan (itemId, quantity, transactionDate) tidak lengkap atau quantity tidak valid." });
        }

        // Use the helper function to update stock and record history
        // Note the negative quantityChange for outgoing
        const updatedItem = await updateStockQuantity(itemId, -quantity, 'outgoing', remarks, transactionDate);

        // Return the updated item details
        res.json(updatedItem); // 200 OK

    } catch (err) {
        console.error('Error recording outgoing goods:', err.message || err);
         // Handle specific errors from updateStockQuantity helper
        if (err.message === 'Item stock not found') {
             return res.status(404).json({ error: 'Item stock tidak ditemukan.' });
        }
         if (err.message === 'Insufficient stock') {
             return res.status(400).json({ error: 'Stok tidak mencukupi untuk transaksi ini.' }); // Specific error for insufficient stock
        }
        res.status(500).json({ error: 'Terjadi kesalahan server saat mencatat barang keluar.' });
    }
};

// --- NEW: Get Stock History ---
const getStockHistory = async (req, res) => {
    try {
        // Fetch all records from the stock_history table, ordered by creation date descending
        const result = await pool.query('SELECT id, item_id, quantity_change, transaction_type, transaction_date, remarks, created_at FROM stock_history ORDER BY created_at DESC');

        // Return the history records
        res.json(result.rows); // 200 OK

    } catch (err) {
        console.error('Error fetching stock history:', err.message || err);
        res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil data riwayat stock.' });
    }
};


// Export all controller functions
module.exports = {
  getAllStock,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  recordIncomingGoods,
  recordOutgoingGoods,
  getStockHistory, // Export the new function
};