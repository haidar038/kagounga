import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Package, Truck, CheckCircle, Clock, XCircle, AlertCircle, ChevronDown, ChevronUp, ExternalLink, Loader2, ShoppingBag, RefreshCw, Copy, Search } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useUserOrders, UserOrder } from "@/hooks/useUserOrders";
import { RefundRequestForm } from "@/components/order/RefundRequestForm";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function MyOrders() {
    const { user } = useAuth();
    const [statusFilter, setStatusFilter] = useState("all");
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    const { data: orders, isLoading, error, refetch } = useUserOrders(statusFilter);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: id });
    };

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { variant: any; label: string; icon: any; color: string }> = {
            PENDING: { variant: "secondary", label: "Menunggu Pembayaran", icon: Clock, color: "text-yellow-600" },
            PAID: { variant: "default", label: "Dibayar", icon: CheckCircle, color: "text-green-600" },
            PROCESSING: { variant: "default", label: "Diproses", icon: Package, color: "text-blue-600" },
            SHIPPED: { variant: "default", label: "Dikirim", icon: Truck, color: "text-purple-600" },
            DELIVERED: { variant: "default", label: "Diterima", icon: CheckCircle, color: "text-green-600" },
            CANCELLED: { variant: "destructive", label: "Dibatalkan", icon: XCircle, color: "text-red-600" },
            EXPIRED: { variant: "destructive", label: "Kadaluarsa", icon: AlertCircle, color: "text-gray-600" },
            FAILED: { variant: "destructive", label: "Gagal", icon: XCircle, color: "text-red-600" },
            REFUNDED: { variant: "outline", label: "Refund", icon: RefreshCw, color: "text-orange-600" },
        };
        return configs[status] || configs.PENDING;
    };

    const getRefundStatusBadge = (status: string) => {
        const configs: Record<string, { variant: any; label: string }> = {
            pending: { variant: "secondary", label: "Menunggu Review" },
            approved: { variant: "default", label: "Disetujui" },
            rejected: { variant: "destructive", label: "Ditolak" },
            processing: { variant: "default", label: "Diproses" },
            completed: { variant: "default", label: "Selesai" },
            failed: { variant: "destructive", label: "Gagal" },
        };
        return configs[status] || configs.pending;
    };

    const isRefundEligible = (order: UserOrder) => {
        // Eligible statuses for refund
        const eligibleStatuses = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];
        if (!eligibleStatuses.includes(order.status)) return false;

        // Check if there's already a pending or processing refund
        const hasActiveRefund = order.refund_requests?.some((r) => ["pending", "approved", "processing"].includes(r.status));
        return !hasActiveRefund;
    };

    const toggleExpand = (orderId: string) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const copyOrderId = (orderId: string) => {
        navigator.clipboard.writeText(orderId);
        toast.success("Order ID disalin!");
    };

    if (!user) {
        return (
            <Layout>
                <SEO title="Pesanan Saya - Kagounga" description="Lihat dan kelola pesanan Anda" />
                <div className="container mx-auto px-4 py-16 text-center">
                    <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Login Required</h1>
                    <p className="text-muted-foreground mb-6">Silakan login untuk melihat pesanan Anda</p>
                    <Button asChild>
                        <Link to="/auth">Login</Link>
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO title="Pesanan Saya - Kagounga" description="Lihat dan kelola pesanan Anda" />

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Pesanan Saya</h1>
                            <p className="text-muted-foreground text-sm">Lihat dan kelola semua pesanan Anda</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="PENDING">Menunggu Pembayaran</SelectItem>
                                    <SelectItem value="PAID">Dibayar</SelectItem>
                                    <SelectItem value="PROCESSING">Diproses</SelectItem>
                                    <SelectItem value="SHIPPED">Dikirim</SelectItem>
                                    <SelectItem value="DELIVERED">Diterima</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon" onClick={() => refetch()}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <Card className="border-destructive">
                            <CardContent className="py-8 text-center">
                                <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                                <p className="text-destructive">Gagal memuat pesanan. Silakan coba lagi.</p>
                                <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                                    Coba Lagi
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && orders?.length === 0 && (
                        <Card>
                            <CardContent className="py-16 text-center">
                                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                <h2 className="text-xl font-semibold mb-2">Belum ada pesanan</h2>
                                <p className="text-muted-foreground mb-6">Anda belum memiliki pesanan. Mulai berbelanja sekarang!</p>
                                <Button asChild>
                                    <Link to="/products">Lihat Produk</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Orders List */}
                    {!isLoading && !error && orders && orders.length > 0 && (
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const statusConfig = getStatusConfig(order.status);
                                const StatusIcon = statusConfig.icon;
                                const isExpanded = expandedOrder === order.id;
                                const canRequestRefund = isRefundEligible(order);
                                const activeRefund = order.refund_requests?.find((r) => ["pending", "approved", "processing"].includes(r.status));

                                return (
                                    <Card key={order.id} className="overflow-hidden">
                                        <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(order.id)}>
                                            {/* Order Header */}
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <CardTitle className="text-base font-mono">Order #{order.external_id || order.id.slice(0, 8)}</CardTitle>
                                                            <Badge variant={statusConfig.variant}>
                                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                                {statusConfig.label}
                                                            </Badge>
                                                        </div>
                                                        <CardDescription>{formatDate(order.created_at)}</CardDescription>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                                                        <p className="text-xs text-muted-foreground">{order.items?.length || 0} item(s)</p>
                                                    </div>
                                                </div>

                                                {/* Order Items Preview */}
                                                <div className="mt-3 text-sm text-muted-foreground">
                                                    {order.items
                                                        ?.slice(0, 2)
                                                        .map((item) => `${item.product_name} x${item.quantity}`)
                                                        .join(", ")}
                                                    {order.items && order.items.length > 2 && ` +${order.items.length - 2} lainnya`}
                                                </div>

                                                {/* Refund Status */}
                                                {activeRefund && (
                                                    <div className="mt-3 p-2 rounded-lg bg-orange-50 border border-orange-200">
                                                        <div className="flex items-center gap-2">
                                                            <RefreshCw className="h-4 w-4 text-orange-600" />
                                                            <span className="text-sm font-medium text-orange-900">Pengajuan Refund</span>
                                                            <Badge variant={getRefundStatusBadge(activeRefund.status).variant as any}>{getRefundStatusBadge(activeRefund.status).label}</Badge>
                                                        </div>
                                                        <p className="text-xs text-orange-700 mt-1">Jumlah refund: {formatCurrency(activeRefund.amount)}</p>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 mt-4">
                                                    <CollapsibleTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            {isExpanded ? (
                                                                <>
                                                                    <ChevronUp className="h-4 w-4 mr-1" /> Sembunyikan
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronDown className="h-4 w-4 mr-1" /> Lihat Detail
                                                                </>
                                                            )}
                                                        </Button>
                                                    </CollapsibleTrigger>

                                                    {order.invoice_url && order.status === "PENDING" && (
                                                        <Button asChild size="sm">
                                                            <a href={order.invoice_url} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="h-4 w-4 mr-1" /> Bayar Sekarang
                                                            </a>
                                                        </Button>
                                                    )}

                                                    {order.tracking_number && (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link to={`/track-order?token=${order.id}`}>
                                                                <Truck className="h-4 w-4 mr-1" /> Lacak
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    {canRequestRefund && <RefundRequestForm orderId={order.id} orderAmount={order.total_amount} orderNumber={order.external_id || order.id.slice(0, 8)} />}
                                                </div>
                                            </CardHeader>

                                            {/* Expanded Content */}
                                            <CollapsibleContent>
                                                <CardContent className="border-t pt-4 space-y-4">
                                                    {/* Order ID Section */}
                                                    <div className="p-3 rounded-lg bg-muted/10 border">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Order ID (untuk tracking)</p>
                                                                <code className="text-sm font-mono">{order.id}</code>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => copyOrderId(order.id)}>
                                                                    <Copy className="h-3 w-3 mr-1" />
                                                                    Salin
                                                                </Button>
                                                                <Button variant="outline" size="sm" asChild>
                                                                    <Link to={`/track-order?token=${order.id}`}>
                                                                        <Search className="h-3 w-3 mr-1" />
                                                                        Lacak
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Order Items */}
                                                    <div>
                                                        <h4 className="font-medium mb-2">Detail Produk</h4>
                                                        <div className="space-y-2">
                                                            {order.items?.map((item) => (
                                                                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                                                    <div>
                                                                        <p className="font-medium">{item.product_name}</p>
                                                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                                    </div>
                                                                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex justify-between items-center pt-3 border-t mt-3">
                                                            <span className="text-muted-foreground">Ongkos Kirim</span>
                                                            <span>{formatCurrency(order.shipping_cost || 0)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center pt-2 font-bold">
                                                            <span>Total</span>
                                                            <span>{formatCurrency(order.total_amount)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Shipping Info */}
                                                    <div>
                                                        <h4 className="font-medium mb-2">Informasi Pengiriman</h4>
                                                        <div className="text-sm space-y-1">
                                                            <p>
                                                                <span className="text-muted-foreground">Penerima:</span> {order.customer_name}
                                                            </p>
                                                            <p>
                                                                <span className="text-muted-foreground">Telepon:</span> {order.customer_phone}
                                                            </p>
                                                            <p>
                                                                <span className="text-muted-foreground">Alamat:</span> {order.shipping_address}
                                                            </p>
                                                            <p>
                                                                <span className="text-muted-foreground">Kota:</span> {order.city}, {order.postal_code}
                                                            </p>
                                                            {order.courier_name && (
                                                                <p>
                                                                    <span className="text-muted-foreground">Kurir:</span> {order.courier_name} {order.service_name && `(${order.service_name})`}
                                                                </p>
                                                            )}
                                                            {order.tracking_number && (
                                                                <p>
                                                                    <span className="text-muted-foreground">No. Resi:</span> <code className="bg-muted/10 px-1 rounded">{order.tracking_number}</code>
                                                                </p>
                                                            )}
                                                            {order.is_local_delivery && <p className="text-accent font-medium">📍 Pengiriman Lokal Ternate</p>}
                                                        </div>
                                                    </div>

                                                    {/* Timeline */}
                                                    <div>
                                                        <h4 className="font-medium mb-2">Status Pesanan</h4>
                                                        <div className="text-sm space-y-1">
                                                            <p>
                                                                <span className="text-muted-foreground">Dibuat:</span> {formatDate(order.created_at)}
                                                            </p>
                                                            {order.shipped_at && (
                                                                <p>
                                                                    <span className="text-muted-foreground">Dikirim:</span> {formatDate(order.shipped_at)}
                                                                </p>
                                                            )}
                                                            {order.delivered_at && (
                                                                <p>
                                                                    <span className="text-muted-foreground">Diterima:</span> {formatDate(order.delivered_at)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Refund History */}
                                                    {order.refund_requests && order.refund_requests.length > 0 && (
                                                        <div>
                                                            <h4 className="font-medium mb-2">Riwayat Refund</h4>
                                                            <div className="space-y-2">
                                                                {order.refund_requests.map((refund) => (
                                                                    <div key={refund.id} className="p-3 rounded-lg bg-muted/10">
                                                                        <div className="flex items-center justify-between">
                                                                            <Badge variant={getRefundStatusBadge(refund.status).variant as any}>{getRefundStatusBadge(refund.status).label}</Badge>
                                                                            <span className="text-sm font-medium">{formatCurrency(refund.amount)}</span>
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground mt-1">{formatDate(refund.created_at)}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Help Section */}
                    <div className="mt-8 p-4 rounded-lg bg-muted/10">
                        <h3 className="font-medium mb-2">Butuh Bantuan?</h3>
                        <p className="text-sm text-muted-foreground mb-3">Jika Anda memiliki pertanyaan tentang pesanan Anda, silakan hubungi kami.</p>
                        <Button variant="outline" size="sm" asChild>
                            <Link to="/contact">Hubungi Kami</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
