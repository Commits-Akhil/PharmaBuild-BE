# RxConnect Pharmacy Application — Summary & Working of Recent Changes

This document provides a comprehensive overview of all recent changes, updates, and architectural integrations made across the **Backend (Express.js/PostgreSQL)** and **Frontend (Next.js/Tailwind CSS)**.

---

## 1. Executive Summary

The RxConnect Pharmacy System is a full-stack, multi-branch pharmacy management application. Recent efforts focused on connecting all 18 backend REST endpoints with the Next.js frontend, fixing route mounting and static asset serving in Express, enforcing role-based access control (RBAC), and resolving response data parsing mismatches.

---

## 2. Backend Changes & Internal Working

### 2.1 Route Mounts & Controller Adjustments (`backend/index.js`)

1. **Static Asset Serving (`/uploads`)**:
   - **Change**: Added `app.use('/uploads', express.static(path.join(__dirname, 'uploads')))` in `backend/index.js`.
   - **Working**: Prescriptions uploaded by customers via Multer are stored in `backend/uploads/`. Serving this folder statically allows the frontend (and Pharmacists) to load uploaded images directly via `http://localhost:5000/uploads/<filename>`.

2. **Order Placement Route Mount (`/orders`)**:
   - **Change**: Mounted `APIs/placeorder/routes` under `/orders`.
   - **Working**: Enables `POST /orders/place`, which calls the `place_order` PostgreSQL stored function to atomically check stock, place orders, and reserve inventory per branch.

3. **Prescription Management Route Mount (`/prescriptions`)**:
   - **Change**: Mounted `APIs/Prescriptions/routes` under `/prescriptions`.
   - **Working**: Enables `POST /prescriptions/upload`, enforcing multipart/form-data image validation (max 5MB, JPG/PNG/WEBP/GIF) and order ownership verification.

4. **Customer Orders Route Mount (`/customer`)**:
   - **Change**: Mounted `APIs/Customer/routes` under `/customer`.
   - **Working**: Exposes `GET /customer/orders` and `GET /customer/orders/:id` for fetching order histories and itemized details.

5. **Cross-Origin Resource Sharing (CORS)**:
   - **Change**: Added explicit CORS headers allowing `GET, POST, PUT, DELETE, OPTIONS` from `http://localhost:3000`.
   - **Working**: Enables browser-based API calls from the Next.js frontend without CORS policy errors.

### 2.2 Pharmacist Route Security (`backend/APIs/Pharmacist/routes.js`)

1. **Authentication & Authorization Middleware**:
   - **Change**: Applied `verifyToken` and `authorizeRoles("pharmacist")` to the router.
   - **Working**: Ensures only users with a valid JWT token bearing the `"pharmacist"` role can access pending prescription queues (`GET /pharmacist/pending-prescriptions`), approve prescriptions (`POST /pharmacist/approve`), or reject prescriptions (`POST /pharmacist/reject`).

---

## 3. Frontend Changes & Internal Working

### 3.1 Centralized API Client & Token Management (`app/lib/api.js`)

- **Centralized Axios Instance**: Intercepts every outgoing HTTP request to attach `Authorization: Bearer <token>` from `localStorage`.
- **Automatic 401 Interception**: Intercepts `401 Unauthorized` responses, clears local storage tokens, and redirects the browser to `/Login`.
- **Helper Functions**: Includes `getImageUrl(path)` to construct absolute image URLs (`http://localhost:5000/uploads/...`) and local storage helpers (`storeAuth`, `clearAuth`, `getStoredUser`).

### 3.2 Authentication & User Onboarding (`app/Login`, `app/Signup`, `app/profile`)

1. **Pharmacist Registration (`branch_id` addition)**:
   - **Change**: Added a `Branch ID` input field to `app/Signup/page.js` when the `"pharmacist"` role is selected.
   - **Validation**: Enforced via Zod schema requiring a positive integer for `branch_id`.
   - **Working**: Passes `branch_id` in `POST /auth/register`, binding new staff accounts to a specific physical branch.

2. **Role-Based Redirection**:
   - **Working**: Upon successful login or registration, the application inspects `user.role` and routes the user:
     - `admin` ➔ `/Admin`
     - `pharmacist` ➔ `/branch`
     - `customer` ➔ `/`

### 3.3 Cart, Stock Checking & Order Placement (`app/cart/page.js`)

1. **Response Data Matching**:
   - **Check Stock (`POST /orders/check-stock`)**: Updated parsing to read top-level `prescriptionRequired` and `availableBranches` flags.
   - **Place Order (`POST /orders/place`)**: Updated parsing to read top-level `orderId` response.
   - **Working**: Prevents `NULL` constraint violations on `requires_prescription` during order creation.

2. **Multi-Step Checkout Flow**:
   - Step 1: User reviews cart items and clicks "Proceed to Checkout".
   - Step 2: System sends cart items to `POST /orders/check-stock` and opens a modal displaying eligible branches that have sufficient inventory.
   - Step 3: User selects a branch and places the order via `POST /orders/place`.
   - Step 4: If a prescription is required, the user can attach a prescription image inline or upload it later on the Order Details page.

### 3.4 Pharmacist Verification Portal (`app/branch/page.js`)

- **Queue Fetching**: Calls `GET /pharmacist/pending-prescriptions` with Bearer token.
- **Image Lightbox Inspection**: Renders customer prescription images using `getImageUrl()` in a high-resolution lightbox modal.
- **Approval Flow**: Calls `POST /pharmacist/approve` with `{ prescriptionId }`, updating order status to `"Verified"`.
- **Rejection Flow**: Calls `POST /pharmacist/reject` with `{ prescriptionId, rejectionReason }`, triggering automatic inventory stock release via PostgreSQL stored procedure.

### 3.5 Executive Admin Dashboard (`app/Admin/page.js`)

- **Syntax & State Fix**: Corrected a `fontFinally:` syntax typo to `} finally {` to ensure loading spinners clear properly.
- **Multi-Tab Analytics**:
  - **Network Overview**: Displays total active branches, global order count, registered accounts, and pending Rx reviews.
  - **Low Stock Audit**: Fetches `GET /admin/branches/low-stock` listing items below safety thresholds.
  - **Fulfillment Failures**: Fetches `GET /admin/branches/fulfillment-failures` analyzing branch-level failure rates and out-of-stock incidents.
  - **Today's Orders Modal**: Fetches `GET /admin/branches/:branchId/today-orders` for real-time daily order inspections.

### 3.6 Global UI Enhancements (`app/components/Toast.jsx`, `app/components/Skeleton.jsx`)

- **Toast System**: Module-level notification container providing non-blocking alert toasts (`success`, `error`, `warning`).
- **Skeleton Loaders**: Provides pulse loader placeholders (`SkeletonCard`, `SkeletonTable`, `SkeletonMedicineGrid`) for smooth data-loading user experiences.

---

## 4. End-to-End System Workflow

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ 1. Customer Workflow                                                              │
└───────────────────────────────────────────────────────────────────────────────────┘
  Catalog Browsing ──▶ Add to Cart ──▶ Check Stock (POST /orders/check-stock) 
        ──▶ Select Branch ──▶ Place Order (POST /orders/place) 
        ──▶ Upload Prescription (POST /prescriptions/upload) 
        ──▶ View Order Status (/orders & /orders/[id])

┌───────────────────────────────────────────────────────────────────────────────────┐
│ 2. Pharmacist Workflow                                                            │
└───────────────────────────────────────────────────────────────────────────────────┘
  Register (with branch_id & secret) ──▶ Login 
        ──▶ View Pending Queue (GET /pharmacist/pending-prescriptions) 
        ──▶ Inspect Prescription Image 
        ──▶ Decision: APPROVE (POST /pharmacist/approve) OR REJECT (POST /pharmacist/reject)

┌───────────────────────────────────────────────────────────────────────────────────┐
│ 3. Admin Workflow                                                                 │
└───────────────────────────────────────────────────────────────────────────────────┘
  Login ──▶ Executive Dashboard (/Admin) 
        ──▶ View Network Branches, Stock Levels, Low Stock Audit, Failure Metrics 
        ──▶ Inspect Today's Orders per Branch
```

---

## 5. Summary of Modified Files

| Location | File | Primary Modification |
|---|---|---|
| **Backend** | `backend/index.js` | CORS headers, route mounts (`/orders`, `/prescriptions`, `/customer`), static `/uploads` serving |
| **Backend** | `backend/APIs/Pharmacist/routes.js` | Applied JWT `verifyToken` and `authorizeRoles("pharmacist")` middleware |
| **Frontend** | `frontend/app/lib/api.js` | Axios instance with JWT interceptors, 401 handling, image URL helper |
| **Frontend** | `frontend/app/Signup/page.js` | Added `branch_id` field for pharmacist registration with Zod validation |
| **Frontend** | `frontend/app/cart/page.js` | Fixed stock check & order placement response shape parsing, multi-step modal |
| **Frontend** | `frontend/app/branch/page.js` | Pharmacist dashboard calling `/pharmacist/pending-prescriptions`, image lightbox |
| **Frontend** | `frontend/app/Admin/page.js` | Fixed `} finally {` block, low stock audit tab, failure metrics tab, today's orders modal |
| **Frontend** | `frontend/app/orders/[id]/page.js` | Dynamic order detail view with inline prescription upload |
| **Frontend** | `frontend/app/components/Toast.jsx` | Global notification system |
| **Frontend** | `frontend/app/components/Skeleton.jsx` | Pulse loader components |
