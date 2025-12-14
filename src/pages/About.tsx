import { Layout } from "@/components/layout/Layout";
import { Users, Heart, MapPin, Award } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Autentik",
    description: "Melestarikan cita rasa tradisional Papua yang otentik dalam setiap produk.",
  },
  {
    icon: Users,
    title: "Komunitas",
    description: "Memberdayakan petani sagu lokal dan komunitas Papua.",
  },
  {
    icon: Award,
    title: "Kualitas",
    description: "Standar kualitas tinggi dari pemilihan bahan hingga produksi.",
  },
  {
    icon: MapPin,
    title: "Lokal",
    description: "Produk asli Indonesia untuk pasar Indonesia dan dunia.",
  },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/20 via-background to-background py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <p className="section-label mb-4">Tentang Kami</p>
            <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">
              Move, Moreover!
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              Kagōunga hadir untuk memperkenalkan kelezatan popeda — makanan tradisional Papua — 
              ke seluruh Indonesia dengan cara yang praktis dan modern.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="section-label mb-2">Cerita Kami</p>
              <h2 className="font-heading text-3xl font-bold sm:text-4xl">
                Dari Papua untuk Indonesia
              </h2>
              <div className="mt-6 space-y-4 text-muted">
                <p>
                  Bermula dari kecintaan terhadap kuliner tradisional Papua, Kagōunga didirikan 
                  dengan misi sederhana: membuat popeda dapat dinikmati oleh siapa saja, 
                  kapan saja, di mana saja.
                </p>
                <p>
                  Popeda adalah makanan pokok masyarakat Papua yang dibuat dari tepung sagu. 
                  Dengan tekstur yang unik dan rasa yang khas, popeda biasanya disajikan 
                  bersama ikan kuah kuning dan sambal colo-colo.
                </p>
                <p>
                  Kami bekerja sama langsung dengan petani sagu di Papua untuk memastikan 
                  kualitas bahan baku terbaik sambil mendukung ekonomi lokal.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary/30 to-accent/20">
                <div className="flex h-full items-center justify-center text-[10rem]">
                  🌴
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-card p-4 shadow-soft">
                <p className="font-heading text-3xl font-bold">2023</p>
                <p className="text-sm text-muted">Tahun Berdiri</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary/30 py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="section-label mb-2">Nilai-Nilai Kami</p>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Yang Kami Yakini
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-border bg-card p-6 text-center transition-shadow hover:shadow-soft"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <value.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-lg font-semibold">{value.title}</h3>
                <p className="mt-2 text-sm text-muted">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Quote */}
      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <blockquote className="font-heading text-2xl font-semibold italic sm:text-3xl">
              "Kami percaya bahwa makanan tradisional Indonesia layak mendapatkan 
              tempat di meja makan modern tanpa kehilangan esensinya."
            </blockquote>
            <p className="mt-6 text-muted">— Tim Kagōunga</p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
