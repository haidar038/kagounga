import { Layout } from "@/components/layout/Layout";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";
import { Music2, ExternalLink } from "lucide-react";

// Platform icons as SVG components
const SpotifyIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
);

const AppleMusicIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 0 0-1.877-.726 10.496 10.496 0 0 0-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.364-1.29.44-2.27 1.22-2.94 2.41-.265.468-.395.972-.495 1.49-.093.49-.12.985-.123 1.48-.004.123-.008.247-.008.37V18.87c.003.19.01.38.024.57.04.6.11 1.19.31 1.75.36 1 .96 1.81 1.83 2.42.49.34 1.03.56 1.61.71.5.12 1.01.18 1.52.21.19.01.38.02.57.02h12.02c.19 0 .38-.01.57-.02.62-.04 1.24-.12 1.84-.33 1.14-.38 2.06-1.03 2.73-2.04.24-.36.43-.74.57-1.15.16-.47.26-.95.31-1.44.04-.4.06-.8.06-1.2V6.13c-.01-.01-.01-.01-.01-.01zm-7.145 5.396l-.008 6.06c0 .24-.02.47-.07.71-.12.54-.38.98-.82 1.32-.44.34-.95.51-1.5.55-.53.04-1.03-.05-1.5-.3-.47-.23-.8-.58-.97-1.07-.21-.58-.09-1.13.27-1.63.32-.46.76-.74 1.3-.88.29-.07.58-.12.88-.15.42-.04.84-.1 1.26-.18.25-.05.37-.18.38-.45V9.54c0-.26-.11-.41-.38-.44l-5.05.97c-.04.01-.07.02-.12.03-.23.06-.32.18-.32.42v7.87c0 .28-.02.56-.09.83-.13.53-.39.97-.84 1.3-.45.34-.96.5-1.53.54-.72.04-1.37-.15-1.92-.62-.33-.28-.54-.64-.64-1.07-.12-.53-.02-1.03.32-1.47.35-.46.8-.74 1.35-.87.28-.07.56-.11.84-.14.41-.04.83-.1 1.24-.18.26-.05.38-.18.38-.45V8.14c0-.18.06-.32.21-.42.15-.1.32-.16.49-.2.13-.02.27-.04.4-.06l6.62-1.27c.16-.03.32-.05.49-.05.29 0 .51.18.53.46.01.1.01.2.01.29z" />
    </svg>
);

const AmazonMusicIcon = () => (
    <img
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MTggNjkwIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiMwMDAwMDAiIHN0eWxlPSJvcGFjaXR5OjE7Ij48cGF0aCAgZD0iTTUyNS4wMDggMjIxdjE1NWMwIDQ3IDIwIDY4IDM4IDk0YzYgOSA3IDE5LTEgMjZjLTE5IDE3LTU3IDQ5LTc2IDY3bC0xLTFjLTYgNi0xNSA3LTIzIDNjLTMzLTI4LTQwLTQxLTU4LTY3Yy01NCA1NS05MiA3My0xNjQgNzNjLTg0IDAtMTUwLTUzLTE1MC0xNTdjMC04MSA0NS0xMzYgMTA3LTE2M2M1NC0yNCAxMzAtMjcgMTg4LTM0di0xNGMwLTI0IDItNTEtMTItNzFjLTEyLTE4LTM3LTI3LTU3LTI3Yy0zOCAwLTcxIDE5LTc5IDYwYy0yIDktOSAxOC0xOCAxOWwtOTctMTBjLTgtMi0xNy0xMC0xNC0yMmMyMi0xMTggMTI4LTE1MiAyMjMtMTUyYzQ5IDAgMTEyIDEzIDE1MCA0OWM0OSA0NiA0NCAxMDYgNDQgMTcybS0xNDAgOTd2LTIxYy03MyAwLTE0OCAxNS0xNDggMTAxYzAgNDMgMjIgNzIgNjAgNzJjMjkgMCA1NC0xNiA3MC00NWMxOS0zNSAxOC02NyAxOC0xMDdtMjk2IDE5MWMxMiAxMS0yIDY4LTggOTNjLTIgNyA1IDkgMTAgM2MzOC00MSAzOS0xMTYgMjktMTI1Yy0xMC0xMC04NS0xMC0xMjYgMjhjLTYgNi00IDEzIDMgMTFjMjYtNiA4MS0yMSA5Mi0xMG0tMjggNDJjMTItMTEtMS0yNC0xMy0xN2MtODMgNDktMTc1IDg0LTI2MSA5NmMtMTI5IDE3LTI1OS0xMy0zNjktNThjLTktNC0xNCA2LTYgMTFjMTA0IDcyIDIzNSAxMjEgMzcyIDEwM2M5OC0xMyAyMDYtNjYgMjc3LTEzNSIvPjwvc3ZnPg=="
        alt=""
        className="w-5 h-5"
    />
);

const YouTubeMusicIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228 18.228 15.432 18.228 12 15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z" />
    </svg>
);

const DeezerIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.81 4.16v3.03H24V4.16h-5.19zM6.27 8.38v3.027h5.189V8.38h-5.19zm12.54 0v3.027H24V8.38h-5.19zM0 12.62v3.028h5.19V12.62H0zm6.27 0v3.028h5.189V12.62h-5.19zm6.27 0v3.028h5.189V12.62h-5.19zm6.27 0v3.028H24V12.62h-5.19zM0 16.81v3.028h5.19v-3.027H0zm6.27 0v3.028h5.189v-3.027h-5.19zm6.27 0v3.028h5.189v-3.027h-5.19zm6.27 0v3.028H24v-3.027h-5.19z" />
    </svg>
);

// Mock data for songs
const songs = [
    {
        id: 1,
        title: "Walking Shark",
        artist: "Kagōunga",
        album: "Kagounga",
        releaseDate: "2025",
        coverImage: "https://i.ibb.co.com/qF0DnCjm/Kagounga-Artist.jpg",
        spotifyEmbed: "https://open.spotify.com/embed/artist/4TSp3l3tAtUr04jdHkqsNO?utm_source=generator&theme=0",
        platforms: {
            spotify: "https://open.spotify.com/track/2W7mqRXUmpJLnWPdIUUwh8?si=d5624230cd1d4843",
            appleMusic: "https://music.apple.com/id/album/walking-shark-single/1830258778?l=id",
            youtubeMusic: "https://youtu.be/t02jxzSR4UA?si=RPEs-TXPqSVNjOLT",
            amazonMusic: "https://amazon.com/music/player/albums/B0FKHD8DFB?marketplaceId=ATVPDKIKX0DER&musicTerritory=US&ref=dm_sh_hmJWfS5XRkvK0q1WIXYeDVn0H",
            deezer: "https://www.deezer.com/track/1234567890",
        },
    },
];

const platformConfig = [
    { key: "spotify", icon: SpotifyIcon, label: "Spotify", color: "#1DB954" },
    { key: "appleMusic", icon: AppleMusicIcon, label: "Apple Music", color: "#FA243C" },
    { key: "youtubeMusic", icon: YouTubeMusicIcon, label: "YouTube Music", color: "#FF0000" },
    { key: "amazonMusic", icon: AmazonMusicIcon, label: "Amazon Music", color: "#FF9900" },
    { key: "deezer", icon: DeezerIcon, label: "Deezer", color: "#FEAA2D" },
];

const Music = () => {
    const { t } = useTranslation();

    return (
        <Layout>
            <SEO
                title={t("music.pageTitle", "Our Music")}
                description="Listen to original music by Kagōunga. Discover our brand songs on Spotify, Apple Music, YouTube Music, and more."
                url="/music"
                keywords="kagounga music, maluku utara music, ternate songs, andy taku"
            />

            {/* Hero */}
            <section className="bg-gradient-to-br from-accent/10 via-background to-background py-16 sm:py-20">
                <div className="container-page">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="section-label mb-4">{t("music.pageLabel", "Sound of Kagōunga")}</p>
                        <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">{t("music.pageTitle", "Our Music")}</h1>
                        <p className="mt-6 text-lg text-muted">{t("music.pageSubtitle", "Experience the rhythm of Maluku Utara through our original compositions and collaborations.")}</p>
                    </div>
                </div>
            </section>

            {/* Featured Player */}
            <section className="py-12 bg-surface">
                <div className="container-page">
                    <div className="mx-auto max-w-3xl">
                        <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
                            <iframe
                                data-testid="embed-iframe"
                                className="w-full"
                                src="https://open.spotify.com/embed/artist/4TSp3l3tAtUr04jdHkqsNO?utm_source=generator&theme=0"
                                width="100%"
                                height="352"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </section>

            {/* Songs List */}
            <section className="py-16 sm:py-20">
                <div className="container-page">
                    <div className="mb-12">
                        <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("music.allSongs", "All Songs")}</h2>
                        <p className="mt-4 text-muted">{t("music.allSongsDesc", "Browse our complete collection and listen on your favorite platform.")}</p>
                    </div>

                    <div className="space-y-6">
                        {songs.map((song) => (
                            <div key={song.id} className="group flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border border-border bg-card hover:border-primary-border hover:shadow-lg transition-all duration-300">
                                {/* Cover Image */}
                                <div className="flex-shrink-0 w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-secondary">
                                    <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                                </div>

                                {/* Song Info */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-heading text-xl font-bold flex items-center gap-2">
                                                <Music2 className="w-5 h-5 text-accent" />
                                                {song.title}
                                            </h3>
                                            <p className="text-muted mt-1">{song.artist}</p>
                                            <p className="text-sm text-muted/70 mt-1">
                                                {song.album} • {song.releaseDate}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Platform Links */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {platformConfig.map((platform) => {
                                            const url = song.platforms[platform.key as keyof typeof song.platforms];
                                            if (!url) return null;

                                            return (
                                                <a
                                                    key={platform.key}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-background hover:bg-secondary transition-colors"
                                                    style={
                                                        {
                                                            "--hover-color": platform.color,
                                                        } as React.CSSProperties
                                                    }
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = platform.color;
                                                        e.currentTarget.style.color = platform.color;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = "";
                                                        e.currentTarget.style.color = "";
                                                    }}
                                                >
                                                    <platform.icon />
                                                    {platform.label}
                                                    <ExternalLink className="w-3 h-3 opacity-50" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Spotify Embed (Hidden on mobile, visible on larger screens) */}
                                <div className="hidden lg:block flex-shrink-0 w-80">
                                    <iframe src={song.spotifyEmbed} width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Music Distributors */}
            <section className="py-16 sm:py-20 bg-surface">
                <div className="container-page">
                    <div className="text-center mb-12">
                        <p className="section-label mb-3">{t("music.availableOn", "Available On")}</p>
                        <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("music.distributors", "Music Distributors")}</h2>
                        <p className="mt-4 text-muted max-w-2xl mx-auto">{t("music.distributorsDesc", "Listen to our music on all major streaming platforms worldwide.")}</p>
                    </div>

                    {/* Row 1: 5 logos */}
                    <div className="grid grid-cols-5 gap-6 sm:gap-8 items-center justify-items-center mb-8">
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/Spotify.webp" alt="Spotify" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/apple-music.webp" alt="Apple Music" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/DEEZER.webp" alt="Deezer" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/YouTube-Music.webp" alt="YouTube Music" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/TikTok.webp" alt="TikTok" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                    </div>

                    {/* Row 2: 5 logos */}
                    <div className="grid grid-cols-5 gap-6 sm:gap-8 items-center justify-items-center mb-8">
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/Shazam.webp" alt="Shazam" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/Amazon-Music.webp" alt="Amazon Music" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/JOOX.webp" alt="Joox" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/Tidal.webp" alt="Tidal" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/IHeartRadio.webp" alt="iHeartRadio" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                    </div>

                    {/* Row 3: 6 logos */}
                    <div className="grid grid-cols-6 gap-6 sm:gap-8 items-center justify-items-center">
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/Meta-Musics.webp" alt="Meta Music" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/Soundcloud.webp" alt="Soundcloud" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/7digital.webp" alt="7digital" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/Tencent-Music.webp" alt="Tencent Music" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/Line-Music.webp" alt="Line Music" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                        <div className="group flex items-center justify-center h-12 w-full">
                            <img src="/music/Pandora.webp" alt="Pandora" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 object-contain" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-20 bg-accent text-white">
                <div className="container-page">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="font-heading text-3xl font-bold sm:text-4xl">{t("music.ctaTitle", "Follow Us on Spotify")}</h2>
                        <p className="mt-4 text-white/80">{t("music.ctaDesc", "Stay updated with our latest releases and exclusive content.")}</p>
                        <a
                            href="https://open.spotify.com/artist/0TnOYISbd1XYRBk9myaseg"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 mt-8 px-8 py-4 rounded-full bg-white text-accent font-semibold hover:bg-white/90 transition-colors"
                        >
                            <SpotifyIcon />
                            {t("music.followSpotify", "Follow on Spotify")}
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Music;
