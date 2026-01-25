import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NewsPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    body: string | null;
    featured_image: string | null;
    is_published: boolean | null;
    published_at: string | null;
    created_at: string;
}

const AdminNews = () => {
    const [posts, setPosts] = useState<NewsPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
    const [deletingPost, setDeletingPost] = useState<NewsPost | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        body: "",
        featured_image: "",
        is_published: false,
    });

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from("news_posts").select("*").order("created_at", { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error: any) {
            console.error("Error fetching posts:", error);
            toast.error("Failed to load news posts");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
    };

    const openCreateDialog = () => {
        setEditingPost(null);
        setFormData({
            title: "",
            slug: "",
            excerpt: "",
            body: "",
            featured_image: "",
            is_published: false,
        });
        setDialogOpen(true);
    };

    const openEditDialog = (post: NewsPost) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || "",
            body: post.body || "",
            featured_image: post.featured_image || "",
            is_published: post.is_published || false,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title.trim()) {
            toast.error("Title is required");
            return;
        }

        const slug = formData.slug || generateSlug(formData.title);

        setIsSaving(true);
        try {
            if (editingPost) {
                const { error } = await supabase
                    .from("news_posts")
                    .update({
                        title: formData.title,
                        slug,
                        excerpt: formData.excerpt || null,
                        body: formData.body || null,
                        featured_image: formData.featured_image || null,
                        is_published: formData.is_published,
                        published_at: formData.is_published ? new Date().toISOString() : null,
                    })
                    .eq("id", editingPost.id);

                if (error) throw error;
                toast.success("Post updated successfully");
            } else {
                const { error } = await supabase.from("news_posts").insert({
                    title: formData.title,
                    slug,
                    excerpt: formData.excerpt || null,
                    body: formData.body || null,
                    featured_image: formData.featured_image || null,
                    is_published: formData.is_published,
                    published_at: formData.is_published ? new Date().toISOString() : null,
                });

                if (error) throw error;
                toast.success("Post created successfully");
            }

            setDialogOpen(false);
            fetchPosts();
        } catch (error: any) {
            console.error("Error saving post:", error);
            toast.error(error.message || "Failed to save post");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingPost) return;

        try {
            const { error } = await supabase.from("news_posts").delete().eq("id", deletingPost.id);

            if (error) throw error;
            toast.success("Post deleted successfully");
            setDeleteDialogOpen(false);
            setDeletingPost(null);
            fetchPosts();
        } catch (error: any) {
            console.error("Error deleting post:", error);
            toast.error(error.message || "Failed to delete post");
        }
    };

    const togglePublish = async (post: NewsPost) => {
        try {
            const newStatus = !post.is_published;
            const { error } = await supabase
                .from("news_posts")
                .update({
                    is_published: newStatus,
                    published_at: newStatus ? new Date().toISOString() : null,
                })
                .eq("id", post.id);

            if (error) throw error;
            toast.success(newStatus ? "Post published" : "Post unpublished");
            fetchPosts();
        } catch (error: any) {
            console.error("Error toggling publish:", error);
            toast.error("Failed to update post status");
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
                <h1 className="font-heading text-3xl font-bold">News Management</h1>
                <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                </Button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="p-8 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-muted">No news posts yet.</p>
                        <Button onClick={openCreateDialog} className="mt-4">
                            Create your first post
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{post.title}</p>
                                            <p className="text-sm text-muted">/news/{post.slug}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={post.is_published ? "default" : "secondary"} className="cursor-pointer" onClick={() => togglePublish(post)}>
                                            {post.is_published ? (
                                                <>
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Published
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="h-3 w-3 mr-1" />
                                                    Draft
                                                </>
                                            )}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted">{new Date(post.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(post)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setDeletingPost(post);
                                                    setDeleteDialogOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
                        <DialogDescription>{editingPost ? "Update the news post details below." : "Fill in the details for your new post."}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Title *</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                        slug: generateSlug(e.target.value),
                                    });
                                }}
                                placeholder="Post title"
                            />
                        </div>
                        <div>
                            <Label>Slug</Label>
                            <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="url-friendly-slug" />
                        </div>
                        <div>
                            <Label>Excerpt</Label>
                            <Textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Brief summary of the post" rows={2} />
                        </div>
                        <div>
                            <Label>Body</Label>
                            <Textarea value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} placeholder="Full post content (Markdown supported)" rows={8} />
                        </div>
                        <div>
                            <Label>Featured Image URL</Label>
                            <Input value={formData.featured_image} onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })} placeholder="https://example.com/image.jpg" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch checked={formData.is_published} onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })} />
                            <Label>Publish immediately</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingPost ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Post</DialogTitle>
                        <DialogDescription>Are you sure you want to delete "{deletingPost?.title}"? This action cannot be undone.</DialogDescription>
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

export default AdminNews;
