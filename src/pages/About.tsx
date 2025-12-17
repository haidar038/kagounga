import { Layout } from "@/components/layout/Layout";
import { Heart, CircleCheckBig, Users2, Orbit } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";

// Mock Data for Core Attendant
const teamMembers = [
    { name: "Heri Susanto", position: "Founder & CEO", image: "https://kagounga.id/wp-content/uploads/2024/08/heri-susanto.webp" },
    { name: "Aiya Lee", position: "Co-Founder & CMO", image: "https://kagounga.id/wp-content/uploads/2024/08/Aiya.jpg" },
    { name: "Maryam Helida", position: "Graphic Designer", image: "https://kagounga.id/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-05-at-03.15.16_e895f0b1-scaled.jpg" },
    { name: "Shahnaz Salsabila", position: "Visual Artist", image: "https://kagounga.id/wp-content/uploads/2024/08/Anaz.jpg" },
    { name: "Yogo Anumerta", position: "Web Developer", image: "https://kagounga.id/wp-content/uploads/2025/08/11zon_resized.png" },
    { name: "Arunika & Co.", position: "Lead Photographer", image: "https://kagounga.id/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-06-at-22.33.45_30ced1a1.jpg" },
    { name: "Sabey Oscar", position: "Lighting Specialist", image: "https://kagounga.id/wp-content/uploads/2024/08/Sabey.jpg" },
    { name: "Andy Taku", position: "Music Composer", image: "https://kagounga.id/wp-content/uploads/2024/08/andy-bw.webp" },
];

const About = () => {
    const { t } = useTranslation();
    const heroBackground = "https://kagounga.id/wp-content/uploads/2024/07/about-us.webp";
    const mainCoreBg = "https://kagounga.id/wp-content/uploads/2024/08/about-us-3.webp";

    const values = [
        {
            icon: Heart,
            title: t("about.authenticity"),
            description: t("about.authenticityDesc"),
        },
        {
            icon: Orbit,
            title: t("about.sustainability"),
            description: t("about.sustainabilityDesc"),
        },
        {
            icon: CircleCheckBig,
            title: t("about.quality"),
            description: t("about.qualityValueDesc"),
        },
        {
            icon: Users2,
            title: t("about.community"),
            description: t("about.communityDesc"),
        },
    ];

    return (
        <Layout>
            <SEO
                title={t("about.pageLabel")}
                description="Kenali lebih dekat Kagōunga — brand yang berdedikasi melestarikan warisan kuliner Maluku Utara melalui popeda instant berkualitas tinggi."
                url="/about"
                keywords="tentang kagounga, sejarah popeda, maluku utara, tim kagounga"
            />
            {/* 1. Hero */}
            <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="container-page relative z-10 text-center">
                    <p className="section-label text-accent mb-2">{t("about.pageLabel")}</p>
                    <h1 className="font-heading text-4xl font-bold leading-tight sm:text-6xl mb-6">Kagōunga</h1>
                    <div className="mx-auto mt-6 max-w-6xl text-md text-slate-600 sm:text-xl space-y-3">
                        <p>{t("about.heroDescription1")}</p>
                        <p>{t("about.heroDescription2")}</p>
                        <p>{t("about.heroDescription3")}</p>
                    </div>
                </div>
            </section>

            {/* 2. Main Core (Values) */}
            <section
                className="py-16 sm:py-24 bg-fixed bg-center bg-cover"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${mainCoreBg}')`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="container-page relative z-10">
                    <div className="mx-auto mb-16 max-w-2xl text-center">
                        <p className="section-label text-primary mb-2">{t("about.mainCore")}</p>
                        <h2 className="font-heading text-4xl mb-4 font-bold sm:text-6xl text-white">{t("about.values")}</h2>
                        <p className="text-white text-lg">{t("about.valuesDescription")}</p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {values.map((value) => (
                            <div key={value.title} className="group rounded-3xl border border-border bg-card p-8 text-center transition-all hover:-translate-y-1 hover:shadow-lg">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                                    <value.icon className="h-8 w-8 text-lime-600" />
                                </div>
                                <h3 className="font-heading text-xl font-bold mb-3">{value.title}</h3>
                                <p className="text-muted text-sm leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Core Attendant (Team) */}
            <section className="py-16 sm:py-24 bg-secondary/20">
                <div className="container-page">
                    <div className="mx-auto mb-16 max-w-2xl text-center">
                        <p className="section-label mb-2">{t("about.coreAttendant")}</p>
                        <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("about.teamTitle")}</h2>
                        <p className="mt-4 text-muted">{t("about.teamDescription")}</p>
                    </div>

                    {/* Grid 4 columns x 2 rows = 8 items */}
                    <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                        {teamMembers.map((member, idx) => (
                            <div key={idx} className="group flex flex-col items-center text-center transition-all">
                                <div className="aspect-square w-full max-w-[200px] overflow-hidden rounded-full bg-muted mb-4">
                                    <img src={member.image} alt={member.name} className="h-full w-full object-cover filter grayscale transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                </div>
                                <div className="flex flex-col">
                                    <p className="font-bold text-lg">{member.name}</p>
                                    <p className="text-sm text-muted">{member.position}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Our Process (Let's Talk Taste) */}
            <section
                className="relative py-16 sm:py-24 bg-cover bg-center"
                style={{
                    backgroundImage: 'url("https://kagounga.id/wp-content/uploads/2024/07/Picture1.png")',
                }}
            >
                <div className="absolute inset-0 bg-black/60" /> {/* Dark Overlay */}
                <div className="container-page relative z-10 transition-all">
                    <div className="mx-auto mb-16 max-w-2xl text-center">
                        <p className="section-label text-white/90 mb-2">{t("about.ourProcess")}</p>
                        <h2 className="font-heading text-3xl font-bold sm:text-4xl text-white">{t("about.letsTalkTaste")}</h2>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="flex flex-col items-center text-center rounded-3xl bg-white backdrop-blur-md p-8 shadow-lg">
                            <div className="mb-6 flex h-32 w-32 items-center justify-center p-2">
                                <img src="https://kagounga.id/wp-content/uploads/2024/08/fish.png" alt="Harvesting" className="h-full w-full object-contain drop-shadow-md" />
                            </div>
                            <h3 className="font-heading text-xl font-bold mb-3 text-slate-900">{t("about.harvestingTitle")}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">{t("about.harvestingDesc")}</p>
                        </div>

                        <div className="flex flex-col items-center text-center rounded-3xl bg-white backdrop-blur-md p-8 shadow-lg">
                            <div className="mb-6 flex h-32 w-32 items-center justify-center p-2">
                                <img src="https://kagounga.id/wp-content/uploads/2024/08/hand.png" alt="Artisan Crafting" className="h-full w-full object-contain drop-shadow-md" />
                            </div>
                            <h3 className="font-heading text-xl font-bold mb-3 text-slate-900">{t("about.artisanTitle")}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">{t("about.artisanDesc")}</p>
                        </div>

                        <div className="flex flex-col items-center text-center rounded-3xl bg-white backdrop-blur-md p-8 shadow-lg">
                            <div className="mb-6 flex h-32 w-32 items-center justify-center p-2">
                                <img src="https://kagounga.id/wp-content/uploads/2024/08/bowl.png" alt="Quality Assurance" className="h-full w-full object-contain drop-shadow-md" />
                            </div>
                            <h3 className="font-heading text-xl font-bold mb-3 text-slate-900">{t("about.qualityTitle")}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">{t("about.qualityDesc")}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Commitment */}
            <section className="py-16 sm:py-24 bg-primary text-primary-foreground">
                <div className="container-page">
                    <div className="mx-auto max-w-4xl text-center space-y-8">
                        <div>
                            <p className="font-medium opacity-80 mb-2 tracking-widest uppercase text-sm">{t("about.ourCommitment")}</p>
                            <h2 className="font-heading text-lg sm:text-xl">"{t("about.commitmentQuote")}"</h2>
                        </div>
                        <div className="pt-8 border-t border-primary-foreground/20">
                            <p className="text-xl font-medium">- {t("about.commitmentAuthor")}</p>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default About;
