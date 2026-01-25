import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Loader2, Package, ShoppingCart, DollarSign, Clock, Truck, CheckCircle, XCircle, MessageSquare, History, Download, FileSpreadsheet, FileText, Printer, CheckSquare, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { exportOrdersToCSV, exportOrdersToExcel } from "@/lib/exportUtils";

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
}

interface OrderNote {
    id: string;
    note: string;
    created_at: string;
    admin_id: string | null;
}

interface OrderHistoryItem {
    id: string;
    field_changed: string;
    old_value: string | null;
    new_value: string | null;
    created_at: string;
}

interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    status: string;
    total_amount: number;
    shipping_cost: number;
    shipping_address: string;
    city: string;
    postal_code: string;
    invoice_url: string | null;
    tracking_number: string | null;
    // New shipping schema
    courier_code: string | null;
    courier_name: string | null;
    service_code: string | null;
    service_name: string | null;
    estimated_delivery_days: string | null;
    is_local_delivery: boolean | null;
    biteship_order_id: string | null;
    // Legacy field (keep for backward compatibility)
    courier: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    items?: OrderItem[];
    order_notes?: OrderNote[];
    order_history?: OrderHistoryItem[];
}

const AdminTransactions = () => {
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [courier, setCourier] = useState("");
    const [noteText, setNoteText] = useState("");
    const [isLocalDelivery, setIsLocalDelivery] = useState(false);
    const [shippingNotes, setShippingNotes] = useState("");
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const queryClient = useQueryClient();

    // Fetch available shipping couriers for dynamic dropdown
    const { data: availableCouriers } = useQuery({
        queryKey: ["shipping-couriers"],
        queryFn: async () => {
            const { data, error } = await supabase.from("shipping_couriers").select("code, name, is_active").eq("is_active", true).order("name");

            if (error) throw error;
            return data || [];
        },
    });

    const { data: orders, isLoading } = useQuery({
        queryKey: ["admin-orders", statusFilter],
        queryFn: async () => {
            let query = supabase
                .from("orders")
                .select(
                    `
                    *,
                    items:order_items(*),
                    order_notes(*),
                    order_history(*)
                `,
                )
                .order("created_at", { ascending: false });

            if (statusFilter !== "all") {
                query = query.eq("status", statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data as unknown as Order[];
        },
    });

    // Mutation: Update Order Status
    const updateStatusMutation = useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
            const updateData: any = { status, updated_at: new Date().toISOString() };

            // Auto-set timestamps based on status
            if (status === "SHIPPED" && !selectedOrder?.shipped_at) {
                updateData.shipped_at = new Date().toISOString();
            }
            if (status === "DELIVERED") {
                updateData.delivered_at = new Date().toISOString();
            }

            const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);

            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            toast.success("Order status updated successfully");
            setShowStatusDialog(false);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update order status");
        },
    });

    // Mutation: Update Shipping Info
    const updateShippingMutation = useMutation({
        mutationFn: async ({ orderId, trackingNumber, courier, isLocal, notes }: { orderId: string; trackingNumber: string; courier: string; isLocal?: boolean; notes?: string }) => {
            // Map courier code to name
            const courierNames: Record<string, string> = {
                lion_parcel: "Lion Parcel",
                jne: "JNE",
                jnt: "J&T Express",
                sicepat: "SiCepat",
                anteraja: "AnterAja",
                local_delivery: "Pengiriman Lokal Ternate",
            };

            const updateData: any = {
                tracking_number: trackingNumber,
                courier: courier, // Legacy field
                courier_code: courier,
                courier_name: courierNames[courier] || courier.toUpperCase(),
                status: "SHIPPED",
                shipped_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            // Add local delivery specific fields
            if (isLocal !== undefined) {
                updateData.is_local_delivery = isLocal;
            }
            if (notes) {
                updateData.shipping_notes = notes;
            }

            const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);

            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            toast.success("Shipping information updated");
            setTrackingNumber("");
            setCourier("");
            setIsLocalDelivery(false);
            setShippingNotes("");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update shipping info");
        },
    });

    // Mutation: Add Order Note
    const addNoteMutation = useMutation({
        mutationFn: async ({ orderId, note }: { orderId: string; note: string }) => {
            const { data: userData } = await supabase.auth.getUser();
            const { error } = await supabase.from("order_notes").insert({
                order_id: orderId,
                admin_id: userData?.user?.id,
                note: note,
                is_internal: true,
            });

            if (error) throw error;
            return { success: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            toast.success("Note added successfully");
            setNoteText("");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add note");
        },
    });

    // Mutation: Cancel Shipment
    const cancelShipmentMutation = useMutation({
        mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
            const { data, error } = await supabase.functions.invoke("shipping-cancel", {
                body: { orderId, reason },
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.message || "Failed to cancel shipment");
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            toast.success("Shipment cancelled successfully");
            setIsSheetOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to cancel shipment");
        },
    });

    // Mutation: Bulk Update Order Status
    const bulkUpdateStatusMutation = useMutation({
        mutationFn: async ({ orderIds, status }: { orderIds: string[]; status: string }) => {
            const updateData: any = { status, updated_at: new Date().toISOString() };

            if (status === "SHIPPED") {
                updateData.shipped_at = new Date().toISOString();
            }
            if (status === "DELIVERED") {
                updateData.delivered_at = new Date().toISOString();
            }

            const { error } = await supabase.from("orders").update(updateData).in("id", orderIds);

            if (error) throw error;
            return { count: orderIds.length };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            toast.success(`${data.count} orders updated successfully`);
            setSelectedOrders([]);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update orders");
        },
    });

    const handleStatusUpdate = (status: string) => {
        setNewStatus(status);
        setShowStatusDialog(true);
    };

    const confirmStatusUpdate = () => {
        if (selectedOrder) {
            updateStatusMutation.mutate({ orderId: selectedOrder.id, status: newStatus });
        }
    };

    const handleShipOrder = () => {
        if (selectedOrder && trackingNumber && courier) {
            updateShippingMutation.mutate({
                orderId: selectedOrder.id,
                trackingNumber,
                courier,
                isLocal: isLocalDelivery,
                notes: shippingNotes,
            });
        } else {
            toast.error("Please fill in tracking number and courier");
        }
    };

    const handleAddNote = () => {
        if (selectedOrder && noteText.trim()) {
            addNoteMutation.mutate({ orderId: selectedOrder.id, note: noteText.trim() });
        } else {
            toast.error("Please enter a note");
        }
    };

    const handleCancelShipment = () => {
        if (selectedOrder) {
            const reason = prompt("Alasan pembatalan pengiriman:");
            if (reason !== null) {
                // Allow empty string but cancel if clicked Cancel
                cancelShipmentMutation.mutate({ orderId: selectedOrder.id, reason });
            }
        }
    };

    const handleOpenSheet = (order: Order) => {
        setSelectedOrder(order);
        setTrackingNumber(order.tracking_number || "");
        // Use new courier_code if available, fallback to legacy courier field
        setCourier(order.courier_code || order.courier || "");
        setIsLocalDelivery(order.is_local_delivery || false);
        setShippingNotes("");
        setIsSheetOpen(true);
    };

    const handleSelectOrder = (orderId: string, checked: boolean) => {
        if (checked) {
            setSelectedOrders((prev) => [...prev, orderId]);
        } else {
            setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked && orders) {
            setSelectedOrders(orders.map((o) => o.id));
        } else {
            setSelectedOrders([]);
        }
    };

    const handleBulkStatusUpdate = (status: string) => {
        if (selectedOrders.length === 0) {
            toast.error("Please select at least one order");
            return;
        }
        bulkUpdateStatusMutation.mutate({ orderIds: selectedOrders, status });
    };

    const printShippingLabel = (order: Order) => {
        const labelWindow = window.open("", "_blank", "width=400,height=600");
        if (!labelWindow) {
            toast.error("Please allow popups for this site");
            return;
        }

        const itemsList = order.items?.map((item) => `${item.product_name} x${item.quantity}`).join(", ") || "N/A";

        labelWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Shipping Label - ${order.id.slice(0, 8)}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; max-width: 350px; margin: 0 auto; }
                    .label { border: 2px solid #000; padding: 15px; }
                    .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                    .header h2 { margin: 0; font-size: 18px; }
                    .section { margin: 10px 0; }
                    .section-title { font-weight: bold; font-size: 12px; color: #666; margin-bottom: 5px; }
                    .content { font-size: 14px; }
                    .to-section { background: #f5f5f5; padding: 10px; margin: 10px 0; }
                    .barcode { text-align: center; padding: 15px 0; border-top: 1px dashed #000; margin-top: 10px; }
                    .tracking { font-family: monospace; font-size: 16px; font-weight: bold; }
                    .items { font-size: 12px; color: #666; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="label">
                    <div class="header">
                        <h2>KAGOUNGA</h2>
                        <p style="margin: 5px 0; font-size: 12px;">Shipping Label</p>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">FROM:</div>
                        <div class="content">
                            Kagounga Store<br/>
                            Ternate, Maluku Utara<br/>
                            Indonesia
                        </div>
                    </div>
                    
                    <div class="to-section">
                        <div class="section-title">TO:</div>
                        <div class="content">
                            <strong>${order.customer_name}</strong><br/>
                            ${order.shipping_address}<br/>
                            ${order.city}, ${order.postal_code}<br/>
                            📞 ${order.customer_phone}
                        </div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">COURIER:</div>
                        <div class="content">${order.courier_name || order.courier || "N/A"}</div>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">ITEMS:</div>
                        <div class="items">${itemsList}</div>
                    </div>
                    
                    <div class="barcode">
                        <div class="section-title">TRACKING NUMBER:</div>
                        <div class="tracking">${order.tracking_number || "PENDING"}</div>
                    </div>
                </div>
                <script>window.print();</script>
            </body>
            </html>
        `);
        labelWindow.document.close();
    };

    const printSelectedLabels = () => {
        if (selectedOrders.length === 0) {
            toast.error("Please select at least one order");
            return;
        }
        const selectedOrderData = orders?.filter((o) => selectedOrders.includes(o.id)) || [];
        selectedOrderData.forEach((order, index) => {
            setTimeout(() => printShippingLabel(order), index * 500);
        });
    };

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
                return "default";
            case "delivered":
                return "accent";
            case "settled":
                return "success";
            case "pending":
                return "secondary";
            case "expired":
            case "failed":
                return "destructive";
            default:
                return "outline";
        }
    };

    // Generate realistic tracking numbers for testing/simulation
    const generateTrackingNumber = async (courierCode: string): Promise<string> => {
        const date = new Date();
        const dateStr = format(date, "yyyyMMdd");

        // For local delivery, use sequential numbering
        if (courierCode === "local_delivery") {
            const { data } = await supabase.from("orders").select("tracking_number").like("tracking_number", `TERN-${dateStr}-%`).order("tracking_number", { ascending: false }).limit(1);

            const lastTrackingNumber = data?.[0]?.tracking_number;
            const counter = lastTrackingNumber ? parseInt(lastTrackingNumber.split("-")[2]) + 1 : 1;

            return `TERN-${dateStr}-${counter.toString().padStart(3, "0")}`;
        }

        // For other couriers, use random numbers
        switch (courierCode) {
            case "jne":
                return `JT${Math.floor(Math.random() * 100000000000)
                    .toString()
                    .padStart(11, "0")}`;
            case "jnt":
                return `JT${Math.floor(Math.random() * 1000000000000)
                    .toString()
                    .padStart(12, "0")}`;
            case "lion_parcel":
                return `LION${Math.floor(Math.random() * 10000000000)
                    .toString()
                    .padStart(10, "0")}`;
            case "sicepat":
                return `000${Math.floor(Math.random() * 1000000000000)
                    .toString()
                    .padStart(12, "0")}`;
            case "anteraja":
                return `AJ${Math.floor(Math.random() * 1000000000000)
                    .toString()
                    .padStart(12, "0")}`;
            default: {
                const random = Math.floor(Math.random() * 100000)
                    .toString()
                    .padStart(5, "0");
                return `TRACK-${dateStr}-${random}`;
            }
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
            // Count all paid orders, including those in processing, shipped, or delivered status
            // Only exclude PENDING, EXPIRED, FAILED, and CANCELLED orders
            const paidStatuses = ["PAID", "SETTLED", "PROCESSING", "SHIPPED", "DELIVERED"];
            if (paidStatuses.includes(order.status)) {
                return acc + order.total_amount;
            }
            return acc;
        }, 0) || 0;

    const totalOrders = orders?.length || 0;
    const pendingOrders = orders?.filter((o) => o.status === "PENDING").length || 0;

    return (
        <div className="space-y-6">
            <Link to="/admin">
                <Button variant="ghost" size="sm">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
            </Link>
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
            <div className="flex items-center justify-between">
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

                {/* Export Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={async () => {
                                if (orders && orders.length > 0) {
                                    try {
                                        await exportOrdersToCSV(orders as any);
                                        toast.success("Orders exported to CSV successfully");
                                    } catch (error) {
                                        toast.error("Failed to export to CSV");
                                    }
                                } else {
                                    toast.error("No orders to export");
                                }
                            }}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Export to CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={async () => {
                                if (orders && orders.length > 0) {
                                    try {
                                        await exportOrdersToExcel(orders as any);
                                        toast.success("Orders exported to Excel successfully");
                                    } catch (error) {
                                        toast.error("Failed to export to Excel");
                                    }
                                } else {
                                    toast.error("No orders to export");
                                }
                            }}
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Export to Excel
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Bulk Actions */}
            {selectedOrders.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-muted/10 rounded-lg">
                    <CheckSquare className="h-4 w-4" />
                    <span className="text-sm font-medium">{selectedOrders.length} order(s) selected</span>
                    <div className="flex-1" />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" disabled={bulkUpdateStatusMutation.isPending}>
                                {bulkUpdateStatusMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Package className="h-4 w-4 mr-2" />}
                                Update Status
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate("PROCESSING")}>Mark as Processing</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate("SHIPPED")}>Mark as Shipped</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate("DELIVERED")}>Mark as Delivered</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBulkStatusUpdate("CANCELLED")} className="text-destructive">
                                Cancel Orders
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" variant="outline" className="bg-white text-slate-800" onClick={printSelectedLabels}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print Labels
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedOrders([])}>
                        Clear
                    </Button>
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox checked={orders && orders.length > 0 && selectedOrders.length === orders.length} onCheckedChange={handleSelectAll} />
                            </TableHead>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Courier</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders?.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>
                                        <Checkbox checked={selectedOrders.includes(order.id)} onCheckedChange={(checked) => handleSelectOrder(order.id, !!checked)} />
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{order.id.slice(0, 8)}...</TableCell>
                                    <TableCell>{order.created_at ? format(new Date(order.created_at), "dd MMM yyyy HH:mm", { locale: id }) : "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.customer_name}</span>
                                            <span className="text-xs text-muted-foreground">{order.customer_email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm">{order.city}</span>
                                            {order.is_local_delivery && <span className="text-xs text-accent">📍 Lokal</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{order.courier_name || order.courier || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{formatCurrency(order.total_amount)}</span>
                                            <span className="text-xs text-muted-foreground">Ongkir: {formatCurrency(order.shipping_cost || 0)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusColor(order.status) as any}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Sheet
                                            open={isSheetOpen && selectedOrder?.id === order.id}
                                            onOpenChange={(open) => {
                                                setIsSheetOpen(open);
                                                if (!open) setSelectedOrder(null);
                                            }}
                                        >
                                            <SheetTrigger asChild>
                                                <button
                                                    onClick={() => handleOpenSheet(order)}
                                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 w-9"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">Manage Order</span>
                                                </button>
                                            </SheetTrigger>
                                            <SheetContent className="overflow-y-auto w-full sm:max-w-2xl">
                                                <SheetHeader>
                                                    <SheetTitle>Manage Order</SheetTitle>
                                                    <SheetDescription className="font-mono text-xs">ID: {selectedOrder?.id}</SheetDescription>
                                                </SheetHeader>

                                                {selectedOrder && (
                                                    <Tabs defaultValue="details" className="mt-6">
                                                        <TabsList className="grid w-full grid-cols-4">
                                                            <TabsTrigger value="details">
                                                                <Package className="h-4 w-4 mr-2" />
                                                                Details
                                                            </TabsTrigger>
                                                            <TabsTrigger value="shipping">
                                                                <Truck className="h-4 w-4 mr-2" />
                                                                Shipping
                                                            </TabsTrigger>
                                                            <TabsTrigger value="notes">
                                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                                Notes
                                                            </TabsTrigger>
                                                            <TabsTrigger value="history">
                                                                <History className="h-4 w-4 mr-2" />
                                                                History
                                                            </TabsTrigger>
                                                        </TabsList>

                                                        {/* Details Tab */}
                                                        <TabsContent value="details" className="space-y-6 mt-4">
                                                            {/* Status Management */}
                                                            <div>
                                                                <Label className="text-sm font-semibold mb-2 block">Order Status</Label>
                                                                <div className="flex items-center gap-3">
                                                                    <Badge variant={getStatusColor(selectedOrder.status) as any} className="text-sm">
                                                                        {selectedOrder.status}
                                                                    </Badge>
                                                                    <Select value={selectedOrder.status} onValueChange={handleStatusUpdate}>
                                                                        <SelectTrigger className="w-[180px]">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {selectedOrder.status === "PENDING" && <SelectItem value="PAID">Mark as Paid</SelectItem>}
                                                                            {(selectedOrder.status === "PAID" || selectedOrder.status === "PENDING") && <SelectItem value="PROCESSING">Mark as Processing</SelectItem>}
                                                                            {selectedOrder.status === "PROCESSING" && <SelectItem value="SHIPPED">Mark as Shipped</SelectItem>}
                                                                            {selectedOrder.status === "SHIPPED" && <SelectItem value="DELIVERED">Mark as Delivered</SelectItem>}
                                                                            <SelectItem value="CANCELLED">Cancel Order</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                {selectedOrder.invoice_url && (
                                                                    <a href={selectedOrder.invoice_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline mt-2 inline-block">
                                                                        View Xendit Invoice →
                                                                    </a>
                                                                )}
                                                            </div>

                                                            {/* Customer Info */}
                                                            <div className="space-y-1">
                                                                <h3 className="text-sm font-semibold mb-2">Customer Information</h3>
                                                                <p className="text-sm">
                                                                    <span className="text-muted-foreground">Name:</span> {selectedOrder.customer_name}
                                                                </p>
                                                                <p className="text-sm">
                                                                    <span className="text-muted-foreground">Email:</span> {selectedOrder.customer_email}
                                                                </p>
                                                                <p className="text-sm">
                                                                    <span className="text-muted-foreground">Phone:</span> {selectedOrder.customer_phone}
                                                                </p>
                                                            </div>

                                                            {/* Shipping Address */}
                                                            <div className="space-y-1">
                                                                <h3 className="text-sm font-semibold mb-2">Shipping Address</h3>
                                                                <p className="text-sm whitespace-pre-wrap">{selectedOrder.shipping_address}</p>
                                                                <p className="text-sm">
                                                                    {selectedOrder.city}, {selectedOrder.postal_code}
                                                                </p>
                                                            </div>

                                                            {/* Order Items */}
                                                            <div>
                                                                <h3 className="text-sm font-semibold mb-3">Order Items</h3>
                                                                <div className="space-y-3">
                                                                    {selectedOrder.items?.map((item) => (
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
                                                                    <span className="font-bold text-lg">{formatCurrency(selectedOrder.total_amount)}</span>
                                                                </div>
                                                            </div>
                                                        </TabsContent>

                                                        {/* Shipping Tab */}
                                                        <TabsContent value="shipping" className="space-y-4 mt-4">
                                                            {selectedOrder.tracking_number ? (
                                                                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                                                    <div className="flex items-start gap-3">
                                                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                                                        <div className="flex-1">
                                                                            <h4 className="font-semibold text-green-900">Order Shipped</h4>
                                                                            <div className="mt-2 space-y-1 text-sm">
                                                                                <p>
                                                                                    <span className="font-medium">Tracking Number:</span> {selectedOrder.tracking_number}
                                                                                </p>
                                                                                <p>
                                                                                    <span className="font-medium">Courier:</span> {selectedOrder.courier_name || selectedOrder.courier?.toUpperCase() || "-"}
                                                                                </p>
                                                                                {selectedOrder.service_name && (
                                                                                    <p>
                                                                                        <span className="font-medium">Service:</span> {selectedOrder.service_name}
                                                                                    </p>
                                                                                )}
                                                                                {selectedOrder.estimated_delivery_days && (
                                                                                    <p>
                                                                                        <span className="font-medium">Estimated:</span> {selectedOrder.estimated_delivery_days} hari
                                                                                    </p>
                                                                                )}
                                                                                {selectedOrder.is_local_delivery && <p className="text-accent font-medium">📍 Pengiriman Lokal Ternate</p>}
                                                                                {selectedOrder.shipped_at && (
                                                                                    <p>
                                                                                        <span className="font-medium">Shipped At:</span> {format(new Date(selectedOrder.shipped_at), "dd MMM yyyy HH:mm", { locale: id })}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    {/* Cancel Shipment Button - only show for inter-city orders with Biteship tracking */}
                                                                    {selectedOrder.biteship_order_id && selectedOrder.status !== "CANCELLED" && selectedOrder.status !== "DELIVERED" && (
                                                                        <Button variant="destructive" className="w-full mt-4" onClick={handleCancelShipment} disabled={cancelShipmentMutation.isPending}>
                                                                            {cancelShipmentMutation.isPending ? (
                                                                                <>
                                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                                    Cancelling...
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                                    Cancel Shipment
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            ) : selectedOrder.status === "PROCESSING" || selectedOrder.status === "PAID" ? (
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <Label htmlFor="courier">Courier</Label>
                                                                        <Select value={courier} onValueChange={setCourier}>
                                                                            <SelectTrigger id="courier">
                                                                                <SelectValue placeholder="Select courier" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {selectedOrder.is_local_delivery ? (
                                                                                    // For local delivery, only show local delivery option
                                                                                    <SelectItem value="local_delivery">📍 Pengiriman Lokal Ternate</SelectItem>
                                                                                ) : (
                                                                                    // For inter-city delivery, show all active couriers except local_delivery
                                                                                    <>
                                                                                        {availableCouriers
                                                                                            ?.filter((c) => c.code !== "local_delivery")
                                                                                            .map((c) => (
                                                                                                <SelectItem key={c.code} value={c.code}>
                                                                                                    {c.name}
                                                                                                </SelectItem>
                                                                                            ))}
                                                                                    </>
                                                                                )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor="tracking">Tracking Number / Resi</Label>
                                                                        <div className="flex gap-2">
                                                                            <Input id="tracking" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" className="flex-1" />
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                onClick={async () => {
                                                                                    if (courier) {
                                                                                        const generated = await generateTrackingNumber(courier);
                                                                                        setTrackingNumber(generated);
                                                                                        toast.success("Tracking number generated");
                                                                                    } else {
                                                                                        toast.error("Please select a courier first");
                                                                                    }
                                                                                }}
                                                                                disabled={!courier}
                                                                            >
                                                                                Generate
                                                                            </Button>
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground mt-1">Click Generate for sample tracking number, or enter manually</p>
                                                                    </div>

                                                                    {/* Local Delivery Toggle */}
                                                                    <div className="flex items-center space-x-2 py-2 rounded-lg border p-3 bg-muted/30">
                                                                        <Switch
                                                                            id="local-delivery-toggle"
                                                                            checked={isLocalDelivery}
                                                                            onCheckedChange={(checked) => {
                                                                                setIsLocalDelivery(checked);
                                                                                if (checked) {
                                                                                    setCourier("local_delivery");
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Label htmlFor="local-delivery-toggle" className="cursor-pointer font-medium">
                                                                            📍 Pengiriman Lokal Ternate
                                                                        </Label>
                                                                    </div>

                                                                    {/* Shipping Notes for Local Delivery */}
                                                                    {isLocalDelivery && (
                                                                        <div>
                                                                            <Label htmlFor="shipping-notes">Delivery Notes (Optional)</Label>
                                                                            <Textarea
                                                                                id="shipping-notes"
                                                                                value={shippingNotes}
                                                                                onChange={(e) => setShippingNotes(e.target.value)}
                                                                                placeholder="e.g., Delivery address details, contact person, special instructions..."
                                                                                rows={3}
                                                                            />
                                                                            <p className="text-xs text-muted-foreground mt-1">Additional notes for local delivery courier</p>
                                                                        </div>
                                                                    )}

                                                                    <Button onClick={handleShipOrder} disabled={updateShippingMutation.isPending} className="w-full">
                                                                        {updateShippingMutation.isPending ? (
                                                                            <>
                                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                                Updating...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Truck className="mr-2 h-4 w-4" />
                                                                                Ship Order
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center text-sm text-muted-foreground py-8">
                                                                    <XCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                                    Order is not ready for shipping yet.
                                                                </div>
                                                            )}
                                                        </TabsContent>

                                                        {/* Notes Tab */}
                                                        <TabsContent value="notes" className="space-y-4 mt-4">
                                                            <div>
                                                                <Label htmlFor="newnote">Add Internal Note</Label>
                                                                <Textarea id="newnote" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note about this order (only visible to admins)" rows={3} />
                                                                <Button onClick={handleAddNote} disabled={addNoteMutation.isPending} className="mt-2 w-full">
                                                                    {addNoteMutation.isPending ? (
                                                                        <>
                                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                            Adding...
                                                                        </>
                                                                    ) : (
                                                                        "Add Note"
                                                                    )}
                                                                </Button>
                                                            </div>

                                                            <div className="border-t pt-4">
                                                                <h4 className="text-sm font-semibold mb-3">Order Notes</h4>
                                                                {selectedOrder.order_notes && selectedOrder.order_notes.length > 0 ? (
                                                                    <div className="space-y-3">
                                                                        {selectedOrder.order_notes.map((note) => (
                                                                            <div key={note.id} className="rounded-lg border bg-secondary p-3">
                                                                                <p className="text-sm">{note.note}</p>
                                                                                <p className="text-xs text-muted-foreground mt-1">{format(new Date(note.created_at), "dd MMM yyyy HH:mm", { locale: id })}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-muted-foreground">No notes yet.</p>
                                                                )}
                                                            </div>
                                                        </TabsContent>

                                                        {/* History Tab */}
                                                        <TabsContent value="history" className="mt-4">
                                                            <h4 className="text-sm font-semibold mb-3">Order Timeline</h4>
                                                            {selectedOrder.order_history && selectedOrder.order_history.length > 0 ? (
                                                                <div className="space-y-4 relative before:absolute before:left-[9px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-border">
                                                                    {selectedOrder.order_history.map((history) => (
                                                                        <div key={history.id} className="relative pl-8">
                                                                            <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                                                                <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                                                                            </div>
                                                                            <div className="rounded-lg border bg-card p-3">
                                                                                <p className="text-sm font-medium">
                                                                                    {history.field_changed === "status" && "Status changed"}
                                                                                    {history.field_changed === "tracking_number" && "Tracking number added"}
                                                                                    {history.field_changed === "courier" && "Courier updated"}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                                    {history.old_value && `From: ${history.old_value}`}
                                                                                    {history.old_value && history.new_value && " → "}
                                                                                    {history.new_value && `To: ${history.new_value}`}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground mt-1">{format(new Date(history.created_at), "dd MMM yyyy HH:mm", { locale: id })}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">No history available.</p>
                                                            )}
                                                        </TabsContent>
                                                    </Tabs>
                                                )}
                                            </SheetContent>
                                        </Sheet>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Status Update Confirmation Dialog */}
            <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change the order status to <strong>{newStatus}</strong>?{newStatus === "CANCELLED" && " This action will mark the order as cancelled."}
                            {newStatus === "SHIPPED" && " This will mark the order as shipped."}
                            {newStatus === "DELIVERED" && " This will mark the order as completed."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmStatusUpdate} disabled={updateStatusMutation.isPending}>
                            {updateStatusMutation.isPending ? "Updating..." : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminTransactions;
