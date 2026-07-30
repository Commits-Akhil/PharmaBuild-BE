const express        = require('express');
const router         = express.Router();
const controller     = require('./controller');
const verifyToken    = require('../../AuthHandler/verifyToken');
const authorizeRoles = require('../../AuthHandler/authorizeRoles');

router.use(verifyToken, authorizeRoles('admin'));

router.get('/users',                         controller.getAllUsers);
router.get('/branches',                      controller.getAllBranches);
router.get('/orders',                         controller.getAllOrders);
router.get('/branches/low-stock',            controller.getLowStockByBranch);
router.get('/branches/fulfillment-failures', controller.getFulfillmentFailures);
router.get('/branches/:branchId/today-orders', controller.getBranchTodayOrders);

module.exports = router;
