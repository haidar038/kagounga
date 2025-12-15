import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Loader2, Package, ShoppingCart, DollarSign, Clock } from "lucide-react";

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    status: string;
    total_amount: number;
    shipping_address: string;
    city: string;
    postal_code: string;
    invoice_url: string | null;
    items?: OrderItem[];
}

const AdminTransactions = () => {
    const [statusFilter, setStatusFilter] = useState("all");

    const { data: orders, isLoading } = useQuery({
        queryKey: ["admin-orders", statusFilter],
        queryFn: async () => {
            let query = supabase
                .from("orders")
                .select(
                    `
                    *,
                    items:order_items(*)
                `
                )
                .order("created_at", { ascending: false });

            if (statusFilter !== "all") {
                query = query.eq("status", statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as Order[];
        },
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "paid":
            case "settled":
                return "default"; // green/primary usually
            case "pending":
                return "secondary";
            case "expired":
            case "failed":
                return "destructive";
            default:
                return "outline";
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const totalRevenue =
        orders?.reduce((acc, order) => {
            if (order.status === "PAID" || order.status === "SETTLED") {
                return acc + order.total_amount;
            }
            return acc;
        }, 0) || 0;

    const totalOrders = orders?.length || 0;
    const pendingOrders = orders?.filter((o) => o.status === "PENDING").length || 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-3xl font-bold">Transaction History</h1>
                <p className="text-muted text-sm mt-1">Monitor all transactions and orders.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">From paid orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">All time orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingOrders}</div>
                        <p className="text-xs text-muted-foreground">Awaiting payment</p>
                    </CardContent>
                </Card>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="SETTLED">Settled</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders?.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{order.id.slice(0, 8)}...</TableCell>
                                    <TableCell>{order.created_at ? format(new Date(order.created_at), "dd MMM yyyy HH:mm", { locale: id }) : "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.customer_name}</span>
                                            <span className="text-xs text-muted-foreground">{order.customer_email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(order.status) as any}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 w-9">
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View Details</span>
                                                </button>
                                            </SheetTrigger>
                                            <SheetContent className="overflow-y-auto">
                                                <SheetHeader>
                                                    <SheetTitle>Order Details</SheetTitle>
                                                    <SheetDescription>ID: {order.id}</SheetDescription>
                                                </SheetHeader>

                                                <div className="mt-6 space-y-6">
                                                    {/* Status Section */}
                                                    <div>
                                                        <h3 className="text-sm font-semibold mb-2">Order Status</h3>
                                                        <Badge variant={getStatusColor(order.status) as any}>{order.status}</Badge>
                                                        {order.invoice_url && (
                                                            <a href={order.invoice_url} target="_blank" rel="noopener noreferrer" className="ml-4 text-sm text-primary hover:underline">
                                                                View Invoice
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* Customer Info */}
                                                    <div className="space-y-1">
                                                        <h3 className="text-sm font-semibold mb-2">Customer Information</h3>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">Name:</span> {order.customer_name}
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">Email:</span> {order.customer_email}
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-muted-foreground">Phone:</span> {order.customer_phone}
                                                        </p>
                                                    </div>

                                                    {/* Shipping Info */}
                                                    <div className="space-y-1">
                                                        <h3 className="text-sm font-semibold mb-2">Shipping Details</h3>
                                                        <p className="text-sm whitespace-pre-wrap">{order.shipping_address}</p>
                                                        <p className="text-sm">
                                                            {order.city}, {order.postal_code}
                                                        </p>
                                                    </div>

                                                    {/* Order Items */}
                                                    <div>
                                                        <h3 className="text-sm font-semibold mb-3">Order Items</h3>
                                                        <div className="space-y-3">
                                                            {order.items?.map((item) => (
                                                                <div key={item.id} className="flex justify-between items-start border-b pb-3 last:border-0 last:pb-0">
                                                                    <div>
                                                                        <p className="text-sm font-medium">{item.product_name}</p>
                                                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                                    </div>
                                                                    <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex justify-between items-center border-t pt-4 mt-4">
                                                            <span className="font-bold">Total Amount</span>
                                                            <span className="font-bold text-lg">{formatCurrency(order.total_amount)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AdminTransactions;
