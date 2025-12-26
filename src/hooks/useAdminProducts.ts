import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { toast } from "sonner";

interface DatabaseProduct {
    id: string;
    slug: string;
    name: string;
    description: string;
    long_description: string | null;
    price: number;
    original_price: number | null;
    image: string;
    images: string[] | null;
    category_id: string;
    stock: number;
    rating: number;
    reviews: number;
    tags: string[] | null;
    nutrition_calories: number | null;
    nutrition_carbs: number | null;
    nutrition_protein: number | null;
    nutrition_fat: number | null;
    serving_size: string | null;
    prep_time: string | null;
    is_active: boolean;
    weight_kg: number | null;
    created_at: string;
    updated_at: string;
}

interface CreateProductInput {
    slug: string;
    name: string;
    description: string;
    long_description?: string;
    price: number;
    original_price?: number;
    image: string;
    images?: string[];
    category_id: string;
    stock: number;
    tags?: string[];
    nutrition_calories?: number;
    nutrition_carbs?: number;
    nutrition_protein?: number;
    nutrition_fat?: number;
    serving_size?: string;
    prep_time?: string;
    is_active: boolean;
    weight_kg: number;
}

interface UpdateProductInput extends Partial<CreateProductInput> {
    id: string;
}

/**
 * Hook to fetch ALL products (including inactive) for admin view
 */
export function useAllProducts() {
    return useQuery({
        queryKey: ["admin-products"],
        queryFn: async () => {
            const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });

            if (error) throw error;
            return data as DatabaseProduct[];
        },
    });
}

/**
 * Hook to create a new product
 */
export function useCreateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (product: CreateProductInput) => {
            const { data, error } = await supabase.from("products").insert([product]).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product created successfully");
        },
        onError: (error: Error) => {
            toast.error(`Failed to create product: ${error.message}`);
        },
    });
}

/**
 * Hook to update an existing product
 */
export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: UpdateProductInput) => {
            const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product updated successfully");
        },
        onError: (error: Error) => {
            toast.error(`Failed to update product: ${error.message}`);
        },
    });
}

/**
 * Hook to delete a product
 */
export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (productId: string) => {
            const { error } = await supabase.from("products").delete().eq("id", productId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success("Product deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete product: ${error.message}`);
        },
    });
}

/**
 * Hook to toggle product active status
 */
export function useToggleProductStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
            const { data, error } = await supabase.from("products").update({ is_active }).eq("id", id).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success(`Product ${variables.is_active ? "activated" : "deactivated"} successfully`);
        },
        onError: (error: Error) => {
            toast.error(`Failed to update product status: ${error.message}`);
        },
    });
}

/**
 * Hook to upload image to storage
 */
export async function uploadProductImage(file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
    });

    if (uploadError) throw uploadError;

    const {
        data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);

    return publicUrl;
}

/**
 * Hook to delete image from storage
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
    // Extract file path from public URL
    const urlParts = imageUrl.split("/product-images/");
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

    const { error } = await supabase.storage.from("product-images").remove([filePath]);

    if (error) throw error;
}
