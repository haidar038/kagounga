import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Minus, Plus, ShoppingCart, Truck, ShieldCheck, Clock, Loader2 } from "lucide-react";
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProduct } from "@/hooks/useProducts";
import { useProductVariants } from "@/hooks/useProductVariants";
import { useCart } from "@/hooks/useCart";
import { SEO, ProductSchema, BreadcrumbSchema } from "@/components/SEO";
import { ReviewForm } from "@/components/product/ReviewForm";
import { ReviewList } from "@/components/product/ReviewList";
import { VariantSelector } from "@/components/product/VariantSelector";
import { ProductVariant } from "@/types/product";

const ProductDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const { product, loading, error } = useProduct(slug);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
    const { addItem } = useCart();

    // Fetch variants if product has variants
    const { data: variants } = useProductVariants(product?.id || "");

    // Loading state
    if (loading) {
        return (
            <Layout>
                <SEO title="Memuat Produk..." description="Memuat detail produk..." noindex={true} />
                <div className="container-page flex min-h-screen items-center justify-center py-20">
                    <div className="text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-muted">Memuat detail produk...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Error state
    if (error) {
        return (
            <Layout>
                <SEO title="Terjadi Kesalahan" description="Gagal memuat produk" noindex={true} />
                <div className="container-page py-20 text-center">
                    <p className="text-6xl">⚠️</p>
                    <h1 className="mt-4 font-heading text-2xl font-bold">Terjadi Kesalahan</h1>
                    <p className="mt-2 text-muted">{error}</p>
                    <Button asChild className="mt-6">
                        <Link to="/products">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Produk
                        </Link>
                    </Button>
                </div>
            </Layout>
        );
    }

    if (!product) {
        return (
            <Layout>
                <SEO title="Produk Tidak Ditemukan" description="Produk yang Anda cari tidak tersedia." noindex={true} />
                <div className="container-page py-20 text-center">
                    <p className="text-6xl">😕</p>
                    <h1 className="mt-4 font-heading text-2xl font-bold">Produk tidak ditemukan</h1>
                    <p className="mt-2 text-muted">Produk yang Anda cari tidak tersedia.</p>
                    <Button asChild className="mt-6">
                        <Link to="/products">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Produk
                        </Link>
                    </Button>
                </div>
            </Layout>
        );
    }

    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleAddToCart = () => {
        if (product.has_variants && !selectedVariant) {
            alert("Please select a variant first");
            return;
        }
        addItem(product, quantity, selectedVariant);
    };

    return (
        <Layout>
            <SEO title={product.name} description={product.description} url={`/products/${product.slug}`} type="product" keywords={`${product.name}, popeda instant, kagounga, ${product.category}`} />
            <ProductSchema name={product.name} description={product.description} image="/og-image.png" price={product.price} availability={product.stock > 0 ? "InStock" : "OutOfStock"} sku={product.id} />
            <BreadcrumbSchema
                items={[
                    { name: "Home", url: "/" },
                    { name: "Produk", url: "/products" },
                    { name: product.name, url: `/products/${product.slug}` },
                ]}
            />
            <div className="min-h-screen bg-background py-8 sm:py-12">
                <div className="container-page">
                    {/* Breadcrumb */}
                    <Link to="/products" className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Produk
                    </Link>

                    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                        {/* Image */}
                        <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary">
                            <div className="flex h-full items-center justify-center text-[12rem]">🍚</div>
                            {hasDiscount && (
                                <Badge variant="destructive" className="absolute left-4 top-4">
                                    -{discountPercent}%
                                </Badge>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-col">
                            {/* Tags */}
                            <div className="mb-3 flex flex-wrap gap-2">
                                {product.tags?.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="capitalize">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            <h1 className="font-heading text-3xl font-bold sm:text-4xl">{product.name}</h1>

                            {/* Rating */}
                            <div className="mt-3 flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 fill-primary text-primary" />
                                    <span className="font-semibold">{product.rating}</span>
                                </div>
                                <span className="text-muted">•</span>
                                <span className="text-muted">{product.reviews} ulasan</span>
                                {product.stock <= 10 && (
                                    <>
                                        <span className="text-muted">•</span>
                                        <Badge variant="warning">Stok Terbatas: {product.stock}</Badge>
                                    </>
                                )}
                            </div>

                            {/* Price */}
                            <div className="mt-6 flex items-end gap-3">
                                <span className="font-heading text-4xl font-bold">{formatPrice(product.price)}</span>
                                {hasDiscount && <span className="text-xl text-muted line-through">{formatPrice(product.originalPrice!)}</span>}
                            </div>

                            {/* Description */}
                            <p className="mt-6 text-muted">{product.longDescription || product.description}</p>

                            {/* Variant Selector */}
                            {product.has_variants && variants && variants.length > 0 && (
                                <div className="mt-6">
                                    <VariantSelector
                                        variants={variants}
                                        selectedVariant={selectedVariant}
                                        onVariantChange={(variant) => {
                                            setSelectedVariant(variant);
                                            // Reset quantity to not exceed variant stock
                                            setQuantity(Math.min(quantity, variant.stock));
                                        }}
                                    />
                                </div>
                            )}

                            {/* Quantity & Add to Cart */}
                            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                                <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-2">
                                    <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-12 text-center font-semibold">{quantity}</span>
                                    <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.stock === 0}>
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    Tambah ke Keranjang
                                </Button>
                            </div>

                            {/* Features */}
                            <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Truck className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Gratis Ongkir</p>
                                        <p className="text-xs text-muted">Min. Rp150.000</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Clock className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Siap {product.prepTime}</p>
                                        <p className="text-xs text-muted">Praktis & Cepat</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <ShieldCheck className="h-5 w-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">Garansi</p>
                                        <p className="text-xs text-muted">Uang Kembali</p>
                                    </div>
                                </div>
                            </div>

                            {/* Nutrition Facts */}
                            {product.nutritionFacts && (
                                <div className="mt-6">
                                    <h3 className="mb-3 font-heading font-semibold">Informasi Nutrisi</h3>
                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="rounded-xl bg-secondary p-3 text-center">
                                            <p className="font-heading text-xl font-bold">{product.nutritionFacts.calories}</p>
                                            <p className="text-xs text-muted">Kalori</p>
                                        </div>
                                        <div className="rounded-xl bg-secondary p-3 text-center">
                                            <p className="font-heading text-xl font-bold">{product.nutritionFacts.carbs}g</p>
                                            <p className="text-xs text-muted">Karbo</p>
                                        </div>
                                        <div className="rounded-xl bg-secondary p-3 text-center">
                                            <p className="font-heading text-xl font-bold">{product.nutritionFacts.protein}g</p>
                                            <p className="text-xs text-muted">Protein</p>
                                        </div>
                                        <div className="rounded-xl bg-secondary p-3 text-center">
                                            <p className="font-heading text-xl font-bold">{product.nutritionFacts.fat}g</p>
                                            <p className="text-xs text-muted">Lemak</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="mt-16">
                        <h2 className="font-heading text-3xl font-bold mb-8">Customer Reviews</h2>

                        {/* Review Form */}
                        <div className="mb-8">
                            <ReviewForm productId={product.id} productName={product.name} />
                        </div>

                        {/* Review List */}
                        <ReviewList productId={product.id} />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProductDetail;
