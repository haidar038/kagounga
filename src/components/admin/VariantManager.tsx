import { useState } from "react";
import { ProductVariant } from "@/types/product";
import { useAllProductVariants, useCreateProductVariant, useUpdateProductVariant, useDeleteProductVariant } from "@/hooks/useProductVariants";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VariantManagerProps {
    productId: string;
    productName: string;
}

export function VariantManager({ productId, productName }: VariantManagerProps) {
    const { data: variants, isLoading } = useAllProductVariants(productId);
    const createVariant = useCreateProductVariant();
    const updateVariant = useUpdateProductVariant();
    const deleteVariant = useDeleteProductVariant();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

    // Form state
    const [sku, setSku] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState<number>(0);
    const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
    const [stock, setStock] = useState<number>(0);
    const [displayOrder, setDisplayOrder] = useState<number>(0);
    const [isActive, setIsActive] = useState(true);

    // Attributes (flexible key-value pairs)
    const [attributes, setAttributes] = useState<Record<string, string>>({});
    const [attrKey, setAttrKey] = useState("");
    const [attrValue, setAttrValue] = useState("");

    const resetForm = () => {
        setSku("");
        setName("");
        setPrice(0);
        setOriginalPrice(undefined);
        setStock(0);
        setDisplayOrder(0);
        setIsActive(true);
        setAttributes({});
        setAttrKey("");
        setAttrValue("");
        setEditingVariant(null);
    };

    const openCreateDialog = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const openEditDialog = (variant: ProductVariant) => {
        setEditingVariant(variant);
        setSku(variant.sku);
        setName(variant.name);
        setPrice(variant.price);
        setOriginalPrice(variant.original_price);
        setStock(variant.stock);
        setDisplayOrder(variant.display_order);
        setIsActive(variant.is_active);
        setAttributes(variant.attributes || {});
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!sku || !name || price <= 0) {
            toast.error("Please fill in all required fields");
            return;
        }

        const variantData: any = {
            product_id: productId,
            sku,
            name,
            price,
            original_price: originalPrice || null,
            stock,
            display_order: displayOrder,
            is_active: isActive,
            attributes,
        };

        try {
            if (editingVariant) {
                await updateVariant.mutateAsync({
                    id: editingVariant.id,
                    ...variantData,
                });
            } else {
                await createVariant.mutateAsync(variantData);
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error saving variant:", error);
        }
    };

    const handleDelete = async (variantId: string) => {
        if (confirm("Are you sure you want to delete this variant?")) {
            await deleteVariant.mutateAsync({ id: variantId, productId });
        }
    };

    const addAttribute = () => {
        if (attrKey && attrValue) {
            setAttributes({ ...attributes, [attrKey]: attrValue });
            setAttrKey("");
            setAttrValue("");
        }
    };

    const removeAttribute = (key: string) => {
        const newAttrs = { ...attributes };
        delete newAttrs[key];
        setAttributes(newAttrs);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Product Variants</h3>
                    <p className="text-sm text-muted-foreground">Manage variations for {productName}</p>
                </div>
                <Button onClick={openCreateDialog} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                </Button>
            </div>

            {variants && variants.length > 0 ? (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SKU</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {variants.map((variant) => (
                                <TableRow key={variant.id}>
                                    <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{variant.name}</p>
                                            {Object.entries(variant.attributes || {}).length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {Object.entries(variant.attributes).map(([key, value]) => (
                                                        <Badge key={key} variant="outline" className="text-xs">
                                                            {key}: {value}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-semibold">{formatCurrency(variant.price)}</p>
                                            {variant.original_price && variant.original_price > variant.price && <p className="text-xs text-muted-foreground line-through">{formatCurrency(variant.original_price)}</p>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={variant.stock > 0 ? "default" : "destructive"}>{variant.stock}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={variant.is_active ? "default" : "secondary"}>{variant.is_active ? "Active" : "Inactive"}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(variant)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(variant.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="border rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">No variants yet. Add your first variant to get started.</p>
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingVariant ? "Edit Variant" : "Create New Variant"}</DialogTitle>
                        <DialogDescription>{editingVariant ? "Update variant information" : "Add a new product variant with different pricing and attributes"}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU *</Label>
                                <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="VAR-001" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Variant Name *</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Small (200g)" />
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (IDR) *</Label>
                                <Input id="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="25000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="original_price">Original Price (IDR)</Label>
                                <Input id="original_price" type="number" value={originalPrice || ""} onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)} placeholder="30000" />
                            </div>
                        </div>

                        {/* Stock & Order */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock *</Label>
                                <Input id="stock" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} placeholder="100" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="display_order">Display Order</Label>
                                <Input id="display_order" type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} placeholder="0" />
                            </div>
                        </div>

                        {/* Attributes */}
                        <div className="space-y-2">
                            <Label>Attributes (Optional)</Label>
                            <div className="flex gap-2">
                                <Input placeholder="Key (e.g., size)" value={attrKey} onChange={(e) => setAttrKey(e.target.value)} className="flex-1" />
                                <Input placeholder="Value (e.g., 200g)" value={attrValue} onChange={(e) => setAttrValue(e.target.value)} className="flex-1" />
                                <Button type="button" onClick={addAttribute} variant="outline">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {Object.entries(attributes).length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {Object.entries(attributes).map(([key, value]) => (
                                        <Badge key={key} variant="secondary" className="gap-1">
                                            {key}: {value}
                                            <button onClick={() => removeAttribute(key)} className="ml-1 hover:text-destructive">
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Status */}
                        <div className="flex items-center space-x-2">
                            <input type="checkbox" id="is_active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
                            <Label htmlFor="is_active">Active (visible to customers)</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDialogOpen(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={createVariant.isPending || updateVariant.isPending}>
                            {(createVariant.isPending || updateVariant.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editingVariant ? "Update" : "Create"} Variant
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
