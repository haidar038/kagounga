import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Scale, FileCheck, AlertCircle, HelpCircle, Mail, ScrollText } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function TermsAndConditions() {
    return (
        <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
            <SEO
                title="Syarat & Ketentuan"
                description="Baca syarat dan ketentuan penggunaan layanan Kagōunga sebelum melakukan pembelian atau menggunakan situs kami."
                url="/terms"
                keywords="syarat ketentuan, terms conditions, aturan penggunaan, kagounga"
            />
            <Navbar />
            <main className="flex-1">
                {/* Header Section */}
                <div
                    className="relative overflow-hidden border-b py-20 md:py-32"
                    style={{
                        backgroundImage: 'url("https://kagounga.id/wp-content/uploads/2025/07/SENSITIVITY-scaled.png")',
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60" />

                    <div className="container-page relative z-10 text-center text-white">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
                            <Scale className="h-8 w-8" />
                        </div>
                        <h1 className="mb-6 font-heading text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-white">Syarat & Ketentuan</h1>
                        <p className="mx-auto max-w-2xl text-lg text-white/90 md:text-xl">Harap baca syarat dan ketentuan ini dengan saksama sebelum menggunakan layanan kami.</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container-page relative z-20 -mt-12 max-w-4xl pb-24">
                    <div className="rounded-2xl border bg-card p-8 shadow-sm md:p-12">
                        <div className="mb-12 border-b pb-8">
                            <p className="font-medium text-muted">
                                Terakhir diperbarui: <span className="text-foreground">{new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</span>
                            </p>
                        </div>

                        <div className="space-y-12">
                            <div className="rounded-xl bg-secondary/50 p-6">
                                <p className="leading-relaxed text-muted-foreground">
                                    Selamat datang di Kagōunga. Dengan mengakses atau menggunakan situs web kami, Anda menyetujui untuk terikat oleh Syarat & Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda
                                    tidak diperkenankan menggunakan layanan kami.
                                </p>
                            </div>

                            <section className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                                        <ScrollText className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-heading text-2xl font-semibold">1. Penggunaan Situs</h2>
                                </div>
                                <div className="pl-13 md:pl-[3.25rem]">
                                    <p className="leading-relaxed text-muted-foreground">Anda setuju untuk menggunakan situs ini hanya untuk tujuan yang sah dan sesuai dengan hukum yang berlaku. Anda dilarang keras untuk:</p>
                                    <ul className="mt-4 space-y-3">
                                        {[
                                            "Menggunakan situs untuk tindakan ilegal atau melanggar hukum.",
                                            "Mengganggu atau merusak integritas atau kinerja situs.",
                                            "Mencoba mendapatkan akses tidak sah ke sistem kami.",
                                            "Menyalin atau mendistribusikan konten tanpa izin tertulis.",
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                                        <FileCheck className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-heading text-2xl font-semibold">2. Akun & Transaksi</h2>
                                </div>
                                <div className="pl-13 md:pl-[3.25rem]">
                                    <p className="mb-4 leading-relaxed text-muted-foreground">Untuk mengakses fitur tertentu, Anda mungkin perlu membuat akun. Anda bertanggung jawab penuh untuk menjaga kerahasiaan kredensial akun Anda.</p>
                                    <p className="leading-relaxed text-muted-foreground">
                                        Kami berhak untuk menolak layanan, membatalkan pesanan, atau menghentikan akun jika kami yakin bahwa perilaku pelanggan melanggar hukum yang berlaku atau merugikan kepentingan kami.
                                    </p>

                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-xl border bg-background p-4">
                                            <h4 className="mb-2 font-semibold">Produk</h4>
                                            <p className="text-sm text-muted-foreground">Kami berusaha menampilkan warna dan gambar seakurat mungkin, namun tidak menjamin akurasi tampilan layar Anda.</p>
                                        </div>
                                        <div className="rounded-xl border bg-background p-4">
                                            <h4 className="mb-2 font-semibold">Harga</h4>
                                            <p className="text-sm text-muted-foreground">Harga dapat berubah sewaktu-waktu tanpa pemberitahuan. Kami berhak membatalkan pesanan dengan harga yang salah.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-heading text-2xl font-semibold">3. Hak Kekayaan Intelektual</h2>
                                </div>
                                <div className="pl-13 md:pl-[3.25rem]">
                                    <p className="leading-relaxed text-muted-foreground">
                                        Seluruh konten yang terdapat dalam situs ini, termasuk namun tidak terbatas pada teks, grafik, logo, tombol ikon, gambar, klip audio, unduhan digital, kompilasi data, dan perangkat lunak adalah milik
                                        Kagōunga atau penyedia kontennya dan dilindungi oleh hukum hak cipta Indonesia dan internasional.
                                    </p>
                                </div>
                            </section>

                            <section className="border-t pt-12 text-center">
                                <h3 className="mb-2 font-heading text-xl font-semibold">Butuh Bantuan?</h3>
                                <p className="mb-6 text-muted-foreground">Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, jangan ragu untuk menghubungi kami.</p>
                                <a
                                    href="mailto:hello@kagounga.id"
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                                >
                                    <HelpCircle className="h-4 w-4" />
                                    Hubungi Support
                                </a>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
