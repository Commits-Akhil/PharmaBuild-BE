# RxConnect Backend — Frontend API & Integration Guide

This document is the definitive single source of truth for frontend integration (React, Vite, Next.js, Vue, React Native, Mobile Apps) connecting to the **RxConnect Pharmacy Backend API**.

It contains complete, exact specifications for **all 18 API endpoints**, detailing every **Input parameter (Headers, Path Params, Body fields, Types, Constraints)** and **Output response (Success JSON, Error Status Codes, Error JSONs)**, along with TypeScript interfaces and client implementation code snippets.

---

## 1. Architecture & Connection Details

- **Base URL:** `http://localhost:5000` (or `process.env.VITE_API_BASE_URL` / `REACT_APP_API_BASE_URL`)
- **Static Media URL:** `http://localhost:5000/uploads/<filename>`
- **Request Content Types:**
  - Standard JSON endpoints: `application/json`
  - Prescription upload endpoint: `multipart/form-data`
- **Authentication Scheme:** Bearer Token via HTTP `Authorization` Header
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Standard Response Shape:**
  - **Success:** `{ "success": true, "message"?: string, "data"?: object | array }`
  - **Error:** `{ "success": false, "message": string }`

---

## 2. Global Data Models & TypeScript Interfaces

For frontend projects using TypeScript, copy these type definitions for type-safe API requests and responses:

```typescript
// Role Types
export type UserRole = 'customer' | 'pharmacist' | 'admin';

// User Interface
export interface User {
  id: string; // UUID
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  address: string | null;
  branch_id: number | null;
  created_at?: string;
}

// Medicine Interface
export interface Medicine {
  id: number;
  name: string;
  is_prescription_required: boolean;
  price?: string;
  created_at: string;
}

// Branch Stock Detail
export interface BranchStockItem {
  medicineId: number;
  medicineName: string;
  requested: number;
  available: number;
}

// Available Branch for Stock Check
export interface AvailableBranch {
  branchId: number;
  branchName: string;
  location: string;
  stock: BranchStockItem[];
}

// Order Item Input for Placement
export interface OrderItemInput {
  medicine_id: number;
  quantity: number;
}

// Order Item Response
export interface OrderItem {
  item_id: number;
  medicine_id: number;
  medicine_name: string;
  is_prescription_required: boolean;
  quantity: number;
  price?: string;
}

// Prescription Interface
export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Prescription {
  id: number;
  order_id: number;
  image_url: string;
  uploaded_at: string;
  verification_status: VerificationStatus;
  verified_at?: string | null;
  rejection_reason?: string | null;
}

// Customer Order Summary
export type OrderStatus = 'Placed' | 'Verified' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Rejected' | 'Cancelled';

export interface CustomerOrder {
  order_id: number;
  status: OrderStatus;
  requires_prescription: boolean;
  stock_reserved: boolean;
  created_at: string;
  branch_name: string;
  branch_location: string;
}

// Detailed Order with Items and Prescription
export interface OrderDetail extends CustomerOrder {
  branch_id: number;
  items: OrderItem[];
  prescription: Prescription | null;
}
```

---

## 3. End-to-End User Workflows

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Workflow 1: Customer Auth ──▶ Check Stock ──▶ Place Order ──▶ Upload Prescription      │
└────────────────────────────────────────────────────────────────────────────────────────┘

 1. User Register/Login  ──▶ Receive JWT Token ──▶ Store in localStorage/cookies
 2. Add Items to Cart    ──▶ POST /orders/check-stock 
                             Returns: { requiresPrescription: boolean, availableBranches: [...] }
 3. Select Branch & Place──▶ POST /orders/place
                             Payload: { branchId, requiresPrescription, items: [...] }
                             Returns: { orderId, nextStep }
 4. Upload Prescription  ──▶ POST /prescriptions/upload (If requiresPrescription === true)
                             FormData: orderId (number), prescription (file image)
 5. Track Order Status   ──▶ GET /customer/orders or GET /customer/orders/:id

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Workflow 2: Pharmacist Verification & Stock Release Lifecycle                         │
└────────────────────────────────────────────────────────────────────────────────────────┘

 1. Pharmacist Login     ──▶ GET /pharmacist/pending-prescriptions
 2. Inspect Prescription ──▶ Open Image at: http://localhost:5000/uploads/<filename>
 3. Decision:
    ├── APPROVE ──▶ POST /pharmacist/approve { prescriptionId: 10 }
    │               Result: Order status becomes "Verified"
    └── REJECT  ──▶ POST /pharmacist/reject  { prescriptionId: 10, rejectionReason: "..." }
                    Result: Order status becomes "Rejected"; Stock automatically restored to branch
```

---

## 4. Complete API Endpoint Reference (Inputs & Outputs)

---

### 🔑 4.1 Authentication Endpoints (`/auth`)

#### 1. Register User (`POST /auth/register`)
- **Description:** Registers a new user account. Customers can register freely. Admins and Pharmacists require valid registration secrets.
- **Authentication:** None (Public)
- **Inputs:**
  - **Headers:** `Content-Type: application/json`
  - **Body Parameters:**
    | Parameter | Type | Required | Description / Validation |
    |---|---|---|---|
    | `name` | string | **Yes** | Full name of the user. |
    | `email` | string | **Yes** | Valid unique email address. |
    | `password` | string | **Yes** | User password. |
    | `role` | string | No | `"customer"` (default), `"pharmacist"`, or `"admin"`. |
    | `role_secret` | string | Conditional | Required if `role` is `"admin"` or `"pharmacist"`. Must match server secret. |
    | `phone` | string | No | User contact phone number. |
    | `address` | string | No | Physical address string. |
    | `branch_id` | number | No | Integer branch ID assignment for staff. |
- **Example Input Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "role": "customer",
    "phone": "+1234567890",
    "address": "123 Main St",
    "branch_id": 1
  }
  ```
- **Outputs:**
  - **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Registration successful.",
      "data": {
        "token": "eyJhbGciOi...",
        "user": {
          "id": "a3b8c2d1-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
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
  - **Error Responses:**
    - `400 Bad Request`: `{ "success": false, "message": "Invalid role selected." }`
    - `403 Forbidden`: `{ "success": false, "message": "Invalid admin registration secret." }` or `{ "success": false, "message": "Invalid pharmacist registration secret." }`
    - `409 Conflict`: `{ "success": false, "message": "Email already registered." }`
    - `500 Internal Server Error`: `{ "success": false, "message": "Server error during registration." }`

---

#### 2. Login User (`POST /auth/login`)
- **Description:** Authenticates email and password, returning JWT token and user profile.
- **Authentication:** None (Public)
- **Inputs:**
  - **Headers:** `Content-Type: application/json`
  - **Body Parameters:**
    | Parameter | Type | Required | Description |
    |---|---|---|---|
    | `email` | string | **Yes** | User's registered email. |
    | `password` | string | **Yes** | User's account password. |
- **Example Input Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Login successful.",
      "data": {
        "token": "eyJhbGciOi...",
        "user": {
          "id": "a3b8c2d1-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
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
  - **Error Responses:**
    - `401 Unauthorized`: `{ "success": false, "message": "Invalid email or password." }`
    - `500 Internal Server Error`: `{ "success": false, "message": "Server error during login." }`

---

#### 3. Get Authenticated Profile (`GET /auth/profile`)
- **Description:** Retrieves the user record of the current logged-in account (ID extracted from Bearer Token).
- **Authentication:** Required (Bearer Token — Any valid role)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`
  - **Query / Body Params:** None.
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "a3b8c2d1-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
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
  - **Error Responses:**
    - `401 Unauthorized`: `{ "success": false, "message": "Access denied. No token provided." }` or `{ "success": false, "message": "Invalid token." }`
    - `404 Not Found`: `{ "success": false, "message": "User not found." }`
    - `500 Internal Server Error`: `{ "success": false, "message": "Server error fetching profile." }`

---

### 💊 4.2 Medicines Catalog (`/medicines`)

#### 1. Get All Medicines (`GET /medicines`)
- **Description:** Returns all catalog medicines sorted alphabetically by name.
- **Authentication:** None (Public)
- **Inputs:** None.
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "medicines": [
          {
            "id": 1,
            "name": "Amoxicillin 250mg",
            "is_prescription_required": true,
            "created_at": "2026-07-30T04:00:00.000Z"
          },
          {
            "id": 2,
            "name": "Cough Syrup (Generic)",
            "is_prescription_required": false,
            "created_at": "2026-07-30T04:00:00.000Z"
          },
          {
            "id": 3,
            "name": "Insulin Glargine",
            "is_prescription_required": true,
            "created_at": "2026-07-30T04:00:00.000Z"
          },
          {
            "id": 4,
            "name": "Paracetamol 500mg",
            "is_prescription_required": false,
            "created_at": "2026-07-30T04:00:00.000Z"
          },
          {
            "id": 5,
            "name": "Vitamin C 500mg",
            "is_prescription_required": false,
            "created_at": "2026-07-30T04:00:00.000Z"
          }
        ]
      }
    }
    ```
  - **Error Responses:**
    - `500 Internal Server Error`: `{ "success": false, "message": "Server error fetching medicines." }`

---

### 📦 4.3 Orders & Stock Verification (`/orders`)

#### 1. Check Stock & Prescription Requirement (`POST /orders/check-stock`)
- **Description:** Evaluates cart items to find which pharmacy branches have sufficient stock to fulfill the order completely, and checks if any item requires a prescription. Read-only operation (no stock reserved).
- **Authentication:** Required (Bearer Token — Any valid role)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
  - **Body Parameters:**
    | Parameter | Type | Required | Description |
    |---|---|---|---|
    | `medicines` | Array of Objects | **Yes** | Non-empty array of items to check. |
    | `medicines[].medicineId` | number | **Yes** | Numeric medicine ID. |
    | `medicines[].quantity` | number | **Yes** | Positive integer quantity (> 0). |
- **Example Input Body:**
  ```json
  {
    "medicines": [
      { "medicineId": 1, "quantity": 2 },
      { "medicineId": 4, "quantity": 1 }
    ]
  }
  ```
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "2 branch(es) can fulfill this order.",
      "data": {
        "requiresPrescription": true,
        "availableBranches": [
          {
            "branchId": 1,
            "branchName": "Branch A - Kadri",
            "location": "Kadri, Mangaluru",
            "stock": [
              {
                "medicineId": 1,
                "medicineName": "Amoxicillin 250mg",
                "requested": 2,
                "available": 50
              },
              {
                "medicineId": 4,
                "medicineName": "Paracetamol 500mg",
                "requested": 1,
                "available": 30
              }
            ]
          },
          {
            "branchId": 3,
            "branchName": "Branch C - Surathkal",
            "location": "Surathkal, Mangaluru",
            "stock": [
              {
                "medicineId": 1,
                "medicineName": "Amoxicillin 250mg",
                "requested": 2,
                "available": 10
              },
              {
                "medicineId": 4,
                "medicineName": "Paracetamol 500mg",
                "requested": 1,
                "available": 40
              }
            ]
          }
        ]
      }
    }
    ```
  - **Error Responses:**
    - `400 Bad Request`: `{ "success": false, "message": "\"medicines\" must be a non-empty array." }` or `{ "success": false, "message": "Medicine ID(s) not found: 99" }`
    - `401 Unauthorized`: `{ "success": false, "message": "Access denied. No token provided." }`
    - `500 Internal Server Error`: `{ "success": false, "message": "Server error checking stock." }`

---

#### 2. Place Order (`POST /orders/place`)
- **Description:** Places an order at a selected branch. Atomically deducts and reserves branch stock via PostgreSQL stored function. Customer ID is extracted automatically from JWT token.
- **Authentication:** Required (Bearer Token — Role: `customer`)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
  - **Body Parameters:**
    | Parameter | Type | Required | Description |
    |---|---|---|---|
    | `branchId` | number | **Yes** | Positive integer branch ID. |
    | `requiresPrescription` | boolean | **Yes** | `true` or `false` flag from check-stock step. |
    | `items` | Array of Objects | **Yes** | Non-empty array of items to purchase. |
    | `items[].medicine_id` | number | **Yes** | Numeric medicine ID. |
    | `items[].quantity` | number | **Yes** | Positive integer quantity (> 0). |
- **Example Input Body:**
  ```json
  {
    "branchId": 1,
    "requiresPrescription": true,
    "items": [
      { "medicine_id": 1, "quantity": 2 },
      { "medicine_id": 4, "quantity": 1 }
    ]
  }
  ```
- **Outputs:**
  - **Success Response (201 Created):**
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
  - **Error Responses:**
    - `400 Bad Request`: `{ "success": false, "message": "A valid branchId (number) is required." }` or `{ "success": false, "message": "requiresPrescription must be a boolean." }`
    - `401 Unauthorized`: `{ "success": false, "message": "Access denied. No token provided." }`
    - `403 Forbidden`: `{ "success": false, "message": "Access denied. Required role: customer" }`
    - `422 Unprocessable Entity`: `{ "success": false, "message": "INSUFFICIENT_STOCK: Medicine 1 insufficient stock" }`
    - `500 Internal Server Error`: `{ "success": false, "message": "Server error placing order." }`

---

### 📑 4.4 Prescription File Upload (`/prescriptions`)

#### 1. Upload Prescription File (`POST /prescriptions/upload`)
- **Description:** Allows customer to upload a prescription image file for an order. Enforces file type validation, size limit (5MB), order ownership check (IDOR protection), and checks if order actually requires a prescription.
- **Authentication:** Required (Bearer Token — Role: `customer`)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: multipart/form-data`
  - **FormData Body Parameters:**
    | Parameter | Type | Required | Description |
    |---|---|---|---|
    | `orderId` | number / string | **Yes** | Numeric order ID string/number. |
    | `prescription` | File | **Yes** | Image file (Allowed MIME: `jpeg`, `jpg`, `png`, `webp`, `gif`. Max Size: **5 MB**). |
- **Example FormData:**
  ```javascript
  const formData = new FormData();
  formData.append('orderId', '42');
  formData.append('prescription', fileObject);
  ```
- **Outputs:**
  - **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Prescription uploaded. Awaiting pharmacist review.",
      "data": {
        "prescription": {
          "id": 10,
          "order_id": 42,
          "image_url": "/uploads/prescription-a3b8c2d1-1785393245.jpg",
          "uploaded_at": "2026-07-30T10:30:00.000Z",
          "verification_status": "Pending"
        }
      }
    }
    ```
  - **Error Responses:**
    - `400 Bad Request`: `{ "success": false, "message": "A valid orderId is required." }` or `{ "success": false, "message": "Only image files are allowed (jpeg, jpg, png, webp, gif)." }` or `{ "success": false, "message": "This order does not require a prescription." }`
    - `401 Unauthorized`: `{ "success": false, "message": "Access denied. No token provided." }`
    - `403 Forbidden`: `{ "success": false, "message": "Access denied. Not your order." }`
    - `404 Not Found`: `{ "success": false, "message": "Order not found." }`
    - `409 Conflict`: `{ "success": false, "message": "A prescription has already been uploaded for this order." }`
    - `500 Internal Server Error`: `{ "success": false, "message": "Server error uploading prescription." }`

---

### 👤 4.5 Customer Portal (`/customer`)

#### 1. Get Customer Order History (`GET /customer/orders`)
- **Description:** Returns all orders placed by the currently logged-in customer, ordered newest-first.
- **Authentication:** Required (Bearer Token — Role: `customer`)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`
  - **Params:** None.
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "orders": [
          {
            "order_id": 42,
            "status": "Placed",
            "requires_prescription": true,
            "stock_reserved": true,
            "created_at": "2026-07-30T10:00:00.000Z",
            "branch_name": "Branch A - Kadri",
            "branch_location": "Kadri, Mangaluru"
          }
        ]
      }
    }
    ```
  - **Error Responses:**
    - `401 Unauthorized`: `{ "success": false, "message": "Access denied. No token provided." }`
    - `403 Forbidden`: `{ "success": false, "message": "Access denied. Required role: customer" }`
    - `500 Internal Server Error`: `{ "success": false, "message": "Server error fetching orders." }`

---

#### 2. Get Order Details by ID (`GET /customer/orders/:id`)
- **Description:** Retrieves full order record including order status, branch location, order items, and uploaded prescription metadata. Fully protected against IDOR.
- **Authentication:** Required (Bearer Token — Role: `customer`)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`
  - **Path Parameters:**
    | Parameter | Type | Required | Description |
    |---|---|---|---|
    | `id` | number | **Yes** | Order ID integer. |
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "order": {
          "order_id": 42,
          "status": "Placed",
          "requires_prescription": true,
          "stock_reserved": true,
          "created_at": "2026-07-30T10:00:00.000Z",
          "branch_id": 1,
          "branch_name": "Branch A - Kadri",
          "branch_location": "Kadri, Mangaluru"
        },
        "items": [
          {
            "item_id": 101,
            "medicine_id": 1,
            "medicine_name": "Amoxicillin 250mg",
            "is_prescription_required": true,
            "quantity": 2
          },
          {
            "item_id": 102,
            "medicine_id": 4,
            "medicine_name": "Paracetamol 500mg",
            "is_prescription_required": false,
            "quantity": 1
          }
        ],
        "prescription": {
          "id": 10,
          "image_url": "/uploads/prescription-a3b8c2d1-1785393245.jpg",
          "uploaded_at": "2026-07-30T10:30:00.000Z",
          "verification_status": "Pending",
          "verified_at": null,
          "rejection_reason": null
        }
      }
    }
    ```
  - **Error Responses:**
    - `400 Bad Request`: `{ "success": false, "message": "Invalid order ID." }`
    - `401 Unauthorized`: `{ "success": false, "message": "Access denied. No token provided." }`
    - `403 Forbidden`: `{ "success": false, "message": "Access denied. Required role: customer" }`
    - `404 Not Found`: `{ "success": false, "message": "Order not found." }`
    - `500 Internal Server Error`: `{ "success": false, "message": "Server error fetching order." }`

---

### 🩺 4.6 Pharmacist Operations (`/pharmacist`)

#### 1. Get Pending Prescriptions Queue (`GET /pharmacist/pending-prescriptions`)
- **Description:** Returns all uploaded prescriptions currently in `"Pending"` status, joined with customer details and branch location, ordered oldest first.
- **Authentication:** Required (Bearer Token — Role: `pharmacist`)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "prescriptions": [
          {
            "prescription_id": 10,
            "image_url": "/uploads/prescription-a3b8c2d1-1785393245.jpg",
            "uploaded_at": "2026-07-30T10:30:00.000Z",
            "verification_status": "Pending",
            "order_id": 42,
            "order_status": "Placed",
            "requires_prescription": true,
            "order_created_at": "2026-07-30T10:00:00.000Z",
            "branch_name": "Branch A - Kadri",
            "branch_location": "Kadri, Mangaluru",
            "customer_id": "a3b8c2d1-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
            "customer_name": "Jane Doe",
            "customer_email": "jane@example.com",
            "customer_phone": "+1234567890"
          }
        ]
      }
    }
    ```
  - **Error Responses:**
    - `401 Unauthorized`: `{ "success": false, "message": "Access denied. No token provided." }`
    - `403 Forbidden`: `{ "success": false, "message": "Access denied. Required role: pharmacist" }`
    - `500 Internal Server Error`: `{ "success": false, "message": "Server error fetching prescriptions." }`

---

#### 2. Approve Prescription (`POST /pharmacist/approve`)
- **Description:** Marks prescription as `"Approved"`, records approving pharmacist ID and timestamp, and changes order status to `"Verified"`.
- **Authentication:** Required (Bearer Token — Role: `pharmacist`)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
  - **Body Parameters:**
    | Parameter | Type | Required | Description |
    |---|---|---|---|
    | `prescriptionId` | number | **Yes** | Numeric prescription ID. |
- **Example Input Body:**
  ```json
  {
    "prescriptionId": 10
  }
  ```
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Prescription approved. Order status updated to Verified.",
      "data": {
        "prescriptionId": 10,
        "orderId": 42,
        "status": "Approved"
      }
    }
    ```
  - **Error Responses:**
    - `400 Bad Request`: `{ "success": false, "message": "A valid prescriptionId is required." }`
    - `401 Unauthorized`: `{ "success": false, "message": "Access denied. No token provided." }`
    - `403 Forbidden`: `{ "success": false, "message": "Access denied. Required role: pharmacist" }`
    - `404 Not Found`: `{ "success": false, "message": "Prescription not found." }`
    - `409 Conflict`: `{ "success": false, "message": "Prescription is already Approved." }`
    - `500 Internal Server Error`: `{ "success": false, "message": "Server error approving prescription." }`

---

#### 3. Reject Prescription (`POST /pharmacist/reject`)
- **Description:** Marks prescription as `"Rejected"`, records rejection reason, and invokes stored function to atomically restore reserved inventory back to the branch and mark order status as `"Rejected"`.
- **Authentication:** Required (Bearer Token — Role: `pharmacist`)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
  - **Body Parameters:**
    | Parameter | Type | Required | Description |
    |---|---|---|---|
    | `prescriptionId` | number | **Yes** | Numeric prescription ID. |
    | `rejectionReason` | string | No | Optional rejection reason notes. |
- **Example Input Body:**
  ```json
  {
    "prescriptionId": 10,
    "rejectionReason": "Illegible doctor signature or expired prescription."
  }
  ```
- **Outputs:**
  - **Success Response (200 OK):**
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
  - **Error Responses:**
    - `400 Bad Request`: `{ "success": false, "message": "A valid prescriptionId is required." }`
    - `401 Unauthorized`: `{ "success": false, "message": "Access denied. No token provided." }`
    - `403 Forbidden`: `{ "success": false, "message": "Access denied. Required role: pharmacist" }`
    - `404 Not Found`: `{ "success": false, "message": "Prescription not found." }`
    - `409 Conflict`: `{ "success": false, "message": "Prescription is already Rejected." }`
    - `500 Internal Server Error`: `{ "success": false, "message": "Prescription rejected, but stock release failed: FAILED..." }`

---

### ⚙️ 4.7 Admin Dashboard & Analytics Endpoints (`/admin`)

#### 1. Get All System Users (`GET /admin/users`)
- **Description:** Lists all registered users (customers, pharmacists, admins). Password hash is excluded.
- **Authentication:** Required (Bearer Token — Role: `admin`)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "users": [
          {
            "id": "a3b8c2d1-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
            "name": "Jane Doe",
            "email": "jane@example.com",
            "role": "customer",
            "phone": "+1234567890",
            "address": "123 Main St",
            "branch_id": 1,
            "created_at": "2026-07-30T10:00:00.000Z"
          }
        ]
      }
    }
    ```
  - **Error Responses:** `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`.

---

#### 2. Get All Branches & Stock (`GET /admin/branches`)
- **Description:** Returns all branch locations along with complete medicine stock listings and calculated status indicators (`"Out of Stock"`, `"Low Stock"`, `"In Stock"`).
- **Authentication:** Required (Bearer Token — Role: `admin`)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "branches": [
          {
            "id": 1,
            "name": "Branch A - Kadri",
            "location": "Kadri, Mangaluru",
            "created_at": "2026-07-30T04:00:00.000Z",
            "stock": [
              {
                "branch_id": 1,
                "medicine_id": 1,
                "medicine_name": "Amoxicillin 250mg",
                "quantity_available": 50,
                "low_stock_threshold": 5,
                "stock_status": "In Stock"
              }
            ]
          }
        ]
      }
    }
    ```
  - **Error Responses:** `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`.

---

#### 3. Get All Global Orders (`GET /admin/orders`)
- **Description:** Returns all orders system-wide with joined customer details, branch details, and prescription review status.
- **Authentication:** Required (Bearer Token — Role: `admin`)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "orders": [
          {
            "order_id": 42,
            "status": "Placed",
            "requires_prescription": true,
            "stock_reserved": true,
            "created_at": "2026-07-30T10:00:00.000Z",
            "branch_id": 1,
            "branch_name": "Branch A - Kadri",
            "branch_location": "Kadri, Mangaluru",
            "customer_id": "a3b8c2d1-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
            "customer_name": "Jane Doe",
            "customer_email": "jane@example.com",
            "customer_phone": "+1234567890",
            "prescription_id": 10,
            "verification_status": "Pending",
            "image_url": "/uploads/prescription-a3b8c2d1-1785393245.jpg",
            "verified_at": null,
            "rejection_reason": null
          }
        ]
      }
    }
    ```
  - **Error Responses:** `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`.

---

#### 4. Get Today's Orders by Branch (`GET /admin/branches/:branchId/today-orders`)
- **Description:** Fetches all orders created today (`created_at >= CURRENT_DATE`) for a target branch, including item line items.
- **Authentication:** Required (Bearer Token — Role: `admin`)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`
  - **Path Parameters:**
    | Parameter | Type | Required | Description |
    |---|---|---|---|
    | `branchId` | number | **Yes** | Positive integer branch ID. |
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "branch": {
          "id": 1,
          "name": "Branch A - Kadri",
          "location": "Kadri, Mangaluru"
        },
        "total_today_orders": 1,
        "orders": [
          {
            "order_id": 42,
            "status": "Placed",
            "requires_prescription": true,
            "stock_reserved": true,
            "created_at": "2026-07-30T10:00:00.000Z",
            "customer_id": "a3b8c2d1-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
            "customer_name": "Jane Doe",
            "customer_email": "jane@example.com",
            "customer_phone": "+1234567890",
            "prescription_id": 10,
            "verification_status": "Pending",
            "image_url": "/uploads/prescription-a3b8c2d1-1785393245.jpg",
            "verified_at": null,
            "rejection_reason": null,
            "items": [
              {
                "order_id": 42,
                "item_id": 101,
                "medicine_id": 1,
                "medicine_name": "Amoxicillin 250mg",
                "is_prescription_required": true,
                "quantity": 2
              }
            ]
          }
        ]
      }
    }
    ```
  - **Error Responses:**
    - `400 Bad Request`: `{ "success": false, "message": "A valid branchId (positive integer) is required." }`
    - `404 Not Found`: `{ "success": false, "message": "Branch not found." }`

---

#### 5. Get Low Stock Inventory Report (`GET /admin/branches/low-stock`)
- **Description:** Returns all stock items across all branches where `quantity_available <= low_stock_threshold`.
- **Authentication:** Required (Bearer Token — Role: `admin`)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "total_low_stock_items": 1,
        "branches": [
          {
            "branch_id": 1,
            "branch_name": "Branch A - Kadri",
            "branch_location": "Kadri, Mangaluru",
            "low_stock_items": [
              {
                "medicine_id": 3,
                "medicine_name": "Insulin Glargine",
                "is_prescription_required": true,
                "quantity_available": 3,
                "low_stock_threshold": 5,
                "stock_status": "Low Stock"
              }
            ]
          }
        ]
      }
    }
    ```
  - **Error Responses:** `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`.

---

#### 6. Get Branch Fulfillment Failure Metrics (`GET /admin/branches/fulfillment-failures`)
- **Description:** Analyzes order status and stock metrics per branch to compute failure rate percentage, rejection counts, and out-of-stock counts.
- **Authentication:** Required (Bearer Token — Role: `admin`)
- **Inputs:**
  - **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Fulfillment failure metrics by branch",
      "data": {
        "failing_branches_summary": [
          {
            "branch_id": 1,
            "branch_name": "Branch A - Kadri",
            "branch_location": "Kadri, Mangaluru",
            "total_orders": 15,
            "failed_orders": 3,
            "rejected_orders": 3,
            "cancelled_orders": 0,
            "placed_orders": 2,
            "verified_orders": 10,
            "delivered_orders": 0,
            "failure_rate_percentage": "20.00",
            "out_of_stock_count": 1,
            "low_stock_count": 4
          }
        ]
      }
    }
    ```
  - **Error Responses:** `401 Unauthorized`, `403 Forbidden`, `500 Internal Server Error`.

---

### 🏥 4.8 Health Check (`GET /`)

#### 1. System Health Check (`GET /`)
- **Description:** Verifies API server status.
- **Authentication:** None (Public)
- **Inputs:** None.
- **Outputs:**
  - **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "RxConnect API is running."
    }
    ```

---

## 5. Frontend Client Integration Snippets (Axios & Fetch)

### Axios Setup & Interceptors

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically inject JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Complete Checkout & Order Flow Snippet

```javascript
import api from './api';

// 1. Check Stock for Cart
export async function checkCartStock(cartItems) {
  // cartItems format: [{ medicineId: 1, quantity: 2 }, ...]
  const response = await api.post('/orders/check-stock', { medicines: cartItems });
  return response.data.data; 
  // { requiresPrescription: boolean, availableBranches: [...] }
}

// 2. Place Order
export async function submitOrder(branchId, requiresPrescription, cartItems) {
  const items = cartItems.map(item => ({
    medicine_id: item.medicineId,
    quantity: item.quantity
  }));

  const response = await api.post('/orders/place', {
    branchId,
    requiresPrescription,
    items
  });
  return response.data.data; // { orderId: 42, nextStep: "..." }
}

// 3. Upload Prescription Image File
export async function uploadPrescription(orderId, fileObject) {
  const formData = new FormData();
  formData.append('orderId', orderId);
  formData.append('prescription', fileObject);

  // Note: Do NOT set Content-Type header manually when sending FormData in Axios!
  const response = await api.post('/prescriptions/upload', formData);
  return response.data.data;
}

// Helper: Resolve static image URL
export function getImageUrl(relativePath) {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `${API_BASE_URL}${relativePath}`;
}
```

---

## 6. Summary Table of All 18 API Endpoints

| Method | Endpoint Route | Auth Required | Role Guard | Content-Type | Summary / Description |
|---|---|---|---|---|---|
| `POST` | `/auth/register` | Public | None | `application/json` | Creates user account (customer/pharmacist/admin) |
| `POST` | `/auth/login` | Public | None | `application/json` | Authenticates user & returns JWT |
| `GET` | `/auth/profile` | Bearer Token | Any | N/A | Fetches authenticated profile |
| `GET` | `/medicines` | Public | None | N/A | Lists medicine catalog sorted by name |
| `POST` | `/orders/check-stock` | Bearer Token | Any | `application/json` | Checks branch stock & prescription status |
| `POST` | `/orders/place` | Bearer Token | `customer` | `application/json` | Places order & reserves branch stock atomically |
| `POST` | `/prescriptions/upload` | Bearer Token | `customer` | `multipart/form-data` | Uploads prescription file for order |
| `GET` | `/customer/orders` | Bearer Token | `customer` | N/A | Lists customer order history |
| `GET` | `/customer/orders/:id` | Bearer Token | `customer` | N/A | Gets full order details, items, & prescription |
| `GET` | `/pharmacist/pending-prescriptions` | Bearer Token | `pharmacist` | N/A | Fetches pending prescription review queue |
| `POST` | `/pharmacist/approve` | Bearer Token | `pharmacist` | `application/json` | Approves prescription (sets order to Verified) |
| `POST` | `/pharmacist/reject` | Bearer Token | `pharmacist` | `application/json` | Rejects prescription & restores stock |
| `GET` | `/admin/users` | Bearer Token | `admin` | N/A | Lists all system users |
| `GET` | `/admin/branches` | Bearer Token | `admin` | N/A | Lists all branches & inventory status |
| `GET` | `/admin/orders` | Bearer Token | `admin` | N/A | Lists all system-wide orders |
| `GET` | `/admin/branches/:branchId/today-orders` | Bearer Token | `admin` | N/A | Lists branch orders placed today |
| `GET` | `/admin/branches/low-stock` | Bearer Token | `admin` | N/A | Low stock inventory report |
| `GET` | `/admin/branches/fulfillment-failures` | Bearer Token | `admin` | N/A | Analytics on branch fulfillment failure metrics |
