import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Lock, Eye, FileText, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";

export default function PrivacyPolicy() {
    const { t, i18n } = useTranslation();

    const section1Items = t("privacy.section1Items", { returnObjects: true }) as string[];
    const section2Items = t("privacy.section2Items", { returnObjects: true }) as string[];

    const formatDate = () => {
        const locale = i18n.language === "id" ? "id-ID" : "en-US";
        return new Date().toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
    };

    return (
        <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
            <SEO
                title={t("privacy.pageTitle")}
                description="Kebijakan privasi Kagōunga menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda."
                url="/privacy"
                keywords="kebijakan privasi, privacy policy, perlindungan data, kagounga"
            />
            <Navbar />
            <main className="flex-1">
                {/* Header Section */}
                <div
                    className="relative overflow-hidden border-b py-20 md:py-32"
                    style={{
                        backgroundImage: 'url("https://kagounga.id/wp-content/uploads/2024/07/Picture1.png")',
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60" />

                    <div className="container-page relative z-10 text-center text-white">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
                            <Shield className="h-8 w-8" />
                        </div>
                        <h1 className="mb-6 font-heading text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl text-white">{t("privacy.pageTitle")}</h1>
                        <p className="mx-auto max-w-2xl text-lg text-white/90 md:text-xl">{t("privacy.pageSubtitle")}</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container-page relative z-20 -mt-12 max-w-4xl pb-24">
                    <div className="rounded-2xl border bg-card p-8 shadow-sm md:p-12">
                        <div className="mb-12 border-b pb-8">
                            <p className="font-medium text-muted">
                                {t("privacy.lastUpdated")}: <span className="text-foreground">{formatDate()}</span>
                            </p>
                        </div>

                        <div className="space-y-12">
                            <section className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                                        <Eye className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-heading text-2xl font-semibold">{t("privacy.section1Title")}</h2>
                                </div>
                                <div className="pl-13 md:pl-[3.25rem]">
                                    <p className="leading-relaxed text-muted-foreground">{t("privacy.section1Intro")}</p>
                                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                                        {section1Items.map((item: string) => (
                                            <li key={item} className="flex items-center gap-2 text-sm font-medium text-foreground">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-heading text-2xl font-semibold">{t("privacy.section2Title")}</h2>
                                </div>
                                <div className="pl-13 md:pl-[3.25rem]">
                                    <p className="leading-relaxed text-muted-foreground">{t("privacy.section2Intro")}</p>
                                    <ul className="mt-4 space-y-3">
                                        {section2Items.map((item: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-heading text-2xl font-semibold">{t("privacy.section3Title")}</h2>
                                </div>
                                <div className="pl-13 md:pl-[3.25rem]">
                                    <p className="mb-4 leading-relaxed text-muted-foreground">{t("privacy.section3Content")}</p>
                                    <div className="rounded-xl bg-accent/5 p-6 ring-1 ring-accent/10">
                                        <p className="text-sm leading-relaxed text-foreground">{t("privacy.section3Note")}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="border-t pt-12 text-center">
                                <h3 className="mb-2 font-heading text-xl font-semibold">{t("privacy.questionsTitle")}</h3>
                                <p className="mb-6 text-muted-foreground">{t("privacy.questionsSubtitle")}</p>
                                <a
                                    href="mailto:hello@kagounga.id"
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                                >
                                    <Mail className="h-4 w-4" />
                                    {t("privacy.contactUs")}
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
