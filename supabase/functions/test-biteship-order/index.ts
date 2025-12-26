import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * DIAGNOSTIC TEST FUNCTION
 *
 * This function tests the complete order creation flow:
 * 1. Check if BITESHIP_TEST_API_KEY is configured
 * 2. Check if we can call shipping-create function
 * 3. Simulate the exact scenario when payment succeeds
 *
 * USE THIS TO DEBUG WHY ORDERS AREN'T CREATED IN BITESHIP
 */

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        console.log("=== BITESHIP ORDER CREATION DIAGNOSTIC TEST ===");

        const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

        const BITESHIP_API_KEY = Deno.env.get("BITESHIP_TEST_API_KEY");
        const BITESHIP_API_URL = "https://api.biteship.com/v1";

        // Step 1: Check environment variables
        console.log("\n📋 Step 1: Environment Check");
        console.log("- BITESHIP_TEST_API_KEY:", BITESHIP_API_KEY ? "✅ Configured" : "❌ Missing");
        console.log("- SUPABASE_URL:", Deno.env.get("SUPABASE_URL") ? "✅ OK" : "❌ Missing");
        console.log("- SUPABASE_SERVICE_ROLE_KEY:", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ? "✅ OK" : "❌ Missing");

        if (!BITESHIP_API_KEY) {
            throw new Error("BITESHIP_TEST_API_KEY not configured in Supabase Secrets!");
        }

        // Step 2: Find a recent order with courier data
        console.log("\n📦 Step 2: Finding Recent Order with Courier Data");
        const { data: recentOrder, error: orderError } = await supabase
            .from("orders")
            .select("id, customer_name, courier_code, courier_name, service_code, service_name, is_local_delivery, city")
            .not("courier_code", "is", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (orderError || !recentOrder) {
            console.log("❌ No recent order with courier data found");
            console.log("Please complete a checkout first!");
            throw new Error("No test order available");
        }

        console.log("✅ Found order:", {
            orderId: recentOrder.id,
            customer: recentOrder.customer_name,
            courier: `${recentOrder.courier_name} (${recentOrder.courier_code})`,
            service: `${recentOrder.service_name} (${recentOrder.service_code})`,
            isLocal: recentOrder.is_local_delivery,
            city: recentOrder.city,
        });

        // Step 3: Check condition for Biteship order creation
        console.log("\n🔍 Step 3: Checking Conditions");
        const shouldCreateBiteship = !recentOrder.is_local_delivery && !!recentOrder.courier_code;

        console.log("Conditions:", {
            isLocalDelivery: recentOrder.is_local_delivery,
            hasCourierCode: !!recentOrder.courier_code,
            shouldCreateBiteship: shouldCreateBiteship,
        });

        if (!shouldCreateBiteship) {
            console.log("⚠️ Order does NOT meet criteria for Biteship creation");
            if (recentOrder.is_local_delivery) {
                console.log("Reason: Local delivery (Ternate)");
            } else {
                console.log("Reason: Missing courier code");
            }
            throw new Error("Order not suitable for Biteship");
        }

        console.log("✅ Order meets criteria - should create in Biteship");

        // Step 4: Test Biteship API connection
        console.log("\n🌐 Step 4: Testing Biteship API Connection");

        // Try to get areas as a simple test
        const testResponse = await fetch(`${BITESHIP_API_URL}/maps/areas?countries=ID&input=Jakarta&type=single`, {
            method: "GET",
            headers: {
                Authorization: BITESHIP_API_KEY,
                "Content-Type": "application/json",
            },
        });

        if (!testResponse.ok) {
            console.log("❌ Biteship API test failed:", testResponse.status);
            const errorText = await testResponse.text();
            console.log("Error:", errorText);
            throw new Error("Biteship API not accessible");
        }

        console.log("✅ Biteship API connection successful");

        // Step 5: Test shipping-create invocation
        console.log("\n🚀 Step 5: Testing shipping-create Function");
        console.log("Attempting to invoke shipping-create with order data...");

        const { data: shipmentData, error: shipmentError } = await supabase.functions.invoke("shipping-create", {
            body: {
                orderId: recentOrder.id,
                courierCode: recentOrder.courier_code,
                serviceCode: recentOrder.service_code,
                courierName: recentOrder.courier_name,
                serviceName: recentOrder.service_name,
                isLocalDelivery: false,
            },
        });

        if (shipmentError) {
            console.log("❌ shipping-create invocation failed:", shipmentError);
            throw shipmentError;
        }

        console.log("✅ shipping-create invoked successfully");
        console.log("Response:", shipmentData);

        // Step 6: Check if order was created in Biteship
        console.log("\n🎯 Step 6: Final Result");

        if (shipmentData?.success) {
            console.log("✅ SUCCESS! Order created in Biteship");
            console.log("Details:", {
                trackingNumber: shipmentData.trackingNumber,
                biteshipOrderId: shipmentData.biteshipOrderId,
                isLocal: shipmentData.isLocal,
            });

            // Verify in database
            const { data: updatedOrder } = await supabase.from("orders").select("biteship_order_id, tracking_number").eq("id", recentOrder.id).single();

            console.log("Database updated:", {
                biteship_order_id: updatedOrder?.biteship_order_id,
                tracking_number: updatedOrder?.tracking_number,
            });
        } else {
            console.log("❌ Order creation failed");
            console.log("Error:", shipmentData?.error || "Unknown error");
        }

        return new Response(
            JSON.stringify({
                success: shipmentData?.success || false,
                diagnosticResults: {
                    environmentOk: !!BITESHIP_API_KEY,
                    orderFound: !!recentOrder,
                    conditionsMet: shouldCreateBiteship,
                    biteshipApiOk: true,
                    shipmentCreated: shipmentData?.success || false,
                },
                order: {
                    id: recentOrder.id,
                    courier: recentOrder.courier_name,
                },
                shipmentData,
                message: shipmentData?.success ? "✅ Order successfully created in Biteship!" : "❌ Order creation failed. Check logs for details.",
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error: any) {
        console.error("\n❌ DIAGNOSTIC TEST FAILED");
        console.error("Error:", error.message);
        console.error("Stack:", error.stack);

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
                stack: error.stack,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 500,
            }
        );
    }
});
