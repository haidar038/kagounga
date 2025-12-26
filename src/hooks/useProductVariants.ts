import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductVariant } from "@/types/product";
import { toast } from "sonner";

export function useProductVariants(productId: string) {
    return useQuery({
        queryKey: ["product-variants", productId],
        queryFn: async () => {
            const { data, error } = await supabase.from("product_variants").select("*").eq("product_id", productId).eq("is_active", true).order("display_order", { ascending: true }).order("name", { ascending: true });

            if (error) throw error;
            return data as ProductVariant[];
        },
        enabled: !!productId,
    });
}

export function useCreateProductVariant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (variant: Omit<ProductVariant, "id">) => {
            const { data, error } = await supabase.from("product_variants").insert(variant).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["product-variants", variables.product_id] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product", variables.product_id] });
            toast.success("Variant created successfully");
        },
        onError: (error) => {
            console.error("Error creating variant:", error);
            toast.error("Failed to create variant");
        },
    });
}

export function useUpdateProductVariant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<ProductVariant> & { id: string }) => {
            const { data, error } = await supabase.from("product_variants").update(updates).eq("id", id).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["product-variants", data.product_id] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product", data.product_id] });
            toast.success("Variant updated successfully");
        },
        onError: (error) => {
            console.error("Error updating variant:", error);
            toast.error("Failed to update variant");
        },
    });
}

export function useDeleteProductVariant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
            // Soft delete by setting is_active to false
            const { error } = await supabase.from("product_variants").update({ is_active: false }).eq("id", id);

            if (error) throw error;
            return { id, productId };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["product-variants", data.productId] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product", data.productId] });
            toast.success("Variant deleted successfully");
        },
        onError: (error) => {
            console.error("Error deleting variant:", error);
            toast.error("Failed to delete variant");
        },
    });
}

// Admin hook to get all variants (including inactive)
export function useAllProductVariants(productId: string) {
    return useQuery({
        queryKey: ["all-product-variants", productId],
        queryFn: async () => {
            const { data, error } = await supabase.from("product_variants").select("*").eq("product_id", productId).order("display_order", { ascending: true }).order("name", { ascending: true });

            if (error) throw error;
            return data as ProductVariant[];
        },
        enabled: !!productId,
    });
}
