import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product, NutritionFacts } from "@/types/product";

export interface Category {
    id: string;
    name: string;
    icon: string;
    display_order: number;
}

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
}

// Transform database product to Product type
function transformProduct(dbProduct: DatabaseProduct): Product {
    const nutritionFacts: NutritionFacts | undefined =
        dbProduct.nutrition_calories !== null && dbProduct.nutrition_carbs !== null && dbProduct.nutrition_protein !== null && dbProduct.nutrition_fat !== null
            ? {
                  calories: dbProduct.nutrition_calories,
                  carbs: dbProduct.nutrition_carbs,
                  protein: dbProduct.nutrition_protein,
                  fat: dbProduct.nutrition_fat,
              }
            : undefined;

    return {
        id: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        description: dbProduct.description,
        longDescription: dbProduct.long_description || undefined,
        price: Number(dbProduct.price),
        originalPrice: dbProduct.original_price !== null ? Number(dbProduct.original_price) : undefined,
        image: dbProduct.image,
        images: dbProduct.images || undefined,
        category: dbProduct.category_id,
        stock: dbProduct.stock,
        rating: Number(dbProduct.rating),
        reviews: dbProduct.reviews,
        tags: dbProduct.tags || undefined,
        nutritionFacts,
        servingSize: dbProduct.serving_size || undefined,
        prepTime: dbProduct.prep_time || undefined,
    };
}

/**
 * Hook to fetch all active products
 */
export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                setError(null);

                const { data, error: fetchError } = await supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: true });

                if (fetchError) {
                    throw fetchError;
                }

                const transformedProducts = (data as DatabaseProduct[]).map(transformProduct);
                setProducts(transformedProducts);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch products");
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    return { products, loading, error };
}

/**
 * Hook to fetch a single product by slug
 */
export function useProduct(slug: string | undefined) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProduct() {
            if (!slug) {
                setProduct(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const { data, error: fetchError } = await supabase.from("products").select("*").eq("slug", slug).eq("is_active", true).single();

                if (fetchError) {
                    if (fetchError.code === "PGRST116") {
                        // No rows returned
                        setProduct(null);
                    } else {
                        throw fetchError;
                    }
                } else {
                    setProduct(transformProduct(data as DatabaseProduct));
                }
            } catch (err) {
                console.error("Error fetching product:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch product");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [slug]);

    return { product, loading, error };
}

/**
 * Hook to fetch all product categories
 */
export function useProductCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCategories() {
            try {
                setLoading(true);
                setError(null);

                const { data, error: fetchError } = await supabase.from("product_categories").select("*").order("display_order", { ascending: true });

                if (fetchError) {
                    throw fetchError;
                }

                setCategories(data as Category[]);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch categories");
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

    return { categories, loading, error };
}
