export interface NutritionFacts {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    sku: string;
    name: string;
    attributes: Record<string, string>;
    price: number;
    original_price?: number;
    stock: number;
    is_active: boolean;
    display_order: number;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    longDescription?: string;
    price: number;
    originalPrice?: number;
    image: string;
    images?: string[];
    category: string;
    stock: number;
    rating: number;
    reviews: number;
    tags?: string[];
    nutritionFacts?: NutritionFacts;
    servingSize?: string;
    prepTime?: string;
    has_variants?: boolean;
    variants?: ProductVariant[];
}

export interface CartItem {
    product: Product;
    quantity: number;
    variant?: ProductVariant; // Selected variant if product has variants
}

export interface Cart {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
}
