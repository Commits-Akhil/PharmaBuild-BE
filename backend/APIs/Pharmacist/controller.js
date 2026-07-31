const pool = require("../../config");

const error = (res, err) => {
    console.log(err.message);
    return res.status(500).json({
        success: false,
        message: "Server Error"
    });
};

const getPrescription = async (id) => {
    const result = await pool.query(
        `SELECT id, order_id, verification_status
         FROM prescriptions
         WHERE id=$1`,
        [id]
    );
    return result.rows[0];
};

//  Pending prescriptions
const getPendingPrescriptions = async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                p.id AS prescription_id,
                p.image_url,
                p.uploaded_at,
                o.id AS order_id,
                o.status,
                b.name AS branch_name,
                u.name AS customer_name,
                u.email
            FROM prescriptions p
            JOIN orders o ON p.order_id=o.id
            JOIN branches b ON o.branch_id=b.id
            JOIN users u ON o.customer_id=u.id
            WHERE p.verification_status='Pending'
            ORDER BY p.uploaded_at
        `);

        return res.json({
            success: true,
            prescriptions: result.rows
        });

    } catch (err) {
        return error(res, err);
    }
};

// Approveddd
const approvePrescription = async (req, res) => {

    const { prescriptionId } = req.body;
    const pharmacistId = null; // replace with req.user.id after JWT

    if (!prescriptionId)
        return res.status(400).json({
            success: false,
            message: "Prescription ID required"
        });

    try {

        const prescription = await getPrescription(prescriptionId);

        if (!prescription)
            return res.status(404).json({
                success: false,
                message: "Prescription not found"
            });

        if (prescription.verification_status !== "Pending")
            return res.status(400).json({
                success: false,
                message: "Already processed"
            });

        await pool.query(
            `UPDATE prescriptions
             SET verification_status='Approved',
                 verified_by=$1,
                 verified_at=NOW()
             WHERE id=$2`,
            [pharmacistId, prescriptionId]
        );

        await pool.query(
            "UPDATE orders SET status='Verified' WHERE id=$1",
            [prescription.order_id]
        );

        return res.json({
            success: true,
            message: "Prescription Approved"
        });

    } catch (err) {
        return error(res, err);
    }
};

// Rejection
const rejectPrescription = async (req, res) => {

    const { prescriptionId, rejectionReason } = req.body;
    const pharmacistId = null; // replace with req.user.id after JWT

    if (!prescriptionId)
        return res.status(400).json({
            success: false,
            message: "Prescription ID required"
        });

    try {

        const prescription = await getPrescription(prescriptionId);

        if (!prescription)
            return res.status(404).json({
                success: false,
                message: "Prescription not found"
            });

        if (prescription.verification_status !== "Pending")
            return res.status(400).json({
                success: false,
                message: "Already processed"
            });

        await pool.query(
            `UPDATE prescriptions
             SET verification_status='Rejected',
                 verified_by=$1,
                 verified_at=NOW(),
                 rejection_reason=$2
             WHERE id=$3`,
            [
                pharmacistId,
                rejectionReason || "No reason",
                prescriptionId
            ]
        );

        const release = await pool.query(
            `SELECT p_result_message
             FROM release_order_stock($1,$2)`,
            [
                prescription.order_id,
                "Rejected"
            ]
        );

        return res.json({
            success: true,
            message: "Prescription Rejected",
            stockRelease: release.rows[0].p_result_message
        });

    } catch (err) {
        return error(res, err);
    }
};

module.exports = {
    getPendingPrescriptions,
    approvePrescription,
    rejectPrescription
};