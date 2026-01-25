import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, Pencil, Trash2, Loader2, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface GalleryImage {
    id: string;
    image_url: string;
    alt_text: string;
    caption: string | null;
    display_order: number;
    created_at: string;
}

const AdminGallery = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
    const [deletingImage, setDeletingImage] = useState<GalleryImage | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        image_url: "",
        alt_text: "",
        caption: "",
        display_order: 0,
    });

    const fetchImages = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from("gallery_images").select("*").order("display_order", { ascending: true });

            if (error) throw error;
            setImages(data || []);
        } catch (error: any) {
            console.error("Error fetching images:", error);
            toast.error("Failed to load gallery images");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const openCreateDialog = () => {
        setEditingImage(null);
        setFormData({
            image_url: "",
            alt_text: "",
            caption: "",
            display_order: images.length,
        });
        setDialogOpen(true);
    };

    const openEditDialog = (image: GalleryImage) => {
        setEditingImage(image);
        setFormData({
            image_url: image.image_url,
            alt_text: image.alt_text,
            caption: image.caption || "",
            display_order: image.display_order,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.image_url.trim() || !formData.alt_text.trim()) {
            toast.error("Image URL and Alt text are required");
            return;
        }

        setIsSaving(true);
        try {
            if (editingImage) {
                const { error } = await supabase
                    .from("gallery_images")
                    .update({
                        image_url: formData.image_url,
                        alt_text: formData.alt_text,
                        caption: formData.caption || null,
                        display_order: formData.display_order,
                    })
                    .eq("id", editingImage.id);

                if (error) throw error;
                toast.success("Image updated successfully");
            } else {
                const { error } = await supabase.from("gallery_images").insert({
                    image_url: formData.image_url,
                    alt_text: formData.alt_text,
                    caption: formData.caption || null,
                    display_order: formData.display_order,
                });

                if (error) throw error;
                toast.success("Image added successfully");
            }

            setDialogOpen(false);
            fetchImages();
        } catch (error: any) {
            console.error("Error saving image:", error);
            toast.error(error.message || "Failed to save image");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingImage) return;

        try {
            const { error } = await supabase.from("gallery_images").delete().eq("id", deletingImage.id);

            if (error) throw error;
            toast.success("Image deleted successfully");
            setDeleteDialogOpen(false);
            setDeletingImage(null);
            fetchImages();
        } catch (error: any) {
            console.error("Error deleting image:", error);
            toast.error(error.message || "Failed to delete image");
        }
    };

    return (
        <div className="space-y-6">
            <Link to="/admin">
                <Button variant="ghost" size="sm">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
            </Link>
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <h1 className="font-heading text-3xl font-bold">Gallery Management</h1>
                <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Image
                </Button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="p-8 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted" />
                    </div>
                ) : images.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-muted">No gallery images yet.</p>
                        <Button onClick={openCreateDialog} className="mt-4">
                            Add your first image
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                        {images.map((image) => (
                            <div key={image.id} className="relative group rounded-lg overflow-hidden bg-secondary aspect-square">
                                <img
                                    src={image.image_url}
                                    alt={image.alt_text}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                                    }}
                                />
                                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => openEditDialog(image)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            setDeletingImage(image);
                                            setDeleteDialogOpen(true);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-2 pt-12 bg-gradient-to-t from-background/90 to-transparent">
                                    <p className="text-sm font-semibold text-foreground truncate">{image.alt_text}</p>
                                    <p className="text-xs font-semibold text-muted">Order: {image.display_order}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingImage ? "Edit Image" : "Add New Image"}</DialogTitle>
                        <DialogDescription>{editingImage ? "Update the image details below." : "Add a new image to the gallery."}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Image URL *</Label>
                            <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://example.com/image.jpg" />
                        </div>
                        {formData.image_url && (
                            <div className="rounded-lg overflow-hidden bg-secondary aspect-video">
                                <img
                                    src={formData.image_url}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                                    }}
                                />
                            </div>
                        )}
                        <div>
                            <Label>Alt Text *</Label>
                            <Input value={formData.alt_text} onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })} placeholder="Descriptive text for accessibility" />
                        </div>
                        <div>
                            <Label>Caption</Label>
                            <Textarea value={formData.caption} onChange={(e) => setFormData({ ...formData, caption: e.target.value })} placeholder="Optional caption" rows={2} />
                        </div>
                        <div>
                            <Label>Display Order</Label>
                            <Input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })} min={0} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingImage ? "Update" : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Image</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this image? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminGallery;
