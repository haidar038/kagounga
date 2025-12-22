import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tracking-token",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const handler = async (req: Request): Promise<Response> => {
    console.log("=== Order tracking get function called ===");

    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 200,
            headers: corsHeaders,
        });
    }

    try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("Missing environment variables");
        }

        // Get tracking token from header
        const trackingToken = req.headers.get("x-tracking-token");

        if (!trackingToken) {
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

        // Initialize Supabase Admin Client
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // Find order with valid access token
        const now = new Date().toISOString();

        const { data: order, error: findError } = await supabaseAdmin
            .from("orders")
            .select(
                `
                id,
                status,
                total_amount,
                shipping_cost,
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                city,
                postal_code,
                created_at,
                updated_at,
                order_items (
                    id,
                    product_name,
                    quantity,
                    price
                )
            `
            )
            .eq("tracking_access_token", trackingToken)
            .gt("tracking_access_expires_at", now)
            .single();

        if (findError || !order) {
            console.error("Order not found or token expired:", findError);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Invalid or expired tracking token",
                }),
                {
                    status: 404,
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                }
            );
        }

        // Transform order_items to items for frontend compatibility
        const transformedOrder = {
            ...order,
            items: order.order_items || [],
        };
        delete transformedOrder.order_items;

        return new Response(
            JSON.stringify({
                success: true,
                order: transformedOrder,
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
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
