import { useTranslation } from "react-i18next";
import { TrendingUp, DollarSign, CheckCircle, XCircle, CreditCard, RefreshCw } from "lucide-react";
import { usePaymentAnalytics } from "@/hooks/usePaymentAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminPaymentAnalytics() {
    const { t } = useTranslation();
    const { stats, methodStats, dailyStats, loading, refresh } = usePaymentAnalytics();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(amount);
    };

    // Map Xendit payment method codes to user-friendly names
    const formatPaymentMethodName = (method: string): string => {
        const methodMap: Record<string, string> = {
            // E-Wallets
            ID_DANA: "Dana",
            ID_OVO: "OVO",
            ID_SHOPEEPAY: "ShopeePay",
            ID_LINKAJA: "LinkAja",
            ID_GOPAY: "GoPay",
            ID_ASTRAPAY: "AstraPay",
            ID_JENIUSPAY: "Jenius Pay",
            // Virtual Account Banks
            ID_BCA: "BCA Virtual Account",
            ID_BNI: "BNI Virtual Account",
            ID_BRI: "BRI Virtual Account",
            ID_MANDIRI: "Mandiri Virtual Account",
            ID_PERMATA: "Permata Virtual Account",
            ID_BSI: "BSI Virtual Account",
            ID_CIMB: "CIMB Virtual Account",
            ID_SAHABAT_SAMPOERNA: "Bank Sahabat Sampoerna VA",
            // QRIS
            ID_QRIS: "QRIS",
            QRIS: "QRIS",
            // Retail Outlets
            ID_ALFAMART: "Alfamart",
            ID_INDOMARET: "Indomaret",
            // Cards
            CREDIT_CARD: "Credit Card",
            DEBIT_CARD: "Debit Card",
            CARD: "Credit/Debit Card",
            // Direct Debit
            ID_BRI_DD: "BRI Direct Debit",
            ID_BCA_KLIKPAY: "BCA KlikPay",
            ID_CIMB_CLICKS: "CIMB Clicks",
            ID_DANAMON_ONLINE: "Danamon Online",
            // Paylater
            ID_KREDIVO: "Kredivo",
            ID_AKULAKU: "Akulaku",
            ID_UANGME: "UangMe",
            ID_INDODANA: "Indodana",
            ID_ATOME: "Atome",
            // Fallback
            EWALLET: "E-Wallet",
            VIRTUAL_ACCOUNT: "Virtual Account",
            BANK_TRANSFER: "Bank Transfer",
            RETAIL: "Retail Outlet",
            PAYLATER: "Pay Later",
        };

        // Check exact match first
        if (methodMap[method]) {
            return methodMap[method];
        }

        // Check if it starts with known prefixes
        if (method.startsWith("ID_")) {
            // Remove ID_ prefix and format nicely
            const name = method.replace("ID_", "").replace(/_/g, " ");
            return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
        }

        // Return as-is if no mapping found (with basic formatting)
        return method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    // Prepare data for success/failure pie chart
    const successFailureData = stats
        ? [
              { name: t("Successful"), value: stats.successfulTransactions },
              { name: t("Failed"), value: stats.failedTransactions },
          ]
        : [];

    // Prepare data for daily revenue line chart
    const revenueChartData = dailyStats
        .slice()
        .reverse()
        .map((day) => ({
            date: new Date(day.transactionDate).toLocaleDateString("id-ID", {
                month: "short",
                day: "numeric",
            }),
            revenue: day.dailyRevenue || 0,
            transactions: day.totalTransactions || 0,
        }));

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-8 h-8" />
                        {t("Payment Analytics")}
                    </h1>
                    <p className="text-gray-600">{t("Monitor payment performance and statistics")}</p>
                </div>
                <Button onClick={refresh} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {t("Refresh")}
                </Button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("Total Transactions")}</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalTransactions || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("Success Rate")}</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats?.successRate?.toFixed(1) || 0}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.successfulTransactions || 0} {t("successful")}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("Failure Rate")}</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats?.failureRate?.toFixed(1) || 0}%</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.failedTransactions || 0} {t("failed")}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("Total Revenue")}</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
                        <p className="text-xs text-muted-foreground">
                            {t("Avg")}: {formatCurrency(stats?.averageTransactionValue || 0)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Success vs Failure Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t("Success vs Failure Rate")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={successFailureData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                                    <Cell fill="#10b981" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Revenue by Payment Method Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t("Revenue by Payment Method")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={methodStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="paymentMethod" tickFormatter={(value) => formatPaymentMethodName(value)} />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Legend />
                                <Bar dataKey="totalRevenue" fill="#0ea5e9" name={t("Revenue")}>
                                    {methodStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 gap-6 mb-6">
                {/* Daily Revenue Line Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t("Daily Revenue Trend (Last 30 Days)")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name={t("Revenue")} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Methods Table */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("Payment Method Performance")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">{t("Payment Method")}</th>
                                    <th className="text-right py-3 px-4">{t("Transactions")}</th>
                                    <th className="text-right py-3 px-4">{t("Total Revenue")}</th>
                                    <th className="text-right py-3 px-4">{t("Success Rate")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {methodStats.map((method, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium">{formatPaymentMethodName(method.paymentMethod)}</td>
                                        <td className="py-3 px-4 text-right">{method.transactionCount}</td>
                                        <td className="py-3 px-4 text-right">{formatCurrency(method.totalRevenue)}</td>
                                        <td className="py-3 px-4 text-right">
                                            <span className={`font-semibold ${method.successRate >= 80 ? "text-green-600" : "text-red-600"}`}>{method.successRate?.toFixed(1)}%</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
