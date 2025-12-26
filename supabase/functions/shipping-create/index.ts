import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateShipmentRequest {
    orderId: string;
    courierCode: string;
    serviceCode: string;
    courierName: string;
    serviceName: string;
    isLocalDelivery: boolean;
}

const BITESHIP_API_KEY = Deno.env.get("BITESHIP_TEST_API_KEY");
const BITESHIP_API_URL = "https://api.biteship.com/v1";
const DEFAULT_PRODUCT_WEIGHT = 1000; // 1kg in grams as fallback

/**
 * Get destination area_id from Biteship Maps API
 * This ensures accurate shipping calculations
 */
async function getDestinationAreaId(city: string, postalCode: string): Promise<string | null> {
    try {
        console.log(`Looking up area_id for city: ${city}, postal: ${postalCode}`);

        const response = await fetch(`${BITESHIP_API_URL}/maps/areas`, {
            method: "GET",
            headers: {
                Authorization: BITESHIP_API_KEY!,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch areas from Biteship");
            return null;
        }

        const data = await response.json();
        const areas = data.areas || [];

        // Search for matching area by city name or postal code
        const matchingArea = areas.find((area: any) => {
            const areaName = area.name?.toLowerCase() || "";
            const searchCity = city.toLowerCase();
            return areaName.includes(searchCity) || area.postal_code === postalCode;
        });

        if (matchingArea) {
            console.log(`Found area_id: ${matchingArea.id} for ${city}`);
            return matchingArea.id;
        }

        console.warn(`No area_id found for ${city}`);
        return null;
    } catch (error) {
        console.error("Error fetching area_id:", error);
        return null;
    }
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        console.log("=== SHIPPING-CREATE FUNCTION CALLED ===");

        // Validate environment variables
        const hasApiKey = !!BITESHIP_API_KEY;
        console.log("Environment Check:", {
            hasBiteshipApiKey: hasApiKey,
            biteshipApiUrl: BITESHIP_API_URL,
        });

        // Create Supabase client with service role for admin access
        const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

        const requestBody: CreateShipmentRequest = await req.json();
        const { orderId, courierCode, serviceCode, courierName, serviceName, isLocalDelivery } = requestBody;

        console.log("Request Payload:", {
            orderId,
            courierCode,
            courierName,
            serviceCode,
            serviceName,
            isLocalDelivery,
        });

        // Validate required fields
        if (!orderId) {
            throw new Error("Missing required field: orderId");
        }
        if (!courierCode) {
            throw new Error("Missing required field: courierCode");
        }
        if (!serviceCode) {
            throw new Error("Missing required field: serviceCode");
        }

        console.log("✅ All required fields validated");
        console.log(`Fetching order details for: ${orderId}`);

        // Get order details
        const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single();

        if (orderError || !order) {
            console.error("Order fetch error:", orderError);
            throw new Error(`Order not found: ${orderId}`);
        }

        console.log("Order found:", {
            orderId: order.id,
            customerName: order.customer_name,
            city: order.city,
            postalCode: order.postal_code,
        });

        // Get order items (without products join - product_id is TEXT without FK)
        const { data: orderItems, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", orderId);

        if (itemsError) {
            console.error("Error fetching order items:", itemsError);
        }

        // Fetch product details separately if we have order items
        const productsMap: Record<string, any> = {};
        if (orderItems && orderItems.length > 0) {
            const productIds = orderItems.map((item: any) => item.product_id).filter(Boolean);

            if (productIds.length > 0) {
                const { data: products, error: productsError } = await supabase.from("products").select("id, weight_kg, length_cm, width_cm, height_cm").in("id", productIds);

                if (productsError) {
                    console.error("Error fetching products:", productsError);
                } else if (products) {
                    // Create a map of product id -> product data
                    products.forEach((product: any) => {
                        productsMap[product.id] = product;
                    });
                    console.log(`Fetched ${products.length} products for weight/dimension data`);
                }
            }
        }

        // ===== LOCAL DELIVERY =====
        // For local delivery, we don't create shipment in Biteship
        // Admin will handle manually, so we just update order with status
        if (isLocalDelivery) {
            console.log("Local delivery - no Biteship order needed, manual tracking");

            const { error: updateError } = await supabase
                .from("orders")
                .update({
                    courier_code: courierCode,
                    courier_name: courierName,
                    service_code: serviceCode,
                    service_name: serviceName,
                    is_local_delivery: true,
                    shipping_notes: "Pengiriman lokal - Resi akan di-generate secara manual oleh admin",
                })
                .eq("id", orderId);

            if (updateError) {
                throw updateError;
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    isLocal: true,
                    message: "Order marked for local delivery. Tracking number will be added manually.",
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // ===== INTER-CITY DELIVERY via BITESHIP =====
        console.log("Inter-city delivery - creating Biteship order");

        if (!BITESHIP_API_KEY) {
            throw new Error("Biteship API key not configured");
        }

        // Get destination area_id for better accuracy
        const destinationAreaId = await getDestinationAreaId(order.city, order.postal_code);

        // Prepare items for Biteship with actual product weights and dimensions
        const biteshipItems =
            orderItems?.map((item: any) => {
                // Get product data from the separately fetched products map
                const product = productsMap[item.product_id];

                // Convert weight from kg to grams
                const weightInGrams = product?.weight_kg ? Math.round(product.weight_kg * 1000) : DEFAULT_PRODUCT_WEIGHT;

                const itemData: any = {
                    name: item.product_name,
                    value: item.price,
                    weight: weightInGrams,
                    quantity: item.quantity,
                };

                // Add dimensions if available
                if (product?.length_cm) itemData.length = product.length_cm;
                if (product?.width_cm) itemData.width = product.width_cm;
                if (product?.height_cm) itemData.height = product.height_cm;

                console.log(`Item: ${item.product_name}, Weight: ${weightInGrams}g, Dims: ${product?.length_cm}x${product?.width_cm}x${product?.height_cm}`);

                return itemData;
            }) || [];

        // Calculate total weight for logging
        const totalWeight = biteshipItems.reduce((sum, item) => sum + item.weight * item.quantity, 0);
        console.log(`Total shipment weight: ${totalWeight}g (${(totalWeight / 1000).toFixed(2)}kg)`);

        // Build destination payload
        const destinationPayload: any = {
            destination_contact_name: order.customer_name,
            destination_contact_phone: order.customer_phone,
            destination_contact_email: order.customer_email,
            destination_address: order.shipping_address,
            destination_postal_code: parseInt(order.postal_code) || 0,
            destination_note: order.shipping_notes || "",
        };

        // Add area_id if found for better accuracy
        if (destinationAreaId) {
            destinationPayload.destination_area_id = destinationAreaId;
        }

        // Build origin payload
        const originAreaId = Deno.env.get("BITESHIP_ORIGIN_AREA_ID");
        const originPayload: any = {
            origin_contact_name: Deno.env.get("STORE_NAME") || "Kagounga Store",
            origin_contact_phone: Deno.env.get("STORE_PHONE") || "081234567890",
            origin_address: Deno.env.get("STORE_ADDRESS") || "Ternate, Maluku Utara",
            origin_note: "Toko Kagounga",
            origin_postal_code: parseInt(Deno.env.get("STORE_POSTAL_CODE") || "97711"),
        };

        // Add origin area_id if configured
        if (originAreaId) {
            originPayload.origin_area_id = originAreaId;
        } else {
            // Fallback to coordinates if no area_id
            originPayload.origin_coordinate = {
                latitude: 0.7893, // Ternate coordinates
                longitude: 127.3774,
            };
        }

        // Create shipment order in Biteship
        // Default to "drop_off" since many remote areas (like Ternate) don't support pickup
        const orderPayload = {
            shipper_contact_name: Deno.env.get("STORE_NAME") || "Kagounga Store",
            shipper_contact_phone: Deno.env.get("STORE_PHONE") || "081234567890",
            shipper_contact_email: Deno.env.get("STORE_EMAIL") || "store@kagounga.com",
            shipper_organization: "Kagounga",
            ...originPayload,
            ...destinationPayload,
            courier_company: courierCode,
            courier_type: serviceCode,
            delivery_type: "drop_off", // Use drop_off to avoid pickup unavailability in remote areas
            order_note: `Order #${order.external_id || order.id}`,
            reference_id: order.external_id || order.id, // For easier reference
            items: biteshipItems,
        };

        console.log("Creating Biteship order with payload:", JSON.stringify(orderPayload, null, 2));

        let biteshipResponse = await fetch(`${BITESHIP_API_URL}/orders`, {
            method: "POST",
            headers: {
                Authorization: BITESHIP_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderPayload),
        });

        let responseText = await biteshipResponse.text();

        // If drop_off fails, try with "later" delivery type as another fallback
        if (!biteshipResponse.ok) {
            const errorJson = JSON.parse(responseText);
            const errorCode = errorJson.code;

            console.warn(`First attempt failed (code: ${errorCode}), trying with 'later' delivery type...`);

            // Retry with "later" delivery type
            const retryPayload = { ...orderPayload, delivery_type: "later" };

            biteshipResponse = await fetch(`${BITESHIP_API_URL}/orders`, {
                method: "POST",
                headers: {
                    Authorization: BITESHIP_API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(retryPayload),
            });

            responseText = await biteshipResponse.text();
        }

        if (!biteshipResponse.ok) {
            console.error("Biteship order creation error:", responseText);

            // Try to parse error details
            let errorDetails = responseText;
            let errorCode = "";
            try {
                const errorJson = JSON.parse(responseText);
                errorDetails = errorJson.error || errorJson.message || responseText;
                errorCode = errorJson.code || "";
            } catch (e) {
                // Keep raw text if not JSON
            }

            // Check if this is a courier unavailability error (40002031)
            // In this case, gracefully mark for manual handling instead of failing
            if (errorCode === "40002031" || errorDetails.includes("cannot provide pickup service") || errorDetails.includes("courier")) {
                console.warn(`⚠️ Courier ${courierCode} is not available in this area. Marking for manual shipment.`);

                // Update order to indicate manual shipment is needed
                const { error: updateError } = await supabase
                    .from("orders")
                    .update({
                        courier_code: courierCode,
                        courier_name: courierName,
                        service_code: serviceCode,
                        service_name: serviceName,
                        is_local_delivery: false,
                        shipping_notes: `⚠️ Kurir ${courierName} tidak tersedia di area ini. Silakan buat pengiriman manual di Biteship Dashboard atau gunakan kurir lain.`,
                    })
                    .eq("id", orderId);

                if (updateError) {
                    console.error("Error updating order:", updateError);
                }

                return new Response(
                    JSON.stringify({
                        success: true, // Mark as success so webhook doesn't fail
                        isLocal: false,
                        requiresManualShipment: true,
                        courierName,
                        serviceName,
                        message: `Kurir ${courierName} tidak tersedia di area asal. Admin perlu membuat pengiriman secara manual.`,
                        reason: errorDetails,
                    }),
                    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }

            throw new Error(`Biteship API Error (${biteshipResponse.status}): ${errorDetails}`);
        }

        const biteshipData = JSON.parse(responseText);
        console.log("Biteship order created successfully:", biteshipData);

        // Extract tracking info
        const trackingNumber = biteshipData.courier?.waybill_id || biteshipData.order_id || biteshipData.id;
        const biteshipOrderId = biteshipData.id;

        if (!trackingNumber) {
            console.warn("Warning: No tracking number received from Biteship");
        }

        // Update order with tracking information
        const { error: updateError } = await supabase
            .from("orders")
            .update({
                courier_code: courierCode,
                courier_name: courierName,
                service_code: serviceCode,
                service_name: serviceName,
                is_local_delivery: false,
                tracking_number: trackingNumber,
                biteship_order_id: biteshipOrderId,
                total_weight_kg: totalWeight / 1000, // Store in kg
                shipping_notes: trackingNumber ? `Shipment created via Biteship. Tracking: ${trackingNumber}` : `Shipment created via Biteship. Order ID: ${biteshipOrderId}`,
            })
            .eq("id", orderId);

        if (updateError) {
            console.error("Error updating order:", updateError);
            throw updateError;
        }

        return new Response(
            JSON.stringify({
                success: true,
                isLocal: false,
                trackingNumber,
                biteshipOrderId,
                courierName,
                serviceName,
                totalWeight: `${(totalWeight / 1000).toFixed(2)}kg`,
                message: "Shipment created successfully",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error creating shipment:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
                message: "Gagal membuat pengiriman. Silakan coba lagi.",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
