const pool   = require('../../config');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
require('dotenv').config();


const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );


const register = async (req, res) => {
  const { name, email, password, phone, address, branch_id } = req.body;

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const password_hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone, address, branch_id)
       VALUES ($1, $2, $3, 'customer', $4, $5, $6)
       RETURNING id, name, email, role, phone, address, branch_id, created_at`,
      [name, email, password_hash, phone || null, address || null, branch_id || null]
    );

    const user  = result.rows[0];
    const token = signToken(user);

    return res.status(201).json({ success: true, message: 'Registration successful.', data: { token, user } });
  } catch (err) {
    console.error('[Auth/register]', err.message);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT id, name, email, password_hash, role, phone, address, branch_id FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const user    = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const token = signToken(user);
    delete user.password_hash;

    return res.status(200).json({ success: true, message: 'Login successful.', data: { token, user } });
  } catch (err) {
    console.error('[Auth/login]', err.message);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};


const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, phone, address, branch_id, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'User not found.' });

    return res.status(200).json({ success: true, data: { user: result.rows[0] } });
  } catch (err) {
    console.error('[Auth/profile]', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
};

module.exports = { register, login, getProfile };
