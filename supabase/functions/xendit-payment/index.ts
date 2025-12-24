import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    city: string;
    postalCode: string;
    items: Array<{
        id: string;
        name: string;
        quantity: number;
        price: number;
    }>;
    successRedirectUrl: string;
    failureRedirectUrl: string;
    userId?: string;
    // Shipping parameters
    shippingCost?: number;
    courierCode?: string;
    courierName?: string;
    serviceCode?: string;
    serviceName?: string;
    estimatedDeliveryDays?: string;
    isLocalDelivery?: boolean;
    totalWeight?: number;
}

const handler = async (req: Request): Promise<Response> => {
    console.log("=== Xendit payment function called ===");

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
        let requestBody: PaymentRequest;
        try {
            requestBody = await req.json();
            console.log("Request body parsed:", {
                amount: requestBody.amount,
                customerEmail: requestBody.customerEmail,
                itemsCount: requestBody.items?.length,
                hasUserId: !!requestBody.userId,
            });
        } catch (e) {
            console.error("Failed to parse request body:", e);
            throw new Error("Invalid request body");
        }

        const {
            amount,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            city,
            postalCode,
            items,
            successRedirectUrl,
            failureRedirectUrl,
            userId,
            // Shipping data
            shippingCost,
            courierCode,
            courierName,
            serviceCode,
            serviceName,
            estimatedDeliveryDays,
            isLocalDelivery,
            totalWeight,
        } = requestBody;

        // 3. Validate required fields
        if (!amount || !customerName || !customerEmail || !customerPhone || !items || items.length === 0) {
            throw new Error("Missing required fields");
        }

        // 4. Initialize Supabase Client with Service Role
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        console.log("Supabase client initialized");

        // 5. Create Order in Database
        console.log("Creating order in database...");

        // Generate tracking token for guest order tracking
        const trackingToken = crypto.randomUUID(); // Cryptographically secure

        const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .insert({
                user_id: userId || null,
                status: "PENDING",
                total_amount: amount,
                shipping_cost: shippingCost || 0,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                shipping_address: shippingAddress || "",
                city: city || "",
                postal_code: postalCode || "",
                tracking_token: trackingToken,
                // Shipping information
                courier_code: courierCode,
                courier_name: courierName,
                service_code: serviceCode,
                service_name: serviceName,
                estimated_delivery_days: estimatedDeliveryDays,
                is_local_delivery: isLocalDelivery || false,
                total_weight_kg: totalWeight || 1.0,
            })
            .select()
            .single();

        if (orderError) {
            console.error("Order creation failed:", orderError);
            throw new Error(`Failed to create order: ${orderError.message}`);
        }

        if (!orderData) {
            throw new Error("Order data is null");
        }

        console.log("Order created successfully:", orderData.id);

        // 6. Create Order Items
        console.log("Creating order items...");
        const orderItems = items.map((item) => ({
            order_id: orderData.id,
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            price: item.price,
        }));

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

        if (itemsError) {
            console.error("Order items creation failed:", itemsError);
            throw new Error(`Failed to create order items: ${itemsError.message}`);
        }

        console.log("Order items created successfully");

        // 7. Create Xendit Invoice
        console.log("Creating Xendit invoice...");
        const externalId = orderData.id;

        const invoicePayload = {
            external_id: externalId,
            amount: amount,
            payer_email: customerEmail,
            description: `Order ${orderData.id} - ${items.map((i) => `${i.name} x${i.quantity}`).join(", ")}`,
            success_redirect_url: successRedirectUrl,
            failure_redirect_url: failureRedirectUrl,
            currency: "IDR",
            customer: {
                given_names: customerName,
                email: customerEmail,
                mobile_number: customerPhone,
            },
            items: items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                category: "Food",
            })),
            payment_methods: ["BCA", "BNI", "BRI", "MANDIRI", "PERMATA", "OVO", "DANA", "LINKAJA", "SHOPEEPAY", "CREDIT_CARD"],
        };

        console.log("Calling Xendit API...");
        const response = await fetch("https://api.xendit.co/v2/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${btoa(XENDIT_SECRET_KEY + ":")}`,
            },
            body: JSON.stringify(invoicePayload),
        });

        const responseText = await response.text();
        console.log("Xendit response status:", response.status);

        if (!response.ok) {
            console.error("Xendit error response:", responseText);
            throw new Error(`Xendit API error: ${responseText}`);
        }

        const invoice = JSON.parse(responseText);
        console.log("Xendit invoice created:", invoice.id);

        // 8. Update Order with Invoice URL
        await supabase
            .from("orders")
            .update({
                invoice_url: invoice.invoice_url,
                external_id: invoice.id, // Store Xendit invoice ID
            })
            .eq("id", orderData.id);

        console.log("Order updated with invoice URL");

        return new Response(
            JSON.stringify({
                success: true,
                invoiceId: invoice.id,
                invoiceUrl: invoice.invoice_url,
                orderId: orderData.id,
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json", ...corsHeaders },
            }
        );
    } catch (error: any) {
        console.error("=== ERROR in xendit-payment function ===");
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
