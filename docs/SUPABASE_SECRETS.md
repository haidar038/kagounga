# Supabase Secrets Configuration

This file lists all secrets that need to be configured in Supabase Project Settings → Edge Functions → Secrets.

> **Note**: Secrets dengan prefix `VITE_` adalah untuk frontend dan tidak perlu di-set di Supabase Secrets (sudah di .env lokal)

## Required Secrets (Edge Functions)

### Payment Integration

```
XENDIT_SECRET_KEY
XENDIT_CALLBACK_TOKEN
```

### Biteship Shipping Integration

```
BITESHIP_API_KEY
BITESHIP_TEST_API_KEY
BITESHIP_ORIGIN_AREA_ID
BITESHIP_WEBHOOK_SECRET
```

### Store Information

```
STORE_NAME
STORE_PHONE
STORE_EMAIL
STORE_ADDRESS
STORE_POSTAL_CODE
```

## Automatic Supabase Variables

These are automatically available in Edge Functions (no need to set manually):

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Frontend Only (Not needed in Supabase Secrets)

These variables with `VITE_` prefix are only for frontend (.env file):

```
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_URL
VITE_BITESHIP_TEST_API_KEY
VITE_BITESHIP_API_KEY
VITE_SHIPPING_ORIGIN_CITY_ID
VITE_LOCAL_DELIVERY_FLAT_RATE
VITE_FREE_SHIPPING_THRESHOLD
VITE_DEFAULT_PRODUCT_WEIGHT_KG
```

## How to Set Secrets

### Via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/edospvzmgvaytsozbcdl/settings/functions
2. Scroll to "Secrets" section
3. Add each secret from "Required Secrets" section above
4. Click "Save"

### Via CLI

```bash
# Set all required secrets
supabase secrets set XENDIT_SECRET_KEY=your_xendit_secret_key
supabase secrets set XENDIT_CALLBACK_TOKEN=your_callback_token

supabase secrets set BITESHIP_API_KEY=your_biteship_api_key
supabase secrets set BITESHIP_TEST_API_KEY=your_biteship_test_api_key
supabase secrets set BITESHIP_ORIGIN_AREA_ID=IDNP20IDNC464IDND5917IDZ97751
supabase secrets set BITESHIP_WEBHOOK_SECRET=vite-supabase-kagounga-store-system-2025

supabase secrets set STORE_NAME="Kagounga"
supabase secrets set STORE_PHONE="+6281234567890"
supabase secrets set STORE_EMAIL="hello@kagounga.id"
supabase secrets set STORE_ADDRESS="Jambula, Pulau Ternate, Maluku Utara"
supabase secrets set STORE_POSTAL_CODE="97747"
```

### Verify Secrets

```bash
supabase secrets list
```

## Current Values (from .env)

**DO NOT commit these to git!** Use this as reference only:

-   BITESHIP_API_KEY: `biteship_test.eyJhbG...` (test)
-   BITESHIP_TEST_API_KEY: `biteship_test.eyJhbG...`
-   BITESHIP_ORIGIN_AREA_ID: `IDNP20IDNC464IDND5917IDZ97751`
-   BITESHIP_WEBHOOK_SECRET: `vite-supabase-kagounga-store-system-2025`
-   STORE_NAME: `Kagounga`
-   STORE_PHONE: `+6281234567890`
-   STORE_EMAIL: `hello@kagounga.id`
-   STORE_ADDRESS: `Jambula, Pulau Ternate, Maluku Utara`
-   STORE_POSTAL_CODE: `97747`
-   XENDIT_SECRET_KEY: `xnd_development_gEK...`
-   XENDIT_CALLBACK_TOKEN: (empty, needs to be set)

## Notes

1. **BITESHIP_API_KEY vs BITESHIP_TEST_API_KEY**:

    - Use `BITESHIP_TEST_API_KEY` for development/staging
    - Use `BITESHIP_API_KEY` for production
    - Currently both have the same test key value

2. **XENDIT_CALLBACK_TOKEN**:

    - This should be set to secure your webhook endpoint
    - Generate a random secure string

3. **Webhook Secret**:

    - Optional but recommended
    - Used to verify webhook requests from Biteship
    - Current value: `vite-supabase-kagounga-store-system-2025`

4. **Origin Area ID**:
    - Current ID is for Ternate
    - Obtained from Biteship Maps API

## Security Reminders

-   ✅ `.env` added to `.gitignore`
-   ✅ Never commit real API keys to git
-   ✅ Use different keys for development vs production
-   ✅ Rotate keys regularly
-   ✅ Only share keys via secure channels
