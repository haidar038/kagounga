import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

const Cart = () => {
    const { t } = useTranslation();
    const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (items.length === 0) {
        return (
            <Layout>
                <div className="min-h-[60vh] bg-background">
                    <div className="container-page py-16 text-center">
                        <div className="mx-auto max-w-md">
                            <div className="mb-6 text-8xl">🛒</div>
                            <h1 className="font-heading text-2xl font-bold">{t("cart.emptyCartTitle")}</h1>
                            <p className="mt-2 text-muted">{t("cart.emptyCartDesc")}</p>
                            <Button asChild className="mt-6" size="lg">
                                <Link to="/products">
                                    <ShoppingBag className="mr-2 h-5 w-5" />
                                    {t("cart.startShopping")}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-background py-8 sm:py-12">
                <div className="container-page">
                    <h1 className="font-heading text-3xl font-bold sm:text-4xl">{t("cart.pageTitle")}</h1>
                    <p className="mt-2 text-muted">{t("cart.itemsInCart", { count: totalItems })}</p>

                    <div className="mt-8 grid gap-8 lg:grid-cols-3">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.product.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4 sm:p-6">
                                        {/* Image */}
                                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary sm:h-32 sm:w-32">
                                            <div className="flex h-full items-center justify-center text-5xl">🍚</div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex flex-1 flex-col">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <Link to={`/products/${item.product.slug}`} className="font-heading text-lg font-semibold transition-colors hover:text-accent">
                                                        {item.product.name}
                                                    </Link>
                                                    <p className="mt-1 text-sm text-muted line-clamp-1">{item.product.description}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="shrink-0 text-muted hover:text-destructive" onClick={() => removeItem(item.product.id)}>
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>

                                            <div className="mt-auto flex items-end justify-between pt-4">
                                                {/* Quantity */}
                                                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}>
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {/* Price */}
                                                <p className="font-heading text-xl font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button variant="ghost" className="mt-4 text-muted" onClick={clearCart}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("cart.clearCart")}
                            </Button>
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
                                <h2 className="font-heading text-xl font-semibold">{t("cart.orderSummary")}</h2>

                                <div className="mt-6 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">
                                            {t("common.subtotal")} ({totalItems} item)
                                        </span>
                                        <span>{formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">{t("cart.shipping")}</span>
                                        <span className="text-primary-foreground">{totalPrice >= 150000 ? t("common.free") : formatPrice(15000)}</span>
                                    </div>
                                    {totalPrice < 150000 && <p className="text-xs text-muted">{t("cart.freeShippingNote", { amount: formatPrice(150000 - totalPrice) })}</p>}
                                </div>

                                <div className="my-6 border-t border-border" />

                                <div className="flex justify-between">
                                    <span className="font-heading text-lg font-semibold">{t("common.total")}</span>
                                    <span className="font-heading text-2xl font-bold">{formatPrice(totalPrice + (totalPrice >= 150000 ? 0 : 15000))}</span>
                                </div>

                                <Button asChild size="lg" className="mt-6 w-full">
                                    <Link to="/checkout">
                                        {t("cart.proceedToPayment")}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>

                                <Link to="/products" className="mt-4 block text-center text-sm text-muted transition-colors hover:text-foreground">
                                    {t("cart.continueShopping")}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Cart;
