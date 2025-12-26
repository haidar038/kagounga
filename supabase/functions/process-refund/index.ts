import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RefundRequest {
    refundRequestId: string;
}

interface XenditRefundPayload {
    payment_request_id?: string;
    invoice_id?: string;
    reference_id: string;
    reason: string;
    amount?: number;
    currency: string;
    metadata?: Record<string, string>;
}

const handler = async (req: Request): Promise<Response> => {
    console.log("=== Process Refund function called ===");

    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // 1. Check environment variables
        const XENDIT_SECRET_KEY = Deno.env.get("XENDIT_SECRET_KEY");
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        console.log("Environment check:", {
            hasXenditKey: !!XENDIT_SECRET_KEY,
            hasSupabaseUrl: !!SUPABASE_URL,
            hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY,
        });

        if (!XENDIT_SECRET_KEY) {
            throw new Error("XENDIT_SECRET_KEY not configured");
        }
        if (!SUPABASE_URL) {
            throw new Error("SUPABASE_URL not configured");
        }
        if (!SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
        }

        // 2. Parse request body
        let requestBody: RefundRequest;
        try {
            requestBody = await req.json();
            console.log("Request body parsed:", requestBody);
        } catch (e) {
            console.error("Failed to parse request body:", e);
            throw new Error("Invalid request body");
        }

        const { refundRequestId } = requestBody;

        if (!refundRequestId) {
            throw new Error("Missing refundRequestId");
        }

        // 3. Initialize Supabase Client
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        console.log("Supabase client initialized");

        // 4. Fetch refund request with order details
        console.log("Fetching refund request:", refundRequestId);
        const { data: refundRequest, error: refundError } = await supabase
            .from("refund_requests")
            .select(
                `
                *,
                orders:order_id (
                    id,
                    external_id,
                    invoice_url,
                    total_amount,
                    payment_method,
                    customer_name,
                    customer_email
                )
            `
            )
            .eq("id", refundRequestId)
            .single();

        if (refundError || !refundRequest) {
            console.error("Refund request not found:", refundError);
            throw new Error("Refund request not found");
        }

        console.log("Refund request found:", {
            id: refundRequest.id,
            status: refundRequest.status,
            amount: refundRequest.amount,
            orderId: refundRequest.order_id,
        });

        // 5. Validate refund request status
        if (refundRequest.status !== "approved") {
            throw new Error(`Cannot process refund with status: ${refundRequest.status}. Only approved refunds can be processed.`);
        }

        const order = refundRequest.orders;
        if (!order) {
            throw new Error("Associated order not found");
        }

        console.log("Order details:", {
            orderId: order.id,
            externalId: order.external_id,
            totalAmount: order.total_amount,
        });

        // 6. Update refund status to "processing"
        await supabase
            .from("refund_requests")
            .update({
                status: "processing",
                updated_at: new Date().toISOString(),
            })
            .eq("id", refundRequestId);

        console.log("Refund status updated to processing");

        // 7. Prepare Xendit Refund API call
        // Use Invoice ID for refund (from external_id which stores Xendit invoice ID)
        const xenditInvoiceId = order.external_id;

        if (!xenditInvoiceId) {
            // Fallback: Update status to failed if no payment reference
            await supabase
                .from("refund_requests")
                .update({
                    status: "failed",
                    admin_notes: (refundRequest.admin_notes || "") + "\n[System] No Xendit payment reference found.",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", refundRequestId);

            throw new Error("No Xendit payment reference found for this order");
        }

        // Map our reason to Xendit reason format
        const reasonMap: Record<string, string> = {
            FRAUDULENT: "FRAUDULENT",
            DUPLICATE: "DUPLICATE",
            REQUESTED_BY_CUSTOMER: "REQUESTED_BY_CUSTOMER",
            CANCELLATION: "CANCELLATION",
            OTHERS: "OTHERS",
        };

        const xenditPayload: XenditRefundPayload = {
            invoice_id: xenditInvoiceId,
            reference_id: refundRequest.id,
            reason: reasonMap[refundRequest.reason] || "OTHERS",
            amount: refundRequest.amount,
            currency: "IDR",
            metadata: {
                order_id: order.id,
                customer_name: order.customer_name,
                customer_email: order.customer_email,
            },
        };

        console.log("Calling Xendit Refund API with payload:", {
            invoice_id: xenditPayload.invoice_id,
            reference_id: xenditPayload.reference_id,
            reason: xenditPayload.reason,
            amount: xenditPayload.amount,
        });

        // 8. Call Xendit Refund API
        const response = await fetch("https://api.xendit.co/refunds", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${btoa(XENDIT_SECRET_KEY + ":")}`,
                "api-version": "2022-07-31",
            },
            body: JSON.stringify(xenditPayload),
        });

        const responseText = await response.text();
        console.log("Xendit response status:", response.status);
        console.log("Xendit response body:", responseText);

        if (!response.ok) {
            // Parse error and update status to failed
            let errorMessage = responseText;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || errorData.error_code || responseText;
            } catch {
                // Use raw response text
            }

            await supabase
                .from("refund_requests")
                .update({
                    status: "failed",
                    admin_notes: (refundRequest.admin_notes || "") + `\n[System] Xendit API Error: ${errorMessage}`,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", refundRequestId);

            throw new Error(`Xendit API error: ${errorMessage}`);
        }

        const xenditRefund = JSON.parse(responseText);
        console.log("Xendit refund created:", xenditRefund.id);

        // 9. Update refund request with Xendit refund ID
        await supabase
            .from("refund_requests")
            .update({
                xendit_refund_id: xenditRefund.id,
                payment_request_id: xenditInvoiceId,
                refund_method: xenditRefund.channel_code || "XENDIT",
                updated_at: new Date().toISOString(),
            })
            .eq("id", refundRequestId);

        console.log("Refund request updated with Xendit refund ID");

        // 10. Return success response
        return new Response(
            JSON.stringify({
                success: true,
                refundId: xenditRefund.id,
                status: xenditRefund.status,
                amount: xenditRefund.amount,
                currency: xenditRefund.currency,
                channelCode: xenditRefund.channel_code,
                message: "Refund is being processed by Xendit",
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    } catch (error: any) {
        console.error("=== ERROR in process-refund function ===");
        console.error("Error details:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || "Unknown error occurred",
                details: error.toString(),
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    }
};

serve(handler);
