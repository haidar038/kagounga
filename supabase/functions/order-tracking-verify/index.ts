import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tracking-token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VerifyRequest {
    email: string;
    orderId: string;
}

const handler = async (req: Request): Promise<Response> => {
    console.log("=== Order tracking verification function called ===");

    // Handle CORS preflight
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

        // Initialize Supabase Client with Service Role (bypasses RLS)
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // Parse request body
        let requestBody: VerifyRequest;
        try {
            requestBody = await req.json();
        } catch (e) {
            throw new Error("Invalid request body");
        }

        const { email, orderId } = requestBody;

        // Validate input
        if (!email || !orderId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Email and Order ID are required",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Invalid email format",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                }
            );
        }

        // Find order matching email and order ID
        console.log(`Looking for order: ${orderId} with email: ${email}`);

        const { data: order, error: findError } = await supabaseAdmin.from("orders").select("id, customer_email, tracking_token").eq("id", orderId).eq("customer_email", email.toLowerCase().trim()).single();

        if (findError || !order) {
            console.error("Order not found:", findError);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Order not found. Please check your email and Order ID.",
                }),
                {
                    status: 404,
                    headers: { "Content-Type": "application/json", ...corsHeaders },
                }
            );
        }

        // Generate access token (cryptographically secure)
        const accessToken = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

        console.log(`Generating access token for order: ${orderId}`);

        // Update order with access token
        const { error: updateError } = await supabaseAdmin
            .from("orders")
            .update({
                tracking_access_token: accessToken,
                tracking_access_expires_at: expiresAt.toISOString(),
            })
            .eq("id", orderId);

        if (updateError) {
            console.error("Failed to update order with access token:", updateError);
            throw new Error("Failed to generate tracking access");
        }

        console.log("Access token generated successfully");

        return new Response(
            JSON.stringify({
                success: true,
                accessToken: accessToken,
                expiresAt: expiresAt.toISOString(),
                message: "Order found! Use the access token to track your order.",
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    } catch (error: any) {
        console.error("=== ERROR in order-tracking-verify function ===");
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
