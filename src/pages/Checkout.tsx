import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck, Check, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Step = "shipping" | "payment" | "confirmation";

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

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
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
    { id: "confirmation", label: "Konfirmasi", icon: Check },
  ];

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInfo.cardNumber || !paymentInfo.expiry || !paymentInfo.cvv || !paymentInfo.cardName) {
      toast.error("Mohon lengkapi informasi pembayaran");
      return;
    }
    setCurrentStep("confirmation");
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    clearCart();
    toast.success("Pesanan berhasil dibuat!", {
      description: "Kami akan mengirimkan konfirmasi ke email Anda.",
    });
    
    navigate("/checkout/success");
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
          <Link
            to="/cart"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Keranjang
          </Link>

          <h1 className="font-heading text-3xl font-bold">Checkout</h1>

          {/* Steps */}
          <div className="mt-8 flex items-center justify-center gap-4">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted =
                (currentStep === "payment" && step.id === "shipping") ||
                (currentStep === "confirmation" && (step.id === "shipping" || step.id === "payment"));

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
                  <span
                    className={cn(
                      "ml-2 hidden text-sm font-medium sm:block",
                      isActive && "text-foreground",
                      !isActive && "text-muted"
                    )}
                  >
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-4 h-0.5 w-8 sm:w-16",
                        isCompleted ? "bg-accent" : "bg-border"
                      )}
                    />
                  )}
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

              {/* Payment Form */}
              {currentStep === "payment" && (
                <form onSubmit={handlePaymentSubmit} className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="font-heading text-xl font-semibold">Informasi Pembayaran</h2>
                  <p className="mt-1 text-sm text-muted">Demo mode — gunakan data kartu apa saja</p>
                  
                  <div className="mt-6 grid gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Nama pada Kartu</label>
                      <input
                        type="text"
                        value={paymentInfo.cardName}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                        placeholder="JOHN DOE"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Nomor Kartu</label>
                      <input
                        type="text"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                        placeholder="4242 4242 4242 4242"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Masa Berlaku</label>
                        <input
                          type="text"
                          value={paymentInfo.expiry}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry: e.target.value })}
                          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">CVV</label>
                        <input
                          type="text"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setCurrentStep("shipping")}
                    >
                      Kembali
                    </Button>
                    <Button type="submit" size="lg" className="flex-1">
                      Lanjut ke Konfirmasi
                    </Button>
                  </div>
                </form>
              )}

              {/* Confirmation */}
              {currentStep === "confirmation" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="font-heading text-xl font-semibold">Konfirmasi Pesanan</h2>
                  <p className="mt-1 text-sm text-muted">Periksa kembali pesanan Anda sebelum melanjutkan</p>

                  <div className="mt-6 space-y-6">
                    {/* Shipping Info */}
                    <div className="rounded-xl bg-secondary p-4">
                      <h3 className="text-sm font-semibold text-muted">Pengiriman ke:</h3>
                      <p className="mt-1 font-medium">{shippingInfo.name}</p>
                      <p className="text-sm text-muted">{shippingInfo.address}</p>
                      <p className="text-sm text-muted">
                        {shippingInfo.city} {shippingInfo.postalCode}
                      </p>
                      <p className="text-sm text-muted">{shippingInfo.phone}</p>
                    </div>

                    {/* Payment Info */}
                    <div className="rounded-xl bg-secondary p-4">
                      <h3 className="text-sm font-semibold text-muted">Metode Pembayaran:</h3>
                      <p className="mt-1 font-medium">
                        **** **** **** {paymentInfo.cardNumber.slice(-4) || "****"}
                      </p>
                    </div>

                    {/* Items */}
                    <div>
                      <h3 className="text-sm font-semibold text-muted">Produk:</h3>
                      <div className="mt-2 space-y-2">
                        {items.map((item) => (
                          <div key={item.product.id} className="flex justify-between text-sm">
                            <span>
                              {item.product.name} x{item.quantity}
                            </span>
                            <span>{formatPrice(item.product.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setCurrentStep("payment")}
                      disabled={isProcessing}
                    >
                      Kembali
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1"
                      onClick={handleConfirmOrder}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        `Bayar ${formatPrice(grandTotal)}`
                      )}
                    </Button>
                  </div>
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
                      <div className="h-12 w-12 shrink-0 rounded-lg bg-secondary text-2xl flex items-center justify-center">
                        🍚
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-muted">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="my-4 border-t border-border" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Ongkos Kirim</span>
                    <span>{shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}</span>
                  </div>
                </div>

                <div className="my-4 border-t border-border" />

                <div className="flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-heading text-xl font-bold">{formatPrice(grandTotal)}</span>
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
