const { Pool } = require('pg');

// For local testing, this connects directly via node-postgres.
// In your real Supabase-hosted project, you'd instead use supabase-js's
// `.rpc('function_name', { ...params })` — which, under the hood, sends
// a request that runs the exact same Postgres function this file calls
// directly. The SQL logic and results are identical either way.
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rxconnect_test',
  password: 'testpass',
  port: 5432,
});

module.exports = pool;
