import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShippingItem {
    name: string;
    value: number;
    weight: number; // in grams
    quantity: number;
}

interface CalculateShippingRequest {
    originCity: string;
    destinationCity: string;
    destinationPostalCode?: string;
    items: ShippingItem[];
    totalWeight?: number; // in kg, if not provided will calculate from items
}

interface ShippingOption {
    courier: string;
    courierName: string;
    service: string;
    serviceName: string;
    price: number;
    estimatedDays: string;
    description?: string;
    isLocal: boolean;
}

// Configuration
const BITESHIP_API_KEY = Deno.env.get("BITESHIP_TEST_API_KEY");
const TERNATE_CITY_KEYWORDS = ["ternate"];
const LOCAL_DELIVERY_RATE = 10000; // Rp 10,000 as confirmed
const FREE_SHIPPING_THRESHOLD = 150000; // Rp 150,000 as confirmed
const BITESHIP_API_URL = "https://api.biteship.com/v1";

// Recommended couriers by priority
const PRIORITY_COURIERS = ["lion", "jne", "jnt", "sicepat", "anteraja"];

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        console.log("=== SHIPPING-CALCULATE FUNCTION CALLED ===");

        // Validate environment
        const hasApiKey = !!BITESHIP_API_KEY;
        console.log("Environment Check:", {
            hasBiteshipApiKey: hasApiKey,
            biteshipTestApiKey: hasApiKey ? "✅ Configured" : "❌ Missing",
            priorityCouriers: PRIORITY_COURIERS,
        });

        const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");

        const requestBody: CalculateShippingRequest = await req.json();
        const { originCity, destinationCity, destinationPostalCode, items, totalWeight } = requestBody;

        console.log("Request Details:", {
            originCity,
            destinationCity,
            destinationPostalCode,
            itemCount: items.length,
            requestedWeight: totalWeight,
        });

        // Calculate total weight if not provided
        let weightInKg = totalWeight || 0;
        if (!weightInKg && items && items.length > 0) {
            const totalGrams = items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
            weightInKg = totalGrams / 1000; // Convert grams to kg
        }

        // Default to 1kg if still no weight
        if (weightInKg <= 0) {
            weightInKg = 1;
        }

        console.log(`Total weight: ${weightInKg} kg`);

        // Calculate total value for insurance
        const totalValue = items.reduce((sum, item) => sum + item.value * item.quantity, 0);

        // Check if delivery is local (Ternate)
        const isLocalDelivery = TERNATE_CITY_KEYWORDS.some((keyword) => destinationCity.toLowerCase().includes(keyword));

        const shippingOptions: ShippingOption[] = [];

        // ===== LOCAL DELIVERY (TERNATE) =====
        if (isLocalDelivery) {
            console.log("Local delivery detected (Ternate)");

            // Check for free shipping threshold
            const localRate = totalValue >= FREE_SHIPPING_THRESHOLD ? 0 : LOCAL_DELIVERY_RATE;

            shippingOptions.push({
                courier: "local_delivery",
                courierName: "Pengiriman Lokal Ternate",
                service: "same_day",
                serviceName: "Same Day / Next Day",
                price: localRate,
                estimatedDays: "0-1",
                description: totalValue >= FREE_SHIPPING_THRESHOLD ? "🎉 Gratis ongkir untuk pembelian di atas Rp 150.000!" : "Pengiriman lokal di dalam kota Ternate",
                isLocal: true,
            });

            return new Response(
                JSON.stringify({
                    success: true,
                    isLocal: true,
                    options: shippingOptions,
                    totalWeight: weightInKg,
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // ===== INTER-CITY DELIVERY via BITESHIP =====
        console.log("Inter-city delivery detected, calling Biteship API");

        if (!BITESHIP_API_KEY) {
            console.error("❌ BITESHIP API KEY NOT CONFIGURED");
            console.error("Please set BITESHIP_TEST_API_KEY in Supabase Secrets");
            console.error("Returning fallback rates (hardcoded)");

            // Return basic fallback options when API is not configured
            const fallbackOptions: ShippingOption[] = [
                {
                    courier: "lion_parcel",
                    courierName: "Lion Parcel",
                    service: "reg",
                    serviceName: "Regular Service",
                    price: 25000,
                    estimatedDays: "3-5",
                    description: "⚠️ Estimasi ongkir - akan dikonfirmasi admin",
                    isLocal: false,
                },
                {
                    courier: "jne",
                    courierName: "JNE",
                    service: "reg",
                    serviceName: "Regular",
                    price: 30000,
                    estimatedDays: "2-4",
                    description: "⚠️ Estimasi ongkir - akan dikonfirmasi admin",
                    isLocal: false,
                },
            ];

            console.warn("⚠️ Returning fallback - only 2 couriers available");
            return new Response(
                JSON.stringify({
                    success: true,
                    isLocal: false,
                    options: fallbackOptions,
                    totalWeight: weightInKg,
                    fallback: true,
                    warning: "Biteship API belum dikonfigurasi. Menggunakan estimasi ongkir.",
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Check cache first
        const { data: cachedRates } = await supabase
            .from("shipping_rates_cache")
            .select("*")
            .eq("origin_city", originCity.toLowerCase())
            .eq("destination_city", destinationCity.toLowerCase())
            .eq("weight_kg", weightInKg)
            .gt("expires_at", new Date().toISOString())
            .order("rate_amount", { ascending: true });

        if (cachedRates && cachedRates.length > 0) {
            console.log(`Found ${cachedRates.length} cached rates`);

            cachedRates.forEach((rate) => {
                shippingOptions.push({
                    courier: rate.courier_code,
                    courierName: rate.courier_code.toUpperCase(),
                    service: rate.service_code,
                    serviceName: rate.service_name,
                    price: rate.rate_amount,
                    estimatedDays: rate.min_estimated_days && rate.max_estimated_days ? `${rate.min_estimated_days}-${rate.max_estimated_days}` : "2-4",
                    isLocal: false,
                });
            });

            // If we have enough cached options, return them
            if (shippingOptions.length >= 3) {
                return new Response(
                    JSON.stringify({
                        success: true,
                        isLocal: false,
                        options: shippingOptions,
                        totalWeight: weightInKg,
                        cached: true,
                    }),
                    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
        }

        // Call Biteship API for rates
        // First, get destination area ID via maps API
        let destinationAreaId = null;

        try {
            const mapsResponse = await fetch(`${BITESHIP_API_URL}/maps/areas?countries=ID&input=${encodeURIComponent(destinationCity)}&type=single`, {
                method: "GET",
                headers: {
                    Authorization: BITESHIP_API_KEY,
                    "Content-Type": "application/json",
                },
            });

            if (mapsResponse.ok) {
                const mapsData = await mapsResponse.json();
                console.log("Maps API response:", JSON.stringify(mapsData).substring(0, 200));

                // Biteship returns areas array directly
                if (mapsData.areas && mapsData.areas.length > 0) {
                    destinationAreaId = mapsData.areas[0].id;
                    console.log(`Found destination area ID: ${destinationAreaId}`);
                } else {
                    console.warn(`No area found for: ${destinationCity}`);
                }
            } else {
                const errorText = await mapsResponse.text();
                console.error("Maps API error:", errorText);
            }
        } catch (error) {
            console.error("Error getting area ID:", error);
        }

        // If no area ID found, try with postal code or fallback to direct API call
        if (!destinationAreaId && !destinationPostalCode) {
            // Return error with helpful message
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Tidak dapat menemukan lokasi tujuan. Mohon pastikan nama kota benar atau tambahkan kode pos.",
                    message: "Unable to find destination location",
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
        }

        // Prepare items for Biteship API (weight in grams, not kg)
        const biteshipItems = items.map((item) => ({
            name: item.name,
            value: item.value,
            weight: item.weight, // already in grams
            quantity: item.quantity,
        }));

        // If no items, create a default item
        if (biteshipItems.length === 0) {
            biteshipItems.push({
                name: "Package",
                value: totalValue || 100000,
                weight: weightInKg * 1000, // Convert kg to grams
                quantity: 1,
            });
        }

        // Request rates from Biteship
        const originAreaId = Deno.env.get("BITESHIP_ORIGIN_AREA_ID");
        const ratesPayload = {
            origin_area_id: originAreaId || undefined,
            destination_area_id: destinationAreaId,
            destination_postal_code: destinationPostalCode ? parseInt(destinationPostalCode) : undefined,
            couriers: PRIORITY_COURIERS.join(","),
            items: biteshipItems,
        };

        // Remove undefined fields
        Object.keys(ratesPayload).forEach((key) => {
            if (ratesPayload[key] === undefined) {
                delete ratesPayload[key];
            }
        });

        console.log("📦 Biteship Rates API Request:", {
            hasOriginAreaId: !!originAreaId,
            hasDestinationAreaId: !!destinationAreaId,
            hasPostalCode: !!destinationPostalCode,
            requestedCouriers: PRIORITY_COURIERS,
            itemCount: biteshipItems.length,
        });
        console.log("Full payload:", JSON.stringify(ratesPayload, null, 2));

        const ratesResponse = await fetch(`${BITESHIP_API_URL}/rates/couriers`, {
            method: "POST",
            headers: {
                Authorization: BITESHIP_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(ratesPayload),
        });

        if (!ratesResponse.ok) {
            const errorText = await ratesResponse.text();
            console.error("❌ BITESHIP RATES API ERROR:", ratesResponse.status);
            console.error("Error response:", errorText);
            console.error("Request payload:", JSON.stringify(ratesPayload, null, 2));
            console.error("Falling back to hardcoded rates");

            // Return fallback instead of throwing error
            const fallbackOptions: ShippingOption[] = [
                {
                    courier: "lion_parcel",
                    courierName: "Lion Parcel",
                    service: "reg",
                    serviceName: "Regular Service",
                    price: 25000,
                    estimatedDays: "3-5",
                    description: "⚠️ Estimasi ongkir - akan dikonfirmasi admin",
                    isLocal: false,
                },
            ];

            return new Response(
                JSON.stringify({
                    success: true,
                    isLocal: false,
                    options: fallbackOptions,
                    totalWeight: weightInKg,
                    fallback: true,
                    warning: `Error dari Biteship API. Menggunakan estimasi ongkir.`,
                    debugInfo: errorText.substring(0, 200),
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const ratesData = await ratesResponse.json();
        console.log("✅ Biteship API Success!");
        console.log(`Received ${ratesData.pricing?.length || 0} rate options from Biteship`);

        if (ratesData.pricing && ratesData.pricing.length > 0) {
            console.log(
                "Available couriers:",
                ratesData.pricing.map((p) => `${p.courier_name} (${p.courier_service_name})`)
            );
        }

        // Process rates
        if (ratesData.pricing && Array.isArray(ratesData.pricing)) {
            for (const pricing of ratesData.pricing) {
                if (!pricing.available) continue;

                const option: ShippingOption = {
                    courier: pricing.courier_code,
                    courierName: pricing.courier_name,
                    service: pricing.courier_service_code,
                    serviceName: pricing.courier_service_name,
                    price: pricing.price,
                    estimatedDays: pricing.duration || "2-4",
                    description: pricing.description,
                    isLocal: false,
                };

                shippingOptions.push(option);

                // Cache this rate for future use (24 hour TTL)
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24);

                await supabase.from("shipping_rates_cache").insert({
                    origin_city: originCity.toLowerCase(),
                    destination_city: destinationCity.toLowerCase(),
                    destination_area_id: destinationAreaId,
                    courier_code: pricing.courier_code,
                    service_code: pricing.courier_service_code,
                    service_name: pricing.courier_service_name,
                    weight_kg: weightInKg,
                    rate_amount: pricing.price,
                    min_estimated_days: pricing.min_day,
                    max_estimated_days: pricing.max_day,
                    expires_at: expiresAt.toISOString(),
                });
            }
        }

        // Sort by price (cheapest first)
        shippingOptions.sort((a, b) => a.price - b.price);

        console.log(`📊 Returning ${shippingOptions.length} shipping options`);
        console.log(
            "Final options:",
            shippingOptions.map((o) => ({
                courier: o.courierName,
                service: o.serviceName,
                price: o.price,
            }))
        );

        return new Response(
            JSON.stringify({
                success: true,
                isLocal: false,
                options: shippingOptions,
                totalWeight: weightInKg,
                cached: false,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error calculating shipping:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
                message: "Gagal menghitung ongkos kirim. Silakan coba lagi.",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
