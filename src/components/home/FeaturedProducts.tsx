import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { mockProducts } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";

export function FeaturedProducts() {
  const featured = mockProducts.slice(0, 4);

  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        {/* Header */}
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="section-label mb-2">Produk Unggulan</p>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Pilihan Favorit
            </h2>
            <p className="mt-2 text-muted">
              Produk terlaris yang disukai pelanggan kami
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/products">
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
