import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, format, eachDayOfInterval } from "date-fns";

// Types
export interface RevenueDataPoint {
    date: string;
    revenue: number;
}

export interface TopProduct {
    product_name: string;
    quantity_sold: number;
    revenue: number;
}

export interface OrderStats {
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
    total_customers: number;
    status_breakdown: {
        status: string;
        count: number;
    }[];
}

export interface CustomerAnalytics {
    total_customers: number;
    new_customers: number;
    returning_customers: number;
}

// Helper: Get paid order statuses
const PAID_STATUSES = ["PAID", "SETTLED", "PROCESSING", "SHIPPED", "DELIVERED"];

/**
 * Hook: Fetch revenue data aggregated by day
 */
export function useRevenueData(startDate: Date, endDate: Date) {
    return useQuery({
        queryKey: ["analytics", "revenue", startDate.toISOString(), endDate.toISOString()],
        queryFn: async (): Promise<RevenueDataPoint[]> => {
            const { data, error } = await supabase
                .from("orders")
                .select("created_at, total_amount, status")
                .gte("created_at", startOfDay(startDate).toISOString())
                .lte("created_at", endOfDay(endDate).toISOString())
                .in("status", PAID_STATUSES);

            if (error) throw error;

            // Generate all days in range
            const days = eachDayOfInterval({ start: startDate, end: endDate });

            // Group by day
            const revenueByDay: Record<string, number> = {};

            days.forEach((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                revenueByDay[dateKey] = 0;
            });

            data?.forEach((order) => {
                const dateKey = format(new Date(order.created_at), "yyyy-MM-dd");
                if (revenueByDay[dateKey] !== undefined) {
                    revenueByDay[dateKey] += order.total_amount;
                }
            });

            // Convert to array
            return days.map((day) => ({
                date: format(day, "MMM dd"),
                revenue: revenueByDay[format(day, "yyyy-MM-dd")] || 0,
            }));
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook: Fetch top selling products
 */
export function useTopProducts(startDate: Date, endDate: Date, limit = 10) {
    return useQuery({
        queryKey: ["analytics", "top-products", startDate.toISOString(), endDate.toISOString(), limit],
        queryFn: async (): Promise<TopProduct[]> => {
            const { data, error } = await supabase
                .from("order_items")
                .select(
                    `
                    product_name,
                    quantity,
                    price,
                    orders!inner(status, created_at)
                `
                )
                .gte("orders.created_at", startOfDay(startDate).toISOString())
                .lte("orders.created_at", endOfDay(endDate).toISOString())
                .in("orders.status", PAID_STATUSES);

            if (error) throw error;

            // Aggregate by product name
            const productMap: Record<string, { quantity: number; revenue: number }> = {};

            data?.forEach((item: any) => {
                const name = item.product_name;
                if (!productMap[name]) {
                    productMap[name] = { quantity: 0, revenue: 0 };
                }
                productMap[name].quantity += item.quantity;
                productMap[name].revenue += item.quantity * item.price;
            });

            // Convert to array and sort
            const products: TopProduct[] = Object.entries(productMap).map(([name, stats]) => ({
                product_name: name,
                quantity_sold: stats.quantity,
                revenue: stats.revenue,
            }));

            // Sort by revenue and limit
            return products.sort((a, b) => b.revenue - a.revenue).slice(0, limit);
        },
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook: Fetch order statistics and status breakdown
 */
export function useOrderStats(startDate: Date, endDate: Date) {
    return useQuery({
        queryKey: ["analytics", "order-stats", startDate.toISOString(), endDate.toISOString()],
        queryFn: async (): Promise<OrderStats> => {
            const { data, error } = await supabase.from("orders").select("id, status, total_amount, customer_email").gte("created_at", startOfDay(startDate).toISOString()).lte("created_at", endOfDay(endDate).toISOString());

            if (error) throw error;

            const orders = data || [];

            // Calculate stats
            const paidOrders = orders.filter((o) => PAID_STATUSES.includes(o.status));
            const total_revenue = paidOrders.reduce((sum, o) => sum + o.total_amount, 0);
            const total_orders = orders.length;
            const avg_order_value = paidOrders.length > 0 ? total_revenue / paidOrders.length : 0;

            // Unique customers
            const uniqueCustomers = new Set(orders.map((o) => o.customer_email));
            const total_customers = uniqueCustomers.size;

            // Status breakdown
            const statusCounts: Record<string, number> = {};
            orders.forEach((o) => {
                statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
            });

            const status_breakdown = Object.entries(statusCounts).map(([status, count]) => ({
                status,
                count,
            }));

            return {
                total_orders,
                total_revenue,
                avg_order_value,
                total_customers,
                status_breakdown,
            };
        },
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook: Fetch customer analytics (new vs returning)
 */
export function useCustomerAnalytics(startDate: Date, endDate: Date) {
    return useQuery({
        queryKey: ["analytics", "customer-analytics", startDate.toISOString(), endDate.toISOString()],
        queryFn: async (): Promise<CustomerAnalytics> => {
            // Fetch all orders
            const { data: allOrders, error: allError } = await supabase.from("orders").select("customer_email, created_at").order("created_at", { ascending: true });

            if (allError) throw allError;

            // Fetch orders in selected range
            const { data: rangeOrders, error: rangeError } = await supabase.from("orders").select("customer_email").gte("created_at", startOfDay(startDate).toISOString()).lte("created_at", endOfDay(endDate).toISOString());

            if (rangeError) throw rangeError;

            // Get unique customers in range
            const customersInRange = new Set(rangeOrders?.map((o) => o.customer_email) || []);

            // Check if each customer is new or returning
            let new_customers = 0;
            let returning_customers = 0;

            customersInRange.forEach((email) => {
                // Find first order for this customer
                const firstOrder = allOrders?.find((o) => o.customer_email === email);
                if (firstOrder) {
                    const firstOrderDate = new Date(firstOrder.created_at);
                    // If first order is within range, they're new
                    if (firstOrderDate >= startDate && firstOrderDate <= endDate) {
                        new_customers++;
                    } else {
                        returning_customers++;
                    }
                }
            });

            return {
                total_customers: customersInRange.size,
                new_customers,
                returning_customers,
            };
        },
        staleTime: 5 * 60 * 1000,
    });
}
