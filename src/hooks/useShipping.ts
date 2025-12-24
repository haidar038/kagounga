import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ShippingOption {
    courier: string;
    courierName: string;
    service: string;
    serviceName: string;
    price: number;
    estimatedDays: string;
    description?: string;
    isLocal: boolean;
}

export interface ShippingCalculateParams {
    originCity: string;
    destinationCity: string;
    destinationPostalCode?: string;
    items: {
        name: string;
        value: number;
        weight: number; // in grams
        quantity: number;
    }[];
    totalWeight?: number; // in kg
}

export interface TrackingHistory {
    note: string;
    updated_at: string;
    status: string;
}

export interface TrackingResult {
    success: boolean;
    trackingNumber: string;
    courier?: string;
    service?: string;
    status: string;
    currentLocation?: string;
    destination?: string;
    estimatedDelivery?: string;
    history: TrackingHistory[];
    link?: string;
    message: string;
    isLocal?: boolean;
}

export function useShipping() {
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLocalDelivery, setIsLocalDelivery] = useState(false);

    /**
     * Calculate shipping costs for given parameters
     */
    const calculateShipping = async (params: ShippingCalculateParams) => {
        setIsLoading(true);
        setError(null);
        setShippingOptions([]);
        setSelectedOption(null);

        try {
            const { data, error: invokeError } = await supabase.functions.invoke("shipping-calculate", {
                body: params,
            });

            if (invokeError) {
                throw new Error(invokeError.message);
            }

            if (!data.success) {
                throw new Error(data.error || "Failed to calculate shipping");
            }

            setShippingOptions(data.options || []);
            setIsLocalDelivery(data.isLocal || false);

            // Auto-select first option if available
            if (data.options && data.options.length > 0) {
                setSelectedOption(data.options[0]);
            }

            return data.options;
        } catch (err: any) {
            const errorMessage = err.message || "Gagal menghitung ongkos kirim";
            setError(errorMessage);
            console.error("Error calculating shipping:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Select a shipping option
     */
    const selectOption = (option: ShippingOption) => {
        setSelectedOption(option);
    };

    /**
     * Get selected shipping cost
     */
    const getShippingCost = (): number => {
        return selectedOption?.price || 0;
    };

    /**
     * Track a shipment by order ID or tracking number
     */
    const trackShipment = async (params: { orderId?: string; trackingNumber?: string }): Promise<TrackingResult> => {
        try {
            const { data, error: invokeError } = await supabase.functions.invoke("shipping-track", {
                body: params,
            });

            if (invokeError) {
                throw new Error(invokeError.message);
            }

            if (!data.success) {
                throw new Error(data.error || "Failed to track shipment");
            }

            return data;
        } catch (err: any) {
            const errorMessage = err.message || "Gagal melacak pengiriman";
            console.error("Error tracking shipment:", err);
            throw new Error(errorMessage);
        }
    };

    /**
     * Create shipment (called after payment success)
     */
    const createShipment = async (params: { orderId: string; courierCode: string; serviceCode: string; courierName: string; serviceName: string; isLocalDelivery: boolean }) => {
        try {
            const { data, error: invokeError } = await supabase.functions.invoke("shipping-create", {
                body: params,
            });

            if (invokeError) {
                throw new Error(invokeError.message);
            }

            if (!data.success) {
                throw new Error(data.error || "Failed to create shipment");
            }

            return data;
        } catch (err: any) {
            const errorMessage = err.message || "Gagal membuat pengiriman";
            console.error("Error creating shipment:", err);
            throw new Error(errorMessage);
        }
    };

    /**
     * Reset shipping state
     */
    const reset = () => {
        setShippingOptions([]);
        setSelectedOption(null);
        setError(null);
        setIsLocalDelivery(false);
    };

    return {
        // State
        shippingOptions,
        selectedOption,
        isLoading,
        error,
        isLocalDelivery,

        // Methods
        calculateShipping,
        selectOption,
        getShippingCost,
        trackShipment,
        createShipment,
        reset,
    };
}
