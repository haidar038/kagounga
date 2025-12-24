import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackShipmentRequest {
    orderId?: string;
    trackingNumber?: string;
}

const BITESHIP_API_KEY = Deno.env.get("BITESHIP_API_KEY");
const BITESHIP_API_URL = "https://api.biteship.com/v1";

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");

        const requestBody: TrackShipmentRequest = await req.json();
        const { orderId, trackingNumber } = requestBody;

        console.log("Tracking shipment:", { orderId, trackingNumber });

        let order = null;
        let trackNum = trackingNumber;

        // Get order if orderId provided
        if (orderId) {
            const { data: orderData, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single();

            if (orderError || !orderData) {
                throw new Error("Order not found");
            }

            order = orderData;
            trackNum = order.tracking_number || trackNum;
        }

        if (!trackNum) {
            throw new Error("No tracking number provided or found in order");
        }

        // Check if it's local delivery
        if (order && order.is_local_delivery) {
            return new Response(
                JSON.stringify({
                    success: true,
                    isLocal: true,
                    trackingNumber: trackNum,
                    status: order.status,
                    message: "Pengiriman lokal - Status diupdate manual oleh admin",
                    history: [
                        {
                            note: "Order diterima",
                            updated_at: order.created_at,
                            status: "confirmed",
                        },
                    ],
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Track via Biteship for inter-city
        if (!BITESHIP_API_KEY) {
            throw new Error("Biteship API key not configured");
        }

        console.log(`Tracking via Biteship: ${trackNum}`);

        const trackingResponse = await fetch(`${BITESHIP_API_URL}/trackings/${trackNum}`, {
            method: "GET",
            headers: {
                Authorization: BITESHIP_API_KEY,
                "Content-Type": "application/json",
            },
        });

        if (!trackingResponse.ok) {
            const errorText = await trackingResponse.text();
            console.error("Biteship tracking error:", errorText);

            // Return basic info if tracking fails
            return new Response(
                JSON.stringify({
                    success: true,
                    trackingNumber: trackNum,
                    courier: order?.courier_name || "Unknown",
                    service: order?.service_name || "Unknown",
                    status: order?.status || "PENDING",
                    message: "Informasi tracking belum tersedia",
                    history: [],
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const trackingData = await trackingResponse.json();
        console.log("Biteship tracking data:", trackingData);

        return new Response(
            JSON.stringify({
                success: true,
                isLocal: false,
                trackingNumber: trackNum,
                courier: trackingData.courier?.name || order?.courier_name,
                service: trackingData.courier?.service_name || order?.service_name,
                status: trackingData.status,
                currentLocation: trackingData.current_location,
                destination: trackingData.destination,
                estimatedDelivery: trackingData.delivery_time,
                history: trackingData.history || [],
                link: trackingData.link,
                message: "Tracking information retrieved successfully",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error tracking shipment:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
                message: "Gagal melacak pengiriman. Silakan coba lagi.",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
