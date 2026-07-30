$base = 'http://localhost:5000'
$ErrorActionPreference = 'SilentlyContinue'

function Test-Endpoint {
    param($name, $method, $path, $body=$null, $headers=@{}, $contentType='application/json')
    Write-Host "`n=== $name ===" -ForegroundColor Cyan
    try {
        $params = @{ Uri="$base$path"; Method=$method; Headers=$headers }
        if ($body) { $params['Body'] = $body; $params['ContentType'] = $contentType }
        $r = Invoke-RestMethod @params -ErrorVariable apiErr -ErrorAction Stop
        Write-Host "  STATUS: OK" -ForegroundColor Green
        Write-Host "  BODY:   $(($r | ConvertTo-Json -Depth 3 -Compress))"
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        try { $msg = ($_.ErrorDetails.Message | ConvertFrom-Json).message } catch { $msg = $_.Exception.Message }
        Write-Host "  STATUS: $status" -ForegroundColor Red
        Write-Host "  BODY:   $msg"
    }
}

# ── Health Check ─────────────────────────────────────────────────────
Test-Endpoint "GET / Health Check" "GET" "/"

# ── Auth: Register ───────────────────────────────────────────────────
Test-Endpoint "POST /auth/register - missing all fields" "POST" "/auth/register" '{}'
Test-Endpoint "POST /auth/register - missing name" "POST" "/auth/register" '{"email":"a@b.com","password":"pass123"}'
Test-Endpoint "POST /auth/register - invalid role" "POST" "/auth/register" '{"name":"T","email":"t@t.com","password":"p123456","role":"hacker"}'
Test-Endpoint "POST /auth/register - admin without secret" "POST" "/auth/register" '{"name":"T","email":"adm@t.com","password":"p123456","role":"admin"}'
Test-Endpoint "POST /auth/register - pharmacist without secret" "POST" "/auth/register" '{"name":"T","email":"ph@t.com","password":"p123456","role":"pharmacist"}'

# ── Auth: Login ──────────────────────────────────────────────────────
Test-Endpoint "POST /auth/login - empty body" "POST" "/auth/login" '{}'
Test-Endpoint "POST /auth/login - wrong password" "POST" "/auth/login" '{"email":"test@test.com","password":"wrongpassword"}'
Test-Endpoint "POST /auth/login - nonexistent user" "POST" "/auth/login" '{"email":"nobody@nowhere.com","password":"abc123"}'
Test-Endpoint "POST /auth/login - missing password" "POST" "/auth/login" '{"email":"test@test.com"}'

# ── Auth: Profile ────────────────────────────────────────────────────
Test-Endpoint "GET /auth/profile - no token" "GET" "/auth/profile"
Test-Endpoint "GET /auth/profile - bad token" "GET" "/auth/profile" $null @{Authorization="Bearer invalid.token.here"}
Test-Endpoint "GET /auth/profile - expired-like token" "GET" "/auth/profile" $null @{Authorization="Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEifQ.FAKE"}

# ── Medicines ────────────────────────────────────────────────────────
Test-Endpoint "GET /medicines - public" "GET" "/medicines"
Test-Endpoint "GET /medicines - with fake auth" "GET" "/medicines" $null @{Authorization="Bearer fake"}

# ── Orders: Check Stock ──────────────────────────────────────────────
Test-Endpoint "POST /orders/check-stock - empty body" "POST" "/orders/check-stock" '{}'
Test-Endpoint "POST /orders/check-stock - empty array" "POST" "/orders/check-stock" '{"medicines":[]}'
Test-Endpoint "POST /orders/check-stock - invalid medicineId" "POST" "/orders/check-stock" '{"medicines":[{"medicineId":99999,"quantity":1}]}'
Test-Endpoint "POST /orders/check-stock - zero quantity" "POST" "/orders/check-stock" '{"medicines":[{"medicineId":1,"quantity":0}]}'
Test-Endpoint "POST /orders/check-stock - negative quantity" "POST" "/orders/check-stock" '{"medicines":[{"medicineId":1,"quantity":-5}]}'
Test-Endpoint "POST /orders/check-stock - string quantity" "POST" "/orders/check-stock" '{"medicines":[{"medicineId":1,"quantity":"abc"}]}'
Test-Endpoint "POST /orders/check-stock - missing quantity" "POST" "/orders/check-stock" '{"medicines":[{"medicineId":1}]}'
Test-Endpoint "POST /orders/check-stock - valid (id 1, qty 2)" "POST" "/orders/check-stock" '{"medicines":[{"medicineId":1,"quantity":2}]}'

# ── Orders: Place Order ──────────────────────────────────────────────
Test-Endpoint "POST /orders/place - no token" "POST" "/orders/place" '{"branchId":1,"requiresPrescription":false,"items":[{"medicine_id":1,"quantity":1}]}'
Test-Endpoint "POST /orders/place - customer token faked" "POST" "/orders/place" '{"branchId":1,"requiresPrescription":false,"items":[{"medicine_id":1,"quantity":1}]}' @{Authorization="Bearer fake"}
Test-Endpoint "POST /orders/place - missing branchId" "POST" "/orders/place" '{"requiresPrescription":false,"items":[{"medicine_id":1,"quantity":1}]}' @{Authorization="Bearer fake"}
Test-Endpoint "POST /orders/place - invalid branchId string" "POST" "/orders/place" '{"branchId":"abc","requiresPrescription":false,"items":[{"medicine_id":1,"quantity":1}]}' @{Authorization="Bearer fake"}
Test-Endpoint "POST /orders/place - empty items" "POST" "/orders/place" '{"branchId":1,"requiresPrescription":false,"items":[]}' @{Authorization="Bearer fake"}

# ── Pharmacist ───────────────────────────────────────────────────────
Test-Endpoint "GET /pharmacist/pending-prescriptions - no auth (bug - should 401)" "GET" "/pharmacist/pending-prescriptions"
Test-Endpoint "POST /pharmacist/approve - missing prescriptionId" "POST" "/pharmacist/approve" '{}'
Test-Endpoint "POST /pharmacist/approve - non-numeric id" "POST" "/pharmacist/approve" '{"prescriptionId":"abc"}'
Test-Endpoint "POST /pharmacist/approve - nonexistent id" "POST" "/pharmacist/approve" '{"prescriptionId":999999}'
Test-Endpoint "POST /pharmacist/reject - missing prescriptionId" "POST" "/pharmacist/reject" '{}'
Test-Endpoint "POST /pharmacist/reject - no rejectionReason" "POST" "/pharmacist/reject" '{"prescriptionId":999999}'

# ── Admin ─────────────────────────────────────────────────────────────
Test-Endpoint "GET /admin/users - no token" "GET" "/admin/users"
Test-Endpoint "GET /admin/branches - no token" "GET" "/admin/branches"
Test-Endpoint "GET /admin/orders - no token" "GET" "/admin/orders"
Test-Endpoint "GET /admin/users - fake token" "GET" "/admin/users" $null @{Authorization="Bearer fake"}

# ── Customer Routes ──────────────────────────────────────────────────
Test-Endpoint "GET /customer/orders - no token" "GET" "/customer/orders"
Test-Endpoint "GET /customer/orders/1 - no token" "GET" "/customer/orders/1"
Test-Endpoint "GET /customer/orders/abc - invalid id" "GET" "/customer/orders/abc" $null @{Authorization="Bearer fake"}
Test-Endpoint "GET /customer/orders/-1 - negative id" "GET" "/customer/orders/-1" $null @{Authorization="Bearer fake"}

# ── Prescriptions ────────────────────────────────────────────────────
Test-Endpoint "POST /prescriptions/upload - no token" "POST" "/prescriptions/upload" '{"orderId":1}'
Test-Endpoint "GET /prescriptions/upload (wrong method)" "GET" "/prescriptions/upload"

Write-Host "`n=== TESTS COMPLETE ===" -ForegroundColor Green
