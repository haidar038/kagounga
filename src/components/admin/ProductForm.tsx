import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./ImageUpload";
import { useProductCategories } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";

const productSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    slug: z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    long_description: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    original_price: z.number().min(0).optional().nullable(),
    image: z.string().url("Must be a valid URL"),
    images: z.array(z.string()).optional(),
    category_id: z.string().min(1, "Category is required"),
    stock: z.number().int().min(0, "Stock must be non-negative"),
    weight_kg: z.number().min(0.01, "Weight must be at least 0.01 kg"),
    tags: z.string().optional(),
    nutrition_calories: z.number().int().min(0).optional().nullable(),
    nutrition_carbs: z.number().min(0).optional().nullable(),
    nutrition_protein: z.number().min(0).optional().nullable(),
    nutrition_fat: z.number().min(0).optional().nullable(),
    serving_size: z.string().optional().nullable(),
    prep_time: z.string().optional().nullable(),
    is_active: z.boolean(),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
    initialData?: Partial<ProductFormData & { id: string; tags?: string | string[] }>;
    onSubmit: (data: ProductFormData & { id?: string }) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function ProductForm({ initialData, onSubmit, onCancel, isLoading }: ProductFormProps) {
    const { categories, loading: categoriesLoading } = useProductCategories();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: initialData?.name || "",
            slug: initialData?.slug || "",
            description: initialData?.description || "",
            long_description: initialData?.long_description || "",
            price: initialData?.price || 0,
            original_price: initialData?.original_price || null,
            image: initialData?.image || "",
            images: initialData?.images || [],
            category_id: initialData?.category_id || "",
            stock: initialData?.stock || 0,
            weight_kg: initialData?.weight_kg || 0.5,
            tags: Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : initialData?.tags || "",
            nutrition_calories: initialData?.nutrition_calories || null,
            nutrition_carbs: initialData?.nutrition_carbs || null,
            nutrition_protein: initialData?.nutrition_protein || null,
            nutrition_fat: initialData?.nutrition_fat || null,
            serving_size: initialData?.serving_size || "",
            prep_time: initialData?.prep_time || "",
            is_active: initialData?.is_active ?? true,
        },
    });

    const name = watch("name");

    // Auto-generate slug from name
    useEffect(() => {
        if (!initialData?.slug && name) {
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();
            setValue("slug", slug);
        }
    }, [name, initialData, setValue]);

    const handleFormSubmit = (data: ProductFormData) => {
        onSubmit({
            ...data,
            id: initialData?.id,
        });
    };

    if (categoriesLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input id="name" {...register("name")} placeholder="e.g., Popeda Original" />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug *</Label>
                        <Input id="slug" {...register("slug")} placeholder="e.g., popeda-original" />
                        {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Short Description *</Label>
                    <Textarea id="description" {...register("description")} rows={3} placeholder="Brief product description" />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="long_description">Long Description</Label>
                    <Textarea id="long_description" {...register("long_description")} rows={5} placeholder="Detailed product description" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category_id">Category *</Label>
                    <Select value={watch("category_id")} onValueChange={(value) => setValue("category_id", value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories
                                ?.filter((c) => c.id !== "all")
                                .map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.icon} {category.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    {errors.category_id && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
                </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Pricing & Inventory</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price (IDR) *</Label>
                        <Input id="price" type="number" {...register("price", { valueAsNumber: true })} placeholder="25000" />
                        {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="original_price">Original Price (IDR)</Label>
                        <Input
                            id="original_price"
                            type="number"
                            {...register("original_price", {
                                valueAsNumber: true,
                                setValueAs: (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? null : Number(v)),
                            })}
                            placeholder="32000 (leave empty if no discount)"
                        />
                        <p className="text-xs text-muted-foreground">Only fill this if product has a discount/sale. Leave empty otherwise.</p>
                        {errors.original_price && <p className="text-sm text-destructive">{errors.original_price.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="stock">Stock *</Label>
                        <Input id="stock" type="number" {...register("stock", { valueAsNumber: true })} placeholder="50" />
                        {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="weight_kg">Weight (kg) *</Label>
                    <Input id="weight_kg" type="number" step="0.01" {...register("weight_kg", { valueAsNumber: true })} placeholder="0.5" />
                    {errors.weight_kg && <p className="text-sm text-destructive">{errors.weight_kg.message}</p>}
                </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Images</h3>

                <ImageUpload label="Primary Image *" currentImage={watch("image")} onImageUploaded={(url) => setValue("image", url)} />
                {errors.image && <p className="text-sm text-destructive">{errors.image.message}</p>}
            </div>

            {/* Nutrition (Optional) */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Nutrition Facts (Optional)</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="nutrition_calories">Calories</Label>
                        <Input
                            id="nutrition_calories"
                            type="number"
                            {...register("nutrition_calories", {
                                valueAsNumber: true,
                                setValueAs: (v) => (v === "" ? null : v),
                            })}
                            placeholder="180"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nutrition_carbs">Carbs (g)</Label>
                        <Input
                            id="nutrition_carbs"
                            type="number"
                            step="0.1"
                            {...register("nutrition_carbs", {
                                valueAsNumber: true,
                                setValueAs: (v) => (v === "" ? null : v),
                            })}
                            placeholder="42"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nutrition_protein">Protein (g)</Label>
                        <Input
                            id="nutrition_protein"
                            type="number"
                            step="0.1"
                            {...register("nutrition_protein", {
                                valueAsNumber: true,
                                setValueAs: (v) => (v === "" ? null : v),
                            })}
                            placeholder="2"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nutrition_fat">Fat (g)</Label>
                        <Input
                            id="nutrition_fat"
                            type="number"
                            step="0.1"
                            {...register("nutrition_fat", {
                                valueAsNumber: true,
                                setValueAs: (v) => (v === "" ? null : v),
                            })}
                            placeholder="0.5"
                        />
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Additional Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="serving_size">Serving Size</Label>
                        <Input
                            id="serving_size"
                            {...register("serving_size", {
                                setValueAs: (v) => (v === "" ? null : v),
                            })}
                            placeholder="200g"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="prep_time">Prep Time</Label>
                        <Input
                            id="prep_time"
                            {...register("prep_time", {
                                setValueAs: (v) => (v === "" ? null : v),
                            })}
                            placeholder="5 minutes"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" {...register("tags")} placeholder="bestseller, original, new" />
                </div>

                <div className="flex items-center space-x-2">
                    <Switch id="is_active" checked={watch("is_active")} onCheckedChange={(checked) => setValue("is_active", checked)} />
                    <Label htmlFor="is_active">Active (visible to customers)</Label>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {initialData?.id ? "Update" : "Create"} Product
                </Button>
            </div>
        </form>
    );
}
