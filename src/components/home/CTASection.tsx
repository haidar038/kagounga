import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface CTAContent {
    id: string;
    headline: string;
    description: string | null;
    button_text: string | null;
    button_url: string | null;
}

export function CTASection() {
    const { t } = useTranslation();

    const { data: cta, isLoading } = useQuery({
        queryKey: ["cta-content"],
        queryFn: async () => {
            const { data, error } = await supabase.from("cta_content").select("*").limit(1).maybeSingle();

            if (error) throw error;
            return data as CTAContent | null;
        },
    });

    if (isLoading) {
        return (
            <section className="py-16 sm:py-20">
                <div className="container-page">
                    <div className="rounded-3xl bg-accent p-8 lg:p-12 animate-pulse">
                        <div className="text-center space-y-4">
                            <div className="h-8 w-64 mx-auto bg-white/20 rounded" />
                            <div className="h-5 w-96 mx-auto bg-white/20 rounded" />
                            <div className="h-12 w-40 mx-auto bg-white/20 rounded" />
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!cta) return null;

    return (
        <section className="py-16 sm:py-20">
            <div className="container-page">
                <div className="rounded-3xl bg-accent p-8 lg:p-16 text-center">
                    <h2 className="font-heading text-3xl font-bold text-accent-foreground sm:text-4xl lg:text-5xl">{cta.headline}</h2>
                    {cta.description && <p className="mt-4 text-lg text-accent-foreground/80 max-w-2xl mx-auto">{cta.description}</p>}
                    {cta.button_url && (
                        <Button asChild size="xl" className="mt-8 bg-primary text-slate-800 hover:bg-primary/90 font-semibold">
                            <Link to={cta.button_url}>
                                {cta.button_text || t("common.learnMore")}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}
