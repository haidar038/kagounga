import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Heart, CircleCheckBig, Users2, Orbit } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Mock Data for Core Attendant
const teamMembers = [
    { name: "Heri Susanto", position: "Founder & CEO", image: "https://kagounga.id/wp-content/uploads/2024/08/heri-susanto.webp" },
    { name: "Aiya Lee", position: "Co-Founder & CMO", image: "https://kagounga.id/wp-content/uploads/2024/08/Aiya.jpg" },
    { name: "Maryam Helida", position: "Graphic Designer", image: "https://kagounga.id/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-05-at-03.15.16_e895f0b1-scaled.jpg" },
    { name: "Shahnaz Salsabila", position: "Visual Artist", image: "https://kagounga.id/wp-content/uploads/2024/08/Anaz.jpg" },
    { name: "M. Khaidar", position: "Web Developer", image: "https://i.ibb.co.com/C3pbzLb1/hdr.webp" },
    { name: "Arunika & Co.", position: "Lead Photographer", image: "https://kagounga.id/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-06-at-22.33.45_30ced1a1.jpg" },
    { name: "Sabey Oscar", position: "Lighting Specialist", image: "https://kagounga.id/wp-content/uploads/2024/08/Sabey.jpg" },
    { name: "Andy Taku", position: "Music Composer", image: "https://kagounga.id/wp-content/uploads/2024/08/andy-bw.webp" },
];

// Collaborators Data
interface Collaborator {
    name: string;
    role: string;
    image: string;
    description: string;
}

const collaborators: Collaborator[] = [
    {
        name: "Partner One",
        role: "Graphic Designer",
        image: "https://kagounga.id/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-05-at-03.15.16_e895f0b1-scaled.jpg",
        description:
            "A dedicated community of local fishermen who provide the freshest ingredients directly from the waters of North Maluku. Their expertise and sustainable practices ensure the highest quality of raw materials for our products.",
    },
    {
        name: "Partner Two",
        role: "Visual Artist",
        image: "https://kagounga.id/wp-content/uploads/2024/08/Anaz.jpg",
        description: "Skilled artisans who have mastered the traditional techniques of sago processing passed down through generations. They bring authenticity and cultural heritage to every product we create together.",
    },
    {
        name: "Partner Three",
        role: "Graphic Designer",
        image: "https://kagounga.id/wp-content/uploads/2024/08/WhatsApp-Image-2024-08-05-at-03.15.16_e895f0b1-scaled.jpg",
        description: "Expert quality controllers who ensure every batch meets our rigorous standards. Their attention to detail guarantees consistency and excellence in all Kagōunga products.",
    },
    {
        name: "Partner Four",
        role: "Visual Artist",
        image: "https://kagounga.id/wp-content/uploads/2024/08/Anaz.jpg",
        description: "Our trusted logistics partners who ensure that Kagōunga products reach customers fresh and on time. They connect the flavors of North Maluku to households across Indonesia and beyond.",
    },
];

const About = () => {
    const { t } = useTranslation();
    const heroBackground = "https://kagounga.id/wp-content/uploads/2024/07/about-us.webp";
    const mainCoreBg = "https://kagounga.id/wp-content/uploads/2024/08/about-us-3.webp";
    const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);

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
                                <div className="aspect-square w-full max-w-[200px] overflow-hidden rounded-full bg-muted/10mb-4">
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

            {/* 4. Collaborators */}
            <section
                className="relative py-16 sm:py-24 bg-cover bg-center"
                style={{
                    backgroundImage: 'url("https://kagounga.id/wp-content/uploads/2024/07/Picture1.png")',
                }}
            >
                <div className="absolute inset-0 bg-black/60" /> {/* Dark Overlay */}
                <div className="container-page relative z-10 transition-all">
                    <div className="mx-auto mb-16 max-w-2xl text-center">
                        <p className="section-label text-white/90 mb-2">{t("about.collaborators")}</p>
                        <h2 className="font-heading text-3xl font-bold sm:text-4xl text-white">{t("about.ourPartners")}</h2>
                    </div>

                    <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
                        {collaborators.map((collaborator, idx) => (
                            <div key={idx} className="group relative aspect-[3/4] overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer" onClick={() => setSelectedCollaborator(collaborator)}>
                                <img src={collaborator.image} alt={collaborator.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
                                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                                    <h3 className="font-heading text-lg sm:text-xl font-bold text-white">{collaborator.name}</h3>
                                    <p className="text-white/70 text-sm mt-1">{collaborator.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Collaborator Profile Dialog */}
            <Dialog open={!!selectedCollaborator} onOpenChange={() => setSelectedCollaborator(null)}>
                <DialogContent className="sm:max-w-lg">
                    {selectedCollaborator && (
                        <>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
                                    <img src={selectedCollaborator.image} alt={selectedCollaborator.name} className="w-full h-full object-cover" />
                                </div>
                                <DialogHeader className="text-center">
                                    <DialogTitle className="text-2xl text-center">{selectedCollaborator.name}</DialogTitle>
                                    <p className="text-accent font-medium text-center">{selectedCollaborator.role}</p>
                                </DialogHeader>
                            </div>
                            <DialogDescription className="text-center text-base leading-relaxed mt-4">{selectedCollaborator.description}</DialogDescription>
                        </>
                    )}
                </DialogContent>
            </Dialog>

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
