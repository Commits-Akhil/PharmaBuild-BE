const express        = require("express");
const router         = express.Router();
const controller     = require("./controller");
const verifyToken    = require("../../AuthHandler/verifyToken");
const authorizeRoles = require("../../AuthHandler/authorizeRoles");

// All delivery routes require a valid JWT with role = 'delivery_partner'
router.use(verifyToken, authorizeRoles("delivery_partner"));

router.get("/orders/available",          controller.getAvailableOrders);
router.get("/orders/my-orders",          controller.getMyOrders);
router.post("/orders/:orderId/claim",    controller.claimOrder);
router.patch("/orders/:orderId/delivered", controller.markDelivered);

module.exports = router;
