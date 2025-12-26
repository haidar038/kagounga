import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: "sm" | "md" | "lg";
    interactive?: boolean;
    onChange?: (rating: number) => void;
    className?: string;
}

export function StarRating({ rating, maxRating = 5, size = "md", interactive = false, onChange, className }: StarRatingProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };

    const handleClick = (newRating: number) => {
        if (interactive && onChange) {
            onChange(newRating);
        }
    };

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {Array.from({ length: maxRating }, (_, index) => {
                const starValue = index + 1;
                const isFilled = starValue <= Math.floor(rating);
                const isHalfFilled = starValue === Math.ceil(rating) && rating % 1 !== 0;

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleClick(starValue)}
                        disabled={!interactive}
                        className={cn("relative transition-colors", interactive && "cursor-pointer hover:scale-110", !interactive && "cursor-default")}
                        aria-label={`Rate ${starValue} stars`}
                    >
                        {isHalfFilled ? (
                            <div className="relative">
                                <Star className={cn(sizeClasses[size], "text-gray-300")} />
                                <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                                    <Star className={cn(sizeClasses[size], "text-yellow-400")} fill="currentColor" />
                                </div>
                            </div>
                        ) : (
                            <Star className={cn(sizeClasses[size], isFilled ? "text-yellow-400" : "text-gray-300")} fill={isFilled ? "currentColor" : "none"} />
                        )}
                    </button>
                );
            })}
            {!interactive && <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>}
        </div>
    );
}
