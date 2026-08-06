# Delivery Partner Feature — Change Log

**Branch:** `tanish` → merged into `dev`
**Session Date:** 2026-08-06
**Author:** Tanish
**Remote:** `https://github.com/Commits-Akhil/PharmaBuild-BE`

---

## Overview

This session adds a full **Delivery Partner** feature to the RxConnect pharmacy backend. A new role (`delivery_partner`) was introduced end-to-end: registration with secret-key gating, JWT-protected API routes, and atomic order claiming to prevent race conditions between multiple delivery partners.

---

## 1. Database Changes (Supabase PostgreSQL)

### 1.1 `orders` Table — New Columns

Run these SQL statements in the **Supabase SQL Editor**:

```sql
-- Who is delivering this order (NULL = unclaimed)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_partner_id UUID
    REFERENCES users(id) ON DELETE SET NULL;

-- Last-updated timestamp for tracking status changes
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
```

### 1.2 New Indexes on `orders`

```sql
-- Fast lookup: "my orders" by delivery partner
CREATE INDEX IF NOT EXISTS idx_orders_delivery_partner
  ON orders(delivery_partner_id);

-- Fast lookup: available unclaimed orders ready for pickup
CREATE INDEX IF NOT EXISTS idx_orders_status_delivery
  ON orders(status, delivery_partner_id)
  WHERE delivery_partner_id IS NULL;
```

### 1.3 New Order Status Values

If your `status` column is a **PostgreSQL ENUM** (check with the query below), add the new values:

```sql
-- Check if status is an enum
SELECT typname, enumlabel FROM pg_enum e
JOIN pg_type t ON t.oid = e.enumtypid
WHERE typname ILIKE '%status%';

-- If it is an enum, run:
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'ready_for_pickup';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'out_for_delivery';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'delivered';
```

> If `status` is plain `TEXT`, no enum changes are needed — the strings work as-is.

### 1.4 Order Status Flow

```
pending
  └─► (pharmacist approves / packs order)
        └─► ready_for_pickup        ← delivery partners can now see and claim this order
              └─► (delivery partner claims)
                    └─► out_for_delivery   ← order locked to that partner
                          └─► (delivery partner marks done)
                                └─► delivered
```

### 1.5 `users` Table — New Role Value

If `users.role` is a **PostgreSQL ENUM**, add the new value:

```sql
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'delivery_partner';
```

If it is plain `TEXT`, no change is needed.

---

## 2. Backend Changes

### 2.1 New Files Created

| File | Description |
|------|-------------|
| `backend/APIs/Delivery/controller.js` | Controller with 4 delivery partner functions |
| `backend/APIs/Delivery/routes.js` | Express router — all routes protected by `delivery_partner` JWT |

---

### 2.2 Modified Files

#### `backend/index.js`
Mounted the new delivery routes:
```js
// Added line:
app.use("/delivery", require("./APIs/Delivery/routes"));
```

#### `backend/APIs/Auth/controller.js`
- Added `'delivery_partner'` to `allowedRoles` array.
- Added secret validation block for the new role:
```js
if (selectedRole === 'delivery_partner') {
  if (!role_secret || role_secret !== process.env.DELIVERY_SECRET)
    return res.status(403).json({ success: false, message: 'Invalid delivery partner registration secret.' });
}
```

#### `backend/.env`
Added new environment variable:
```env
DELIVERY_SECRET=DELIVER
```

#### `.gitignore`
Resolved `add/add` merge conflict between `tanish` and `origin/main`. Final merged version includes:
- `**/node_modules/`, `.next/`, build dirs
- `.env`, `.env.*`, `!.env.example`
- `*.log`, `npm-debug.log*`, `yarn-debug.log*`
- `.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`

---

## 3. Delivery Partner API Endpoints

**Base path:** `/delivery`
**Auth:** All endpoints require `Authorization: Bearer <token>` with `role = delivery_partner`

---

### 3.1 Register as Delivery Partner

**`POST /auth/register`**

> Same endpoint as other roles. Use `role_secret: "DELIVER"` to gate registration.

**Request Body:**
```json
{
  "name": "Delivery Partner Name",
  "email": "partner@example.com",
  "password": "yourpassword",
  "phone": "9876543210",
  "address": "123 Logistics Street",
  "role": "delivery_partner",
  "role_secret": "DELIVER"
}
```

**Success Response `201`:**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "token": "<JWT>",
    "user": {
      "id": "uuid",
      "name": "Delivery Partner Name",
      "email": "partner@example.com",
      "role": "delivery_partner",
      ...
    }
  }
}
```

**Error Responses:**
- `400` — Invalid role
- `403` — Wrong `role_secret`
- `409` — Email already registered

---

### 3.2 Login

**`POST /auth/login`**

> Same endpoint as all other roles. Returns a JWT with `role: "delivery_partner"`.

**Request Body:**
```json
{
  "email": "partner@example.com",
  "password": "yourpassword"
}
```

---

### 3.3 Get Available Orders

**`GET /delivery/orders/available`**

Lists all unclaimed orders with status `ready_for_pickup`. Shows the **branch pickup address** and **customer delivery address**.

**Headers:**
```
Authorization: Bearer <delivery_partner_token>
```

**Success Response `200`:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "order_id": 42,
      "status": "ready_for_pickup",
      "created_at": "2026-08-06T10:00:00Z",
      "branch_id": 1,
      "branch_name": "RxConnect Downtown",
      "pickup_address": "12 MG Road, Bangalore",
      "customer_name": "Rohan Sharma",
      "delivery_address": "456 Customer Lane, Bangalore",
      "customer_phone": "9876543210"
    }
  ]
}
```

**Error Responses:**
- `401` — No token / invalid token
- `403` — Wrong role (not `delivery_partner`)

---

### 3.4 Claim an Order

**`POST /delivery/orders/:orderId/claim`**

Atomically assigns an order to the calling delivery partner. Uses `FOR UPDATE SKIP LOCKED` — if two partners claim simultaneously, only one wins.

**Headers:**
```
Authorization: Bearer <delivery_partner_token>
```

**URL Param:** `:orderId` — the integer ID of the order to claim.

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Order claimed successfully. Status set to 'out_for_delivery'.",
  "data": {
    "id": 42,
    "status": "out_for_delivery",
    "delivery_partner_id": "uuid-of-delivery-partner",
    "updated_at": "2026-08-06T12:34:56Z"
  }
}
```

**Error Responses:**
- `400` — Order exists but status is not `ready_for_pickup`
- `409` — Order already claimed by someone else (race condition handled)
- `409` — Order not found / already locked

---

### 3.5 View My Orders

**`GET /delivery/orders/my-orders`**

Lists all orders currently assigned to the logged-in delivery partner (any status).

**Headers:**
```
Authorization: Bearer <delivery_partner_token>
```

**Success Response `200`:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "order_id": 42,
      "status": "out_for_delivery",
      "created_at": "2026-08-06T10:00:00Z",
      "updated_at": "2026-08-06T12:34:56Z",
      "branch_name": "RxConnect Downtown",
      "pickup_address": "12 MG Road, Bangalore",
      "customer_name": "Rohan Sharma",
      "delivery_address": "456 Customer Lane, Bangalore",
      "customer_phone": "9876543210"
    }
  ]
}
```

---

### 3.6 Mark Order as Delivered

**`PATCH /delivery/orders/:orderId/delivered`**

Marks an order as `delivered`. Only works if the order belongs to the calling partner and is currently `out_for_delivery`.

**Headers:**
```
Authorization: Bearer <delivery_partner_token>
```

**URL Param:** `:orderId` — the order ID.

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Order marked as delivered.",
  "data": {
    "id": 42,
    "status": "delivered",
    "updated_at": "2026-08-06T14:00:00Z"
  }
}
```

**Error Responses:**
- `404` — Order not found or not owned by this partner

---

## 4. API Test Results

All 8 endpoint tests passed against the live Supabase database:

| # | Test | Status Code | Result |
|---|------|-------------|--------|
| 1 | Register delivery partner (valid secret) | `201` | ✅ PASS |
| 2 | Register with invalid secret | `403` | ✅ PASS |
| 3 | GET available orders (valid token) | `200` | ✅ PASS |
| 4 | GET my orders (valid token) | `200` | ✅ PASS |
| 5 | GET available orders (no token) | `401` | ✅ PASS |
| 6 | GET available orders (customer token) | `403` | ✅ PASS |
| 7 | Claim non-existent order | `409` | ✅ PASS |
| 8 | Mark unowned order as delivered | `404` | ✅ PASS |

---

## 5. Git History

```
a785475  Merge origin/main into tanish - resolve .gitignore conflict, bring in delivery API
afe1301  delivery (routes.js + controller.js added)
6cb1f64  delivery (auth + index.js changes)
```

**Branches updated:**
- `tanish` — feature branch (pushed)
- `dev` — merged from `tanish`, pushed to `origin/dev`

---

## 6. Environment Variables Required

Add these to `backend/.env`:

```env
DATABASE_URL=<your_supabase_connection_string>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=7d
PORT=5000

# Role registration secrets
ADMIN_SECRET=ADMIN
PHARMACIST_SECRET=PHARM
DELIVERY_SECRET=DELIVER       # ← NEW
```
