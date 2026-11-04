const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

// Regitrasi Klien
app.get('/api/klien/search', async (req, res) => {
    try{
        const {q} = req.query;
        const query = `
            SELECT DISTINCT nik, nama, telepon, alamat
            FROM buku_tamu
            WHERE nama ILIKE $1 OR nik ILIKE $1
            LIMIT 5
        `;
        const result = await db.query(query, [`%${q}$%`]);
        res.json({
            success: true, 
            data: result.rows
        });
    }catch (err){
        res.status(500).json({
            seccess: false,
            massage: err.message
        });
    }
});

// Monitoring Klien

// Akses semua buku

// Kelola tim & akses

// Input data akta

// Export & Cetak

// Pencarian berkas

// Verifikasi laporan

// Update progres