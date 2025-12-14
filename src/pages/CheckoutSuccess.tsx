import { Link } from "react-router-dom";
import { CheckCircle, ShoppingBag, Home } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

const CheckoutSuccess = () => {
  return (
    <Layout>
      <div className="min-h-[70vh] bg-background">
        <div className="container-page py-16 text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-accent-glow">
              <CheckCircle className="h-10 w-10" />
            </div>

            <h1 className="font-heading text-3xl font-bold">Pesanan Berhasil!</h1>
            <p className="mt-3 text-muted">
              Terima kasih telah berbelanja di Kagōunga. Konfirmasi pesanan telah dikirim ke email Anda.
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left">
              <h2 className="font-heading font-semibold">Apa selanjutnya?</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted">
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    1
                  </span>
                  <span>Anda akan menerima email konfirmasi dengan detail pesanan</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    2
                  </span>
                  <span>Pesanan akan diproses dalam 1-2 hari kerja</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    3
                  </span>
                  <span>Nomor resi akan dikirim via email setelah pengiriman</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild variant="outline" size="lg">
                <Link to="/">
                  <Home className="mr-2 h-5 w-5" />
                  Kembali ke Beranda
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link to="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Belanja Lagi
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;
