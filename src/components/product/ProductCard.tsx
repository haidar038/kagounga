import { Link } from "react-router-dom";
import { Star, Plus } from "lucide-react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const isLowStock = product.stock <= 10;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      {/* Image */}
      <Link to={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-secondary">
        <div className="flex h-full items-center justify-center text-6xl">
          🍚
        </div>
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {hasDiscount && (
            <Badge variant="destructive" className="text-xs">
              -{discountPercent}%
            </Badge>
          )}
          {product.tags?.includes("bestseller") && (
            <Badge variant="accent" className="text-xs">
              Bestseller
            </Badge>
          )}
          {product.tags?.includes("new") && (
            <Badge variant="default" className="text-xs">
              Baru
            </Badge>
          )}
        </div>

        {isLowStock && (
          <Badge variant="warning" className="absolute right-3 top-3 text-xs">
            Stok Terbatas
          </Badge>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <Link to={`/products/${product.slug}`} className="group/title">
          <h3 className="font-heading text-lg font-semibold transition-colors group-hover/title:text-accent">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 text-sm text-muted">
          {product.description}
        </p>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-muted">({product.reviews})</span>
        </div>

        {/* Price & Action */}
        <div className="mt-auto flex items-end justify-between pt-4">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-sm text-muted line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
            <span className="font-heading text-xl font-bold">
              {formatPrice(product.price)}
            </span>
          </div>

          <Button
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="shrink-0"
            disabled={product.stock === 0}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
