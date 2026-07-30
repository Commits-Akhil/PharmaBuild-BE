const pool = require('../../config');

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, phone, address, branch_id, created_at FROM users ORDER BY created_at DESC`
    );
    return res.status(200).json({ success: true, data: { users: result.rows } });
  } catch (err) {
    console.error('[Admin/getAllUsers]', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching users.' });
  }
};


 ///GET /admin/branches

const getAllBranches = async (req, res) => {
  try {
    const branchRes = await pool.query(`SELECT id, name, location, created_at FROM branches ORDER BY id`);

    const stockRes = await pool.query(
      `SELECT
         bs.branch_id,
         bs.medicine_id,
         m.name AS medicine_name,
         bs.quantity_available,
         bs.low_stock_threshold,
         CASE
           WHEN bs.quantity_available = 0                        THEN 'Out of Stock'
           WHEN bs.quantity_available <= bs.low_stock_threshold  THEN 'Low Stock'
           ELSE 'In Stock'
         END AS stock_status
       FROM branch_stock bs
       JOIN medicines m ON m.id = bs.medicine_id
       ORDER BY bs.branch_id, m.name`
    );

    const stockByBranch = {};
    stockRes.rows.forEach((row) => {
      if (!stockByBranch[row.branch_id]) stockByBranch[row.branch_id] = [];
      stockByBranch[row.branch_id].push(row);
    });

    const branches = branchRes.rows.map((b) => ({ ...b, stock: stockByBranch[b.id] || [] }));

    return res.status(200).json({ success: true, data: { branches } });
  } catch (err) {
    console.error('[Admin/getAllBranches]', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching branches.' });
  }
};

// GET /admin/orders

const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         o.id              AS order_id,
         o.status,
         o.requires_prescription,
         o.stock_reserved,
         o.created_at,
         b.id              AS branch_id,
         b.name            AS branch_name,
         b.location        AS branch_location,
         u.id              AS customer_id,
         u.name            AS customer_name,
         u.email           AS customer_email,
         u.phone           AS customer_phone,
         p.id              AS prescription_id,
         p.verification_status,
         p.image_url,
         p.verified_at,
         p.rejection_reason
       FROM orders o
       JOIN branches         b ON b.id = o.branch_id
       JOIN users            u ON u.id = o.customer_id
       LEFT JOIN prescriptions p ON p.order_id = o.id
       ORDER BY o.created_at DESC`
    );
    return res.status(200).json({ success: true, data: { orders: result.rows } });
  } catch (err) {
    console.error('[Admin/getAllOrders]', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching orders.' });
  }
};

// GET /admin/branches/:branchId/today-orders

const getBranchTodayOrders = async (req, res) => {
  const { branchId } = req.params;

  if (!Number.isInteger(Number(branchId)) || Number(branchId) <= 0) {
    return res.status(400).json({ success: false, message: 'A valid branchId (positive integer) is required.' });
  }

  try {
    const branchRes = await pool.query(
      `SELECT id, name, location FROM branches WHERE id = $1`,
      [Number(branchId)]
    );

    if (branchRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Branch not found.' });
    }

    const ordersRes = await pool.query(
      `SELECT
         o.id              AS order_id,
         o.status,
         o.requires_prescription,
         o.stock_reserved,
         o.created_at,
         u.id              AS customer_id,
         u.name            AS customer_name,
         u.email           AS customer_email,
         u.phone           AS customer_phone,
         p.id              AS prescription_id,
         p.verification_status,
         p.image_url,
         p.verified_at,
         p.rejection_reason
       FROM orders o
       JOIN users u ON u.id = o.customer_id
       LEFT JOIN prescriptions p ON p.order_id = o.id
       WHERE o.branch_id = $1 AND o.created_at >= CURRENT_DATE
       ORDER BY o.created_at DESC`,
      [Number(branchId)]
    );

    const orders = ordersRes.rows;

    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.order_id);
      const itemsRes = await pool.query(
        `SELECT
           oi.order_id,
           oi.id AS item_id,
           m.id AS medicine_id,
           m.name AS medicine_name,
           m.price,
           m.is_prescription_required,
           oi.quantity
         FROM order_items oi
         JOIN medicines m ON m.id = oi.medicine_id
         WHERE oi.order_id = ANY($1::int[])`,
        [orderIds]
      );

      const itemsByOrder = {};
      itemsRes.rows.forEach((item) => {
        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
        itemsByOrder[item.order_id].push(item);
      });

      orders.forEach((o) => {
        o.items = itemsByOrder[o.order_id] || [];
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        branch: branchRes.rows[0],
        total_today_orders: orders.length,
        orders,
      },
    });
  } catch (err) {
    console.error('[Admin/getBranchTodayOrders]', err.message);
    return res.status(500).json({ success: false, message: "Server error fetching today's orders." });
  }
};

// GET /admin/branches/low-stock

const getLowStockByBranch = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         b.id                     AS branch_id,
         b.name                   AS branch_name,
         b.location               AS branch_location,
         bs.medicine_id,
         m.name                   AS medicine_name,
         m.price,
         m.is_prescription_required,
         bs.quantity_available,
         bs.low_stock_threshold,
         CASE
           WHEN bs.quantity_available = 0 THEN 'Out of Stock'
           ELSE 'Low Stock'
         END AS stock_status
       FROM branch_stock bs
       JOIN branches b ON b.id = bs.branch_id
       JOIN medicines m ON m.id = bs.medicine_id
       WHERE bs.quantity_available <= bs.low_stock_threshold
       ORDER BY b.id, bs.quantity_available ASC`
    );

    const lowStockByBranch = {};
    result.rows.forEach((row) => {
      if (!lowStockByBranch[row.branch_id]) {
        lowStockByBranch[row.branch_id] = {
          branch_id: row.branch_id,
          branch_name: row.branch_name,
          branch_location: row.branch_location,
          low_stock_items: [],
        };
      }
      lowStockByBranch[row.branch_id].low_stock_items.push({
        medicine_id: row.medicine_id,
        medicine_name: row.medicine_name,
        price: row.price,
        is_prescription_required: row.is_prescription_required,
        quantity_available: row.quantity_available,
        low_stock_threshold: row.low_stock_threshold,
        stock_status: row.stock_status,
      });
    });

    return res.status(200).json({
      success: true,
      data: {
        total_low_stock_items: result.rows.length,
        branches: Object.values(lowStockByBranch),
      },
    });
  } catch (err) {
    console.error('[Admin/getLowStockByBranch]', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching low stock report.' });
  }
};

// GET /admin/branches/fulfillment-failures

const getFulfillmentFailures = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         b.id AS branch_id,
         b.name AS branch_name,
         b.location AS branch_location,
         COUNT(o.id)::int AS total_orders,
         COUNT(CASE WHEN o.status::text IN ('Rejected', 'Cancelled') THEN 1 END)::int AS failed_orders,
         COUNT(CASE WHEN o.status::text = 'Rejected' THEN 1 END)::int AS rejected_orders,
         COUNT(CASE WHEN o.status::text = 'Cancelled' THEN 1 END)::int AS cancelled_orders,
         COUNT(CASE WHEN o.status::text = 'Placed' THEN 1 END)::int AS placed_orders,
         COUNT(CASE WHEN o.status::text = 'Verified' THEN 1 END)::int AS verified_orders,
         COUNT(CASE WHEN o.status::text = 'Delivered' THEN 1 END)::int AS delivered_orders,
         COALESCE(
           ROUND(
             (COUNT(CASE WHEN o.status::text IN ('Rejected', 'Cancelled') THEN 1 END)::numeric / NULLIF(COUNT(o.id), 0)) * 100,
             2
           ),
           0
         ) AS failure_rate_percentage,
         (
           SELECT COUNT(*)::int 
           FROM branch_stock bs 
           WHERE bs.branch_id = b.id AND bs.quantity_available = 0
         ) AS out_of_stock_count,
         (
           SELECT COUNT(*)::int 
           FROM branch_stock bs 
           WHERE bs.branch_id = b.id AND bs.quantity_available <= bs.low_stock_threshold
         ) AS low_stock_count
       FROM branches b
       LEFT JOIN orders o ON o.branch_id = b.id
       GROUP BY b.id, b.name, b.location
       ORDER BY failed_orders DESC, failure_rate_percentage DESC, out_of_stock_count DESC`
    );

    return res.status(200).json({
      success: true,
      message: 'Fulfillment failure metrics by branch',
      data: {
        failing_branches_summary: result.rows,
      },
    });
  } catch (err) {
    console.error('[Admin/getFulfillmentFailures]', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching fulfillment failure metrics.' });
  }
};

module.exports = {
  getAllUsers,
  getAllBranches,
  getAllOrders,
  getBranchTodayOrders,
  getLowStockByBranch,
  getFulfillmentFailures,
};
