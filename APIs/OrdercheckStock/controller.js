const pool = require("../../config");

const checkStock = async (req, res) => {
    try {

        const { medicines } = req.body;

        if (!medicines || medicines.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Medicine list is required"
            });
        }

        // Get medicine details
        const medicineIds = medicines.map(item => item.medicineId);

        const medicineResult = await pool.query(
            `
            SELECT
                id,
                name,
                is_prescription_required
            FROM medicines
            WHERE id = ANY($1)
            `,
            [medicineIds]
        );

        if (medicineResult.rows.length !== medicineIds.length) {
            return res.status(404).json({
                success: false,
                message: "One or more medicines not found"
            });
        }

        // Prescription Check
        const prescriptionMedicines = medicineResult.rows.filter(
            med => med.is_prescription_required
        );

        const requiresPrescription = prescriptionMedicines.length > 0;

        // Get all branches
        const branches = await pool.query(`
            SELECT id,name
            FROM branches
            ORDER BY id
        `);

        const eligibleBranches = [];

        for (const branch of branches.rows) {

            let available = true;

            for (const item of medicines) {

                const stock = await pool.query(
                    `
                    SELECT quantity_available
                    FROM branch_stock
                    WHERE branch_id=$1
                    AND medicine_id=$2
                    `,
                    [branch.id, item.medicineId]
                );

                if (
                    stock.rowCount === 0 ||
                    stock.rows[0].quantity_available < item.quantity
                ) {
                    available = false;
                    break;
                }
            }

            if (available) {

                const availableMedicines = medicines.map(item => {

                    const med = medicineResult.rows.find(
                        m => m.id === item.medicineId
                    );

                    return {
                        medicineId: item.medicineId,
                        medicineName: med.name,
                        requestedQuantity: item.quantity
                    };

                });

                eligibleBranches.push({
                    branchId: branch.id,
                    branchName: branch.name,
                    availableMedicines
                });
            }
        }

        return res.status(200).json({
            success: true,
            prescriptionRequired: requiresPrescription,
            prescriptionMedicines,
            availableBranches: eligibleBranches
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

module.exports = {
    checkStock
};