import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-callback-token",
};

/**
 * Webhook handler for Xendit Refund events
 * Handles: refund.succeeded, refund.failed
 */
const handler = async (req: Request): Promise<Response> => {
    console.log("=== Xendit Refund Webhook received ===");

    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const xenditCallbackToken = Deno.env.get("XENDIT_CALLBACK_TOKEN");

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Verify X-CALLBACK-TOKEN if configured
        const incomingToken = req.headers.get("x-callback-token");
        if (xenditCallbackToken && incomingToken !== xenditCallbackToken) {
            console.error("Invalid callback token");
            return new Response(JSON.stringify({ message: "Invalid token" }), {
                status: 403,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            });
        }

        const payload = await req.json();
        console.log("Webhook payload received:", JSON.stringify(payload, null, 2));

        // Extract refund event data
        const { event, data, created } = payload;

        // Handle both direct payload and event wrapper format
        const refundData = data || payload;
        const eventType = event || refundData.status;

        console.log("Processing refund event:", {
            eventType,
            refundId: refundData.id,
            referenceId: refundData.reference_id,
            status: refundData.status,
            amount: refundData.amount,
        });

        // Validate required fields
        if (!refundData.reference_id) {
            console.error("Missing reference_id in webhook payload");
            return new Response("Missing reference_id", {
                status: 400,
                headers: corsHeaders,
            });
        }

        // Timestamp validation (prevent replay attacks)
        if (created) {
            const webhookTimestamp = new Date(created).getTime();
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;

            if (Math.abs(now - webhookTimestamp) > fiveMinutes) {
                console.error("Webhook timestamp is too old or in the future");
                return new Response("Webhook expired", {
                    status: 400,
                    headers: corsHeaders,
                });
            }
        }

        // Find refund request by reference_id (which is our refund_request.id)
        const { data: refundRequest, error: fetchError } = await supabase.from("refund_requests").select("*").eq("id", refundData.reference_id).single();

        if (fetchError || !refundRequest) {
            console.error("Refund request not found:", refundData.reference_id);
            return new Response("Refund request not found", {
                status: 404,
                headers: corsHeaders,
            });
        }

        console.log("Found refund request:", {
            id: refundRequest.id,
            currentStatus: refundRequest.status,
            orderId: refundRequest.order_id,
        });

        // Determine new status based on Xendit refund status
        let newStatus: string;
        let adminNote = "";

        switch (refundData.status) {
            case "SUCCEEDED":
                newStatus = "completed";
                adminNote = `[Xendit] Refund completed successfully. Channel: ${refundData.channel_code || "N/A"}`;
                break;
            case "FAILED":
                newStatus = "failed";
                adminNote = `[Xendit] Refund failed. Reason: ${refundData.failure_code || "Unknown"}`;
                break;
            case "PENDING":
                // Still processing, don't change status
                console.log("Refund still pending, no status change needed");
                return new Response(JSON.stringify({ success: true, message: "Acknowledged pending status" }), {
                    status: 200,
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                });
            default:
                console.log("Unknown refund status:", refundData.status);
                return new Response(JSON.stringify({ success: true, message: "Unknown status acknowledged" }), {
                    status: 200,
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                });
        }

        // Update refund request status
        const updateData: Record<string, any> = {
            status: newStatus,
            updated_at: new Date().toISOString(),
        };

        if (newStatus === "completed") {
            updateData.completed_at = new Date().toISOString();
        }

        // Append admin note
        if (adminNote) {
            const existingNotes = refundRequest.admin_notes || "";
            updateData.admin_notes = existingNotes ? `${existingNotes}\n${adminNote}` : adminNote;
        }

        // Store Xendit refund ID if not already stored
        if (refundData.id && !refundRequest.xendit_refund_id) {
            updateData.xendit_refund_id = refundData.id;
        }

        console.log(`Updating refund request ${refundRequest.id} to status: ${newStatus}`);

        const { error: updateError } = await supabase.from("refund_requests").update(updateData).eq("id", refundRequest.id);

        if (updateError) {
            console.error("Error updating refund request:", updateError);
            throw updateError;
        }

        console.log(`✅ Refund request ${refundRequest.id} updated to ${newStatus} successfully`);

        // If refund completed, optionally update order status
        if (newStatus === "completed") {
            console.log("Updating order status for refunded order:", refundRequest.order_id);

            // Get order to check current total vs refund amount
            const { data: order } = await supabase.from("orders").select("total_amount, status").eq("id", refundRequest.order_id).single();

            if (order) {
                // If full refund, mark order as refunded
                if (refundRequest.amount >= order.total_amount) {
                    await supabase
                        .from("orders")
                        .update({
                            status: "REFUNDED",
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", refundRequest.order_id);

                    console.log("Order marked as REFUNDED (full refund)");
                } else {
                    // Partial refund - add note but don't change status
                    await supabase.from("order_notes").insert({
                        order_id: refundRequest.order_id,
                        note: `Partial refund of ${refundRequest.amount} IDR processed`,
                        is_internal: true,
                    });

                    console.log("Order note added for partial refund");
                }
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
            status: 200,
        });
    } catch (error: any) {
        console.error("=== Refund Webhook error ===");
        console.error("Error:", error);
        console.error("Error message:", error.message);

        return new Response(
            JSON.stringify({
                error: error.message,
                success: false,
            }),
            {
                headers: { "Content-Type": "application/json", ...corsHeaders },
                status: 500,
            }
        );
    }
};

serve(handler);
