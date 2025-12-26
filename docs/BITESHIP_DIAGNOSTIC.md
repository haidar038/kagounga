# Quick Diagnostic: Shipping Calculate Function

## Kemungkinan Issue

Berdasarkan gejala Anda (hanya Lion Parcel muncul), ada 3 kemungkinan:

### **1. Function Belum Terdeploy dengan Perubahan Baru** ⚠️

Enhanced logging yang saya tambahkan mungkin belum terdeploy.

**Check:**

-   Apakah Anda deploy ulang function setelah saya edit?
-   Di Supabase Dashboard → Functions → shipping-calculate → lihat "Last deployed"

**Solution:**

```bash
# Deploy ulang function
supabase functions deploy shipping-calculate
```

### **2. Environment Variable Tidak Terbaca** ⚠️

`BITESHIP_TEST_API_KEY` mungkin tidak terbaca oleh function.

**Check di Supabase Dashboard:**

-   Settings → Edge Functions → Secrets
-   Pastikan nama exact: `BITESHIP_TEST_API_KEY` (case-sensitive!)
-   **BUKAN** `BITESHIP_API_KEY` atau nama lain

### **3. Biteship API Returning Error** ⚠️

API key valid tapi Biteship API return error.

---

## Cara Cepat Debug

### **Option A: Lihat Console Logs (Recommended)**

1. Supabase Dashboard → **Functions** → **shipping-calculate**
2. Tab **"Logs"** (di sebelah "Invocations")
3. Filter: Last 1 hour
4. Cari text: `SHIPPING-CALCULATE`

**Yang harus Anda lihat:**

```
=== SHIPPING-CALCULATE FUNCTION CALLED ===
Environment Check: {
  hasBiteshipApiKey: true,  ← HARUS TRUE!
  biteshipTestApiKey: "✅ Configured",
  priorityCouriers: ["lion", "jne", "jnt", "sicepat", "anteraja"]
}
```

**Jika `hasBiteshipApiKey: false`:**
→ Environment variable tidak terbaca

**Jika tidak ada log `===` sama sekali:**
→ Function belum terdeploy dengan perubahan baru

### **Option B: Test Langsung via Supabase**

1. Supabase Dashboard → **Functions** → **shipping-calculate**
2. Tab **"Details"** → **"Invoke function"**
3. Paste payload ini:

```json
{
    "originCity": "Ternate",
    "destinationCity": "Jakarta",
    "destinationPostalCode": "12345",
    "items": [
        {
            "name": "Test Product",
            "value": 100000,
            "weight": 1000,
            "quantity": 1
        }
    ]
}
```

4. Click **"Invoke"**
5. Lihat response dan logs

**Expected response (SUCCESS):**

```json
{
  "success": true,
  "isLocal": false,
  "options": [
    { "courierName": "Lion Parcel", "price": 25000, ... },
    { "courierName": "JNE", "price": 28000, ... },
    { "courierName": "J&T Express", "price": 22000, ... },
    ...
  ]
}
```

**If fallback:**

```json
{
  "success": true,
  "fallback": true,  ← BAD!
  "warning": "Biteship API belum dikonfigurasi...",
  "options": [
    { "courierName": "Lion Parcel", ... },  // Only 2 options
    { "courierName": "JNE", ... }
  ]
}
```

---

## Action Items untuk Anda

**Lakukan step by step:**

### **Step 1: Verify Environment Variable**

```
Supabase Dashboard → Settings → Edge Functions → Secrets
✓ BITESHIP_TEST_API_KEY = biteship_test.xxxxxxxxx
```

Screenshot dan kirim jika tidak yakin.

### **Step 2: Check Function Deployment**

```
Supabase Dashboard → Functions → shipping-calculate
Lihat "Last deployed" timestamp
```

Jika sebelum saya edit kode (sebelum ~30 menit yang lalu), **deploy ulang**:

```bash
cd supabase
bunx supabase functions deploy shipping-calculate
```

### **Step 3: Test via Dashboard**

Gunakan "Invoke function" dengan payload di atas.
Copy-paste **FULL response** dan **logs** ke sini.

### **Step 4: Copy Paste Console Logs**

```
Supabase Dashboard → Functions → shipping-calculate → Logs tab
```

Copy paste semua yang ada text "SHIPPING-CALCULATE" atau "Biteship"

---

## Temporary Workaround

Sambil debugging, saya bisa buat test endpoint khusus yang:

1. Print semua environment variables (masked)
2. Test Biteship API connection
3. Return detailed diagnostic info

Mau saya buatkan? (Y/N)
