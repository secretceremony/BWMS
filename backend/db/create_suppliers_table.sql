-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample suppliers
INSERT INTO suppliers (name, contact_person, phone, email, address)
VALUES 
    ('PT Sukses Mandiri', 'Budi Santoso', '021-5551234', 'budi@suksesmandiri.com', 'Jl. Pahlawan No. 123, Jakarta'),
    ('CV Sejahtera Abadi', 'Dewi Kusuma', '021-5552345', 'dewi@sejahteraabadi.com', 'Jl. Raya Bogor Km 30, Bogor'),
    ('PT Makmur Jaya', 'Agus Widodo', '021-5553456', 'agus@makmurjaya.com', 'Jl. Sudirman No. 45, Jakarta'),
    ('UD Berkah Selalu', 'Siti Aminah', '021-5554567', 'siti@berkahselalu.com', 'Jl. Raya Bekasi Km 15, Bekasi')
ON CONFLICT (name) DO NOTHING; 