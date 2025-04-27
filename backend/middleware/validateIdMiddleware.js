// middleware/validateIdMiddleware.js

const validateIdParam = (req, res, next) => {
    const { id } = req.params; // Ambil parameter 'id' dari URL

    // --- Log untuk debugging ---
    console.log(`>>> DEBUG: Validating ID parameter. Received ID in URL: "${id}"`);
    // --------------------------

    // Coba parse ID menjadi integer
    const parsedId = parseInt(id, 10);

    // Cek jika ID kosong atau bukan angka yang valid
    if (!id || isNaN(parsedId)) {
        // --- Log warning saat validasi gagal ---
        console.warn(`Validation failed: ID "${id}" is invalid (not a number or missing). Sending 400.`);
        // --------------------------------------
        return res.status(400).json({ error: 'ID stok tidak valid.' }); // Kirim error 400 Bad Request
    }

    // Opsional: Timpa parameter id di req.params dengan nilai integer yang sudah divalidasi
    // Ini memastikan controller selalu menerima id sebagai number, bukan string
    req.params.id = parsedId;

    // Jika validasi berhasil, lanjutkan
    console.log(`>>> DEBUG: ID "${id}" is valid. Proceeding.`); // Log sukses validasi
    next();
};

module.exports = validateIdParam;