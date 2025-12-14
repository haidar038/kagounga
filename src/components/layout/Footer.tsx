import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border bg-surface">
            <div className="container-page py-12">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo/logo_yellow.svg" alt="Kagounga Logo" className="h-8 w-8" />
                            <span className="font-heading text-xl font-semibold">Kagōunga</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm uppercase text-muted font-semibold">Move, Moreover!</p>
                            <p className="text-sm text-muted">We transcend all boundaries, imaginable.</p>
                        </div>
                        <div className="flex gap-3">
                            <a target="_blank" href="https://www.instagram.com/kagounga.id/" className="rounded-lg bg-secondary p-2 text-muted transition-colors hover:text-foreground">
                                <img className="h-5 w-5" src="https://cdn.simpleicons.org/instagram/535353" />
                            </a>
                            <a target="_blank" href="https://www.facebook.com/profile.php?id=61563199222858&mibextid=ZbWKwL" className="rounded-lg bg-secondary p-2 text-muted transition-colors hover:text-foreground">
                                <img className="h-5 w-5" src="https://cdn.simpleicons.org/facebook/535353" />
                            </a>
                            <a target="_blank" href="https://x.com/kagounga" className="rounded-lg bg-secondary p-2 text-muted transition-colors hover:text-foreground">
                                <img className="h-5 w-5" src="https://cdn.simpleicons.org/x/535353" />
                            </a>
                            <a target="_blank" href="https://threads.net/@kagounga.id" className="rounded-lg bg-secondary p-2 text-muted transition-colors hover:text-foreground">
                                <img className="h-5 w-5" src="https://cdn.simpleicons.org/threads/535353" />
                            </a>
                            <a target="_blank" href="https://www.youtube.com/@Kagounga" className="rounded-lg bg-secondary p-2 text-muted transition-colors hover:text-foreground">
                                <img className="h-5 w-5" src="https://cdn.simpleicons.org/youtube/535353" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="font-heading font-semibold">Navigasi</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/about" className="text-muted transition-colors hover:text-foreground">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link to="/news" className="text-muted transition-colors hover:text-foreground">
                                    News
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-muted transition-colors hover:text-foreground">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link to="/products" className="text-muted transition-colors hover:text-foreground">
                                    Products
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
                                <span>Ternate, Indonesia</span>
                            </li>
                            <li className="flex items-center gap-2 text-muted">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span>+62 811-1538-111</span>
                            </li>
                            <li className="flex items-center gap-2 text-muted">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span>hello@kagounga.id</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    {/* <div className="space-y-4">
                        <h4 className="font-heading font-semibold">Newsletter</h4>
                        <p className="text-sm text-muted">Dapatkan info promo dan produk terbaru.</p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Email Anda"
                                className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none transition-colors focus:border-primary-border focus:ring-2 focus:ring-ring/20"
                            />
                            <button type="submit" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90">
                                Kirim
                            </button>
                        </form>
                    </div> */}
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
