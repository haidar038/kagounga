export interface NutritionFacts {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
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
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}
