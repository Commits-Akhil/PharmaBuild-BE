# RxConnect Backend — Frontend AI Integration Guide

This document provides complete architectural context, folder structure, API endpoint specifications, data flow lifecycles, and integration patterns for an AI Agent or developer connecting a frontend client (React/Vite/Next.js/Vue/Mobile) to the **RxConnect Pharmacy Backend API**.

---

## 1. System Architecture & Base URLs

- **Base URL:** `http://localhost:5000` (or `process.env.VITE_API_BASE_URL`)
- **Static Media URL:** `http://localhost:5000/uploads/<filename>`
- **Content Types:**
  - Standard API requests: `application/json`
  - Prescription upload: `multipart/form-data`
- **Authentication:** Bearer Token via HTTP Header
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```

---

## 2. Directory & Folder Structure

```
backend/
├── APIs/                      # Modular API Domain Handlers
│   ├── Admin/                 # Admin operations (manage users, stock, orders)
│   │   ├── controller.js
│   │   └── routes.js
│   ├── Auth/                  # User authentication & registration
│   │   ├── controller.js
│   │   ├── routes.js
│   │   └── auth_test_endpoints.json
│   ├── Customer/              # Customer order history & tracking
│   │   ├── controller.js
│   │   └── routes.js
│   ├── Medicines/             # Medicine catalog endpoints
│   │   ├── controller.js
│   │   └── routes.js
│   ├── Orders/                # Order creation & atomic database execution
│   │   ├── controller.js
│   │   └── routes.js
│   ├── OrdersCheckStock/      # Cart stock verification & prescription check
│   │   ├── controller.js
│   │   └── routes.js
│   ├── Pharmacist/            # Pharmacist prescription queue & verification
│   │   ├── controller.js
│   │   └── routes.js
│   └── Prescriptions/         # Multer file upload & prescription metadata
│       ├── controller.js
│       └── routes.js
├── AuthHandler/               # Express Security Middleware
│   ├── authorizeRoles.js      # Role-based Access Control (RBAC) middleware
│   └── verifyToken.js         # JWT Token verification middleware
├── uploads/                   # Physical storage for prescription image uploads
├── config.js                  # PostgreSQL Pool Connection
├── index.js                   # Main Express application entry point
├── .env                       # Environment configuration
└── FRONTEND_INTEGRATION_GUIDE.md  # (This guide)
```

---

## 3. End-to-End User Workflows & Lifecycles

### Workflow A: User Authentication & Role Setup
```
[User Selects Role] ──▶ [Calls POST /auth/register] ──▶ [Receive JWT & Store in LocalStorage]
                                                     └──▶ [Set Auth Header in Axios/Fetch]
```
1. **Roles:** `customer`, `pharmacist`, `admin`.
2. **Registration:** Customers register freely. `admin` and `pharmacist` must include a valid `role_secret` (`ADMIN` or `PHARM`).
3. **Login:** Submit `email` and `password` to receive JWT. JWT contains `{ id, email, role }`.

---

### Workflow B: Checkout & Order Placement Lifecycle
```
 1. Add Medicines to Cart
            │
            ▼
 2. POST /orders/check-stock ──▶ Returns: { requiresPrescription: true/false, availableBranches: [...] }
            │
            ├─────────────────────────────────────────┐
            │                                         │
 [requiresPrescription = false]            [requiresPrescription = true]
            │                                         │
            │                              Show Prompt to User:
            │                              "Prescription Required for Checkout"
            │                                         │
            ▼                                         ▼
 3. POST /orders/place ─────────────────────▶ POST /orders/place
    Payload: { branchId,                        Payload: { branchId,
      requiresPrescription: false,                 requiresPrescription: true,
      items: [...] }                               items: [...] }
            │                                         │
            ▼                                         ▼
    Order Complete                     Order Created (Status: Pending)
                                                      │
                                                      ▼
                                           4. POST /prescriptions/upload
                                              Payload: FormData (orderId, prescription file)
                                                      │
                                                      ▼
                                           Awaiting Pharmacist Approval
```

---

### Workflow C: Prescription Review Lifecycle (Pharmacist)
```
1. Pharmacist logs in (Role: pharmacist)
2. GET /pharmacist/pending-prescriptions ──▶ Fetch queue of pending uploads
3. Pharmacist inspects image at: http://localhost:5000/uploads/<filename>
4. Pharmacist Action:
   ├── POST /pharmacist/approve ──▶ Order status changes to "Verified"
   └── POST /pharmacist/reject  ──▶ Stock automatically released back to branch;
                                     Order status changes to "Rejected"
```

---

## 4. Comprehensive API Endpoint Reference

### 🔑 4.1 Authentication (`/auth`)

#### 1. Register User
- **Route:** `POST /auth/register`
- **Auth Required:** None (Public)
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "role": "customer",
    "role_secret": null,
    "phone": "+1234567890",
    "address": "123 Main St",
    "branch_id": 1
  }
  ```
  *(Note: For `admin` role set `role_secret: "ADMIN"`. For `pharmacist` role set `role_secret: "PHARM"`.)*
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful.",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "uuid",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "customer",
        "phone": "+1234567890",
        "address": "123 Main St",
        "branch_id": 1,
        "created_at": "2026-07-30T10:00:00.000Z"
      }
    }
  }
  ```
- **Error Statuses:** `400` (Invalid role/missing parameters), `403` (Invalid role secret), `409` (Email already registered), `500` (Server error).

#### 2. Login User
- **Route:** `POST /auth/login`
- **Auth Required:** None (Public)
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "uuid",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "customer",
        "phone": "+1234567890",
        "address": "123 Main St",
        "branch_id": 1
      }
    }
  }
  ```
- **Error Statuses:** `401` (Invalid email or password), `500` (Server error).

#### 3. Get Authenticated User Profile
- **Route:** `GET /auth/profile`
- **Auth Required:** Yes (Bearer Token)
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "uuid",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "customer",
        "phone": "+1234567890",
        "address": "123 Main St",
        "branch_id": 1,
        "created_at": "2026-07-30T10:00:00.000Z"
      }
    }
  }
  ```

---

### 💊 4.2 Medicines Catalog (`/medicines`)

#### 1. Get All Medicines
- **Route:** `GET /medicines`
- **Auth Required:** None (Public)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "medicines": [
        {
          "id": 1,
          "name": "Amoxicillin 500mg",
          "is_prescription_required": true,
          "price": "15.99",
          "image_url": "https://example.com/amoxicillin.jpg",
          "created_at": "2026-07-01T00:00:00.000Z"
        },
        {
          "id": 2,
          "name": "Paracetamol 500mg",
          "is_prescription_required": false,
          "price": "4.50",
          "image_url": "https://example.com/paracetamol.jpg",
          "created_at": "2026-07-01T00:00:00.000Z"
        }
      ]
    }
  }
  ```
- **Frontend Integration Tip:** Search filtering and detail modal views can be performed directly on the client side using the fetched array.

---

### 📦 4.3 Stock Checking & Ordering (`/orders`)

#### 1. Check Branch Stock & Prescription Requirement
- **Route:** `POST /orders/check-stock`
- **Auth Required:** Yes (Bearer Token)
- **Request Body:**
  ```json
  {
    "medicines": [
      { "medicineId": 1, "quantity": 2 },
      { "medicineId": 2, "quantity": 1 }
    ]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "1 branch(es) can fulfill this order.",
    "data": {
      "requiresPrescription": true,
      "availableBranches": [
        {
          "branchId": 1,
          "branchName": "Downtown Pharmacy",
          "location": "Main St Branch",
          "stock": [
            { "medicineId": 1, "medicineName": "Amoxicillin 500mg", "requested": 2, "available": 50 },
            { "medicineId": 2, "medicineName": "Paracetamol 500mg", "requested": 1, "available": 100 }
          ]
        }
      ]
    }
  }
  ```
- **Frontend Usage:**
  - Store `requiresPrescription` flag.
  - Render list of `availableBranches` in a dropdown/selector for the user to pick where to place the order.

#### 2. Place Order
- **Route:** `POST /orders/place`
- **Auth Required:** Yes (Bearer Token — Role: `customer`)
- **Request Body:**
  ```json
  {
    "branchId": 1,
    "requiresPrescription": true,
    "items": [
      { "medicine_id": 1, "quantity": 2 },
      { "medicine_id": 2, "quantity": 1 }
    ]
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Order placed successfully.",
    "data": {
      "orderId": 42,
      "nextStep": "Please upload your prescription at POST /prescriptions/upload"
    }
  }
  ```
- **Error Statuses:** `400` (Validation error), `422` (Stock unavailable / process failed).

---

### 📑 4.4 Prescription File Upload (`/prescriptions`)

#### 1. Upload Prescription File
- **Route:** `POST /prescriptions/upload`
- **Auth Required:** Yes (Bearer Token — Role: `customer`)
- **Content-Type:** `multipart/form-data`
- **Form Data Parameters:**
  - `orderId`: `42` (number)
  - `prescription`: `<File Object>` (Allowed formats: JPEG, PNG, WebP, GIF; Max size: 5MB)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Prescription uploaded. Awaiting pharmacist review.",
    "data": {
      "prescription": {
        "id": 10,
        "order_id": 42,
        "image_url": "/uploads/prescription-uuid-1785393245.jpg",
        "uploaded_at": "2026-07-30T10:30:00.000Z",
        "verification_status": "Pending"
      }
    }
  }
  ```
- **Error Statuses:** `400` (Missing orderId/file or order does not require prescription), `403` (Access denied / order belongs to another user), `409` (Prescription already uploaded for this order).

---

### 👤 4.5 Customer Account (`/customer`)

#### 1. Get Customer Order History
- **Route:** `GET /customer/orders`
- **Auth Required:** Yes (Bearer Token — Role: `customer`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "orders": [
        {
          "order_id": 42,
          "status": "Pending",
          "requires_prescription": true,
          "stock_reserved": true,
          "created_at": "2026-07-30T10:00:00.000Z",
          "branch_name": "Downtown Pharmacy",
          "branch_location": "Main St Branch"
        }
      ]
    }
  }
  ```

#### 2. Get Customer Order Details by ID
- **Route:** `GET /customer/orders/:id`
- **Auth Required:** Yes (Bearer Token — Role: `customer`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "order": {
        "order_id": 42,
        "status": "Pending",
        "requires_prescription": true,
        "stock_reserved": true,
        "created_at": "2026-07-30T10:00:00.000Z",
        "branch_id": 1,
        "branch_name": "Downtown Pharmacy",
        "branch_location": "Main St Branch"
      },
      "items": [
        {
          "item_id": 101,
          "medicine_id": 1,
          "medicine_name": "Amoxicillin 500mg",
          "is_prescription_required": true,
          "quantity": 2
        }
      ],
      "prescription": {
        "id": 10,
        "image_url": "/uploads/prescription-uuid-1785393245.jpg",
        "uploaded_at": "2026-07-30T10:30:00.000Z",
        "verification_status": "Pending",
        "verified_at": null,
        "rejection_reason": null
      }
    }
  }
  ```

---

### 🩺 4.6 Pharmacist Operations (`/pharmacist`)

#### 1. Get Pending Prescriptions Queue
- **Route:** `GET /pharmacist/pending-prescriptions`
- **Auth Required:** Yes (Bearer Token — Role: `pharmacist`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "prescriptions": [
        {
          "prescription_id": 10,
          "image_url": "/uploads/prescription-uuid-1785393245.jpg",
          "uploaded_at": "2026-07-30T10:30:00.000Z",
          "verification_status": "Pending",
          "order_id": 42,
          "order_status": "Pending",
          "customer_name": "Jane Doe",
          "customer_email": "jane@example.com",
          "customer_phone": "+1234567890"
        }
      ]
    }
  }
  ```

#### 2. Approve Prescription
- **Route:** `POST /pharmacist/approve`
- **Auth Required:** Yes (Bearer Token — Role: `pharmacist`)
- **Request Body:**
  ```json
  { "prescriptionId": 10 }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Prescription approved. Order status updated to Verified.",
    "data": { "prescriptionId": 10, "orderId": 42, "status": "Approved" }
  }
  ```

#### 3. Reject Prescription
- **Route:** `POST /pharmacist/reject`
- **Auth Required:** Yes (Bearer Token — Role: `pharmacist`)
- **Request Body:**
  ```json
  {
    "prescriptionId": 10,
    "rejectionReason": "Expired or illegible prescription image."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Prescription rejected. Stock released back to branch.",
    "data": {
      "prescriptionId": 10,
      "orderId": 42,
      "status": "Rejected",
      "stockRelease": "SUCCESS: Restored stock for order 42"
    }
  }
  ```

---

### ⚙️ 4.7 Admin Operations (`/admin`)

#### 1. Get All System Users
- **Route:** `GET /admin/users`
- **Auth Required:** Yes (Bearer Token — Role: `admin`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "users": [
        { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com", "role": "customer", ... }
      ]
    }
  }
  ```

#### 2. Get All Branches & Inventory Stock
- **Route:** `GET /admin/branches`
- **Auth Required:** Yes (Bearer Token — Role: `admin`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "branches": [
        {
          "id": 1,
          "name": "Downtown Pharmacy",
          "stock": [
            {
              "medicine_id": 1,
              "medicine_name": "Amoxicillin 500mg",
              "quantity_available": 50,
              "low_stock_threshold": 10,
              "stock_status": "In Stock"
            }
          ]
        }
      ]
    }
  }
  ```

#### 3. Get All Global Orders
- **Route:** `GET /admin/orders`
- **Auth Required:** Yes (Bearer Token — Role: `admin`)
- **Response (200 OK):** Lists all orders across all branches and customers with joined prescription details.

---

## 5. Frontend Implementation Checklist & Guidelines

1. **HTTP Client Configuration (Axios / Fetch):**
   - Attach JWT from storage:
     ```js
     const token = localStorage.getItem('token');
     const headers = { Authorization: `Bearer ${token}` };
     ```
2. **Handling Prescription Image URLs:**
   - Prepend backend base URL to relative `image_url` strings:
     ```js
     const imageUrl = `${API_BASE_URL}${prescription.image_url}`;
     // Example: http://localhost:5000/uploads/prescription-123.jpg
     ```
3. **Form Uploads for Prescription:**
   - Do NOT manually set `Content-Type: application/json` when sending `FormData`. Let the browser automatically specify the boundary:
     ```js
     const formData = new FormData();
     formData.append('orderId', orderId);
     formData.append('prescription', fileInput.files[0]);

     await axios.post(`${API_BASE_URL}/prescriptions/upload`, formData, {
       headers: { Authorization: `Bearer ${token}` }
     });
     ```
4. **Role Routing:**
   - Decode user JWT or use `user.role` from `/auth/login` to guard routes:
     - `/customer/*` ── Requires `role === 'customer'`
     - `/pharmacist/*` ── Requires `role === 'pharmacist'`
     - `/admin/*` ── Requires `role === 'admin'`
