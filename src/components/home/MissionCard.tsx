import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface MissionContent {
  id: string;
  heading: string;
  paragraph: string;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
}

export function MissionCard() {
  const { data: mission, isLoading } = useQuery({
    queryKey: ["mission-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mission_content")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as MissionContent | null;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 bg-secondary/30">
        <div className="container-page">
          <div className="rounded-3xl bg-card p-8 lg:p-12 animate-pulse">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="h-4 w-24 bg-secondary rounded" />
                <div className="h-8 w-48 bg-secondary rounded" />
                <div className="h-24 w-full bg-secondary rounded" />
                <div className="h-10 w-32 bg-secondary rounded" />
              </div>
              <div className="h-64 lg:h-80 bg-secondary rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!mission) return null;

  return (
    <section className="py-16 sm:py-20 bg-secondary/30">
      <div className="container-page">
        <div className="rounded-3xl bg-card border border-border p-8 lg:p-12 shadow-soft overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content */}
            <div className="order-2 lg:order-1">
              <p className="section-label mb-3">About Kagōunga</p>
              <h2 className="font-heading text-3xl font-bold sm:text-4xl mb-6">
                {mission.heading}
              </h2>
              <p className="text-muted leading-relaxed text-lg mb-8">
                {mission.paragraph}
              </p>
              {mission.cta_url && (
                <Button asChild variant="hero" size="lg">
                  <Link to={mission.cta_url}>
                    {mission.cta_text || "Learn More"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Image */}
            <div className="order-1 lg:order-2">
              {mission.image_url && (
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] lg:aspect-square">
                  <img
                    src={mission.image_url}
                    alt="Kagōunga mission"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
