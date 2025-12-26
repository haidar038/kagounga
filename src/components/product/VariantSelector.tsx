import { useState } from "react";
import { ProductVariant } from "@/types/product";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface VariantSelectorProps {
    variants: ProductVariant[];
    selectedVariant?: ProductVariant;
    onVariantChange: (variant: ProductVariant) => void;
}

export function VariantSelector({ variants, selectedVariant, onVariantChange }: VariantSelectorProps) {
    const [selected, setSelected] = useState<ProductVariant | undefined>(selectedVariant);

    const handleVariantChange = (variantId: string) => {
        const variant = variants.find((v) => v.id === variantId);
        if (variant) {
            setSelected(variant);
            onVariantChange(variant);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getPriceDifference = (variant: ProductVariant, basePrice: number) => {
        const diff = variant.price - basePrice;
        if (diff > 0) return `+${formatPrice(diff)}`;
        if (diff < 0) return formatPrice(diff);
        return null;
    };

    // Get base price (lowest variant price)
    const basePrice = Math.min(...variants.map((v) => v.price));

    return (
        <div className="space-y-3">
            <Label htmlFor="variant-select">Select Variant</Label>
            <Select value={selected?.id} onValueChange={handleVariantChange}>
                <SelectTrigger id="variant-select" className="w-full">
                    <SelectValue placeholder="Choose a variant" />
                </SelectTrigger>
                <SelectContent>
                    {variants.map((variant) => (
                        <SelectItem key={variant.id} value={variant.id} disabled={variant.stock === 0}>
                            <div className="flex items-center justify-between gap-4 w-full">
                                <div className="flex items-center gap-2">
                                    {selected?.id === variant.id && <Check className="h-4 w-4 text-primary" />}
                                    <span className={variant.stock === 0 ? "text-muted-foreground line-through" : ""}>{variant.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{formatPrice(variant.price)}</span>
                                    {getPriceDifference(variant, basePrice) && <span className="text-xs text-muted-foreground">({getPriceDifference(variant, basePrice)})</span>}
                                    {variant.stock === 0 && (
                                        <Badge variant="destructive" className="text-xs">
                                            Out of Stock
                                        </Badge>
                                    )}
                                    {variant.stock > 0 && variant.stock <= 5 && (
                                        <Badge variant="secondary" className="text-xs">
                                            Only {variant.stock} left
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {selected && (
                <div className="mt-2 p-3 bg-muted/10rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium">{selected.name}</p>
                            {Object.entries(selected.attributes).length > 0 && (
                                <div className="flex gap-2 mt-1">
                                    {Object.entries(selected.attributes).map(([key, value]) => (
                                        <Badge key={key} variant="outline" className="text-xs">
                                            {key}: {value}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-primary">{formatPrice(selected.price)}</p>
                            {selected.original_price && selected.original_price > selected.price && <p className="text-sm text-muted-foreground line-through">{formatPrice(selected.original_price)}</p>}
                            <p className="text-xs text-muted-foreground mt-1">{selected.stock > 0 ? `${selected.stock} available` : "Out of stock"}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
