

const express        = require('express');
const router         = express.Router();
const controller     = require('./controller');
const verifyToken    = require('../../AuthHandler/verifyToken');
const authorizeRoles = require('../../AuthHandler/authorizeRoles');

// POST /orders/place – customer only
router.post('/place', verifyToken, authorizeRoles('customer'), controller.placeOrder);

module.exports = router;