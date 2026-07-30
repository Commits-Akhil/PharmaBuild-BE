const pool = require('../../config');


const getAllMedicines = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, is_prescription_required, created_at,image_url,price FROM medicines ORDER BY name ASC`
    );
    return res.status(200).json({ success: true, data: { medicines: result.rows } });
  } catch (err) {
    console.error('[Medicines/getAll]', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching medicines.' });
  }
};


module.exports = { getAllMedicines };

