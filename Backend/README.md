# RxConnect Test API

One test endpoint per database function/query, so each piece of backend logic
can be verified independently over real HTTP before wiring up the full app.

## Setup

```bash
npm install
```

Update `db.js` with your database credentials (currently set up for a local
Postgres instance for testing — swap in your Supabase connection string, or
switch to `supabase-js` with `.rpc()` calls for your real deployed backend).

```bash
node server.js
```

Server runs on `http://localhost:3000`.

## Endpoints and sample requests

### 1. Signup
```bash
curl -X POST localhost:3000/api/test/signup -H "Content-Type: application/json" -d '{
  "name": "Tanish", "email": "tanish@example.com", "password": "pass123",
  "role": "customer", "phone": "9876543210", "address": "Kadri, Mangaluru"
}'
```

### 2. Login (returns a JWT)
```bash
curl -X POST localhost:3000/api/test/login -H "Content-Type: application/json" -d '{
  "email": "tanish@example.com", "password": "pass123"
}'
```

### 3. Find branches with full order availability
```bash
curl -X POST localhost:3000/api/test/find-availability -H "Content-Type: application/json" -d '{
  "items": [{"medicine_id":1,"quantity":2},{"medicine_id":3,"quantity":1}]
}'
```

### 4. Place an order
```bash
curl -X POST localhost:3000/api/test/place-order -H "Content-Type: application/json" -d '{
  "branch_id": 1, "customer_id": "PASTE_CUSTOMER_UUID_HERE",
  "requires_prescription": true, "items": [{"medicine_id":3,"quantity":1}]
}'
```

### 5. Upload a prescription
```bash
curl -X POST localhost:3000/api/test/prescriptions -H "Content-Type: application/json" -d '{
  "order_id": 1, "image_url": "https://storage.example.com/rx/order1.jpg"
}'
```

### 6. Pharmacist queue (branch-scoped)
```bash
curl localhost:3000/api/test/pharmacist-queue/1
```

### 7. Verify (approve/reject) a prescription
```bash
curl -X POST localhost:3000/api/test/verify-prescription -H "Content-Type: application/json" -d '{
  "prescription_id": 1, "pharmacist_id": "PASTE_PHARMACIST_UUID_HERE",
  "approved": true
}'
```

### 8. Release/cancel an order manually
```bash
curl -X POST localhost:3000/api/test/release-order -H "Content-Type: application/json" -d '{
  "order_id": 1, "new_status": "Cancelled"
}'
```

### 9. Get a customer's order history
```bash
curl localhost:3000/api/test/customer-orders/PASTE_CUSTOMER_UUID_HERE
```

## Known gotcha (already fixed here, worth remembering)

When calling a Postgres function that takes a UUID parameter through
node-postgres (`pg`), you must explicitly cast the parameter placeholder,
e.g. `$2::uuid` — not just `$2`. Without the cast, node-postgres can pass
the value as the wrong underlying type, and Postgres silently stores it as
NULL instead of throwing an error. This bit us on `place_order` and
`verify_prescription` during testing — both are fixed in `server.js`, but
keep this in mind if you add new UUID-taking routes.
