const pool = require("../../config");

// Users
const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id,name,email,role,phone,address,branch_id,created_at
             FROM users
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            users: result.rows
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Branches
const getAllBranches = async (req, res) => {
    try {

        const branches = await pool.query(
            `SELECT * FROM branches ORDER BY id`
        );

        const stock = await pool.query(
            `SELECT
                bs.branch_id,
                bs.medicine_id,
                m.name AS medicine_name,
                bs.quantity_available,
                bs.low_stock_threshold,
                CASE
                    WHEN bs.quantity_available=0 THEN 'Out of Stock'
                    WHEN bs.quantity_available<=bs.low_stock_threshold THEN 'Low Stock'
                    ELSE 'In Stock'
                END AS stock_status
             FROM branch_stock bs
             JOIN medicines m
             ON bs.medicine_id=m.id`
        );

        const data = branches.rows.map(branch => ({
            ...branch,
            stock: stock.rows.filter(s => s.branch_id === branch.id)
        }));

        res.json({
            success: true,
            branches: data
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// Orders
const getAllOrders = async (req, res) => {
    try {

        const result = await pool.query(
            `SELECT
                o.id AS order_id,
                o.status,
                o.requires_prescription,
                o.stock_reserved,
                o.created_at,
                b.name AS branch_name,
                u.name AS customer_name,
                p.verification_status,
                p.image_url,
                p.rejection_reason
             FROM orders o
             JOIN branches b
             ON o.branch_id=b.id
             JOIN users u
             ON o.customer_id=u.id
             LEFT JOIN prescriptions p
             ON o.id=p.order_id
             ORDER BY o.created_at DESC`
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

module.exports = {
    getAllUsers,
    getAllBranches,
    getAllOrders
};