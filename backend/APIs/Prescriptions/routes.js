const express        = require('express');
const router         = express.Router();
const { uploadPrescription, uploadMiddleware } = require('./controller');
const verifyToken    = require('../../AuthHandler/verifyToken');
const authorizeRoles = require('../../AuthHandler/authorizeRoles');

router.post(
  '/upload',
  verifyToken,
  authorizeRoles('customer'),
  (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  uploadPrescription
);

module.exports = router;
