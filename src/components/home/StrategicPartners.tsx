import { useTranslation } from "react-i18next";

const partnerLogos = [
    { name: "Arunika", logo: "/partners/Arunika.svg" },
    { name: "Bank Indonesia", logo: "/partners/BankIndonesia.png" },
    { name: "Bela Hotel", logo: "/partners/BelaHotel.svg" },
    { name: "Dispar", logo: "/partners/Dispar2.svg" },
    { name: "Hypermart", logo: "/partners/Logo_Hypermart.svg" },
    { name: "Netrilis", logo: "/partners/Netrilis.png" },
    { name: "Pos Indonesia", logo: "/partners/POSIND.svg" },
    { name: "Puta Dino", logo: "/partners/PutaDino.png" },
    { name: "RRI Ternate", logo: "/partners/RRI_Ternate_2023.svg" },
    { name: "Radio Insania Network", logo: "/partners/RadioInsaniaNetwork.png" },
    { name: "Wonderful Ternate", logo: "/partners/WonderfulTeranate.PNG" },
    { name: "Halmaheranesia", logo: "/partners/halmaheranesia.svg" },
];

export function StrategicPartners() {
    const { t } = useTranslation();

    // Duplicate the logos array for seamless infinite loop
    const duplicatedLogos = [...partnerLogos, ...partnerLogos];

    return (
        <section className="py-12 sm:py-16 bg-background overflow-hidden">
            <div className="container-page mb-12">
                <div className="text-center">
                    <p className="section-label mb-3">{t("home.strategicPartners", "Strategic Partners")}</p>
                    <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("home.trustedBy", "Trusted by Leading Organizations")}</h2>
                </div>
            </div>

            {/* Infinite Carousel */}
            <div className="relative">
                {/* Gradient overlays for fade effect */}
                <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-background to-transparent z-10" />

                {/* Scrolling track */}
                <div className="flex items-center animate-scroll gap-16 sm:gap-20">
                    {duplicatedLogos.map((partner, idx) => (
                        <div key={`${partner.name}-${idx}`} className="flex-shrink-0">
                            <div className="flex items-center justify-center h-10 sm:h-12 w-28 sm:w-32">
                                <img src={partner.logo} alt={partner.name} className="h-full w-auto object-contain filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" loading="lazy" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-scroll {
                    animation: scroll 30s linear infinite;
                }
                .animate-scroll:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}
