const express = require("express");
const router = express.Router();

const {
    getPendingPrescriptions,
    approvePrescription,
    rejectPrescription
} = require("./controller");

const verifyToken = require("../../AuthHandler/verifyToken");
const authorizeRoles = require("../../AuthHandler/authorizeRoles");


router.use(
    verifyToken,
    authorizeRoles("pharmacist")
);

router.get("/pending-prescriptions", getPendingPrescriptions);

router.post("/approve", approvePrescription);

router.post("/reject", rejectPrescription);

module.exports = router;