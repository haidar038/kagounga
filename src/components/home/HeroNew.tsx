import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const HERO_BG_URL = "https://i.ibb.co.com/fV8WBdBZ/Gemini-Generated-Image-6ome4d6ome4d6ome.webp";

export function HeroNew() {
    const { t } = useTranslation();

    return (
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden" aria-label="Hero section" aria-describedby="hero-description">
            {/* Background Image with overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${HERO_BG_URL})`,
                }}
                role="img"
                aria-label="Traditional popeda preparation in Maluku Utara"
            >
                {/* Dark overlay for text contrast */}
                <div className="absolute inset-0 bg-foreground/55" />
            </div>

            {/* Content */}
            <div className="container-page relative z-10 py-20 text-center">
                <div className="mx-auto max-w-3xl animate-fade-in">
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-card/20 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-white/90 border border-white/20">
                        <span>🌴</span>
                        <span>{t("hero.badge")}</span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl" id="hero-description">
                        {t("hero.headline")}{" "}
                        <span className="relative inline-block">
                            <span className="relative z-10 text-primary">{t("hero.highlightedText")}</span>
                            <span className="absolute bottom-1 left-0 h-3 w-full bg-primary/30" />
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="mt-6 text-lg leading-relaxed text-white/80 sm:text-xl">{t("hero.subheadline")}</p>

                    {/* CTA Buttons */}
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button asChild variant="hero" size="xl">
                            <Link to="/about">
                                {t("hero.cta")}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="xl" className="border-white/40 text-white hover:bg-white/10">
                            <Link to="/news">
                                <BookOpen className="mr-2 h-5 w-5" />
                                {t("hero.ctaSecondary")}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <div className="h-12 w-6 rounded-full border-2 border-white/40 p-1">
                    <div className="h-2 w-full rounded-full bg-white/60 animate-pulse" />
                </div>
            </div>
        </section>
    );
}
