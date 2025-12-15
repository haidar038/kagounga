import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck, Check, Loader2, Building, Wallet, ExternalLink } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step = "shipping" | "payment" | "processing";

const Checkout = () => {
    const navigate = useNavigate();
    const { items, totalPrice, clearCart } = useCart();
    const [currentStep, setCurrentStep] = useState<Step>("shipping");
    const [isProcessing, setIsProcessing] = useState(false);

    const [shippingInfo, setShippingInfo] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const shippingCost = totalPrice >= 150000 ? 0 : 15000;
    const grandTotal = totalPrice + shippingCost;

    const steps = [
        { id: "shipping", label: "Pengiriman", icon: Truck },
        { id: "payment", label: "Pembayaran", icon: CreditCard },
        { id: "processing", label: "Selesai", icon: Check },
    ];

    const handleShippingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address) {
            toast.error("Mohon lengkapi semua field yang diperlukan");
            return;
        }
        setCurrentStep("payment");
    };

    const handleXenditPayment = async () => {
        setIsProcessing(true);

        try {
            // Get current user (might be null for guest checkout)
            const {
                data: { user },
            } = await supabase.auth.getUser();

            // Call Edge Function - it will handle order creation and payment
            const { data, error } = await supabase.functions.invoke("xendit-payment", {
                body: {
                    amount: grandTotal,
                    customerName: shippingInfo.name,
                    customerEmail: shippingInfo.email,
                    customerPhone: shippingInfo.phone,
                    shippingAddress: shippingInfo.address,
                    city: shippingInfo.city,
                    postalCode: shippingInfo.postalCode,
                    items: items.map((item) => ({
                        id: item.product.id,
                        name: item.product.name,
                        quantity: item.quantity,
                        price: item.product.price,
                    })),
                    successRedirectUrl: `${window.location.origin}/checkout/success`,
                    failureRedirectUrl: `${window.location.origin}/checkout`,
                    userId: user?.id, // Pass user ID if authenticated, undefined if guest
                },
            });

            if (error) {
                console.error("Edge function error:", error);
                throw new Error(error.message || "Payment processing failed");
            }

            if (data?.success && data?.invoiceUrl) {
                // Clear cart and redirect to payment page
                clearCart();
                window.location.href = data.invoiceUrl;
            } else {
                throw new Error(data?.error || "Failed to create payment");
            }
        } catch (error: any) {
            console.error("Payment error:", error);
            toast.error(error.message || "Gagal memproses pembayaran. Silakan coba lagi.");
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <Layout>
                <div className="min-h-[60vh] bg-background">
                    <div className="container-page py-16 text-center">
                        <p className="text-6xl">🛒</p>
                        <h1 className="mt-4 font-heading text-2xl font-bold">Keranjang Kosong</h1>
                        <p className="mt-2 text-muted">Silakan tambahkan produk ke keranjang terlebih dahulu.</p>
                        <Button asChild className="mt-6">
                            <Link to="/products">Lihat Produk</Link>
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-background py-8 sm:py-12">
                <div className="container-page">
                    <Link to="/cart" className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Keranjang
                    </Link>

                    <h1 className="font-heading text-3xl font-bold">Checkout</h1>

                    {/* Steps */}
                    <div className="mt-8 flex items-center justify-center gap-4">
                        {steps.map((step, index) => {
                            const isActive = step.id === currentStep;
                            const isCompleted = (currentStep === "payment" && step.id === "shipping") || (currentStep === "processing" && (step.id === "shipping" || step.id === "payment"));

                            return (
                                <div key={step.id} className="flex items-center">
                                    <div
                                        className={cn(
                                            "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                                            isActive && "border-primary bg-primary text-primary-foreground",
                                            isCompleted && "border-accent bg-accent text-accent-foreground",
                                            !isActive && !isCompleted && "border-border text-muted"
                                        )}
                                    >
                                        {isCompleted ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                                    </div>
                                    <span className={cn("ml-2 hidden text-sm font-medium sm:block", isActive && "text-foreground", !isActive && "text-muted")}>{step.label}</span>
                                    {index < steps.length - 1 && <div className={cn("mx-4 h-0.5 w-8 sm:w-16", isCompleted ? "bg-accent" : "bg-border")} />}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-10 grid gap-8 lg:grid-cols-3">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            {/* Shipping Form */}
                            {currentStep === "shipping" && (
                                <form onSubmit={handleShippingSubmit} className="rounded-2xl border border-border bg-card p-6">
                                    <h2 className="font-heading text-xl font-semibold">Informasi Pengiriman</h2>

                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label className="mb-1.5 block text-sm font-medium">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.name}
                                                onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                                                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">Email</label>
                                            <input
                                                type="email"
                                                value={shippingInfo.email}
                                                onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                                                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">No. Telepon</label>
                                            <input
                                                type="tel"
                                                value={shippingInfo.phone}
                                                onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                                                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                                                placeholder="+62 812 3456 7890"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="mb-1.5 block text-sm font-medium">Alamat Lengkap</label>
                                            <textarea
                                                value={shippingInfo.address}
                                                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                                                rows={3}
                                                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                                                placeholder="Jl. Contoh No. 123, RT 01/RW 02"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">Kota</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.city}
                                                onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                                                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                                                placeholder="Jakarta"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">Kode Pos</label>
                                            <input
                                                type="text"
                                                value={shippingInfo.postalCode}
                                                onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                                                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                                                placeholder="12345"
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" size="lg" className="mt-6 w-full">
                                        Lanjut ke Pembayaran
                                    </Button>
                                </form>
                            )}

                            {/* Payment Options */}
                            {currentStep === "payment" && (
                                <div className="rounded-2xl border border-border bg-card p-6">
                                    <h2 className="font-heading text-xl font-semibold">Pilih Metode Pembayaran</h2>
                                    <p className="mt-1 text-sm text-muted">Pembayaran aman via Xendit — Virtual Account, E-Wallet, atau Kartu Kredit</p>

                                    <div className="mt-6 space-y-4">
                                        {/* Payment Methods Preview */}
                                        <div className="grid gap-3">
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                                                <Building className="h-5 w-5 text-accent" />
                                                <div>
                                                    <p className="font-medium text-sm">Virtual Account</p>
                                                    <p className="text-xs text-muted">BCA, Mandiri, BNI, BRI, Permata</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                                                <Wallet className="h-5 w-5 text-accent" />
                                                <div>
                                                    <p className="font-medium text-sm">E-Wallet</p>
                                                    <p className="text-xs text-muted">OVO, DANA, LinkAja, ShopeePay</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                                                <CreditCard className="h-5 w-5 text-accent" />
                                                <div>
                                                    <p className="font-medium text-sm">Kartu Kredit/Debit</p>
                                                    <p className="text-xs text-muted">Visa, Mastercard dengan 3DS</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipping Info Summary */}
                                        <div className="mt-6 rounded-xl bg-secondary p-4">
                                            <h3 className="text-sm font-semibold text-muted">Pengiriman ke:</h3>
                                            <p className="mt-1 font-medium">{shippingInfo.name}</p>
                                            <p className="text-sm text-muted">{shippingInfo.address}</p>
                                            <p className="text-sm text-muted">
                                                {shippingInfo.city} {shippingInfo.postalCode}
                                            </p>
                                            <p className="text-sm text-muted">{shippingInfo.phone}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex gap-4">
                                        <Button type="button" variant="outline" size="lg" onClick={() => setCurrentStep("shipping")} disabled={isProcessing}>
                                            Kembali
                                        </Button>
                                        <Button size="lg" className="flex-1" onClick={handleXenditPayment} disabled={isProcessing}>
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Memproses...
                                                </>
                                            ) : (
                                                <>
                                                    <ExternalLink className="mr-2 h-5 w-5" />
                                                    Bayar {formatPrice(grandTotal)}
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <p className="mt-4 text-xs text-center text-muted">Anda akan diarahkan ke halaman pembayaran Xendit yang aman</p>
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                                <h2 className="font-heading text-lg font-semibold">Ringkasan Pesanan</h2>

                                <div className="mt-4 space-y-3">
                                    {items.map((item) => (
                                        <div key={item.product.id} className="flex gap-3">
                                            <div className="h-12 w-12 shrink-0 rounded-lg bg-secondary text-2xl flex items-center justify-center">🍚</div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                                                <p className="text-xs text-muted">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 space-y-2 border-t border-border pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Subtotal</span>
                                        <span>{formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Ongkir</span>
                                        <span>{shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</span>
                                    </div>
                                    {shippingCost > 0 && <p className="text-xs text-accent">Gratis ongkir untuk pesanan di atas {formatPrice(150000)}</p>}
                                </div>

                                <div className="mt-4 flex justify-between border-t border-border pt-4">
                                    <span className="font-semibold">Total</span>
                                    <span className="font-heading text-xl font-bold text-primary">{formatPrice(grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Checkout;
