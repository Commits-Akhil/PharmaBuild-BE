const pool = require("../../config");

/**
 * GET /delivery/orders/available
 * Lists all orders ready for delivery and unclaimed:
 *   - 'Verified'  → prescription orders approved by pharmacist
 *   - 'Placed'    → OTC orders (no prescription required)
 * Returns branch pickup address and customer delivery address.
 */
const getAvailableOrders = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                o.id                    AS order_id,
                o.status,
                o.requires_prescription AS requires_prescription,
                o.created_at,
                -- Branch (pickup) info
                b.id                    AS branch_id,
                b.name                  AS branch_name,
                b.location              AS pickup_address,
                -- Customer (delivery) info
                u.name                  AS customer_name,
                u.address               AS delivery_address,
                u.phone                 AS customer_phone
            FROM orders o
            JOIN branches b ON b.id = o.branch_id
            JOIN users    u ON u.id = o.customer_id
            WHERE o.status IN ('Verified', 'Placed')
              AND o.delivery_partner_id IS NULL
            ORDER BY o.created_at ASC
        `);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error("[Delivery/getAvailableOrders]", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * POST /delivery/orders/:orderId/claim
 * Delivery partner claims an available order atomically.
 * Uses FOR UPDATE SKIP LOCKED to prevent race conditions.
 * Sets status → 'out_for_delivery' and stamps delivery_partner_id.
 */
const claimOrder = async (req, res) => {
    const deliveryPartnerId = req.user.id;
    const { orderId } = req.params;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Lock the row — SKIP LOCKED means if another request already locked it we get 0 rows
        const lock = await client.query(
            `SELECT id, status, delivery_partner_id
             FROM orders
             WHERE id = $1
             FOR UPDATE SKIP LOCKED`,
            [orderId]
        );

        if (lock.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                success: false,
                message: "Order is no longer available (already claimed or does not exist)."
            });
        }

        const order = lock.rows[0];

        if (!["Verified", "Placed"].includes(order.status)) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                success: false,
                message: `Order cannot be claimed. Current status: '${order.status}'.`
            });
        }

        if (order.delivery_partner_id !== null) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                success: false,
                message: "Order has already been claimed by another delivery partner."
            });
        }

        // Claim it
        const updated = await client.query(
            `UPDATE orders
             SET status              = 'Out for Delivery',
                 delivery_partner_id = $1,
                 updated_at          = NOW()
             WHERE id = $2
             RETURNING id, status, delivery_partner_id, updated_at`,
            [deliveryPartnerId, orderId]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: "Order claimed successfully. Status set to 'out_for_delivery'.",
            data: updated.rows[0]
        });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("[Delivery/claimOrder]", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    } finally {
        client.release();
    }
};

/**
 * GET /delivery/orders/my-orders
 * Shows all orders currently held by the logged-in delivery partner.
 */
const getMyOrders = async (req, res) => {
    const deliveryPartnerId = req.user.id;
    try {
        const result = await pool.query(
            `SELECT
                o.id            AS order_id,
                o.status,
                o.created_at,
                o.updated_at,
                b.name          AS branch_name,
                b.location      AS pickup_address,
                u.name          AS customer_name,
                u.address       AS delivery_address,
                u.phone         AS customer_phone
             FROM orders o
             JOIN branches b ON b.id = o.branch_id
             JOIN users    u ON u.id = o.customer_id
             WHERE o.delivery_partner_id = $1
             ORDER BY o.updated_at DESC`,
            [deliveryPartnerId]
        );

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error("[Delivery/getMyOrders]", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * PATCH /delivery/orders/:orderId/delivered
 * Delivery partner marks an order as delivered.
 */
const markDelivered = async (req, res) => {
    const deliveryPartnerId = req.user.id;
    const { orderId } = req.params;

    try {
        const result = await pool.query(
            `UPDATE orders
             SET status     = 'Delivered',
                 updated_at = NOW()
             WHERE id = $1
               AND delivery_partner_id = $2
               AND status = 'Out for Delivery'
             RETURNING id, status, updated_at`,
            [orderId, deliveryPartnerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found or you are not authorised to update it."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order marked as delivered.",
            data: result.rows[0]
        });
    } catch (err) {
        console.error("[Delivery/markDelivered]", err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { getAvailableOrders, claimOrder, getMyOrders, markDelivered };
