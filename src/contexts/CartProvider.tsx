import React, { useReducer, useEffect, ReactNode } from "react";
import { Product, ProductVariant, CartItem, Cart } from "@/types/product";
import { toast } from "sonner";
import { CartContext } from "./CartContext";

const CART_STORAGE_KEY = "kagounga_cart";

type CartAction =
    | { type: "ADD_ITEM"; payload: { product: Product; quantity: number; variant?: ProductVariant } }
    | { type: "REMOVE_ITEM"; payload: { productId: string; variantId?: string } }
    | { type: "UPDATE_QUANTITY"; payload: { productId: string; variantId?: string; quantity: number } }
    | { type: "CLEAR_CART" }
    | { type: "LOAD_CART"; payload: Cart };

const initialState: Cart = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
};

function calculateTotals(items: CartItem[]): { totalItems: number; totalPrice: number } {
    return items.reduce(
        (acc, item) => {
            // Use variant price if variant is selected, otherwise use product price
            const price = item.variant ? item.variant.price : item.product.price;
            return {
                totalItems: acc.totalItems + item.quantity,
                totalPrice: acc.totalPrice + price * item.quantity,
            };
        },
        { totalItems: 0, totalPrice: 0 }
    );
}

function cartReducer(state: Cart, action: CartAction): Cart {
    switch (action.type) {
        case "LOAD_CART": {
            return action.payload;
        }

        case "ADD_ITEM": {
            // Match cart items by product ID AND variant ID (if variant exists)
            const existingItemIndex = state.items.findIndex((item) => item.product.id === action.payload.product.id && item.variant?.id === action.payload.variant?.id);

            let newItems: CartItem[];

            if (existingItemIndex > -1) {
                newItems = state.items.map((item, index) => (index === existingItemIndex ? { ...item, quantity: item.quantity + action.payload.quantity } : item));
            } else {
                newItems = [
                    ...state.items,
                    {
                        product: action.payload.product,
                        quantity: action.payload.quantity,
                        variant: action.payload.variant,
                    },
                ];
            }

            return { ...state, items: newItems, ...calculateTotals(newItems) };
        }

        case "REMOVE_ITEM": {
            const newItems = state.items.filter((item) => !(item.product.id === action.payload.productId && item.variant?.id === action.payload.variantId));
            return { ...state, items: newItems, ...calculateTotals(newItems) };
        }

        case "UPDATE_QUANTITY": {
            if (action.payload.quantity <= 0) {
                const newItems = state.items.filter((item) => !(item.product.id === action.payload.productId && item.variant?.id === action.payload.variantId));
                return { ...state, items: newItems, ...calculateTotals(newItems) };
            }

            const newItems = state.items.map((item) => (item.product.id === action.payload.productId && item.variant?.id === action.payload.variantId ? { ...item, quantity: action.payload.quantity } : item));
            return { ...state, items: newItems, ...calculateTotals(newItems) };
        }

        case "CLEAR_CART":
            return initialState;

        default:
            return state;
    }
}

// Helper to safely parse cart from localStorage
function loadCartFromStorage(): Cart | null {
    try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Validate structure
            if (parsed.items && Array.isArray(parsed.items)) {
                return {
                    items: parsed.items,
                    ...calculateTotals(parsed.items),
                };
            }
        }
    } catch (error) {
        console.error("Failed to load cart from storage:", error);
    }
    return null;
}

// Helper to save cart to localStorage
function saveCartToStorage(cart: Cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: cart.items }));
    } catch (error) {
        console.error("Failed to save cart to storage:", error);
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = loadCartFromStorage();
        if (savedCart && savedCart.items.length > 0) {
            dispatch({ type: "LOAD_CART", payload: savedCart });
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        saveCartToStorage(state);
    }, [state]);

    const addItem = (product: Product, quantity = 1, variant?: ProductVariant) => {
        dispatch({ type: "ADD_ITEM", payload: { product, quantity, variant } });
        const variantInfo = variant ? ` (${variant.name})` : "";
        toast.success(`${product.name}${variantInfo} ditambahkan ke keranjang`, {
            description: `${quantity} item`,
        });
    };

    const removeItem = (productId: string, variantId?: string) => {
        dispatch({ type: "REMOVE_ITEM", payload: { productId, variantId } });
        toast.info("Item dihapus dari keranjang");
    };

    const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
        dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity, variantId } });
    };

    const clearCart = () => {
        dispatch({ type: "CLEAR_CART" });
        localStorage.removeItem(CART_STORAGE_KEY);
        toast.info("Keranjang dikosongkan");
    };

    return (
        <CartContext.Provider
            value={{
                ...state,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}
