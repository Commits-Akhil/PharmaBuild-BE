const express        = require('express');
const router         = express.Router();
const controller     = require('./controller');
const verifyToken    = require('../../AuthHandler/verifyToken');
const authorizeRoles = require('../../AuthHandler/authorizeRoles');

router.use(verifyToken, authorizeRoles('customer'));

router.get('/orders',     controller.getMyOrders);
router.get('/orders/:id', controller.getOrderById);

module.exports = router;
