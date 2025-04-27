// controllers/stockController.js
const pool = require("../db"); // Import your database connection pool

// Helper to map DB rows to camelCase objects
const mapRowToCamelCase = (row) => {
    if (!row) return null;
    const camelCaseRow = {};
    for (const key in row) {
        camelCaseRow[toCamelCase(key)] = row[key];
    }
    return camelCaseRow;
};

// @desc    Get all stock items
// @route   GET /api/stock
// @access  Private (Requires JWT)
const getAllStock = async (req, res) => {
    try {
      // Select all columns, including created_at and updated_at if needed
      const result = await pool.query('SELECT id, name, part_number, category, quantity, supplier, status, uom, remarks, created_at, updated_at FROM stock ORDER BY id ASC');

      const stockItems = result.rows.map(mapRowToCamelCase);
      res.status(200).json(stockItems);

    } catch (error) {
      console.error('Error fetching all stock:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data stok.' });
    }
  };

// @desc    Get a single stock item by ID
// @route   GET /api/stock/:id
// @access  Private (Requires JWT)
const getStockItemById = async (req, res) => {
    // ID is already validated and parsed to integer by validateIdParam middleware
    const id = req.params.id;

    try {
      const result = await pool.query(
        'SELECT id, name, part_number, category, quantity, supplier, status, uom, remarks, created_at, updated_at FROM stock WHERE id = $1',
        [id]
      );

      if (result.rowCount === 0) {
        // Item not found with this ID
        return res.status(404).json({ error: 'Item stok tidak ditemukan.' });
      }

      const stockItem = mapRowToCamelCase(result.rows[0]);
      res.status(200).json(stockItem);
    } catch (error) {
      console.error(`Error fetching stock item with ID ${id}:`, error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data stok.' });
    }
  };

// @desc    Create a new stock item
// @route   POST /api/stock
// @access  Private (Requires JWT)
const createStockItem = async (req, res) => {
    // Destructure directly using database column names (snake_case) from req.body
    const { name, part_number, category, quantity, supplier, status, uom, remarks } = req.body;

    // Basic validation (add more sophisticated validation library like 'express-validator' for production)
    if (!name || !category || quantity === undefined || !supplier || !status || !uom) {
        return res.status(400).json({ error: 'Harap lengkapi semua field wajib (name, category, quantity, supplier, status, uom).' });
    }

    // Ensure quantity is a non-negative number
    if (typeof quantity !== 'number' || quantity < 0) {
         return res.status(400).json({ error: 'Quantity harus berupa angka non-negatif.' });
    }


    try {
        // Insert into database, returning the newly created row
        const result = await pool.query(
            'INSERT INTO stock (name, part_number, category, quantity, supplier, status, uom, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, part_number, category, quantity, supplier, status, uom, remarks, created_at, updated_at',
            [name, part_number, category, quantity, supplier, status, uom, remarks]
        );

        // Map inserted row to camelCase for the response
        const newItem = mapRowToCamelCase(result.rows[0]);

        res.status(201).json(newItem); // 201 Created status
    } catch (error) {
        console.error('Error creating stock item:', error);
         // Handle potential unique constraint errors if part_number is unique
        if (error.code === '23505') { // PostgreSQL unique_violation error code
             res.status(400).json({ error: `Part Number '${part_number}' sudah ada.` });
        } else {
            res.status(500).json({ error: 'Terjadi kesalahan saat membuat item stok baru.' });
        }
    }
};

// @desc    Update a stock item by ID
// @route   PATCH /api/stock/:id (PATCH is often better for partial updates)
// @access  Private (Requires JWT)
const updateStockItem = async (req, res) => {
    // ID is already validated and parsed to integer by validateIdParam middleware
    const id = req.params.id;
     // Destructure potential updates using database column names (snake_case) from req.body
    const { name, part_number, category, quantity, supplier, status, uom, remarks } = req.body;

    // Build query dynamically to allow partial updates (using PATCH semantics)
    const fields = [];
    const values = [];
    let queryIndex = 1; // Start parameter index

    // Add fields and values only if they are provided in the request body
    if (name !== undefined) { fields.push(`name = $${queryIndex++}`); values.push(name); }
    if (part_number !== undefined) { fields.push(`part_number = $${queryIndex++}`); values.push(part_number); }
    if (category !== undefined) { fields.push(`category = $${queryIndex++}`); values.push(category); }
    if (quantity !== undefined) {
        // Basic validation for quantity update
        if (typeof quantity !== 'number' || quantity < 0) {
            return res.status(400).json({ error: 'Quantity harus berupa angka non-negatif saat update.' });
        }
        fields.push(`quantity = $${queryIndex++}`); values.push(quantity);
    }
    if (supplier !== undefined) { fields.push(`supplier = $${queryIndex++}`); values.push(supplier); }
    if (status !== undefined) { fields.push(`status = $${queryIndex++}`); values.push(status); }
    if (uom !== undefined) { fields.push(`uom = $${queryIndex++}`); values.push(uom); }
    if (remarks !== undefined) { fields.push(`remarks = $${queryIndex++}`); values.push(remarks); }

    // If no fields to update, return bad request
    if (fields.length === 0) {
        return res.status(400).json({ error: 'Tidak ada field yang disediakan untuk diperbarui.' });
    }

    // Add the ID to the values and query condition. The ID parameter index is the last one.
    values.push(id);
    const updateQuery = `UPDATE stock SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${queryIndex} RETURNING id, name, part_number, category, quantity, supplier, status, uom, remarks, created_at, updated_at`;

    try {
        const result = await pool.query(updateQuery, values);

        if (result.rowCount === 0) {
            // Item not found with this ID
            return res.status(404).json({ error: 'Item stok tidak ditemukan.' });
        }

        // Map updated row to camelCase for the response
        const updatedItem = mapRowToCamelCase(result.rows[0]);

        res.status(200).json(updatedItem); // 200 OK status
    } catch (error) {
        console.error(`Error updating stock item with ID ${id}:`, error);
         // Handle potential unique constraint errors if part_number is unique during update
        if (error.code === '23505') { // PostgreSQL unique_violation error code
             // Try to get the conflicting value from the error detail if available (PostgreSQL specific)
             const detail = error.detail || '';
             const partNumberMatch = detail.match(/Key \(part_number\)=\((.*?)\)/);
             const conflictingPartNumber = partNumberMatch ? partNumberMatch[1] : 'yang sama';
             res.status(400).json({ error: `Part Number '${conflictingPartNumber}' sudah ada.` });
        } else {
             res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui item stok.' });
        }
    }
};


// @desc    Delete a stock item by ID
// @route   DELETE /api/stock/:id
// @access  Private (Requires JWT)
const deleteStockItem = async (req, res) => {
    // ID is already validated and parsed to integer by validateIdParam middleware
    const id = req.params.id;

    try {
        // Delete the row, returning the ID of the deleted row
        const result = await pool.query('DELETE FROM stock WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            // Item not found with this ID
            return res.status(404).json({ error: 'Item stok tidak ditemukan.' });
        }

        // Respond with success message and the ID of the deleted item
        res.status(200).json({ message: `Item stok dengan ID ${result.rows[0].id} berhasil dihapus.` }); // 200 OK status
    } catch (error) {
        console.error(`Error deleting stock item with ID ${id}:`, error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus item stok.' });
    }
};


module.exports = {
  getAllStock,
  getStockItemById,
  createStockItem,
  updateStockItem,
  deleteStockItem,
};