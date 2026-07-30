const express = require("express");
const router = express.Router();

const {
    getPendingPrescriptions,
    approvePrescription,
    rejectPrescription
} = require("./controller");

router.get("/pending-prescriptions", (req, res) => {
    console.log("Pending route called");
    res.json({
        success: true,
        message: "Route is working"
    });
});

router.get("/pending-prescription", getPendingPrescriptions);

router.post("/approve", approvePrescription);

router.post("/reject", rejectPrescription);

module.exports = router;