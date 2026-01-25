import { useTranslation } from "react-i18next";

const partnerLogos = [
    { name: "Radio Insania Network", logo: "/partners/RadioInsaniaNetwork.png" },
    { name: "Bank Indonesia", logo: "/partners/BankIndonesia.png" },
    { name: "Bela Hotel", logo: "/partners/BelaHotel.svg" },
    { name: "RRI Ternate", logo: "/partners/RRI_Ternate_2023.svg" },
    { name: "Hypermart", logo: "/partners/Logo_Hypermart.svg" },
    { name: "Netrilis", logo: "/partners/Netrilis.png" },
    { name: "Pos Indonesia", logo: "/partners/POSIND.svg" },
    { name: "Wonderful Ternate", logo: "/partners/WonderfulTeranate.PNG" },
    { name: "Puta Dino", logo: "/partners/PutaDino.png" },
    { name: "Dispar", logo: "/partners/Dispar2.svg" },
    { name: "Arunika", logo: "/partners/Arunika.svg" },
    { name: "Halmaheranesia", logo: "/partners/halmaheranesia.svg" },
];

export function StrategicPartners() {
    const { t } = useTranslation();

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
                <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent z-10" />

                {/* Scrolling track - contains two identical sets for seamless loop */}
                <div className="partner-scroll-container">
                    <div className="partner-scroll-track">
                        {/* First set */}
                        {partnerLogos.map((partner, idx) => (
                            <div key={`set1-${partner.name}-${idx}`} className="partner-item">
                                <img src={partner.logo} alt={partner.name} className="h-full w-auto object-contain filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" loading="lazy" />
                            </div>
                        ))}
                        {/* Second set (duplicate for seamless loop) */}
                        {partnerLogos.map((partner, idx) => (
                            <div key={`set2-${partner.name}-${idx}`} className="partner-item">
                                <img src={partner.logo} alt={partner.name} className="h-full w-auto object-contain filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" loading="lazy" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .partner-scroll-container {
                    width: 100%;
                    overflow: hidden;
                }
                
                .partner-scroll-track {
                    display: flex;
                    gap: 3rem;
                    width: max-content;
                    animation: partner-scroll 20s linear infinite;
                }
                
                .partner-item {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 2.5rem;
                    width: 7rem;
                }
                
                @keyframes partner-scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(calc(-50% - 1.5rem));
                    }
                }
                
                .partner-scroll-track:hover {
                    animation-play-state: paused;
                }
                
                /* Faster animation on mobile */
                @media (max-width: 640px) {
                    .partner-scroll-track {
                        gap: 2.5rem;
                        animation-duration: 15s;
                    }
                    .partner-item {
                        height: 2rem;
                        width: 5.5rem;
                    }
                    @keyframes partner-scroll {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(calc(-50% - 1.25rem));
                        }
                    }
                }
                
                /* Larger screens */
                @media (min-width: 767.9px) {
                    .partner-scroll-track {
                        gap: 4rem;
                        animation-duration: 70s;
                    }
                    .partner-item {
                        height: 3rem;
                        width: 8rem;
                    }
                    @keyframes partner-scroll {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(calc(-50% - 2rem));
                        }
                    }
                }
            `}</style>
        </section>
    );
}
