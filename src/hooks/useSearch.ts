import { useState, useEffect, useMemo, useCallback } from "react";
import Fuse from "fuse.js";
import { mockProducts } from "@/data/products";
import { Product } from "@/types/product";

const SEARCH_MODE = import.meta.env.VITE_SEARCH_MODE || "client";
const DEBOUNCE_MS = 250;

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  stock: number;
  snippet: string;
}

export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fuse.js instance for client-side search
  const fuse = useMemo(
    () =>
      new Fuse(mockProducts, {
        keys: [
          { name: "name", weight: 0.4 },
          { name: "category", weight: 0.3 },
          { name: "description", weight: 0.2 },
          { name: "tags", weight: 0.1 },
        ],
        threshold: 0.3,
        includeScore: true,
      }),
    []
  );

  const transformProduct = useCallback((product: Product): SearchResult => ({
    id: product.id,
    slug: product.slug,
    title: product.name,
    price: product.price,
    image: product.image,
    stock: product.stock,
    snippet: product.description,
  }), []);

  const clientSearch = useCallback(
    (searchQuery: string): SearchResult[] => {
      if (!searchQuery.trim()) {
        // Return popular/recent products when query is empty
        return mockProducts.slice(0, 6).map(transformProduct);
      }
      const fuseResults = fuse.search(searchQuery, { limit: 20 });
      return fuseResults.map((result) => transformProduct(result.item));
    },
    [fuse, transformProduct]
  );

  const serverSearch = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search?q=${encodeURIComponent(searchQuery)}`;
    const response = await fetch(url, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
    });
    if (!response.ok) throw new Error("Search failed");
    const data = await response.json();
    return data.results;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout;

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let searchResults: SearchResult[];

        if (SEARCH_MODE === "server") {
          searchResults = await serverSearch(query);
        } else {
          searchResults = clientSearch(query);
        }

        if (!controller.signal.aborted) {
          setResults(searchResults);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Search failed");
          // Fallback to client search on server error
          if (SEARCH_MODE === "server") {
            setResults(clientSearch(query));
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    timeoutId = setTimeout(performSearch, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [query, clientSearch, serverSearch]);

  return { results, isLoading, error, resultCount: results.length };
}
