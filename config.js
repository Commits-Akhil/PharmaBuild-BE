const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const jwtCustomerPass = process.env.jwtCustomerPass;
const  jwtShopPass= process.env.jwtShopPass;
const jwtDeliveryPass=process.env.jwtDeliveryPass;

// Test Database Connection
pool.connect()
    .then(client => {
        console.log("✅ Connected to Supabase PostgreSQL");
        client.release();
    })
    .catch(err => {
        console.error("❌ Database Connection Failed");
        console.error(err.message);
    });

module.exports = pool;