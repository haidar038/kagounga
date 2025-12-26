# Biteship Integration Setup Guide

## Prerequisites

Sebelum mengaktifkan integrasi Biteship, pastikan Anda memiliki:

1. **Akun Biteship** - Daftar di [https://app.biteship.com/](https://app.biteship.com/)
2. **API Key Biteship** - Dapat diakses melalui Biteship Dashboard → Settings → API Key
3. **⚠️ PENTING: Balance Minimal** - Top up minimal **Rp 50.000** di akun Biteship

> [!IMPORTANT] > **Biteship Rates API membutuhkan balance** bahkan di test mode! Tanpa balance, Rates API akan return error dan sistem akan fallback ke harga estimasi hardcoded. Order creation tetap bisa (gratis di test mode), tapi rate calculation tidak akan akurat.

## Environment Variables

Tambahkan environment variables berikut di **Supabase Dashboard → Project Settings → Edge Functions → Secrets**:

### Required Variables

```bash
# Biteship API Configuration
BITESHIP_TEST_API_KEY=your_test_api_key_here

# Store Information (untuk origin pengiriman)
STORE_NAME=Kagounga Store
STORE_PHONE=081234567890
STORE_EMAIL=store@kagounga.com
STORE_ADDRESS=Jl. Pertamina Jambula, Ternate
STORE_POSTAL_CODE=97719
```

### Optional Variables

```bash
# Biteship Origin Area ID (untuk akurasi lebih tinggi)
BITESHIP_ORIGIN_AREA_ID=your_origin_area_id

# Webhook Secret (untuk verifikasi webhook dari Biteship)
BITESHIP_WEBHOOK_SECRET=your_random_secret_string
```

## Cara Mendapatkan API Key

1. Login ke Biteship Dashboard: https://app.biteship.com/
2. Navigasi ke **Settings** → **API Keys**
3. Copy **Test API Key** untuk development
4. Untuk production, copy **Production API Key** dan ganti environment variable

## Webhook Configuration

Untuk menerima update otomatis dari Biteship (status tracking, waybill ID, dll):

1. Login ke Biteship Dashboard
2. Navigasi ke **Settings** → **Webhooks**
3. Tambahkan webhook URL:
    ```
    https://[your-project-ref].supabase.co/functions/v1/biteship-webhook
    ```
4. Pilih events yang ingin di-subscribe:
    - ✅ `order.status` - Update status pengiriman
    - ✅ `order.waybill_id` - Nomor resi assigned
    - ✅ `order.price` - Update harga (opsional)

## Testing the Integration

### 1. Verify Environment Variables

Check bahwa semua environment variables sudah di-set:

```bash
# Via Supabase Dashboard
Settings → Edge Functions → Secrets
```

### 2. Test Checkout Flow

1. Buka website dan lakukan checkout
2. **Pilih pengiriman ANTAR KOTA** (bukan lokal Ternate)
3. Pilih kurir (misal: JNE, J&T, Lion Parcel, dll)
4. Complete payment di Xendit

### 3. Check Logs

Setelah payment berhasil, check logs di Supabase:

```bash
# Via Supabase Dashboard
Functions → Select Function → Logs
```

**Check logs untuk `xendit-webhook`:**

-   Harus menampilkan: `"=== PAYMENT CONFIRMED - CHECKING SHIPMENT CREATION ==="`
-   Harus menampilkan order details dengan courier_code
-   Harus memanggil `shipping-create` jika bukan local delivery

**Check logs untuk `shipping-create`:**

-   Harus menampilkan: `"=== SHIPPING-CREATE FUNCTION CALLED ==="`
-   Harus menampilkan: `"Environment Check"` dengan hasBiteshipApiKey: true
-   Harus membuat order di Biteship API

### 4. Verify in Biteship Dashboard

1. Login ke https://app.biteship.com/
2. Navigasi ke **Orders**
3. Cari order berdasarkan reference_id (order ID dari database)
4. Pastikan order muncul dengan status "confirmed" atau "allocated"

### 5. Check Database

```sql
-- Verify order has Biteship data
SELECT
    id,
    customer_name,
    courier_code,
    courier_name,
    is_local_delivery,
    tracking_number,
    biteship_order_id,
    created_at
FROM orders
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected result:**

-   `biteship_order_id` should be filled (for inter-city orders)
-   `tracking_number` should be filled (waybill ID)
-   `courier_code` and `courier_name` should match selected courier

## Troubleshooting

### Issue: "No sufficient balance to call rates API" ⚠️ **COMMON!**

**Error message:**

```
Error: No sufficient balance to call rates API. Please top up your balance
```

**Penyebab:**

-   Biteship Rates API **membutuhkan balance** bahkan di test mode
-   Akun Biteship Anda balance-nya 0 atau kurang dari minimum

**Solution:**

1. Login ke https://app.biteship.com/
2. Navigate to **Balance** → **Top Up**
3. Top up minimal **Rp 50.000** (recommended Rp 100.000 untuk testing)
4. Test ulang checkout

**Alternative:**

-   Contact Biteship support untuk demo account dengan balance pre-loaded
-   Email: support@biteship.com

**Temporary workaround:**

-   Sistem akan fallback ke hardcoded rates (Lion Parcel Rp 25k, JNE Rp 30k)
-   Order creation tetap bisa (gratis di test mode)
-   Tapi rate calculation tidak akurat

---

### Issue: Order tidak muncul di Biteship

**Check:**

1. Apakah `BITESHIP_TEST_API_KEY` sudah di-set?
2. Apakah pengiriman yang dipilih **ANTAR KOTA** (bukan lokal)?
3. Check logs `xendit-webhook` - apakah `courier_code` ada?
4. Check logs `shipping-create` - apakah ada error dari Biteship API?

**Common causes:**

-   ❌ API key tidak di-set
-   ❌ Memilih pengiriman lokal (tidak akan create order di Biteship)
-   ❌ Courier code tidak tersimpan saat checkout
-   ❌ Biteship balance insufficient

### Issue: Webhook tidak update status

**Check:**

1. Apakah webhook URL sudah dikonfigurasi di Biteship Dashboard?
2. Apakah webhook URL benar? (check project ref)
3. Check logs `biteship-webhook` - apakah ada incoming requests?

**Test webhook:**

```bash
curl -X POST https://[your-project-ref].supabase.co/functions/v1/biteship-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "order.status",
    "order_id": "test-biteship-order-id",
    "status": "picked"
  }'
```

### Issue: Error "Biteship API key not configured"

Pastikan environment variable sudah di-set dengan nama yang **exact**:

-   ✅ `BITESHIP_TEST_API_KEY` (untuk test mode)
-   ❌ Bukan `BITESHIP_API_KEY` atau nama lain

### Issue: Error "destination_area_id not found"

Ini normal jika area tidak ditemukan. System akan fallback ke postal_code.
Untuk akurasi lebih baik, set `BITESHIP_ORIGIN_AREA_ID`.

## Production Checklist

Sebelum go-live:

-   [ ] Ganti `BITESHIP_TEST_API_KEY` dengan `BITESHIP_PRODUCTION_API_KEY`
-   [ ] Verify webhook URL menggunakan production URL
-   [ ] Test end-to-end dengan production API key
-   [ ] Pastikan Biteship balance cukup
-   [ ] Configure auto top-up di Biteship (opsional)
-   [ ] Set up monitoring/alerting untuk failed orders

## Support

Jika masih ada masalah:

1. **Check Biteship Docs**: https://biteship.com/id/docs/api
2. **Biteship Support**: support@biteship.com
3. **Check Logs**: Supabase Dashboard → Functions → Logs
