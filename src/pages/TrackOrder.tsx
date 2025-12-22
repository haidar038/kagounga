import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Package, Truck, Check, Clock, XCircle, Mail, Search } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    status: string;
    total_amount: number;
    shipping_cost: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    city: string;
    postal_code: string;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}

type Step = "input" | "loading" | "success";

const TrackOrder = () => {
    const [searchParams] = useSearchParams();
    const tokenFromUrl = searchParams.get("token");

    const [step, setStep] = useState<Step>(tokenFromUrl ? "loading" : "input");
    const [email, setEmail] = useState("");
    const [orderId, setOrderId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);

    // Auto-load order if token is in URL
    useState(() => {
        if (tokenFromUrl) {
            loadOrderWithToken(tokenFromUrl);
        }
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusInfo = (status: string) => {
        switch (status.toUpperCase()) {
            case "PENDING":
                return {
                    label: "Menunggu Pembayaran",
                    icon: Clock,
                    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
                };
            case "PAID":
                return {
                    label: "Dibayar",
                    icon: Check,
                    color: "text-green-600 bg-green-50 border-green-200",
                };
            case "PROCESSING":
                return {
                    label: "Diproses",
                    icon: Package,
                    color: "text-blue-600 bg-blue-50 border-blue-200",
                };
            case "SHIPPED":
                return {
                    label: "Dikirim",
                    icon: Truck,
                    color: "text-blue-600 bg-blue-50 border-blue-200",
                };
            case "DELIVERED":
                return {
                    label: "Selesai",
                    icon: Check,
                    color: "text-green-600 bg-green-50 border-green-200",
                };
            case "CANCELLED":
            case "FAILED":
            case "EXPIRED":
                return {
                    label: "Dibatalkan",
                    icon: XCircle,
                    color: "text-red-600 bg-red-50 border-red-200",
                };
            default:
                return {
                    label: status,
                    icon: Package,
                    color: "text-gray-600 bg-gray-50 border-gray-200",
                };
        }
    };

    const loadOrderWithToken = async (token: string) => {
        setStep("loading");
        try {
            const { data, error } = await supabase.functions.invoke("order-tracking-get", {
                headers: {
                    "x-tracking-token": token,
                },
            });

            if (error) throw error;

            if (data?.success && data?.order) {
                setOrder(data.order);
                setStep("success");
            } else {
                throw new Error(data?.error || "Failed to load order");
            }
        } catch (error: any) {
            console.error("Error loading order:", error);
            toast.error(error.message || "Token tidak valid atau sudah kadaluarsa");
            setStep("input");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Call verification function
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/order-tracking-verify`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, // Required for edge function authentication
                },
                body: JSON.stringify({
                    email: email,
                    orderId: orderId,
                }),
            });
            const data = await response.json();

            // if (error) throw error;

            if (data?.success && data?.accessToken) {
                toast.success("Pesanan ditemukan!");
                await loadOrderWithToken(data.accessToken);
            } else {
                throw new Error(data?.error || "Pesanan tidak ditemukan");
            }
        } catch (error: any) {
            console.error("Error verifying order:", error);
            toast.error(error.message || "Gagal melacak pesanan. Periksa email dan Order ID Anda.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusInfo = order ? getStatusInfo(order.status) : null;

    return (
        <Layout>
            <SEO title="Lacak Pesanan" description="Lacak status pesanan Kagōunga Anda dengan mudah menggunakan email dan nomor pesanan." url="/track-order" />

            <div className="min-h-screen bg-background py-12">
                <div className="container-page max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="font-heading text-3xl font-bold mb-2">Lacak Pesanan</h1>
                        <p className="text-muted">Masukkan email dan nomor pesanan untuk melacak status pesanan Anda</p>
                    </div>

                    {/* Input Form */}
                    {step === "input" && (
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">
                                        <Mail className="inline h-4 w-4 mr-1" />
                                        Email
                                    </label>
                                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required autoComplete="email" />
                                    <p className="text-xs text-muted mt-1">Email yang digunakan saat checkout</p>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium">
                                        <Package className="inline h-4 w-4 mr-1" />
                                        Nomor Pesanan
                                    </label>
                                    <Input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required />
                                    <p className="text-xs text-muted mt-1">Nomor pesanan dari email konfirmasi</p>
                                </div>

                                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Mencari...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-2" />
                                            Lacak Pesanan
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}

                    {/* Loading State */}
                    {step === "loading" && (
                        <div className="bg-card border border-border rounded-2xl p-12 shadow-soft text-center">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-muted">Memuat informasi pesanan...</p>
                        </div>
                    )}

                    {/* Order Details */}
                    {step === "success" && order && statusInfo && (
                        <div className="space-y-6">
                            {/* Status Card */}
                            <div className={cn("border-2 rounded-2xl p-6", statusInfo.color)}>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center">
                                        <statusInfo.icon className="h-7 w-7" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium opacity-80">Status Pesanan</p>
                                        <h2 className="text-2xl font-bold">{statusInfo.label}</h2>
                                    </div>
                                </div>
                            </div>

                            {/* Order Info */}
                            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                                <div>
                                    <p className="text-xs text-muted mb-1">Nomor Pesanan</p>
                                    <p className="font-mono text-sm font-semibold">{order.id}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted mb-1">Tanggal Pesanan</p>
                                        <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted mb-1">Terakhir Diperbarui</p>
                                        <p className="text-sm font-medium">{formatDate(order.updated_at)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h3 className="font-semibold mb-4">Produk yang Dipesan</h3>
                                <div className="space-y-3">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="h-12 w-12 shrink-0 rounded-lg bg-secondary flex items-center justify-center text-2xl">🍚</div>
                                            <div className="flex-1">
                                                <p className="font-medium">{item.product_name}</p>
                                                <p className="text-sm text-muted">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-4 border-t border-border space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Subtotal</span>
                                        <span>{formatPrice(order.total_amount - order.shipping_cost)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Ongkir</span>
                                        <span>{order.shipping_cost === 0 ? "Gratis" : formatPrice(order.shipping_cost)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-border">
                                        <span className="font-semibold">Total</span>
                                        <span className="font-heading text-xl font-bold text-primary">{formatPrice(order.total_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Info */}
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h3 className="font-semibold mb-4">Informasi Pengiriman</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="font-medium">{order.customer_name}</p>
                                    <p className="text-muted">{order.customer_phone}</p>
                                    <p className="text-muted">{order.shipping_address}</p>
                                    <p className="text-muted">
                                        {order.city} {order.postal_code}
                                    </p>
                                </div>
                            </div>

                            {/* Track Another Order */}
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full"
                                onClick={() => {
                                    setStep("input");
                                    setEmail("");
                                    setOrderId("");
                                    setOrder(null);
                                }}
                            >
                                Lacak Pesanan Lain
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default TrackOrder;
