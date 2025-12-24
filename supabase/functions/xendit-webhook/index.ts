import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-callback-token",
};

const handler = async (req: Request): Promise<Response> => {
    console.log("=== Xendit webhook received ===");

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
        console.log("Webhook payload received");

        const { external_id, status, paid_amount, created } = payload;

        if (!external_id || !status) {
            console.error("Missing external_id or status");
            return new Response("Missing data", {
                status: 400,
                headers: corsHeaders,
            });
        }

        // Security Enhancement 1: Timestamp Validation (Prevent Replay Attacks)
        if (created) {
            const webhookTimestamp = new Date(created).getTime();
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

            if (Math.abs(now - webhookTimestamp) > fiveMinutes) {
                console.error("Webhook timestamp is too old or in the future");
                return new Response("Webhook expired", {
                    status: 400,
                    headers: corsHeaders,
                });
            }
        }

        // Security Enhancement 2: Verify order exists and amount matches
        const { data: existingOrder, error: fetchError } = await supabase.from("orders").select("id, total_amount, status").eq("id", external_id).single();

        if (fetchError || !existingOrder) {
            console.error("Order not found:", external_id);
            return new Response("Order not found", {
                status: 404,
                headers: corsHeaders,
            });
        }

        // Amount verification - only for PAID status
        if (status === "PAID" || status === "SETTLED") {
            if (paid_amount && Math.abs(paid_amount - existingOrder.total_amount) > 1) {
                // Allow 1 IDR tolerance for rounding
                console.error("Amount mismatch - possible fraud attempt", {
                    expected: existingOrder.total_amount,
                    received: paid_amount,
                });
                // Log security incident but don't fail - notify admin instead
                // TODO: Send alert to admin
            }
        }

        // Map Xendit status to our DB status
        let dbStatus = "PENDING";
        if (status === "PAID" || status === "SETTLED") {
            dbStatus = "PAID";
        } else if (status === "EXPIRED") {
            dbStatus = "EXPIRED";
        } else if (status === "FAILED") {
            dbStatus = "FAILED";
        } else {
            console.log("Unknown status:", status);
            return new Response("OK", {
                status: 200,
                headers: corsHeaders,
            });
        }

        // Update Order Status
        // external_id from Xendit IS our orders.id (UUID)
        console.log(`Updating order ${external_id} to ${dbStatus}`);

        const { error } = await supabase
            .from("orders")
            .update({
                status: dbStatus,
                updated_at: new Date().toISOString(),
            })
            .eq("id", external_id); // Match by id, not external_id column

        if (error) {
            console.error("Error updating order:", error);
            throw error;
        }

        console.log(`Order ${external_id} updated to ${dbStatus} successfully`);

        // Auto-create shipment if order is PAID and needs shipping
        if (dbStatus === "PAID") {
            console.log("Payment confirmed - checking if shipment creation needed");

            // Get full order details including shipping info
            const { data: orderDetails } = await supabase.from("orders").select("*").eq("id", external_id).single();

            if (orderDetails && !orderDetails.is_local_delivery && orderDetails.courier_code) {
                // Inter-city delivery - auto-create shipment via Biteship
                console.log(`Creating shipment for inter-city order ${external_id}`);

                try {
                    const { data: shipmentData, error: shipmentError } = await supabase.functions.invoke("shipping-create", {
                        body: {
                            orderId: external_id,
                            courierCode: orderDetails.courier_code,
                            serviceCode: orderDetails.service_code,
                            courierName: orderDetails.courier_name,
                            serviceName: orderDetails.service_name,
                            isLocalDelivery: false,
                        },
                    });

                    if (shipmentError) {
                        console.error("Failed to auto-create shipment:", shipmentError);
                        // Don't fail the webhook - admin can create manually
                    } else {
                        console.log("Shipment created successfully:", shipmentData);
                    }
                } catch (shipmentErr) {
                    console.error("Error creating shipment:", shipmentErr);
                    // Don't fail the webhook
                }
            } else if (orderDetails && orderDetails.is_local_delivery) {
                console.log("Local delivery - tracking number will be added manually by admin");
            }
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
            status: 200,
        });
    } catch (error: any) {
        console.error("=== Webhook error ===");
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
