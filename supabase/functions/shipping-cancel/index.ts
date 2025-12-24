import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancelShipmentRequest {
    orderId: string;
    reason?: string;
}

const BITESHIP_API_KEY = Deno.env.get("BITESHIP_TEST_API_KEY");
const BITESHIP_API_URL = "https://api.biteship.com/v1";

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Create Supabase client with service role for admin access
        const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

        const requestBody: CancelShipmentRequest = await req.json();
        const { orderId, reason } = requestBody;

        console.log("Cancelling shipment for order:", orderId);

        // Get order details
        const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single();

        if (orderError || !order) {
            throw new Error("Order not found");
        }

        // Check if order has a Biteship shipment
        if (!order.biteship_order_id) {
            // If it's a local delivery or no Biteship order, just update status
            const { error: updateError } = await supabase
                .from("orders")
                .update({
                    status: "CANCELLED",
                    shipping_notes: order.shipping_notes ? `${order.shipping_notes} | Cancelled: ${reason || "No reason provided"}` : `Cancelled: ${reason || "No reason provided"}`,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", orderId);

            if (updateError) {
                throw updateError;
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    message: "Order cancelled successfully (no active shipment)",
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Cancel shipment in Biteship
        console.log("Cancelling Biteship order:", order.biteship_order_id);

        if (!BITESHIP_API_KEY) {
            throw new Error("Biteship API key not configured");
        }

        const cancelResponse = await fetch(`${BITESHIP_API_URL}/orders/${order.biteship_order_id}/cancel`, {
            method: "POST",
            headers: {
                Authorization: BITESHIP_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cancellation_reason: reason || "Order cancelled by customer/admin",
            }),
        });

        const responseText = await cancelResponse.text();

        if (!cancelResponse.ok) {
            console.error("Biteship cancellation error:", responseText);

            // Parse error details
            let errorDetails = responseText;
            try {
                const errorJson = JSON.parse(responseText);
                errorDetails = errorJson.error || errorJson.message || responseText;
            } catch (e) {
                // Keep raw text if not JSON
            }

            // Check if already cancelled or similar error
            if (cancelResponse.status === 400 || cancelResponse.status === 404) {
                console.warn("Shipment may already be cancelled or not found in Biteship");
                // Continue to update local database
            } else {
                throw new Error(`Biteship API Error (${cancelResponse.status}): ${errorDetails}`);
            }
        } else {
            console.log("Biteship shipment cancelled successfully");
        }

        // Update order status in database
        const { error: updateError } = await supabase
            .from("orders")
            .update({
                status: "CANCELLED",
                shipping_notes: order.shipping_notes ? `${order.shipping_notes} | Cancelled via Biteship: ${reason || "No reason provided"}` : `Cancelled via Biteship: ${reason || "No reason provided"}`,
                updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

        if (updateError) {
            console.error("Error updating order:", updateError);
            throw updateError;
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "Shipment cancelled successfully",
                biteshipOrderId: order.biteship_order_id,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error cancelling shipment:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
                message: "Gagal membatalkan pengiriman. Silakan coba lagi.",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
