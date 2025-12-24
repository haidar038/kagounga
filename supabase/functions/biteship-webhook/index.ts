import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-biteship-signature",
};

/**
 * Biteship Webhook Handler
 *
 * IMPORTANT: This endpoint is PUBLIC (no Supabase auth required)
 * because it's called by Biteship servers, not our frontend.
 *
 * Biteship Webhook Events (actual available events):
 * - order.status: Order status changed
 * - order.price: Order price updated
 * - order.waybill_id: Waybill/tracking number assigned
 *
 * Status values from Biteship:
 * - confirmed: Order confirmed
 * - allocated: Courier assigned
 * - picking_up: Courier heading to pickup
 * - picked: Package picked up
 * - dropping_off: Package in transit
 * - delivered: Package delivered
 * - cancelled: Order cancelled
 * - returned: Package returned
 */

interface BiteshipWebhookPayload {
    event: string; // "order.status", "order.price", "order.waybill_id"
    order_id: string; // Biteship order ID
    status?: string; // For order.status event
    price?: number; // For order.price event
    waybill_id?: string; // For order.waybill_id event
    courier?: {
        company?: string;
        waybill_id?: string;
        tracking_id?: string;
        history?: Array<{
            status: string;
            note: string;
            updated_at: string;
        }>;
    };
}

// Optional: Webhook secret for additional verification
// This is a random string YOU create (not from Biteship)
// Used to verify requests are actually from Biteship
const BITESHIP_WEBHOOK_SECRET = Deno.env.get("BITESHIP_WEBHOOK_SECRET");

/**
 * Map Biteship status to our order status
 */
function mapBiteshipStatus(biteshipStatus: string): string {
    const statusMap: Record<string, string> = {
        confirmed: "PROCESSING",
        allocated: "PROCESSING",
        picking_up: "PROCESSING",
        picked: "SHIPPED",
        dropping_off: "SHIPPED",
        delivered: "DELIVERED",
        cancelled: "CANCELLED",
        returned: "CANCELLED",
    };

    return statusMap[biteshipStatus.toLowerCase()] || "PROCESSING";
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Verify webhook signature if secret is configured
        if (BITESHIP_WEBHOOK_SECRET) {
            const signature = req.headers.get("x-biteship-signature");
            // TODO: Implement signature verification
            // For now, we'll just log it
            console.log("Webhook signature:", signature);
        }

        const webhookData: BiteshipWebhookPayload = await req.json();

        console.log("Received Biteship webhook:", JSON.stringify(webhookData, null, 2));

        const { event, order_id, status, waybill_id, price, courier } = webhookData;

        if (!order_id) {
            throw new Error("Missing order_id in webhook payload");
        }

        // Create Supabase client with service role for admin access
        const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

        // Find order by biteship_order_id
        const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("biteship_order_id", order_id).single();

        if (orderError || !order) {
            console.error("Order not found for Biteship order_id:", order_id);
            // Return 200 to acknowledge receipt even if order not found
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Order not found",
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`Found order: ${order.id}, Current status: ${order.status}, Event: ${event}`);

        // Prepare update data
        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        // Handle different webhook events
        if (event === "order.status" && status) {
            // Status changed event
            const newStatus = mapBiteshipStatus(status);
            if (newStatus !== order.status) {
                updateData.status = newStatus;
                console.log(`Updating order status from ${order.status} to ${newStatus} (Biteship status: ${status})`);
            }

            // Update timestamps based on status
            if (status === "picked" && !order.shipped_at) {
                updateData.shipped_at = new Date().toISOString();
            }
            if (status === "delivered" && !order.delivered_at) {
                updateData.delivered_at = new Date().toISOString();
            }

            // Append status update to shipping notes
            const statusNote = `[${new Date().toISOString()}] Status: ${status}`;
            updateData.shipping_notes = order.shipping_notes ? `${order.shipping_notes}\n${statusNote}` : statusNote;
        } else if (event === "order.waybill_id" && waybill_id) {
            // Waybill/tracking number assigned
            if (!order.tracking_number) {
                updateData.tracking_number = waybill_id;
                console.log("Setting tracking number from webhook:", waybill_id);

                const trackingNote = `[${new Date().toISOString()}] Tracking assigned: ${waybill_id}`;
                updateData.shipping_notes = order.shipping_notes ? `${order.shipping_notes}\n${trackingNote}` : trackingNote;
            }
        } else if (event === "order.price" && price) {
            // Price updated (usually not needed for our use case)
            console.log(`Price update received: ${price} (current: ${order.shipping_cost})`);
            // Optionally update shipping_cost if needed
            // updateData.shipping_cost = price;
        }

        // Also check courier.waybill_id as fallback
        if (courier?.waybill_id && !order.tracking_number && !updateData.tracking_number) {
            updateData.tracking_number = courier.waybill_id;
            console.log("Setting tracking number from courier data:", courier.waybill_id);
        }

        // Only update if we have changes
        if (Object.keys(updateData).length === 1) {
            // Only updated_at, no real changes
            console.log("No significant changes to update");
            return new Response(
                JSON.stringify({
                    success: true,
                    message: "Webhook received, no updates needed",
                    orderId: order.id,
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Update the order
        const { error: updateError } = await supabase.from("orders").update(updateData).eq("id", order.id);

        if (updateError) {
            console.error("Error updating order:", updateError);
            throw updateError;
        }

        console.log("Order updated successfully:", updateData);

        // Log to order history if status changed
        if (updateData.status && updateData.status !== order.status) {
            const { error: historyError } = await supabase.from("order_history").insert({
                order_id: order.id,
                field_changed: "status",
                old_value: order.status,
                new_value: updateData.status,
                created_at: new Date().toISOString(),
            });

            if (historyError) {
                console.error("Error logging to order history:", historyError);
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "Webhook processed successfully",
                orderId: order.id,
                event: event,
                status: updateData.status || order.status,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error processing webhook:", error);

        // Return 200 even on error to prevent Biteship from retrying
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
