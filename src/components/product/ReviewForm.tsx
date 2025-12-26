import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReviewFormProps {
    productId: string;
    productName: string;
    onSuccess?: () => void;
}

export function ReviewForm({ productId, productName, onSuccess }: ReviewFormProps) {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [user, setUser] = useState<{ id: string } | null>(null);

    // Check if user is authenticated
    useState(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Validation
        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        if (!title.trim() || !reviewText.trim()) {
            setError("Please fill in all required fields");
            return;
        }

        if (!user && (!guestName.trim() || !guestEmail.trim())) {
            setError("Please provide your name and email");
            return;
        }

        setIsSubmitting(true);

        try {
            // Create properly typed review data object
            const reviewData = {
                product_id: productId,
                rating,
                title: title.trim(),
                review_text: reviewText.trim(),
                status: "pending" as const,
                ...(user
                    ? { user_id: user.id }
                    : {
                          guest_name: guestName.trim(),
                          guest_email: guestEmail.trim(),
                      }),
            };

            const { error: insertError } = await supabase.from("product_reviews").insert(reviewData);

            if (insertError) throw insertError;

            setSuccess(true);
            // Reset form
            setRating(0);
            setTitle("");
            setReviewText("");
            setGuestName("");
            setGuestEmail("");

            if (onSuccess) {
                onSuccess();
            }

            // Auto-hide success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            console.error("Error submitting review:", err);
            setError("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    {t("Write a Review")}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Rating */}
                    <div>
                        <Label htmlFor="rating" className="mb-2 block">
                            {t("Your Rating")} <span className="text-red-500">*</span>
                        </Label>
                        <StarRating rating={rating} interactive onChange={setRating} size="lg" />
                    </div>

                    {/* Guest Info (if not authenticated) */}
                    {!user && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="guest-name">
                                    {t("Your Name")} <span className="text-red-500">*</span>
                                </Label>
                                <Input id="guest-name" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder={t("Enter your name")} disabled={isSubmitting} />
                            </div>
                            <div>
                                <Label htmlFor="guest-email">
                                    {t("Your Email")} <span className="text-red-500">*</span>
                                </Label>
                                <Input id="guest-email" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder={t("Enter your email")} disabled={isSubmitting} />
                            </div>
                        </div>
                    )}

                    {/* Review Title */}
                    <div>
                        <Label htmlFor="review-title">
                            {t("Review Title")} <span className="text-red-500">*</span>
                        </Label>
                        <Input id="review-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Summarize your review")} disabled={isSubmitting} maxLength={100} />
                    </div>

                    {/* Review Text */}
                    <div>
                        <Label htmlFor="review-text">
                            {t("Your Review")} <span className="text-red-500">*</span>
                        </Label>
                        <Textarea id="review-text" value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder={t("Share your experience with this product")} disabled={isSubmitting} rows={5} maxLength={1000} />
                        <p className="text-xs text-gray-500 mt-1">{reviewText.length}/1000 characters</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Success Alert */}
                    {success && (
                        <Alert>
                            <AlertDescription>{t("Thank you for your review! It will be published after moderation.")}</AlertDescription>
                        </Alert>
                    )}

                    {/* Submit Button */}
                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                        <Send className="w-4 h-4 mr-2" />
                        {isSubmitting ? t("Submitting...") : t("Submit Review")}
                    </Button>

                    <p className="text-xs text-gray-500">{t("Your review will be visible after admin approval.")}</p>
                </form>
            </CardContent>
        </Card>
    );
}
