# PharmaBuild-BE — API Reference (Backend ↔ Frontend)

> **Base URL:** `http://localhost:5000`  
> **All request bodies must be JSON** (`Content-Type: application/json`)  
> **Auth header format:** `Authorization: Bearer <token>`

---

## ⚠️ Known Issues / Bugs

| # | Issue | Location |
|---|-------|----------|
| 1 | `APIs/placeorder` module exists but is **NOT mounted** in `index.js` — `POST /orders/place` is unreachable | `index.js` |
| 2 | `GET /pharmacist/pending-prescriptions` is a stub (returns hardcoded JSON, not real data) — real endpoint is `GET /pharmacist/pending-prescription` (no 's') | `Pharmacist/routes.js` |
| 3 | Pharmacist routes have **no auth middleware** — any unauthenticated user can approve/reject prescriptions | `Pharmacist/routes.js` |
| 4 | `OrdercheckStock` (`POST /orders/check-stock`) has **no auth middleware** | `OrdercheckStock/routes.js` |
| 5 | `GET /medicines` has **no auth middleware** | `Medicines/routes.js` |

---

## Auth Middleware Summary

| Middleware | What it does |
|------------|--------------|
| `verifyToken` | Reads `Authorization: Bearer <token>`, verifies JWT. Attaches `{ id, email, role }` to `req.user`. Returns `401` if missing/invalid. |
| `authorizeRoles(role)` | Checks `req.user.role` against allowed roles. Returns `403` if role doesn't match. |

---

## 1. Auth — `/auth`

### `POST /auth/register`
**Auth Required:** ❌ None  
**Role Required:** ❌ None

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "role": "string | null  — e.g. 'customer', 'pharmacist', 'admin'",
  "phone": "string | null",
  "address": "string | null",
  "branch_id": "number | null"
}
```

**Success Response — `201 Created`:**
```json
{
  "success": true,
  "message": "Registration successful.",
  "data": {
    "token": "JWT string",
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "string",
      "phone": "string | null",
      "address": "string | null",
      "branch_id": "number | null",
      "created_at": "timestamp"
    }
  }
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `409` | Email already registered | `{ success: false, message: "Email already registered." }` |
| `500` | Server error | `{ success: false, message: "Server error during registration." }` |

---

### `POST /auth/login`
**Auth Required:** ❌ None  
**Role Required:** ❌ None

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "JWT string",
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "string",
      "phone": "string | null",
      "address": "string | null",
      "branch_id": "number | null"
    }
  }
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `401` | Wrong email or password | `{ success: false, message: "Invalid email or password." }` |
| `500` | Server error | `{ success: false, message: "Server error during login." }` |

---

### `GET /auth/profile`
**Auth Required:** ✅ `Bearer <token>`  
**Role Required:** Any valid token (no role restriction)

**Request:** No body. Token in header.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "string",
      "phone": "string | null",
      "address": "string | null",
      "branch_id": "number | null",
      "created_at": "timestamp"
    }
  }
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `401` | No/invalid token | `{ success: false, message: "Access denied. No token provided." }` |
| `404` | User not found | `{ success: false, message: "User not found." }` |
| `500` | Server error | `{ success: false, message: "Server error fetching profile." }` |

---

## 2. Medicines — `/medicines`

### `GET /medicines`
**Auth Required:** ❌ None (public route — no middleware applied)  
**Role Required:** ❌ None

**Request:** No body, no params.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "data": {
    "medicines": [
      {
        "id": "number",
        "name": "string",
        "is_prescription_required": "boolean",
        "created_at": "timestamp",
        "image_url": "string | null",
        "price": "number"
      }
    ]
  }
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `500` | Server error | `{ success: false, message: "Server error fetching medicines." }` |

---

## 3. Orders — `/orders`

### `POST /orders/check-stock`
**Auth Required:** ❌ None (public route — no middleware applied)  
**Role Required:** ❌ None

**Purpose:** Pass a list of medicines with quantities. Returns which branches have all items in stock, and whether a prescription is required.

**Request Body:**
```json
{
  "medicines": [
    { "medicineId": "number", "quantity": "number" },
    { "medicineId": "number", "quantity": "number" }
  ]
}
```

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "prescriptionRequired": "boolean",
  "prescriptionMedicines": [
    {
      "id": "number",
      "name": "string",
      "is_prescription_required": true
    }
  ],
  "availableBranches": [
    {
      "branchId": "number",
      "branchName": "string",
      "availableMedicines": [
        {
          "medicineId": "number",
          "medicineName": "string",
          "requestedQuantity": "number"
        }
      ]
    }
  ]
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `400` | `medicines` missing or empty array | `{ success: false, message: "Medicine list is required" }` |
| `404` | One or more medicine IDs not found | `{ success: false, message: "One or more medicines not found" }` |
| `500` | Server error | `{ success: false, message: "Internal Server Error" }` |

---

### `POST /orders/place`
> ⚠️ **BUG: This route is NOT mounted in `index.js`!** The `placeorder` module routes are never registered. You must add `app.use('/orders', require('./APIs/placeorder/routes'))` in `index.js` to activate this endpoint.

**Auth Required:** ✅ `Bearer <token>`  
**Role Required:** `customer`

**Request Body:**
```json
{
  "branchId": "number (required, positive integer)",
  "requiresPrescription": "boolean (required)",
  "items": [
    { "medicine_id": "number", "quantity": "number" },
    { "medicine_id": "number", "quantity": "number" }
  ]
}
```
> Note: `customerId` is taken from JWT token — do NOT send it in the request body.

**Success Response — `201 Created`:**
```json
{
  "success": true,
  "message": "Order placed successfully.",
  "data": {
    "orderId": "number",
    "message": "SUCCESS",
    "nextStep": "string — either 'Please upload your prescription...' or 'Your order is confirmed.'"
  }
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Invalid `branchId` | `{ success: false, message: "A valid branchId (number) is required." }` |
| `400` | `requiresPrescription` not boolean | `{ success: false, message: "requiresPrescription must be a boolean." }` |
| `400` | `items` missing/empty | `{ success: false, message: "\"items\" must be a non-empty array." }` |
| `400` | Bad `medicine_id` in item | `{ success: false, message: "Each item needs a valid medicine_id." }` |
| `400` | Bad `quantity` in item | `{ success: false, message: "Each item needs a positive integer quantity." }` |
| `400` | Branch not found | `{ success: false, message: "Branch not found." }` |
| `400` | Invalid medicine IDs | `{ success: false, message: "One or more medicine IDs are invalid." }` |
| `401` | No/invalid token | `{ success: false, message: "Access denied. No token provided." }` |
| `403` | Not a customer | `{ success: false, message: "Access denied. Required role(s): customer." }` |
| `422` | Insufficient stock (from DB) | `{ success: false, message: "FAILED: INSUFFICIENT_STOCK" }` |
| `500` | Server error | `{ success: false, message: "Server error placing order." }` |

---

## 4. Customer — `/customer`

> ⚠️ Note: The `Customer` module is defined in `APIs/Customer/` but is **NOT mounted in `index.js`**. You need to add `app.use('/customer', require('./APIs/Customer/routes'))` or similar.

**Auth Required:** ✅ `Bearer <token>`  
**Role Required:** `customer`

---

### `GET /customer/orders`
**Purpose:** Get all orders belonging to the currently logged-in customer.

**Request:** No body. Token in header.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "orders": [
    {
      "order_id": "number",
      "status": "string",
      "requires_prescription": "boolean",
      "stock_reserved": "boolean",
      "created_at": "timestamp",
      "branch_name": "string",
      "branch_location": "string"
    }
  ]
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `401` | No/invalid token | `{ success: false, message: "Access denied. No token provided." }` |
| `403` | Not a customer | `{ success: false, message: "Access denied. Required role(s): customer." }` |
| `500` | Server error | `{ success: false, message: "Server Error" }` |

---

### `GET /customer/orders/:id`
**Purpose:** Get full details of a specific order (order info + items + prescription) for the logged-in customer.

**URL Params:** `:id` — the order ID (integer)

**Request:** No body. Token in header.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "order": {
    "order_id": "number",
    "status": "string",
    "requires_prescription": "boolean",
    "stock_reserved": "boolean",
    "created_at": "timestamp",
    "branch_id": "number",
    "branch_name": "string",
    "branch_location": "string"
  },
  "items": [
    {
      "item_id": "number",
      "medicine_id": "number",
      "medicine_name": "string",
      "is_prescription_required": "boolean",
      "quantity": "number"
    }
  ],
  "prescription": {
    "id": "number",
    "image_url": "string",
    "uploaded_at": "timestamp",
    "verification_status": "string — 'Pending' | 'Approved' | 'Rejected'",
    "verified_at": "timestamp | null",
    "rejection_reason": "string | null"
  }
}
```
> `prescription` will be `null` if no prescription was uploaded for this order.

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Invalid order ID | `{ success: false, message: "Invalid Order ID" }` |
| `401` | No/invalid token | `{ success: false, message: "Access denied. No token provided." }` |
| `403` | Not a customer | `{ success: false, message: "Access denied. Required role(s): customer." }` |
| `404` | Order not found or belongs to another customer | `{ success: false, message: "Order not found" }` |
| `500` | Server error | `{ success: false, message: "Server Error" }` |

---

## 5. Pharmacist — `/pharmacist`

> ⚠️ **BUG: No auth middleware on any pharmacist route.** Any unauthenticated request can access/approve/reject prescriptions.

---

### `GET /pharmacist/pending-prescriptions`
> ⚠️ **STUB — returns hardcoded response, not real data.** Use `GET /pharmacist/pending-prescription` (without 's') for real data.

**Response (hardcoded):**
```json
{
  "success": true,
  "message": "Route is working"
}
```

---

### `GET /pharmacist/pending-prescription`
**Auth Required:** ❌ None (bug — should require pharmacist token)  
**Role Required:** ❌ None (bug)

**Request:** No body.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "prescriptions": [
    {
      "prescription_id": "number",
      "image_url": "string",
      "uploaded_at": "timestamp",
      "order_id": "number",
      "status": "string — order status",
      "branch_name": "string",
      "customer_name": "string",
      "email": "string"
    }
  ]
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `500` | Server error | `{ success: false, message: "Server Error" }` |

---

### `POST /pharmacist/approve`
**Auth Required:** ❌ None (bug)  
**Role Required:** ❌ None (bug)

**Request Body:**
```json
{
  "prescriptionId": "number (required)"
}
```

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Prescription Approved"
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Missing `prescriptionId` | `{ success: false, message: "Prescription ID required" }` |
| `400` | Prescription already processed | `{ success: false, message: "Already processed" }` |
| `404` | Prescription not found | `{ success: false, message: "Prescription not found" }` |
| `500` | Server error | `{ success: false, message: "Server Error" }` |

---

### `POST /pharmacist/reject`
**Auth Required:** ❌ None (bug)  
**Role Required:** ❌ None (bug)

**Request Body:**
```json
{
  "prescriptionId": "number (required)",
  "rejectionReason": "string (optional — defaults to 'No reason')"
}
```

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "message": "Prescription Rejected",
  "stockRelease": "string — message from DB stored function"
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `400` | Missing `prescriptionId` | `{ success: false, message: "Prescription ID required" }` |
| `400` | Prescription already processed | `{ success: false, message: "Already processed" }` |
| `404` | Prescription not found | `{ success: false, message: "Prescription not found" }` |
| `500` | Server error | `{ success: false, message: "Server Error" }` |

---

## 6. Admin — `/admin`

**Auth Required:** ✅ `Bearer <token>`  
**Role Required:** `admin`  
(All three routes share the same middleware via `router.use(verifyToken, authorizeRoles("admin"))`)

---

### `GET /admin/users`
**Purpose:** Fetch all registered users.

**Request:** No body. Token in header.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "string",
      "phone": "string | null",
      "address": "string | null",
      "branch_id": "number | null",
      "created_at": "timestamp"
    }
  ]
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `401` | No/invalid token | `{ success: false, message: "Access denied. No token provided." }` |
| `403` | Not an admin | `{ success: false, message: "Access denied. Required role(s): admin." }` |
| `500` | Server error | `{ success: false, message: "Server Error" }` |

---

### `GET /admin/branches`
**Purpose:** Fetch all branches with their complete stock status.

**Request:** No body. Token in header.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "branches": [
    {
      "id": "number",
      "name": "string",
      "...other branch fields": "...",
      "stock": [
        {
          "branch_id": "number",
          "medicine_id": "number",
          "medicine_name": "string",
          "quantity_available": "number",
          "low_stock_threshold": "number",
          "stock_status": "string — 'In Stock' | 'Low Stock' | 'Out of Stock'"
        }
      ]
    }
  ]
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `401` | No/invalid token | `{ success: false, message: "Access denied. No token provided." }` |
| `403` | Not an admin | `{ success: false, message: "Access denied. Required role(s): admin." }` |
| `500` | Server error | `{ success: false, message: "Server Error" }` |

---

### `GET /admin/orders`
**Purpose:** Fetch all orders across all branches with prescription info.

**Request:** No body. Token in header.

**Success Response — `200 OK`:**
```json
{
  "success": true,
  "orders": [
    {
      "order_id": "number",
      "status": "string",
      "requires_prescription": "boolean",
      "stock_reserved": "boolean",
      "created_at": "timestamp",
      "branch_name": "string",
      "customer_name": "string",
      "verification_status": "string | null — 'Pending' | 'Approved' | 'Rejected'",
      "image_url": "string | null",
      "rejection_reason": "string | null"
    }
  ]
}
```

**Error Responses:**
| Status | Condition | Body |
|--------|-----------|------|
| `401` | No/invalid token | `{ success: false, message: "Access denied. No token provided." }` |
| `403` | Not an admin | `{ success: false, message: "Access denied. Required role(s): admin." }` |
| `500` | Server error | `{ success: false, message: "Server Error" }` |

---

## Quick Reference Table

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| POST | `/auth/register` | ❌ | — | Register new user |
| POST | `/auth/login` | ❌ | — | Login, get JWT token |
| GET | `/auth/profile` | ✅ | Any | Get current user's profile |
| GET | `/medicines` | ❌ | — | List all medicines |
| POST | `/orders/check-stock` | ❌ | — | Check stock availability across branches |
| POST | `/orders/place` | ✅ | customer | Place an order ⚠️ NOT MOUNTED |
| GET | `/customer/orders` | ✅ | customer | My order list ⚠️ NOT MOUNTED |
| GET | `/customer/orders/:id` | ✅ | customer | My order detail ⚠️ NOT MOUNTED |
| GET | `/pharmacist/pending-prescription` | ❌ | — | Pending prescription list ⚠️ No auth |
| POST | `/pharmacist/approve` | ❌ | — | Approve prescription ⚠️ No auth |
| POST | `/pharmacist/reject` | ❌ | — | Reject prescription ⚠️ No auth |
| GET | `/admin/users` | ✅ | admin | All users |
| GET | `/admin/branches` | ✅ | admin | All branches + stock |
| GET | `/admin/orders` | ✅ | admin | All orders |

---

## Fix Checklist for `index.js`

Add these two missing `app.use` lines to activate the unmounted routes:

```js
// In index.js — ADD THESE:
app.use('/orders', require('./APIs/placeorder/routes'));   // POST /orders/place
app.use('/customer', require('./APIs/Customer/routes'));   // GET /customer/orders, GET /customer/orders/:id
```
