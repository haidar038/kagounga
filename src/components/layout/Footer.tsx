import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <span className="font-heading text-xl font-bold text-primary-foreground">K</span>
              </div>
              <span className="font-heading text-xl font-semibold">Kagōunga</span>
            </div>
            <p className="text-sm text-muted">
              Move, Moreover! Popeda instan berkualitas tinggi dari Papua untuk Indonesia.
            </p>
            <div className="flex gap-3">
              <a href="#" className="rounded-lg bg-secondary p-2 text-muted transition-colors hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg bg-secondary p-2 text-muted transition-colors hover:text-foreground">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg bg-secondary p-2 text-muted transition-colors hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="text-muted transition-colors hover:text-foreground">
                  Produk
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted transition-colors hover:text-foreground">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted transition-colors hover:text-foreground">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold">Kontak</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Jl. Raya Papua No. 123, Jayapura, Papua</span>
              </li>
              <li className="flex items-center gap-2 text-muted">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center gap-2 text-muted">
                <Mail className="h-4 w-4 shrink-0" />
                <span>halo@kagounga.id</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-heading font-semibold">Newsletter</h4>
            <p className="text-sm text-muted">
              Dapatkan info promo dan produk terbaru.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Email Anda"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
              />
              <button
                type="submit"
                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
              >
                Kirim
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted md:flex-row">
          <p>&copy; {new Date().getFullYear()} Kagōunga. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="transition-colors hover:text-foreground">
              Kebijakan Privasi
            </Link>
            <Link to="/terms" className="transition-colors hover:text-foreground">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
