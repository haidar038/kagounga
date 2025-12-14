import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container-page relative py-16 sm:py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <div className="max-w-xl animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-foreground">Rasa Autentik Papua</span>
            </div>

            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Popeda Instan,{" "}
              <span className="relative">
                <span className="relative z-10">Praktis</span>
                <span className="absolute bottom-1 left-0 h-3 w-full bg-primary/40" />
              </span>{" "}
              &amp; Lezat
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
              Nikmati kelezatan popeda tradisional Papua kapan saja, di mana saja. 
              Dibuat dari sagu pilihan berkualitas tinggi dengan cita rasa autentik.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button asChild variant="hero" size="xl">
                <Link to="/products">
                  Lihat Produk
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link to="/about">Tentang Kami</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 flex gap-8 border-t border-border pt-8">
              <div>
                <p className="font-heading text-3xl font-bold">5K+</p>
                <p className="text-sm text-muted">Pelanggan Puas</p>
              </div>
              <div>
                <p className="font-heading text-3xl font-bold">4.8</p>
                <p className="text-sm text-muted">Rating Produk</p>
              </div>
              <div>
                <p className="font-heading text-3xl font-bold">100%</p>
                <p className="text-sm text-muted">Bahan Alami</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="relative animate-float">
              {/* Main visual container */}
              <div className="relative h-80 w-80 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-primary-border shadow-glow sm:h-96 sm:w-96">
                <div className="absolute inset-0 flex items-center justify-center text-9xl">
                  🍚
                </div>
                {/* Floating badges */}
                <div className="absolute -left-4 top-10 rounded-2xl bg-card px-4 py-3 shadow-soft">
                  <p className="font-heading text-lg font-bold">3 Menit</p>
                  <p className="text-xs text-muted">Siap Santap</p>
                </div>
                <div className="absolute -right-4 bottom-20 rounded-2xl bg-accent px-4 py-3 text-accent-foreground shadow-accent-glow">
                  <p className="font-heading text-lg font-bold">100% Alami</p>
                  <p className="text-xs opacity-80">Tanpa Pengawet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
