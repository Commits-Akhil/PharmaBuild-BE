const pool = require('./config');

async function main() {
  try {
    // Check orders available for delivery (Verified = prescription approved, Placed = OTC)
    const r = await pool.query(
      "SELECT id, status, requires_prescription, delivery_partner_id FROM orders WHERE status IN ('Verified','Placed') AND delivery_partner_id IS NULL ORDER BY created_at ASC"
    );
    console.log("Orders available for delivery:", r.rows.length);
    r.rows.forEach(o => console.log(" -", JSON.stringify(o)));

    // Show all distinct statuses in DB
    const s = await pool.query("SELECT DISTINCT status FROM orders ORDER BY status");
    console.log("All statuses in DB:", s.rows.map(x => x.status));
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await pool.end();
  }
}
main();
