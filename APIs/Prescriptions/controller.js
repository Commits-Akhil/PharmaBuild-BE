const pool   = require('../../config');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `prescription-${req.user.id}-${Date.now()}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

const fileFilter = (req, file, cb) => {
  ALLOWED_MIME_TYPES.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error('Only images (JPG, PNG, WebP, GIF), PDF, or DOCX files are allowed.'), false);
};


const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single('prescription');


const uploadPrescription = async (req, res) => {
  const customerId = req.user.id;
  const { orderId } = req.body;

  if (!orderId || !Number.isInteger(Number(orderId)) || Number(orderId) <= 0) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ success: false, message: 'A valid orderId is required.' });
  }

  if (!req.file)
    return res.status(400).json({ success: false, message: 'Prescription file is required (JPG, PNG, WebP, GIF, PDF, or DOCX).' });

  try {
    const orderRes = await pool.query(
      `SELECT id, customer_id, requires_prescription FROM orders WHERE id = $1`,
      [Number(orderId)]
    );

    if (orderRes.rows.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderRes.rows[0];

    if (order.customer_id !== customerId) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ success: false, message: 'Access denied. Not your order.' });
    }

    if (!order.requires_prescription) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'This order does not require a prescription.' });
    }

    const existingPresc = await pool.query(
      'SELECT id FROM prescriptions WHERE order_id = $1',
      [Number(orderId)]
    );
    if (existingPresc.rows.length > 0) {
      fs.unlinkSync(req.file.path);
      return res.status(409).json({ success: false, message: 'A prescription has already been uploaded for this order.' });
    }

    const prescResult = await pool.query(
      `INSERT INTO prescriptions (order_id, image_url, verification_status)
       VALUES ($1, $2, 'Pending')
       RETURNING id, order_id, image_url, uploaded_at, verification_status`,
      [Number(orderId), `/uploads/${req.file.filename}`]
    );

    return res.status(201).json({
      success: true,
      message: 'Prescription uploaded. Awaiting pharmacist review.',
      data: { prescription: prescResult.rows[0] },
    });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('[Prescriptions/upload]', err.message);
    return res.status(500).json({ success: false, message: 'Server error uploading prescription.' });
  }
};

module.exports = { uploadPrescription, uploadMiddleware };
