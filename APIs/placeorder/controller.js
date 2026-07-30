// ============================================================
// APIs/Orders/controller.js
// POST /orders/place
//
// Purpose:
//   Places an order by calling the PostgreSQL stored function
//   place_order(). This function atomically:
//     1. Creates an order record
//     2. Deducts stock for each item (fails if insufficient)
//     3. Creates order_items records
//
// If place_order() returns FAILED, the entire transaction is
// rolled back inside PostgreSQL — no partial state is written.
//
// Request Body:
// {
//   "branchId": 3,
//   "requiresPrescription": true,
//   "items": [
//     { "medicine_id": 1, "quantity": 2 },
//     { "medicine_id": 3, "quantity": 1 }
//   ]
// }
//
// The customer ID is taken from the JWT (req.user.id) — never
// from the request body, to prevent spoofing.
// ============================================================

const pool = require('../../config');

const placeOrder = async (req, res) => {
  const { branchId, requiresPrescription, items } = req.body;

  // customerId comes from the verified JWT token
  const customerId = req.user.id;

  // ── Input Validation ──────────────────────────────────────
  if (!branchId || typeof branchId !== 'number' || branchId <= 0) {
    return res.status(400).json({ success: false, message: 'A valid branchId (number) is required.' });
  }

  if (typeof requiresPrescription !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'requiresPrescription must be a boolean.',
    });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: '"items" must be a non-empty array.' });
  }

  for (const item of items) {
    if (!item.medicine_id || !Number.isInteger(item.medicine_id) || item.medicine_id <= 0) {
      return res.status(400).json({ success: false, message: 'Each item needs a valid medicine_id.' });
    }
    if (!item.quantity || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Each item needs a positive integer quantity.' });
    }
  }

  try {
    // ── Verify branch exists ──────────────────────────────
    const branchCheck = await pool.query(
      'SELECT id FROM branches WHERE id = $1',
      [branchId]
    );
    if (branchCheck.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Branch not found.' });
    }

    // ── Verify all medicine IDs exist ─────────────────────
    const medicineIds = items.map((i) => i.medicine_id);
    const medCheck = await pool.query(
      'SELECT id FROM medicines WHERE id = ANY($1::int[])',
      [medicineIds]
    );
    if (medCheck.rows.length !== medicineIds.length) {
      return res.status(400).json({ success: false, message: 'One or more medicine IDs are invalid.' });
    }

    // ── Call PostgreSQL stored function place_order() ─────
    // Converts the items array to a JSONB parameter
    const result = await pool.query(
      `SELECT p_order_id, p_result_message
       FROM place_order($1::int, $2::uuid, $3::boolean, $4::jsonb)`,
      [branchId, customerId, requiresPrescription, JSON.stringify(items)]
    );

    const { p_order_id, p_result_message } = result.rows[0];

    if (p_result_message !== 'SUCCESS') {
      return res.status(422).json({
        success: false,
        message: p_result_message, // e.g. "FAILED: INSUFFICIENT_STOCK"
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: {
        orderId:   p_order_id,
        message:   p_result_message,
        nextStep:  requiresPrescription
          ? 'Please upload your prescription at POST /prescriptions/upload'
          : 'Your order is confirmed.',
      },
    });
  } catch (err) {
    console.error('[Orders/place]', err.message);
    return res.status(500).json({ success: false, message: 'Server error placing order.' });
  }
};

module.exports = { placeOrder };