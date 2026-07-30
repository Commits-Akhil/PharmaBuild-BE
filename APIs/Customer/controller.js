const pool = require("../../config");

// Get all orders of logged-in customer
const getMyOrders = async (req, res) => {
    try {

        const result = await pool.query(
            `SELECT
                o.id AS order_id,
                o.status,
                o.requires_prescription,
                o.stock_reserved,
                o.created_at,
                b.name AS branch_name,
                b.location AS branch_location
             FROM orders o
             JOIN branches b
             ON o.branch_id = b.id
             WHERE o.customer_id = $1
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            orders: result.rows
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Get single order details
const getOrderById = async (req, res) => {

    const { id } = req.params;

    if (!id || id <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid Order ID"
        });
    }

    try {

        const order = await pool.query(
            `SELECT
                o.id AS order_id,
                o.status,
                o.requires_prescription,
                o.stock_reserved,
                o.created_at,
                b.id AS branch_id,
                b.name AS branch_name,
                b.location AS branch_location
             FROM orders o
             JOIN branches b
             ON o.branch_id = b.id
             WHERE o.id = $1
             AND o.customer_id = $2`,
            [id, req.user.id]
        );

        if (order.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const items = await pool.query(
            `SELECT
                oi.id AS item_id,
                m.id AS medicine_id,
                m.name AS medicine_name,
                m.is_prescription_required,
                oi.quantity
             FROM order_items oi
             JOIN medicines m
             ON oi.medicine_id = m.id
             WHERE oi.order_id = $1`,
            [id]
        );

        const prescription = await pool.query(
            `SELECT
                id,
                image_url,
                uploaded_at,
                verification_status,
                verified_at,
                rejection_reason
             FROM prescriptions
             WHERE order_id = $1
             LIMIT 1`,
            [id]
        );

        res.json({
            success: true,
            order: order.rows[0],
            items: items.rows,
            prescription: prescription.rows[0] || null
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
    getMyOrders,
    getOrderById
};