const express = require("express");
const router = express.Router();

const controller = require("./controller");



const verifyToken = require("../../AuthHandler/verifyToken");
const authorizeRoles = require("../../AuthHandler/authorizeRoles");

// Protect all admin routes
router.use(verifyToken, authorizeRoles("admin"));

router.get("/users", controller.getAllUsers);

router.get("/branches", controller.getAllBranches);

router.get("/orders", controller.getAllOrders);

module.exports = router;