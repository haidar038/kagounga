import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/useSearch";
import { useCart } from "@/hooks/useCart";
import { mockProducts } from "@/data/products";
import { cn } from "@/lib/utils";

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const { results, isLoading, resultCount } = useSearch(query);
    const { addItem } = useCart();

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Reset state when closed
    useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case "Escape":
                    onClose();
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) => Math.max(prev - 1, 0));
                    break;
                case "Enter":
                    e.preventDefault();
                    if (results[selectedIndex]) {
                        window.location.href = `/products/${results[selectedIndex].slug}`;
                        onClose();
                    }
                    break;
            }
        },
        [isOpen, onClose, results, selectedIndex]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    const handleAddToCart = (result: (typeof results)[0], e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Find the full product from mockProducts
        const product = mockProducts.find((p) => p.id === result.id);
        if (product) {
            addItem(product, 1);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm animate-fade-in">
            <div ref={overlayRef} className="mx-auto mt-16 w-full max-w-2xl px-4 animate-slide-up" role="dialog" aria-modal="true" aria-label="Product search">
                <div className="rounded-2xl bg-card shadow-soft border border-border overflow-hidden">
                    {/* Search Input */}
                    <div className="relative border-b border-border">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Search products..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedIndex(0);
                            }}
                            className="border-0 pl-12 pr-12 py-6 text-lg focus-visible:ring-0 bg-transparent"
                            aria-label="Search products"
                            aria-describedby="search-results-count"
                        />
                        <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-2 top-1/2 -translate-y-1/2" aria-label="Close search">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {/* Aria live region for screen readers */}
                        <div id="search-results-count" role="status" aria-live="polite" className="sr-only">
                            {isLoading ? "Searching..." : `${resultCount} results found`}
                        </div>

                        {isLoading ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 animate-pulse">
                                        <div className="h-16 w-16 rounded-lg bg-secondary" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-3/4 rounded bg-secondary" />
                                            <div className="h-3 w-1/2 rounded bg-secondary" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : results.length === 0 && query ? (
                            <div className="p-8 text-center">
                                <p className="text-muted">No products found for "{query}"</p>
                                <Link to="/products" onClick={onClose} className="mt-2 inline-flex items-center gap-1 text-accent hover:underline">
                                    Browse all products <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        ) : (
                            <ul role="listbox" aria-label="Search results">
                                {!query && (
                                    <li className="px-4 pt-3 pb-1">
                                        <span className="text-xs uppercase tracking-wide text-muted font-medium">Popular Products</span>
                                    </li>
                                )}
                                {results.map((result, index) => (
                                    <li key={result.id} role="option" aria-selected={index === selectedIndex}>
                                        <Link to={`/products/${result.slug}`} onClick={onClose} className={cn("flex items-center gap-4 p-4 transition-colors", index === selectedIndex ? "bg-secondary" : "hover:bg-secondary/50")}>
                                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                                                <img
                                                    src={result.image}
                                                    alt={result.title}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-heading font-semibold truncate">{result.title}</h4>
                                                <p className="text-sm text-muted line-clamp-1">{result.snippet}</p>
                                                <p className="mt-1 font-heading font-bold text-accent">Rp {result.price.toLocaleString("id-ID")}</p>
                                            </div>
                                            <Button size="sm" variant="default" onClick={(e) => handleAddToCart(result, e)} className="flex-shrink-0" aria-label={`Add ${result.title} to cart`}>
                                                <ShoppingCart className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer hint */}
                    <div className="border-t border-border px-4 py-2 text-xs text-muted flex items-center justify-between">
                        <span>↑↓ to navigate • Enter to select • Esc to close</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
