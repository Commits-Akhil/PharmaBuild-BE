const pool = require("../../config");

const checkStock = async (req, res) => {
    try {
        const { medicines } = req.body;

      
        if (!Array.isArray(medicines) || medicines.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Medicine list is required"
            });
        }

        
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

        const medicineMap = new Map();

        medicineResult.rows.forEach(medicine => {
            medicineMap.set(medicine.id, medicine);
        });

        const prescriptionMedicines = medicineResult.rows.filter(
            medicine => medicine.is_prescription_required
        );

        const requiresPrescription = prescriptionMedicines.length > 0;

        const branchResult = await pool.query(`
            SELECT
                id,
                name
            FROM branches
            ORDER BY id
        `);

        const stockResult = await pool.query(
            `
            SELECT
                branch_id,
                medicine_id,
                quantity_available
            FROM branch_stock
            WHERE medicine_id = ANY($1)
            `,
            [medicineIds]
        );

   
        const stockMap = new Map();

        stockResult.rows.forEach(stock => {
            stockMap.set(
                `${stock.branch_id}-${stock.medicine_id}`,
                stock.quantity_available
            );
        });

        const eligibleBranches = [];


        for (const branch of branchResult.rows) {

            let available = true;

            for (const item of medicines) {

                const availableQuantity =
                    stockMap.get(`${branch.id}-${item.medicineId}`) ?? 0;

                if (availableQuantity < item.quantity) {
                    available = false;
                    break;
                }
            }

            if (available) {

                const availableMedicines = medicines.map(item => {

                    const medicine = medicineMap.get(item.medicineId);

                    return {
                        medicineId: item.medicineId,
                        medicineName: medicine.name,
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

        console.error("Check Stock Error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

module.exports = {
    checkStock
};