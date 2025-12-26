import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ThumbsUp, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";

interface Review {
    id: string;
    rating: number;
    title: string;
    review_text: string;
    user_id: string | null;
    guest_name: string | null;
    helpful_count: number;
    created_at: string;
}

interface HelpfulVoteData {
    review_id: string;
    user_id?: string;
    guest_identifier?: string;
}

interface ReviewListProps {
    productId: string;
}

export function ReviewList({ productId }: ReviewListProps) {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<"newest" | "highest" | "helpful">("newest");
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("product_reviews")
                .select("*")
                .eq("product_id", productId)
                .eq("status", "approved")
                .range((page - 1) * pageSize, page * pageSize - 1);

            // Apply sorting
            if (sortBy === "newest") {
                query = query.order("created_at", { ascending: false });
            } else if (sortBy === "highest") {
                query = query.order("rating", { ascending: false });
            } else if (sortBy === "helpful") {
                query = query.order("helpful_count", { ascending: false });
            }

            const { data, error } = await query;

            if (error) throw error;

            if (page === 1) {
                setReviews(data || []);
            } else {
                setReviews((prev) => [...prev, ...(data || [])]);
            }

            setHasMore((data || []).length === pageSize);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    }, [productId, sortBy, page]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleHelpful = async (reviewId: string) => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            const voteData: HelpfulVoteData = {
                review_id: reviewId,
            };

            if (user) {
                voteData.user_id = user.id;
            } else {
                // For guest users, use a simple identifier (could be improved with session)
                voteData.guest_identifier = `guest_${Date.now()}`;
            }

            const { error } = await supabase.from("review_helpful_votes").insert(voteData);

            if (error) {
                if (error.code === "23505") {
                    // Already voted
                    console.log("Already voted on this review");
                } else {
                    throw error;
                }
            } else {
                // Refresh reviews to show updated count
                fetchReviews();
            }
        } catch (error) {
            console.error("Error voting helpful:", error);
        }
    };

    const handleSortChange = (value: string) => {
        setSortBy(value as "newest" | "highest" | "helpful");
        setPage(1);
    };

    const loadMore = () => {
        setPage((prev) => prev + 1);
    };

    if (loading && page === 1) {
        return (
            <div className="space-y-4">
                <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
                <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
            </div>
        );
    }

    if (!loading && reviews.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-gray-500">{t("No reviews yet. Be the first to review this product!")}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Sort Options */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                    {reviews.length} {t("Reviews")}
                </h3>
                <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">{t("Newest First")}</SelectItem>
                        <SelectItem value="highest">{t("Highest Rated")}</SelectItem>
                        <SelectItem value="helpful">{t("Most Helpful")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Reviews */}
            {reviews.map((review) => (
                <Card key={review.id}>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{review.guest_name || t("Anonymous User")}</p>
                                        <p className="text-sm text-gray-500">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</p>
                                    </div>
                                </div>
                                <StarRating rating={review.rating} size="sm" />
                            </div>

                            {/* Review Content */}
                            <div>
                                <h4 className="font-semibold mb-1">{review.title}</h4>
                                <p className="text-gray-700">{review.review_text}</p>
                            </div>

                            {/* Helpful Button */}
                            <div className="flex items-center gap-2 pt-2">
                                <Button variant="ghost" size="sm" onClick={() => handleHelpful(review.id)} className="gap-2">
                                    <ThumbsUp className="w-4 h-4" />
                                    {t("Helpful")} ({review.helpful_count})
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Load More */}
            {hasMore && (
                <div className="text-center">
                    <Button variant="outline" onClick={loadMore} disabled={loading}>
                        {loading ? t("Loading...") : t("Load More Reviews")}
                    </Button>
                </div>
            )}
        </div>
    );
}
