import { useState, useCallback } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadProductImage } from "@/hooks/useAdminProducts";
import { toast } from "sonner";

interface ImageUploadProps {
    onImageUploaded: (url: string) => void;
    currentImage?: string;
    label?: string;
}

export function ImageUpload({ onImageUploaded, currentImage, label = "Product Image" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [dragActive, setDragActive] = useState(false);

    const handleFile = useCallback(
        async (file: File) => {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload an image file");
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must be less than 5MB");
                return;
            }

            try {
                setUploading(true);

                // Create preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);

                // Upload to storage
                const publicUrl = await uploadProductImage(file);
                onImageUploaded(publicUrl);

                toast.success("Image uploaded successfully");
            } catch (error) {
                console.error("Upload error:", error);
                toast.error("Failed to upload image");
                setPreview(null);
            } finally {
                setUploading(false);
            }
        },
        [onImageUploaded]
    );

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
            }
        },
        [handleFile]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            e.preventDefault();
            if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
            }
        },
        [handleFile]
    );

    const handleRemove = useCallback(() => {
        setPreview(null);
        onImageUploaded("");
    }, [onImageUploaded]);

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>

            {preview ? (
                <div className="relative w-full h-48 border-2 border-border rounded-lg overflow-hidden group">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button type="button" variant="destructive" size="sm" onClick={handleRemove} disabled={uploading}>
                            <X className="h-4 w-4 mr-2" />
                            Remove
                        </Button>
                    </div>
                    {uploading && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={`relative w-full h-48 border-2 border-dashed rounded-lg transition-colors ${dragActive ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            {uploading ? (
                                <>
                                    <Loader2 className="h-10 w-10 animate-spin" />
                                    <p className="text-sm">Uploading...</p>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="h-10 w-10" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Drop image here or click to upload</p>
                                        <p className="text-xs mt-1">PNG, JPG, WEBP up to 5MB</p>
                                    </div>
                                </>
                            )}
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleChange} disabled={uploading} />
                    </label>
                </div>
            )}
        </div>
    );
}
