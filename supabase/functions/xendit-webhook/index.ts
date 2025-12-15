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
        console.log("Webhook payload:", JSON.stringify(payload, null, 2));

        const { external_id, status } = payload;

        if (!external_id || !status) {
            console.error("Missing external_id or status");
            return new Response("Missing data", {
                status: 400,
                headers: corsHeaders,
            });
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
