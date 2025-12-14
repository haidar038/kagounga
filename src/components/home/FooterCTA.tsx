import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FooterCTA() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-accent px-6 py-12 text-center text-accent-foreground shadow-accent-glow sm:px-12 sm:py-16">
          {/* Background decoration */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Dapatkan Popeda Segera
            </h2>
            <p className="mt-4 text-lg opacity-90">
              Promo khusus untuk pembelian pertama. Diskon 20% + gratis ongkir ke seluruh Indonesia!
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="xl" className="bg-surface text-accent hover:bg-surface/90">
                <Link to="/products">
                  Beli Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="ghost"
                className="border-2 border-accent-foreground/30 text-accent-foreground hover:bg-accent-foreground/10"
              >
                <Link to="/contact">Hubungi Kami</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
