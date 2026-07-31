const pool = require("../../config");

const placeOrder = async (req, res) => {

    const { branchId, requiresPrescription, items } = req.body;

    const customerId = req.user.id;

    if (!branchId || !items || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Branch ID and Items are required"
        });
    }

    try {

        const branch = await pool.query(
            "SELECT id FROM branches WHERE id=$1",
            [branchId]
        );

        if (branch.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Branch not found"
            });
        }

        const medicineIds = items.map(item => item.medicine_id);

        const medicines = await pool.query(
            "SELECT id FROM medicines WHERE id = ANY($1)",
            [medicineIds]
        );

        if (medicines.rows.length !== medicineIds.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid medicine ID"
            });
        }

        const result = await pool.query(
            `SELECT
                p_order_id,
                p_result_message
             FROM place_order($1,$2,$3,$4)`,
            [
                branchId,
                customerId,
                requiresPrescription,
                JSON.stringify(items)
            ]
        );

        const order = result.rows[0];

        if (order.p_result_message !== "SUCCESS") {
            return res.status(400).json({
                success: false,
                message: order.p_result_message
            });
        }

        res.status(201).json({
            success: true,
            orderId: order.p_order_id,
            message: "Order Placed Successfully",
            nextStep: requiresPrescription
                ? "Upload Prescription"
                : "Order Confirmed"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

module.exports = {
    placeOrder
};