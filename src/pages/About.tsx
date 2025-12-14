import { Layout } from "@/components/layout/Layout";
import { Heart, CircleCheckBig, Users2, Orbit } from "lucide-react";

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

const values = [
    {
        icon: Heart,
        title: "Authenticity",
        description: "We honor the traditional methods and ingredients that define papeda, ensuring every bite offers an authentic taste of heritage.",
    },
    {
        icon: Orbit,
        title: "Sustainability",
        description: "We prioritize environmentally-friendly practices in our production process to benefit our community and the planet.",
    },
    {
        icon: CircleCheckBig,
        title: "Quality",
        description: "We are committed to maintaining the highest standards in our products, sourcing only the finest ingredients for an exceptional experience.",
    },
    {
        icon: Users2,
        title: "Community",
        description: "We believe in the power of community and work to support local farmers, artisans, and partners who share our passion for preserving cultural traditions.",
    },
];

const About = () => {
    const heroBackground = "https://kagounga.id/wp-content/uploads/2024/07/about-us.webp"; // Placeholder Sagu/Maluku Utara vibe
    const mainCoreBg = "https://kagounga.id/wp-content/uploads/2024/08/about-us-3.webp"; // requested image

    return (
        <Layout>
            {/* 1. Hero */}
            <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
                <div className="container-page relative z-10 text-center">
                    <p className="section-label text-accent mb-2">About Us</p>
                    <h1 className="font-heading text-4xl font-bold leading-tight sm:text-6xl mb-6">Kagōunga</h1>
                    <div className="mx-auto mt-6 max-w-6xl text-md text-slate-600 sm:text-xl space-y-3">
                        <p>
                            Kagōunga began with a simple intention: to honor the rich flavors and timeless wisdom of the land we call home. What started as a humble effort to preserve local traditions has grown into a trusted name that
                            stands for quality, authenticity, and heart.
                        </p>

                        <p>
                            Along the way, we have marked many milestones, each one a reflection of our deep respect for culture and craft. From introducing our first creations to expanding into new innovations, our journey has always been
                            guided by the same values: care, excellence, and a deep love for the stories behind every ingredient.
                        </p>
                        <p>Today, Kagōunga is more than a brand. It is a movement rooted in heritage, built with intention, and shaped by the people who believe that good food can carry meaning, memory, and connection.</p>
                    </div>
                </div>
            </section>

            {/* 2. Main Core (Values) */}
            {/*
                Implementation notes:
                - Background image + dark overlay applied via CSS `background-image` using a linear-gradient + url().
                - Parallax effect via `bg-fixed` / backgroundAttachment: 'fixed'.
                - No extra DOM elements used for overlay — overlay handled entirely in CSS.
                - If you want to tweak darkness, adjust the rgba values in the gradient below.
            */}
            <section
                className="py-16 sm:py-24 bg-fixed bg-center bg-cover"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${mainCoreBg}')`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    // backgroundAttachment is handled by the 'bg-fixed' Tailwind class above.
                }}
            >
                <div className="container-page relative z-10">
                    <div className="mx-auto mb-16 max-w-2xl text-center">
                        <p className="section-label text-primary mb-2">Main Core</p>
                        <h2 className="font-heading text-4xl mb-4 font-bold sm:text-6xl text-white">Values</h2>
                        <p className="text-white text-lg">
                            We strive to deliver the highest quality products while honoring the cultural significance of our food. Our commitment to authenticity, quality, and cultural preservation is at the heart of everything we do.
                        </p>
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
                        <p className="section-label mb-2">Core Attendant</p>
                        <h2 className="font-heading text-3xl font-bold sm:text-4xl">The people behind the scenes</h2>
                        <p className="mt-4 text-muted">A dedicated team bringing the flavors of North Maluku to the world.</p>
                    </div>

                    {/* Grid 4 columns x 2 rows = 8 items */}
                    <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                        {teamMembers.map((member, idx) => (
                            <div key={idx} className="group relative overflow-hidden rounded-2xl bg-card transition-all hover:shadow-md">
                                <div className="aspect-[3/4] overflow-hidden bg-muted">
                                    <img src={member.image} alt={member.name} className="h-full w-full object-cover filter grayscale transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                                    <p className="font-bold text-lg">{member.name}</p>
                                    <p className="text-sm text-white/90">{member.position}</p>
                                </div>
                                {/* Fallback visible text if not hovering? Maybe better to always show plain text below */}
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
                        <p className="section-label text-white/90 mb-2">Our Process</p>
                        <h2 className="font-heading text-3xl font-bold sm:text-4xl text-white">Let's Talk Taste</h2>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {/* Manual mapping for images since the data object uses icons currently */}
                        <div className="flex flex-col items-center text-center rounded-3xl bg-white backdrop-blur-md p-8 shadow-lg">
                            <div className="mb-6 flex h-32 w-32 items-center justify-center p-2">
                                <img src="https://kagounga.id/wp-content/uploads/2024/08/fish.png" alt="Harvesting" className="h-full w-full object-contain drop-shadow-md" />
                            </div>
                            <h3 className="font-heading text-xl font-bold mb-3 text-slate-900">Harvesting and Preparation</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">Sago is carefully harvested and thoroughly cleaned to ensure purity.</p>
                        </div>

                        <div className="flex flex-col items-center text-center rounded-3xl bg-white backdrop-blur-md p-8 shadow-lg">
                            <div className="mb-6 flex h-32 w-32 items-center justify-center p-2">
                                <img src="https://kagounga.id/wp-content/uploads/2024/08/hand.png" alt="Artisan Crafting" className="h-full w-full object-contain drop-shadow-md" />
                            </div>
                            <h3 className="font-heading text-xl font-bold mb-3 text-slate-900">Artisan Crafting</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">Skilled artisans use traditional techniques to transform the sago into the smooth, gelatinous texture of Popeda.</p>
                        </div>

                        <div className="flex flex-col items-center text-center rounded-3xl bg-white backdrop-blur-md p-8 shadow-lg">
                            <div className="mb-6 flex h-32 w-32 items-center justify-center p-2">
                                <img src="https://kagounga.id/wp-content/uploads/2024/08/bowl.png" alt="Quality Assurance" className="h-full w-full object-contain drop-shadow-md" />
                            </div>
                            <h3 className="font-heading text-xl font-bold mb-3 text-slate-900">Quality Assurance</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">Each batch undergoes rigorous checks to maintain our high standards before being packaged and delivered.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Commitment */}
            <section className="py-16 sm:py-24 bg-primary text-primary-foreground">
                <div className="container-page">
                    <div className="mx-auto max-w-4xl text-center space-y-8">
                        <div>
                            <p className="font-medium opacity-80 mb-2 tracking-widest uppercase text-sm">Our Commitment</p>
                            <h2 className="font-heading text-lg sm:text-xl">
                                "At Kagōunga, every product is born from a sincere commitment to uphold quality, respect nature, and nurture trust. We work closely with local communities, responsibly source natural ingredients, and follow
                                sustainable practices. To us, a product is more than its final form; it carries a story of people, culture, and conscious choices that create a positive impact on the earth and one another."
                            </h2>
                        </div>
                        <div className="pt-8 border-t border-primary-foreground/20">
                            <p className="text-xl font-medium">- Tim Kagōunga</p>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default About;
