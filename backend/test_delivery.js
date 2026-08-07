const https = require("https");
const http  = require("http");

const BASE = "http://localhost:5000";
let dpToken = "";
let orderId  = "";
let pass = 0, fail = 0;

const TS = Date.now();
const DP_EMAIL = `dp.test.${TS}@rxconnect.com`;
const DP_PASS  = "deliver123";

function req(method, path, body, token) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: "localhost",
      port: 5000,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
      },
    };
    const r = http.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({ status: res.statusCode, json, raw: data });
      });
    });
    r.on("error", (e) => resolve({ status: 0, json: null, raw: e.message }));
    if (payload) r.write(payload);
    r.end();
  });
}

function test(name, actual, expected, note) {
  const ok = actual === expected;
  if (ok) {
    pass++;
    console.log(`  ✅  ${name}`);
  } else {
    fail++;
    console.log(`  ❌  ${name}`);
    console.log(`       expected ${expected}, got ${actual}${note ? " | " + note : ""}`);
  }
  return ok;
}

(async () => {
  console.log("\n══════════════════════════════════════════════");
  console.log("   RxConnect — Delivery Partner Test Suite   ");
  console.log("══════════════════════════════════════════════\n");

  // ─── 1. AUTH ──────────────────────────────────────────────
  console.log("📁 1 — Auth\n");

  // 1.1 Register
  {
    const r = await req("POST", "/auth/register", {
      name: "Test Delivery Partner",
      email: DP_EMAIL,
      password: DP_PASS,
      phone: "9876543210",
      address: "12 Logistics Lane",
      role: "delivery_partner",
    });
    console.log(`  → POST /auth/register`);
    if (test("1.1  Status 201 — registration successful", r.status, 201)) {
      test("1.1  role = delivery_partner", r.json?.data?.user?.role, "delivery_partner");
      dpToken = r.json?.data?.token || "";
    }
  }

  // 1.2 Duplicate email
  {
    const r = await req("POST", "/auth/register", {
      name: "Test Delivery Partner",
      email: DP_EMAIL,
      password: DP_PASS,
      role: "delivery_partner",
    });
    console.log(`  → POST /auth/register (duplicate)`);
    test("1.2  Status 409 — duplicate email", r.status, 409);
    test("1.2  success = false", r.json?.success, false);
  }

  // 1.3 Login
  {
    const r = await req("POST", "/auth/login", { email: DP_EMAIL, password: DP_PASS });
    console.log(`  → POST /auth/login`);
    if (test("1.3  Status 200 — login successful", r.status, 200)) {
      test("1.3  role = delivery_partner", r.json?.data?.user?.role, "delivery_partner");
      dpToken = r.json?.data?.token || dpToken; // refresh token
    }
  }

  // 1.4 Invalid creds
  {
    const r = await req("POST", "/auth/login", { email: DP_EMAIL, password: "wrongpass" });
    console.log(`  → POST /auth/login (bad password)`);
    test("1.4  Status 401 — bad credentials", r.status, 401);
  }

  // ─── 2. AVAILABLE ORDERS ─────────────────────────────────
  console.log("\n📁 2 — Available Orders\n");

  // 2.1 Valid token
  {
    const r = await req("GET", "/delivery/orders/available", null, dpToken);
    console.log(`  → GET /delivery/orders/available`);
    if (test("2.1  Status 200", r.status, 200)) {
      test("2.1  success = true", r.json?.success, true);
      const hasCount = typeof r.json?.count === "number";
      if (hasCount) { pass++; console.log("  ✅  2.1  has count field"); }
      else          { fail++; console.log("  ❌  2.1  missing count field"); }
      const isArr = Array.isArray(r.json?.data);
      if (isArr) { pass++; console.log("  ✅  2.1  data is array"); }
      else       { fail++; console.log("  ❌  2.1  data is not array"); }

      if (r.json?.data?.length > 0) {
        orderId = String(r.json.data[0].order_id);
        console.log(`       ℹ️  Captured order_id = ${orderId}`);
        // all statuses must be ready_for_pickup
        const allReady = r.json.data.every(o => o.status === "ready_for_pickup");
        test("2.1  All statuses = ready_for_pickup", allReady, true);
      } else {
        console.log("       ⚠️  No available orders in DB — claim/deliver tests will be skipped");
      }
    }
  }

  // 2.2 No token
  {
    const r = await req("GET", "/delivery/orders/available");
    console.log(`  → GET /delivery/orders/available (no token)`);
    test("2.2  Status 401 — no token", r.status, 401);
  }

  // 2.3 Wrong role — register a quick customer token
  {
    const custEmail = `cust.test.${TS}@rxconnect.com`;
    const reg = await req("POST", "/auth/register", {
      name: "Test Customer",
      email: custEmail,
      password: "cust123",
      role: "customer",
    });
    const custToken = reg.json?.data?.token;
    const r = await req("GET", "/delivery/orders/available", null, custToken);
    console.log(`  → GET /delivery/orders/available (customer token)`);
    test("2.3  Status 403 — wrong role", r.status, 403);
  }

  // ─── 3. CLAIM ORDER ──────────────────────────────────────
  console.log("\n📁 3 — Claim Order\n");

  if (!orderId) {
    console.log("  ⏭️  Skipping claim tests — no available orders in DB\n");
    // Still test claiming a non-existent order
    const r = await req("POST", "/delivery/orders/999999/claim", null, dpToken);
    console.log(`  → POST /delivery/orders/999999/claim`);
    test("3.3  Status 409 — non-existent order", r.status, 409);
  } else {
    // 3.1 Valid claim
    {
      const r = await req("POST", `/delivery/orders/${orderId}/claim`, null, dpToken);
      console.log(`  → POST /delivery/orders/${orderId}/claim`);
      if (test("3.1  Status 200 — order claimed", r.status, 200)) {
        test("3.1  status = out_for_delivery", r.json?.data?.status, "out_for_delivery");
        const hasDpId = typeof r.json?.data?.delivery_partner_id === "string";
        if (hasDpId) { pass++; console.log("  ✅  3.1  delivery_partner_id present"); }
        else         { fail++; console.log("  ❌  3.1  delivery_partner_id missing"); }
      }
    }

    // 3.2 Re-claim same order
    {
      const r = await req("POST", `/delivery/orders/${orderId}/claim`, null, dpToken);
      console.log(`  → POST /delivery/orders/${orderId}/claim (re-claim)`);
      const ok = [400, 409].includes(r.status);
      if (ok) { pass++; console.log(`  ✅  3.2  Status ${r.status} — cannot re-claim`); }
      else    { fail++; console.log(`  ❌  3.2  expected 400 or 409, got ${r.status}`); }
      test("3.2  success = false", r.json?.success, false);
    }

    // 3.3 Non-existent order
    {
      const r = await req("POST", "/delivery/orders/999999/claim", null, dpToken);
      console.log(`  → POST /delivery/orders/999999/claim`);
      test("3.3  Status 409 — non-existent order", r.status, 409);
    }
  }

  // ─── 4. MY ORDERS ─────────────────────────────────────────
  console.log("\n📁 4 — My Orders\n");

  {
    const r = await req("GET", "/delivery/orders/my-orders", null, dpToken);
    console.log(`  → GET /delivery/orders/my-orders`);
    if (test("4.1  Status 200", r.status, 200)) {
      test("4.1  success = true", r.json?.success, true);
      const isArr = Array.isArray(r.json?.data);
      if (isArr) { pass++; console.log("  ✅  4.1  data is array"); }
      else       { fail++; console.log("  ❌  4.1  data is not array"); }

      if (orderId && isArr) {
        const found = r.json.data.find(o => String(o.order_id) === orderId);
        if (found) {
          pass++; console.log(`  ✅  4.1  Claimed order ${orderId} in list`);
          test("4.1  status = out_for_delivery", found.status, "out_for_delivery");
        } else {
          fail++; console.log(`  ❌  4.1  Order ${orderId} not found in my-orders`);
        }
      }
    }
  }

  // 4.2 No token
  {
    const r = await req("GET", "/delivery/orders/my-orders");
    console.log(`  → GET /delivery/orders/my-orders (no token)`);
    test("4.2  Status 401 — no token", r.status, 401);
  }

  // ─── 5. MARK DELIVERED ────────────────────────────────────
  console.log("\n📁 5 — Mark Delivered\n");

  if (!orderId) {
    console.log("  ⏭️  Skipping mark-delivered tests — no order was claimed\n");
  } else {
    // 5.1 Valid mark delivered
    {
      const r = await req("PATCH", `/delivery/orders/${orderId}/delivered`, null, dpToken);
      console.log(`  → PATCH /delivery/orders/${orderId}/delivered`);
      if (test("5.1  Status 200 — order marked delivered", r.status, 200)) {
        test("5.1  status = delivered", r.json?.data?.status, "delivered");
        const hasTs = typeof r.json?.data?.updated_at === "string";
        if (hasTs) { pass++; console.log("  ✅  5.1  updated_at timestamp present"); }
        else       { fail++; console.log("  ❌  5.1  updated_at missing"); }
      }
    }

    // 5.2 Already delivered
    {
      const r = await req("PATCH", `/delivery/orders/${orderId}/delivered`, null, dpToken);
      console.log(`  → PATCH /delivery/orders/${orderId}/delivered (again)`);
      test("5.2  Status 404 — already delivered", r.status, 404);
      test("5.2  success = false", r.json?.success, false);
    }

    // 5.3 Unowned order
    {
      const r = await req("PATCH", "/delivery/orders/999999/delivered", null, dpToken);
      console.log(`  → PATCH /delivery/orders/999999/delivered`);
      test("5.3  Status 404 — unowned order", r.status, 404);
    }
  }

  // ─── 6. VERIFY FINAL STATE ────────────────────────────────
  console.log("\n📁 6 — Verify Final State\n");

  {
    const r = await req("GET", "/delivery/orders/my-orders", null, dpToken);
    console.log(`  → GET /delivery/orders/my-orders`);
    if (test("6.1  Status 200", r.status, 200) && orderId) {
      const found = r.json?.data?.find(o => String(o.order_id) === orderId);
      if (found) {
        pass++; console.log(`  ✅  6.1  Order ${orderId} in my-orders`);
        test("6.1  status = delivered", found.status, "delivered");
      } else {
        fail++; console.log(`  ❌  6.1  Order ${orderId} not found in my-orders`);
      }
    }
  }

  {
    const r = await req("GET", "/delivery/orders/available", null, dpToken);
    console.log(`  → GET /delivery/orders/available`);
    if (test("6.2  Status 200", r.status, 200) && orderId) {
      const found = r.json?.data?.find(o => String(o.order_id) === orderId);
      if (!found) { pass++; console.log(`  ✅  6.2  Delivered order no longer in available list`); }
      else        { fail++; console.log(`  ❌  6.2  Order ${orderId} still in available list!`); }
    }
  }

  // ─── SUMMARY ─────────────────────────────────────────────
  const total = pass + fail;
  console.log("\n══════════════════════════════════════════════");
  console.log(`   RESULTS: ${pass}/${total} passed  |  ${fail} failed`);
  console.log("══════════════════════════════════════════════\n");
  process.exit(fail > 0 ? 1 : 0);
})();
