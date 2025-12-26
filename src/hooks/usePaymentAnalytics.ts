import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentStats {
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    successRate: number;
    failureRate: number;
    totalRevenue: number;
    averageTransactionValue: number;
}

export interface PaymentMethodStats {
    paymentMethod: string;
    transactionCount: number;
    totalRevenue: number;
    successRate: number;
}

export interface DailyStats {
    transactionDate: string;
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    dailyRevenue: number;
    successRate: number;
}

export function usePaymentAnalytics(startDate?: Date, endDate?: Date) {
    const [stats, setStats] = useState<PaymentStats | null>(null);
    const [methodStats, setMethodStats] = useState<PaymentMethodStats[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, [startDate, endDate]);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch overall stats
            const { data: statsData, error: statsError } = await supabase.from("payment_statistics").select("*").single();

            if (statsError) throw statsError;

            // Convert to camelCase
            if (statsData) {
                setStats({
                    totalTransactions: statsData.total_transactions || 0,
                    successfulTransactions: statsData.successful_transactions || 0,
                    failedTransactions: statsData.failed_transactions || 0,
                    successRate: statsData.success_rate || 0,
                    failureRate: statsData.failure_rate || 0,
                    totalRevenue: statsData.total_revenue || 0,
                    averageTransactionValue: statsData.average_transaction_value || 0,
                });
            }

            // Fetch payment method stats
            const { data: methodData, error: methodError } = await supabase.from("revenue_by_payment_method").select("*");

            if (methodError) throw methodError;

            if (methodData) {
                setMethodStats(
                    methodData.map((item) => ({
                        paymentMethod: item.payment_method || "Unknown",
                        transactionCount: item.transaction_count || 0,
                        totalRevenue: item.total_revenue || 0,
                        successRate: item.success_rate || 0,
                    }))
                );
            }

            // Fetch daily stats (last 30 days)
            const { data: dailyData, error: dailyError } = await supabase.from("daily_payment_stats").select("*").order("transaction_date", { ascending: false }).limit(30);

            if (dailyError) throw dailyError;

            if (dailyData) {
                setDailyStats(
                    dailyData.map((item) => ({
                        transactionDate: item.transaction_date,
                        totalTransactions: item.total_transactions || 0,
                        successfulTransactions: item.successful_transactions || 0,
                        failedTransactions: item.failed_transactions || 0,
                        dailyRevenue: item.daily_revenue || 0,
                        successRate: item.success_rate || 0,
                    }))
                );
            }
        } catch (err) {
            console.error("Error fetching payment analytics:", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    const refresh = () => {
        fetchAnalytics();
    };

    return {
        stats,
        methodStats,
        dailyStats,
        loading,
        error,
        refresh,
    };
}
