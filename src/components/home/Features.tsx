import { Truck, ShieldCheck, Leaf, Clock } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "100% Alami",
    description: "Dibuat dari sagu pilihan Papua tanpa bahan pengawet atau pewarna buatan.",
  },
  {
    icon: Clock,
    title: "Siap 3 Menit",
    description: "Proses penyajian yang cepat dan praktis. Tinggal tambah air panas!",
  },
  {
    icon: Truck,
    title: "Gratis Ongkir",
    description: "Gratis ongkos kirim untuk pembelian di atas Rp 150.000.",
  },
  {
    icon: ShieldCheck,
    title: "Garansi Kualitas",
    description: "Jaminan uang kembali jika produk tidak sesuai ekspektasi.",
  },
];

export function Features() {
  return (
    <section className="bg-secondary/30 py-16 sm:py-20">
      <div className="container-page">
        <div className="mb-10 text-center">
          <p className="section-label mb-2">Mengapa Kagōunga?</p>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Keunggulan Kami
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary-border hover:shadow-soft"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary-foreground transition-colors group-hover:bg-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
