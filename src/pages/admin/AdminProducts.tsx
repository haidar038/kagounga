import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, Pencil, Trash2, Loader2, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductForm, ProductFormData } from "@/components/admin/ProductForm";
import { VariantManager } from "@/components/admin/VariantManager";
import { useAllProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useToggleProductStatus } from "@/hooks/useAdminProducts";
import { useProductCategories } from "@/hooks/useProducts";

const AdminProducts = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

    const { data: products, isLoading } = useAllProducts();
    const { categories } = useProductCategories();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();
    const toggleStatus = useToggleProductStatus();

    // Filter products
    const filteredProducts = products?.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const openCreateDialog = () => {
        setSelectedProduct(null);
        setDialogOpen(true);
    };

    const openEditDialog = (product: any) => {
        setSelectedProduct({
            ...product,
            tags: product.tags?.join(", ") || "",
        });
        setDialogOpen(true);
    };

    const openDeleteDialog = (product: any) => {
        setSelectedProduct(product);
        setDeleteDialogOpen(true);
    };

    const handleSave = async (data: ProductFormData & { id?: string }) => {
        try {
            // Convert tags from string to array if needed
            const tags =
                typeof data.tags === "string"
                    ? data.tags
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                    : data.tags || [];

            const productData = {
                ...data,
                tags,
            };

            if (data.id) {
                // Update existing product - ensure id is string for UpdateProductInput
                await updateProduct.mutateAsync({ ...productData, id: data.id });
            } else {
                // Create new product - Remove id and ensure all required fields are present
                const { id, ...createData } = productData;
                // Explicitly ensure all required fields are present for CreateProductInput
                await createProduct.mutateAsync({
                    slug: createData.slug || "",
                    name: createData.name || "",
                    description: createData.description || "",
                    price: createData.price || 0,
                    image: createData.image || "",
                    category_id: createData.category_id || "",
                    stock: createData.stock || 0,
                    is_active: createData.is_active ?? true,
                    weight_kg: createData.weight_kg || 0.5,
                    // Optional fields
                    long_description: createData.long_description,
                    original_price: createData.original_price,
                    images: createData.images,
                    tags: createData.tags,
                    nutrition_calories: createData.nutrition_calories,
                    nutrition_carbs: createData.nutrition_carbs,
                    nutrition_protein: createData.nutrition_protein,
                    nutrition_fat: createData.nutrition_fat,
                    serving_size: createData.serving_size,
                    prep_time: createData.prep_time,
                });
            }
            setDialogOpen(false);
            setSelectedProduct(null);
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    const handleDelete = async () => {
        if (selectedProduct) {
            await deleteProduct.mutateAsync(selectedProduct.id);
            setDeleteDialogOpen(false);
            setSelectedProduct(null);
        }
    };

    const handleToggleStatus = async (product: any) => {
        await toggleStatus.mutateAsync({
            id: product.id,
            is_active: !product.is_active,
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getStockBadge = (stock: number) => {
        if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
        if (stock < 10)
            return (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Low Stock
                </Badge>
            );
        return (
            <Badge variant="outline" className="text-green-600 border-green-600">
                In Stock
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/admin">
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="font-heading text-3xl font-bold">Product Management</h1>
                        <p className="text-muted mt-1">Manage products, categories, and inventory</p>
                    </div>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Product
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.icon} {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Products Table */}
            <div className="border rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : filteredProducts && filteredProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px]">Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-center">Stock</TableHead>
                                    <TableHead className="text-center">Weight</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="w-12 h-12 rounded-md overflow-hidden bg-muted/10">
                                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">{product.name}</div>
                                                <div className="text-sm text-muted-foreground line-clamp-1">{product.description}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{categories?.find((c) => c.id === product.category_id)?.name || product.category_id}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="space-y-1">
                                                <div className="font-medium">{formatPrice(product.price)}</div>
                                                {product.original_price && <div className="text-sm text-muted-foreground line-through">{formatPrice(product.original_price)}</div>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="space-y-1">
                                                <div className="font-medium">{product.stock}</div>
                                                {getStockBadge(product.stock)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{product.weight_kg ? `${product.weight_kg} kg` : "-"}</TableCell>
                                        <TableCell className="text-center">
                                            <Switch checked={product.is_active} onCheckedChange={() => handleToggleStatus(product)} disabled={toggleStatus.isPending} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(product)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">No products found</h3>
                        <p className="text-muted-foreground mt-1">{searchQuery || categoryFilter !== "all" ? "Try adjusting your filters" : "Get started by creating your first product"}</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
                        <DialogDescription>{selectedProduct ? "Update product information and manage variants" : "Add a new product to your catalog"}</DialogDescription>
                    </DialogHeader>

                    {selectedProduct ? (
                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                                <TabsTrigger value="variants">Variants</TabsTrigger>
                            </TabsList>
                            <TabsContent value="basic" className="mt-4">
                                <ProductForm initialData={selectedProduct} onSubmit={handleSave} onCancel={() => setDialogOpen(false)} isLoading={createProduct.isPending || updateProduct.isPending} />
                            </TabsContent>
                            <TabsContent value="variants" className="mt-4">
                                <VariantManager productId={selectedProduct.id} productName={selectedProduct.name} />
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <ProductForm initialData={selectedProduct} onSubmit={handleSave} onCancel={() => setDialogOpen(false)} isLoading={createProduct.isPending || updateProduct.isPending} />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete "{selectedProduct?.name}". This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {deleteProduct.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminProducts;
