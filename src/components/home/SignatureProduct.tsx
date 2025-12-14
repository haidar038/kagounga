import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Wheat, Timer, HeartPulse, UtensilsCrossed, Star, LucideIcon } from "lucide-react";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  wheat: Wheat,
  timer: Timer,
  "heart-pulse": HeartPulse,
  "utensils-crossed": UtensilsCrossed,
  star: Star,
};

interface SignaturePoint {
  id: string;
  icon_name: string;
  heading: string;
  description: string;
  display_order: number;
}

export function SignatureProduct() {
  const { data: points, isLoading } = useQuery({
    queryKey: ["signature-points"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signature_points")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as SignaturePoint[];
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 bg-background">
        <div className="container-page">
          <div className="text-center mb-12">
            <div className="h-4 w-32 mx-auto bg-secondary rounded animate-pulse mb-4" />
            <div className="h-8 w-64 mx-auto bg-secondary rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-card animate-pulse">
                <div className="h-12 w-12 rounded-xl bg-secondary mb-4" />
                <div className="h-5 w-3/4 bg-secondary rounded mb-2" />
                <div className="h-4 w-full bg-secondary rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container-page">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="section-label mb-3">Why Choose Us</p>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Signature of Popeda Instant
          </h2>
        </div>

        {/* Points Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {points?.map((point, index) => {
            const IconComponent = iconMap[point.icon_name] || Star;
            return (
              <div
                key={point.id}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary-border hover:shadow-soft transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">
                  {point.heading}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
