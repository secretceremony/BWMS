const pool = require("../db");

// Mendapatkan semua data history
const getAllReports = async (req, res) => {
  try {
    // Ambil parameter filter dari query string jika ada
    const { startDate, endDate, type, item_id } = req.query;
    
    let query = `
      SELECT 
        h.id, 
        h.item_id, 
        h.quantity_change, 
        h.transaction_type, 
        h.transaction_date, 
        h.remarks, 
        h.created_at,
        h.source,
        h.document_ref,
        h.location,
        s.name as item_name, 
        s.part_number, 
        s.category, 
        s.supplier,
        s.price
      FROM 
        stock_history h
      LEFT JOIN 
        stock s ON h.item_id = s.id
    `;
    
    const queryParams = [];
    const conditions = [];
    
    // Tambahkan kondisi filter jika ada
    if (startDate) {
      conditions.push(`h.transaction_date >= $${queryParams.length + 1}`);
      queryParams.push(startDate);
    }
    
    if (endDate) {
      conditions.push(`h.transaction_date <= $${queryParams.length + 1}`);
      queryParams.push(endDate);
    }
    
    if (type) {
      conditions.push(`h.transaction_type = $${queryParams.length + 1}`);
      queryParams.push(type);
    }
    
    if (item_id) {
      conditions.push(`h.item_id = $${queryParams.length + 1}`);
      queryParams.push(item_id);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    // Tambahkan ORDER BY untuk urutkan berdasarkan tanggal transaksi terbaru
    query += ` ORDER BY h.transaction_date DESC, h.created_at DESC`;
    
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reports:', err.message || err);
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil data laporan' });
  }
};

// Mendapatkan report berdasarkan ID
const getReportById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const query = `
      SELECT 
        h.id, 
        h.item_id, 
        h.quantity_change, 
        h.transaction_type, 
        h.transaction_date, 
        h.remarks, 
        h.created_at,
        h.source,
        h.document_ref,
        h.location,
        s.name as item_name, 
        s.part_number, 
        s.category, 
        s.supplier,
        s.price
      FROM 
        stock_history h
      LEFT JOIN 
        stock s ON h.item_id = s.id
      WHERE 
        h.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching report by ID:', err.message || err);
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengambil data laporan' });
  }
};

// Update report berdasarkan ID
const updateReport = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { 
      item_id, 
      quantity_change, 
      transaction_type, 
      transaction_date, 
      remarks, 
      source, 
      document_ref, 
      location 
    } = req.body;
    
    // Validasi input
    if (!item_id || !quantity_change || !transaction_type || !transaction_date) {
      return res.status(400).json({ 
        error: "Field yang dibutuhkan (item_id, quantity_change, transaction_type, transaction_date) tidak lengkap." 
      });
    }
    
    // 1. Dapatkan data history lama
    const oldHistoryResult = await client.query(
      'SELECT * FROM stock_history WHERE id = $1',
      [id]
    );
    
    if (oldHistoryResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }
    
    const oldHistory = oldHistoryResult.rows[0];
    
    // 2. Dapatkan stok saat ini
    const stockResult = await client.query(
      'SELECT quantity FROM stock WHERE id = $1 FOR UPDATE',
      [item_id]
    );
    
    if (stockResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Item stock tidak ditemukan' });
    }
    
    let currentStock = stockResult.rows[0].quantity;
    
    // 3. Kembalikan efek dari history lama
    currentStock -= oldHistory.quantity_change;
    
    // 4. Terapkan efek dari history baru
    currentStock += quantity_change;
    
    // 5. Periksa apakah stok menjadi negatif
    if (currentStock < 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Stok tidak mencukupi untuk perubahan ini' });
    }
    
    // 6. Update stok
    await client.query(
      'UPDATE stock SET quantity = $1 WHERE id = $2',
      [currentStock, item_id]
    );
    
    // 7. Update history
    const updateResult = await client.query(
      `UPDATE stock_history 
       SET item_id = $1, quantity_change = $2, transaction_type = $3, 
           transaction_date = $4, remarks = $5, source = $6, 
           document_ref = $7, location = $8
       WHERE id = $9
       RETURNING *`,
      [
        item_id, 
        quantity_change, 
        transaction_type, 
        transaction_date, 
        remarks, 
        source, 
        document_ref, 
        location, 
        id
      ]
    );
    
    await client.query('COMMIT');
    
    // Join dengan tabel stock untuk mendapatkan informasi item
    const result = await pool.query(`
      SELECT 
        h.id, 
        h.item_id, 
        h.quantity_change, 
        h.transaction_type, 
        h.transaction_date, 
        h.remarks, 
        h.created_at,
        h.source,
        h.document_ref,
        h.location,
        s.name as item_name, 
        s.part_number, 
        s.category, 
        s.supplier,
        s.price
      FROM 
        stock_history h
      LEFT JOIN 
        stock s ON h.item_id = s.id
      WHERE 
        h.id = $1
    `, [id]);
    
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating report:', err.message || err);
    res.status(500).json({ error: 'Terjadi kesalahan server saat mengupdate laporan' });
  } finally {
    client.release();
  }
};

// Hapus report berdasarkan ID
const deleteReport = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // 1. Dapatkan data history yang akan dihapus
    const historyResult = await client.query(
      'SELECT * FROM stock_history WHERE id = $1',
      [id]
    );
    
    if (historyResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }
    
    const history = historyResult.rows[0];
    
    // 2. Dapatkan stok saat ini
    const stockResult = await client.query(
      'SELECT quantity FROM stock WHERE id = $1 FOR UPDATE',
      [history.item_id]
    );
    
    if (stockResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Item stock tidak ditemukan' });
    }
    
    let currentStock = stockResult.rows[0].quantity;
    
    // 3. Kembalikan efek dari history yang akan dihapus
    currentStock -= history.quantity_change;
    
    // 4. Periksa apakah stok menjadi negatif
    if (currentStock < 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Tidak dapat menghapus laporan ini karena akan menyebabkan stok negatif' 
      });
    }
    
    // 5. Update stok
    await client.query(
      'UPDATE stock SET quantity = $1 WHERE id = $2',
      [currentStock, history.item_id]
    );
    
    // 6. Hapus history
    await client.query('DELETE FROM stock_history WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    
    res.json({ message: 'Laporan berhasil dihapus' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting report:', err.message || err);
    res.status(500).json({ error: 'Terjadi kesalahan server saat menghapus laporan' });
  } finally {
    client.release();
  }
};

// Export all controller functions
module.exports = {
  getAllReports,
  getReportById,
  updateReport,
  deleteReport
}; 