const pool = require("../db");

// Get all suppliers
const getAllSuppliers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM suppliers ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching suppliers:', err.message || err);
        res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil data supplier' });
    }
};

// Get supplier by ID
const getSupplierById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Supplier tidak ditemukan' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching supplier by ID:', err.message || err);
        res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil data supplier' });
    }
};

// Create new supplier
const createSupplier = async (req, res) => {
    const { name, contact_person, phone, email, address } = req.body;
    
    try {
        if (!name) {
            return res.status(400).json({ error: "Nama supplier wajib diisi." });
        }
        
        const result = await pool.query(
            'INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, contact_person || null, phone || null, email || null, address || null]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating supplier:', err.message || err);
        if (err.code === '23505') { // unique violation
            return res.status(409).json({ error: 'Supplier dengan nama tersebut sudah ada.' });
        }
        res.status(500).json({ error: 'Terjadi kesalahan server saat menambah supplier baru' });
    }
};

// Update supplier
const updateSupplier = async (req, res) => {
    const { id } = req.params;
    const { name, contact_person, phone, email, address } = req.body;
    
    try {
        if (!name) {
            return res.status(400).json({ error: "Nama supplier wajib diisi." });
        }
        
        const result = await pool.query(
            'UPDATE suppliers SET name = $1, contact_person = $2, phone = $3, email = $4, address = $5 WHERE id = $6 RETURNING *',
            [name, contact_person || null, phone || null, email || null, address || null, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Supplier tidak ditemukan' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating supplier:', err.message || err);
        if (err.code === '23505') { // unique violation
            return res.status(409).json({ error: 'Supplier dengan nama tersebut sudah ada.' });
        }
        res.status(500).json({ error: 'Terjadi kesalahan server saat mengupdate supplier' });
    }
};

// Delete supplier
const deleteSupplier = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Check if supplier is used in any stock items
        const checkResult = await pool.query('SELECT COUNT(*) FROM stock WHERE supplier = (SELECT name FROM suppliers WHERE id = $1)', [id]);
        
        if (parseInt(checkResult.rows[0].count) > 0) {
            return res.status(400).json({ 
                error: 'Supplier tidak dapat dihapus karena masih digunakan dalam data stok',
                itemCount: parseInt(checkResult.rows[0].count)
            });
        }
        
        const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Supplier tidak ditemukan' });
        }
        
        res.json({ message: 'Supplier berhasil dihapus', id: result.rows[0].id });
    } catch (err) {
        console.error('Error deleting supplier:', err.message || err);
        res.status(500).json({ error: 'Terjadi kesalahan server saat menghapus supplier' });
    }
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
}; 