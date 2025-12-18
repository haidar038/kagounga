import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tracking-token",
};

const handler = async (req: Request): Promise<Response> => {
    console.log("=== Order tracking get function called ===");

    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Missing environment variables");
        }

        // Get access token from header
        const accessToken = req.headers.get("x-tracking-token");

        if (!accessToken) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Tracking token is required",
                }),
                {
                    status: 401,
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                }
            );
        }

        // Initialize Supabase Client with Service Role
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        console.log("Fetching order with tracking token");

        // Fetch order with items using the secure function
        const { data: orderResult, error: orderError } = await supabase.rpc("get_order_for_tracking", {
            p_access_token: accessToken,
        });

        if (orderError || !orderResult || orderResult.length === 0) {
            console.error("Order fetch failed:", orderError);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Invalid or expired tracking token",
                }),
                {
                    status: 403,
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                }
            );
        }

        const order = orderResult[0];

        // Fetch order items
        const { data: orderItems, error: itemsError } = await supabase.from("order_items").select("*").eq("order_id", order.id);

        if (itemsError) {
            console.error("Failed to fetch order items:", itemsError);
        }

        // Construct response with order and items
        const response = {
            success: true,
            order: {
                id: order.id,
                status: order.status,
                total_amount: order.total_amount,
                shipping_cost: order.shipping_cost,
                customer_name: order.customer_name,
                customer_email: order.customer_email,
                customer_phone: order.customer_phone,
                shipping_address: order.shipping_address,
                city: order.city,
                postal_code: order.postal_code,
                created_at: order.created_at,
                updated_at: order.updated_at,
                items: orderItems || [],
            },
        };

        console.log("Order fetched successfully");

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    } catch (error: any) {
        console.error("=== ERROR in order-tracking-get function ===");
        console.error("Error details:", error);

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || "Internal server error",
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    }
};

serve(handler);
