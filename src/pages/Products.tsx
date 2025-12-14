import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/product/ProductCard";
import { mockProducts, categories } from "@/data/products";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const filteredProducts = useMemo(() => {
    let filtered = mockProducts;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Keep original order for "popular"
        break;
    }

    return filtered;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-secondary/30 py-12 sm:py-16">
          <div className="container-page">
            <p className="section-label mb-2">Koleksi Kami</p>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
              Semua Produk
            </h1>
            <p className="mt-3 max-w-xl text-muted">
              Temukan berbagai pilihan popeda dan pelengkap dengan kualitas terbaik.
            </p>
          </div>
        </section>

        <div className="container-page py-8 sm:py-12">
          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary-border"
              >
                <option value="popular">Terpopuler</option>
                <option value="price-low">Harga Terendah</option>
                <option value="price-high">Harga Tertinggi</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "gap-2",
                  selectedCategory === cat.id && "shadow-glow"
                )}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Results count */}
          <p className="mb-6 text-sm text-muted">
            Menampilkan {filteredProducts.length} produk
          </p>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card py-16 text-center">
              <p className="text-4xl">🔍</p>
              <h3 className="mt-4 font-heading text-lg font-semibold">
                Produk tidak ditemukan
              </h3>
              <p className="mt-2 text-muted">
                Coba ubah filter atau kata kunci pencarian Anda.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
              >
                Reset Filter
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Products;
