import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrderItem {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
}

export interface RefundRequest {
    id: string;
    status: "pending" | "approved" | "rejected" | "processing" | "completed" | "failed";
    amount: number;
    reason: string;
    created_at: string;
}

export interface UserOrder {
    id: string;
    external_id: string | null;
    status: string;
    total_amount: number;
    shipping_cost: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    city: string;
    postal_code: string;
    courier_name: string | null;
    courier_code: string | null;
    service_name: string | null;
    tracking_number: string | null;
    is_local_delivery: boolean | null;
    invoice_url: string | null;
    created_at: string;
    updated_at: string;
    shipped_at: string | null;
    delivered_at: string | null;
    items: OrderItem[];
    refund_requests: RefundRequest[];
}

/**
 * Hook to fetch orders for the currently logged-in user
 */
export function useUserOrders(statusFilter?: string) {
    return useQuery({
        queryKey: ["user-orders", statusFilter],
        queryFn: async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("User not authenticated");
            }

            let query = supabase
                .from("orders")
                .select(
                    `
                    id,
                    external_id,
                    status,
                    total_amount,
                    shipping_cost,
                    customer_name,
                    customer_email,
                    customer_phone,
                    shipping_address,
                    city,
                    postal_code,
                    courier_name,
                    courier_code,
                    service_name,
                    tracking_number,
                    is_local_delivery,
                    invoice_url,
                    created_at,
                    updated_at,
                    shipped_at,
                    delivered_at,
                    items:order_items(
                        id,
                        product_id,
                        product_name,
                        quantity,
                        price
                    ),
                    refund_requests(
                        id,
                        status,
                        amount,
                        reason,
                        created_at
                    )
                `
                )
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (statusFilter && statusFilter !== "all") {
                query = query.eq("status", statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as unknown as UserOrder[];
        },
    });
}

/**
 * Hook to fetch a single order by ID for the current user
 */
export function useUserOrder(orderId: string | undefined) {
    return useQuery({
        queryKey: ["user-order", orderId],
        queryFn: async () => {
            if (!orderId) return null;

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                throw new Error("User not authenticated");
            }

            const { data, error } = await supabase
                .from("orders")
                .select(
                    `
                    id,
                    external_id,
                    status,
                    total_amount,
                    shipping_cost,
                    customer_name,
                    customer_email,
                    customer_phone,
                    shipping_address,
                    city,
                    postal_code,
                    courier_name,
                    courier_code,
                    service_name,
                    tracking_number,
                    is_local_delivery,
                    invoice_url,
                    created_at,
                    updated_at,
                    shipped_at,
                    delivered_at,
                    items:order_items(
                        id,
                        product_id,
                        product_name,
                        quantity,
                        price
                    ),
                    refund_requests(
                        id,
                        status,
                        amount,
                        reason,
                        reason_note,
                        admin_notes,
                        created_at,
                        updated_at
                    )
                `
                )
                .eq("id", orderId)
                .eq("user_id", user.id)
                .single();

            if (error) throw error;
            return data as unknown as UserOrder;
        },
        enabled: !!orderId,
    });
}
