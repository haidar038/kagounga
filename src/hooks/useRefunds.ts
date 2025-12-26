import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RefundRequest {
    id: string;
    order_id: string;
    requested_by: string | null;
    reason: "FRAUDULENT" | "DUPLICATE" | "REQUESTED_BY_CUSTOMER" | "CANCELLATION" | "OTHERS";
    reason_note?: string;
    amount: number;
    status: "pending" | "approved" | "rejected" | "processing" | "completed" | "failed";
    reviewed_by: string | null;
    reviewed_at: string | null;
    admin_notes?: string;
    xendit_refund_id?: string;
    payment_request_id?: string;
    refund_method?: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
}

export function useRefundRequests(filters?: { status?: string; orderId?: string }) {
    return useQuery({
        queryKey: ["refund-requests", filters],
        queryFn: async () => {
            let query = supabase
                .from("refund_requests")
                .select(
                    `
                *,
                orders:order_id (
                    id,
                    external_id,
                    customer_name,
                    customer_email,
                    total_amount
                )
            `
                )
                .order("created_at", { ascending: false });

            if (filters?.status) {
                query = query.eq("status", filters.status);
            }

            if (filters?.orderId) {
                query = query.eq("order_id", filters.orderId);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as any[];
        },
    });
}

export function useCreateRefundRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (refund: { order_id: string; reason: string; reason_note?: string; amount: number }) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("refund_requests")
                .insert({
                    ...refund,
                    requested_by: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["refund-requests"] });
            toast.success("Refund request submitted successfully");
        },
        onError: (error: any) => {
            console.error("Error creating refund request:", error);
            toast.error(error.message || "Failed to submit refund request");
        },
    });
}

export function useUpdateRefundStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) throw new Error("User not authenticated");

            const updateData: any = {
                status,
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString(),
            };

            if (admin_notes) {
                updateData.admin_notes = admin_notes;
            }

            const { data, error } = await supabase.from("refund_requests").update(updateData).eq("id", id).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["refund-requests"] });
            toast.success("Refund status updated successfully");
        },
        onError: (error: any) => {
            console.error("Error updating refund:", error);
            toast.error(error.message || "Failed to update refund status");
        },
    });
}

/**
 * Hook to process an approved refund via Xendit API
 * This calls the process-refund Edge Function
 */
export function useProcessRefund() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (refundRequestId: string) => {
            const { data, error } = await supabase.functions.invoke("process-refund", {
                body: { refundRequestId },
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error || "Failed to process refund");

            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["refund-requests"] });
            toast.success(`Refund is being processed. Xendit ID: ${data.refundId}`);
        },
        onError: (error: any) => {
            console.error("Error processing refund:", error);
            toast.error(error.message || "Failed to process refund via Xendit");
        },
    });
}

/**
 * Hook to simulate refund completion (TEST MODE ONLY)
 * This directly updates the refund status to "completed" without calling Xendit
 * Use this for testing when Xendit doesn't auto-complete refunds in sandbox mode
 */
export function useSimulateRefundCompletion() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (refundRequestId: string) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) throw new Error("User not authenticated");

            // Update refund status directly to completed
            const { data, error } = await supabase
                .from("refund_requests")
                .update({
                    status: "completed",
                    completed_at: new Date().toISOString(),
                    admin_notes: `[TEST MODE] Refund completion simulated by admin on ${new Date().toLocaleString()}`,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", refundRequestId)
                .select()
                .single();

            if (error) throw error;

            // Also update the order status to REFUNDED if it's a full refund
            if (data) {
                const { data: order } = await supabase.from("orders").select("total_amount").eq("id", data.order_id).single();

                if (order && data.amount >= order.total_amount) {
                    await supabase
                        .from("orders")
                        .update({
                            status: "REFUNDED",
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", data.order_id);
                }
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["refund-requests"] });
            toast.success("✅ [TEST MODE] Refund marked as completed!");
        },
        onError: (error: any) => {
            console.error("Error simulating refund completion:", error);
            toast.error(error.message || "Failed to simulate refund completion");
        },
    });
}
