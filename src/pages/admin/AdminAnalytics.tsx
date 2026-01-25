import { useState } from "react";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, ShoppingCart, TrendingUp, Users, Loader2, BarChart3, ChevronLeft } from "lucide-react";
import { LineChart, Line, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { useRevenueData, useTopProducts, useOrderStats, useCustomerAnalytics } from "@/hooks/useAnalytics";
import { Link } from "react-router-dom";

// Color palette for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

// Date range presets
const DATE_RANGES = {
    "7days": { label: "Last 7 Days", days: 7 },
    "30days": { label: "Last 30 Days", days: 30 },
    "90days": { label: "Last 90 Days", days: 90 },
} as const;

type DateRangeKey = keyof typeof DATE_RANGES;

const AdminAnalytics = () => {
    const [dateRange, setDateRange] = useState<DateRangeKey>("30days");

    // Calculate date range
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, DATE_RANGES[dateRange].days));

    // Fetch data
    const { data: revenueData, isLoading: revenueLoading } = useRevenueData(startDate, endDate);
    const { data: topProducts, isLoading: productsLoading } = useTopProducts(startDate, endDate, 10);
    const { data: orderStats, isLoading: statsLoading } = useOrderStats(startDate, endDate);
    const { data: customerAnalytics, isLoading: customerLoading } = useCustomerAnalytics(startDate, endDate);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const isLoading = revenueLoading || productsLoading || statsLoading || customerLoading;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Prepare pie chart data
    const statusChartData =
        orderStats?.status_breakdown.map((item) => ({
            name: item.status,
            value: item.count,
        })) || [];

    // Prepare customer chart data
    const customerChartData = [
        { name: "New Customers", value: customerAnalytics?.new_customers || 0 },
        { name: "Returning", value: customerAnalytics?.returning_customers || 0 },
    ];

    return (
        <div className="space-y-6">
            <Link to="/admin">
                <Button variant="ghost" size="sm">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
            </Link>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-accent" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-muted text-sm mt-1">Business insights and performance metrics</p>
                </div>

                {/* Date Range Selector */}
                <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRangeKey)}>
                    <SelectTrigger className="w-[180px] bg-white">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(DATE_RANGES).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(orderStats?.total_revenue || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">From paid orders</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orderStats?.total_orders || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">All statuses</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(orderStats?.avg_order_value || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Per paid order</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orderStats?.total_customers || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Unique customers</p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Daily revenue over the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Revenue (IDR)" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top Products & Order Status */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Top Products */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Selling Products</CardTitle>
                        <CardDescription>Best performing products by revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-auto max-h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-center">Qty</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProducts && topProducts.length > 0 ? (
                                        topProducts.map((product, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{product.product_name}</TableCell>
                                                <TableCell className="text-center">{product.quantity_sold}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                                No product sales data
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Status Distribution</CardTitle>
                        <CardDescription>Breakdown by order status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {statusChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {statusChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">No order data</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Customer Analytics */}
            <Card>
                <CardHeader>
                    <CardTitle>Customer Analytics</CardTitle>
                    <CardDescription>New vs returning customers in selected period</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={customerChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#82ca9d" name="Customers" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminAnalytics;
