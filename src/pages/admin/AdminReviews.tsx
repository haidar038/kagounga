import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageSquare, Check, X, Trash2, Search, Filter, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activityLogger";
import { StarRating } from "@/components/product/StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface Review {
    id: string;
    product_id: string;
    rating: number;
    title: string;
    review_text: string;
    user_id: string | null;
    guest_name: string | null;
    guest_email: string | null;
    status: "pending" | "approved" | "rejected";
    helpful_count: number;
    created_at: string;
    products?: {
        name: string;
    };
}

export default function AdminReviews() {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("product_reviews")
                .select(
                    `
          *,
          products (name)
        `,
                )
                .order("created_at", { ascending: false });

            if (filterStatus !== "all") {
                query = query.eq("status", filterStatus);
            }

            const { data, error } = await query;

            if (error) throw error;

            setReviews((data as Review[]) || []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const updateReviewStatus = async (reviewId: string, status: "approved" | "rejected") => {
        try {
            const review = reviews.find((r) => r.id === reviewId);
            if (!review) return;

            const { error } = await supabase
                .from("product_reviews")
                .update({
                    status,
                    moderated_at: new Date().toISOString(),
                })
                .eq("id", reviewId);

            if (error) throw error;

            // Log activity
            await logActivity({
                actionType: status === "approved" ? "approve" : "reject",
                entityType: "review",
                entityId: reviewId,
                entityName: review.title,
                changes: {
                    before: { status: review.status },
                    after: { status },
                },
            });

            fetchReviews();
        } catch (error) {
            console.error("Error updating review status:", error);
        }
    };

    const deleteReview = async (reviewId: string) => {
        if (!confirm(t("Are you sure you want to delete this review?"))) {
            return;
        }

        try {
            const review = reviews.find((r) => r.id === reviewId);
            if (!review) return;

            const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId);

            if (error) throw error;

            // Log activity
            await logActivity({
                actionType: "delete",
                entityType: "review",
                entityId: reviewId,
                entityName: review.title,
            });

            fetchReviews();
        } catch (error) {
            console.error("Error deleting review:", error);
        }
    };

    const bulkApprove = async () => {
        try {
            const reviewIds = Array.from(selectedReviews);

            const { error } = await supabase
                .from("product_reviews")
                .update({
                    status: "approved",
                    moderated_at: new Date().toISOString(),
                })
                .in("id", reviewIds);

            if (error) throw error;

            // Log activity
            await logActivity({
                actionType: "bulk_action",
                entityType: "review",
                entityId: reviewIds.join(","),
                entityName: `Bulk approve ${reviewIds.length} reviews`,
            });

            setSelectedReviews(new Set());
            fetchReviews();
        } catch (error) {
            console.error("Error bulk approving:", error);
        }
    };

    const bulkReject = async () => {
        try {
            const reviewIds = Array.from(selectedReviews);

            const { error } = await supabase
                .from("product_reviews")
                .update({
                    status: "rejected",
                    moderated_at: new Date().toISOString(),
                })
                .in("id", reviewIds);

            if (error) throw error;

            // Log activity
            await logActivity({
                actionType: "bulk_action",
                entityType: "review",
                entityId: reviewIds.join(","),
                entityName: `Bulk reject ${reviewIds.length} reviews`,
            });

            setSelectedReviews(new Set());
            fetchReviews();
        } catch (error) {
            console.error("Error bulk rejecting:", error);
        }
    };

    const toggleSelectReview = (reviewId: string) => {
        const newSelected = new Set(selectedReviews);
        if (newSelected.has(reviewId)) {
            newSelected.delete(reviewId);
        } else {
            newSelected.add(reviewId);
        }
        setSelectedReviews(newSelected);
    };

    const filteredReviews = reviews.filter((review) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            review.title.toLowerCase().includes(searchLower) || review.review_text.toLowerCase().includes(searchLower) || review.products?.name.toLowerCase().includes(searchLower) || review.guest_name?.toLowerCase().includes(searchLower)
        );
    });

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
            pending: "secondary",
            approved: "default",
            rejected: "destructive",
        };
        return <Badge variant={variants[status]}>{t(status)}</Badge>;
    };

    return (
        <div className="space-y-6">
            <Link to="/admin">
                <Button variant="ghost" size="sm">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                </Button>
            </Link>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    <MessageSquare className="w-8 h-8" />
                    {t("Review Management")}
                </h1>
                <p className="text-gray-600">{t("Moderate and manage product reviews")}</p>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input placeholder={t("Search reviews...")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white" />
                    </div>
                </div>
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                    <SelectTrigger className="w-full md:w-[200px] bg-white">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("All Reviews")}</SelectItem>
                        <SelectItem value="pending">{t("Pending")}</SelectItem>
                        <SelectItem value="approved">{t("Approved")}</SelectItem>
                        <SelectItem value="rejected">{t("Rejected")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Bulk Actions */}
            {selectedReviews.size > 0 && (
                <Alert className="mb-4">
                    <AlertDescription className="flex items-center justify-between">
                        <span>
                            {selectedReviews.size} {t("reviews selected")}
                        </span>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={bulkApprove}>
                                <Check className="w-4 h-4 mr-1" />
                                {t("Approve")}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={bulkReject}>
                                <X className="w-4 h-4 mr-1" />
                                {t("Reject")}
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
                    ))}
                </div>
            ) : filteredReviews.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">{t("No reviews found")}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.map((review) => (
                        <Card key={review.id}>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <input type="checkbox" checked={selectedReviews.has(review.id)} onChange={() => toggleSelectReview(review.id)} className="mt-1" />
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{review.title}</h3>
                                                        <p className="text-sm text-gray-500">
                                                            {t("Product")}: {review.products?.name}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">{getStatusBadge(review.status)}</div>
                                                </div>

                                                <div className="flex items-center gap-4 mb-3">
                                                    <StarRating rating={review.rating} size="sm" />
                                                    <span className="text-sm text-gray-500">
                                                        {t("by")} {review.guest_name || t("Anonymous")}
                                                    </span>
                                                    <span className="text-sm text-gray-500">{format(new Date(review.created_at), "PPp")}</span>
                                                </div>

                                                <p className="text-gray-700 mb-3">{review.review_text}</p>

                                                {review.guest_email && (
                                                    <p className="text-sm text-gray-500">
                                                        {t("Email")}: {review.guest_email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 border-t pt-4">
                                        {review.status !== "approved" && (
                                            <Button size="sm" onClick={() => updateReviewStatus(review.id, "approved")}>
                                                <Check className="w-4 h-4 mr-1" />
                                                {t("Approve")}
                                            </Button>
                                        )}
                                        {review.status !== "rejected" && (
                                            <Button size="sm" variant="outline" onClick={() => updateReviewStatus(review.id, "rejected")}>
                                                <X className="w-4 h-4 mr-1" />
                                                {t("Reject")}
                                            </Button>
                                        )}
                                        <Button size="sm" variant="destructive" onClick={() => deleteReview(review.id)}>
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            {t("Delete")}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
