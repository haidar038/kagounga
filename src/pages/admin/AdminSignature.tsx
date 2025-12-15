import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, Pencil, Trash2, Loader2, Star, Leaf, Award, Heart, Sparkles, Coffee } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SignaturePoint {
    id: string;
    heading: string;
    description: string;
    icon_name: string;
    display_order: number;
    created_at: string;
}

const iconOptions = [
    { value: "star", label: "Star", icon: Star },
    { value: "leaf", label: "Leaf", icon: Leaf },
    { value: "award", label: "Award", icon: Award },
    { value: "heart", label: "Heart", icon: Heart },
    { value: "sparkles", label: "Sparkles", icon: Sparkles },
    { value: "coffee", label: "Coffee", icon: Coffee },
];

const getIconComponent = (iconName: string) => {
    const found = iconOptions.find((opt) => opt.value === iconName);
    return found ? found.icon : Star;
};

const AdminSignature = () => {
    const [points, setPoints] = useState<SignaturePoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingPoint, setEditingPoint] = useState<SignaturePoint | null>(null);
    const [deletingPoint, setDeletingPoint] = useState<SignaturePoint | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        heading: "",
        description: "",
        icon_name: "star",
        display_order: 0,
    });

    const fetchPoints = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from("signature_points").select("*").order("display_order", { ascending: true });

            if (error) throw error;
            setPoints(data || []);
        } catch (error: any) {
            console.error("Error fetching signature points:", error);
            toast.error("Failed to load signature points");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPoints();
    }, []);

    const openCreateDialog = () => {
        setEditingPoint(null);
        setFormData({
            heading: "",
            description: "",
            icon_name: "star",
            display_order: points.length,
        });
        setDialogOpen(true);
    };

    const openEditDialog = (point: SignaturePoint) => {
        setEditingPoint(point);
        setFormData({
            heading: point.heading,
            description: point.description,
            icon_name: point.icon_name,
            display_order: point.display_order,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.heading.trim() || !formData.description.trim()) {
            toast.error("Heading and description are required");
            return;
        }

        setIsSaving(true);
        try {
            if (editingPoint) {
                const { error } = await supabase
                    .from("signature_points")
                    .update({
                        heading: formData.heading,
                        description: formData.description,
                        icon_name: formData.icon_name,
                        display_order: formData.display_order,
                    })
                    .eq("id", editingPoint.id);

                if (error) throw error;
                toast.success("Signature point updated successfully");
            } else {
                const { error } = await supabase.from("signature_points").insert({
                    heading: formData.heading,
                    description: formData.description,
                    icon_name: formData.icon_name,
                    display_order: formData.display_order,
                });

                if (error) throw error;
                toast.success("Signature point created successfully");
            }

            setDialogOpen(false);
            fetchPoints();
        } catch (error: any) {
            console.error("Error saving signature point:", error);
            toast.error(error.message || "Failed to save signature point");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingPoint) return;

        try {
            const { error } = await supabase.from("signature_points").delete().eq("id", deletingPoint.id);

            if (error) throw error;
            toast.success("Signature point deleted successfully");
            setDeleteDialogOpen(false);
            setDeletingPoint(null);
            fetchPoints();
        } catch (error: any) {
            console.error("Error deleting signature point:", error);
            toast.error(error.message || "Failed to delete signature point");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <Link to="/admin">
                        <Button variant="ghost" size="sm">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="font-heading text-3xl font-bold">Signature Points</h1>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Point
                </Button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="p-8 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted" />
                    </div>
                ) : points.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-muted">No signature points yet.</p>
                        <Button onClick={openCreateDialog} className="mt-4">
                            Add your first point
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order</TableHead>
                                <TableHead>Icon</TableHead>
                                <TableHead>Heading</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {points.map((point) => {
                                const IconComp = getIconComponent(point.icon_name);
                                return (
                                    <TableRow key={point.id}>
                                        <TableCell className="font-mono">{point.display_order}</TableCell>
                                        <TableCell>
                                            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                                <IconComp className="h-4 w-4 text-accent" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{point.heading}</TableCell>
                                        <TableCell className="text-sm text-muted max-w-xs truncate">{point.description}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEditDialog(point)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setDeletingPoint(point);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPoint ? "Edit Signature Point" : "Add Signature Point"}</DialogTitle>
                        <DialogDescription>{editingPoint ? "Update the signature point details." : "Add a new signature point."}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Icon</Label>
                            <Select value={formData.icon_name} onValueChange={(value) => setFormData({ ...formData, icon_name: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {iconOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            <div className="flex items-center gap-2">
                                                <opt.icon className="h-4 w-4" />
                                                {opt.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Heading *</Label>
                            <Input value={formData.heading} onChange={(e) => setFormData({ ...formData, heading: e.target.value })} placeholder="e.g., Premium Quality" />
                        </div>
                        <div>
                            <Label>Description *</Label>
                            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe this signature point" rows={3} />
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
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingPoint ? "Update" : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Signature Point</DialogTitle>
                        <DialogDescription>Are you sure you want to delete "{deletingPoint?.heading}"? This action cannot be undone.</DialogDescription>
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

export default AdminSignature;
