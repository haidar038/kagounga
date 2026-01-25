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

const YouTubeMusicIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228 18.228 15.432 18.228 12 15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z" />
    </svg>
);

const AmazonMusicIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M13.957 17.672c-2.473 1.798-6.057 2.756-9.146 2.756-4.329 0-8.226-1.6-11.178-4.264-.231-.21-.025-.496.253-.332 3.18 1.851 7.115 2.965 11.181 2.965 2.74 0 5.752-.569 8.524-1.746.418-.18.769.274.366.621zm1.044-1.189c-.315-.404-2.087-.191-2.883-.096-.241.028-.279-.182-.061-.335 1.413-.993 3.732-.707 4.003-.374.271.334-.071 2.651-1.396 3.758-.204.17-.398.08-.307-.145.298-.743.967-2.403.644-2.808z" />
        <path d="M10.997 7.106c0-.593.049-1.088-.285-1.613-.264-.426-.688-.688-1.299-.688-.721 0-1.145.551-1.145 1.364 0 1.603 1.436 1.969 2.729 1.969v-1.032zm1.85 4.476c-.121.109-.296.116-.433.043-.609-.506-.717-.741-1.05-1.225-.1 1.028-1.108 1.76-1.952 1.76-1.524 0-2.713-1.201-2.713-3.606 0-1.877.706-3.151 1.916-3.773.75-.376 1.545-.503 2.205-.503.847 0 1.553.101 2.233.401v1.389c-.697-.378-1.184-.535-2.079-.535-1.083 0-1.862.804-1.862 2.082 0 1.365.693 2.255 1.717 2.255.525 0 .925-.222 1.228-.645.16-.236.19-.354.315-.541l1.087.672c.346.588-.18 1.366-.612 1.726z" />
    </svg>
);

const MetaIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a4.518 4.518 0 0 0 1.762 2.77c.82.538 1.75.808 2.735.808 1.408 0 2.688-.56 3.886-1.499l-.195-.238c-.94.716-1.923 1.108-2.962 1.108-.756 0-1.436-.187-2.024-.55a3.893 3.893 0 0 1-1.456-2.261c-.126-.545-.192-1.13-.192-1.748 0-2.445.67-4.857 1.815-6.594 1.084-1.644 2.409-2.583 3.893-2.583 1.168 0 2.139.613 2.938 1.703.863 1.178 1.315 2.847 1.315 4.846 0 .956-.093 1.852-.283 2.667-.173.732-.428 1.376-.757 1.898-.29.46-.63.825-1.01 1.08-.334.224-.695.337-1.076.337-.26 0-.463-.056-.607-.168a.545.545 0 0 1-.22-.468 1.29 1.29 0 0 1 .053-.37l.01-.037c.022-.082.081-.27.161-.513l.011-.033.102-.303c.154-.453.27-.847.356-1.21.095-.397.165-.793.212-1.184a8.89 8.89 0 0 0 .059-.976c0-.627-.052-1.18-.16-1.65a3.179 3.179 0 0 0-.464-1.123c-.21-.326-.48-.58-.796-.754a1.968 1.968 0 0 0-.99-.263c-.422 0-.845.127-1.256.38-.392.24-.76.595-1.09 1.044a8.143 8.143 0 0 0-.972 1.892 11.153 11.153 0 0 0-.703 2.773 11.04 11.04 0 0 0-.107 1.53c0 1.181.197 2.106.592 2.775.395.67.956 1.006 1.682 1.006.611 0 1.193-.202 1.735-.605.541-.402 1.01-.959 1.396-1.67.192.398.448.714.768.948.465.341 1.051.512 1.756.512.689 0 1.34-.187 1.952-.562a5.373 5.373 0 0 0 1.565-1.506c.427-.632.76-1.377.999-2.233.258-.922.387-1.925.387-3.01 0-2.389-.55-4.344-1.648-5.866C10.005 4.96 8.548 4.03 6.915 4.03z" />
        <path d="M21.927 6.58c-.846 0-1.633.382-2.351 1.09-.666.652-1.225 1.564-1.642 2.67A11.764 11.764 0 0 0 17.2 14.1c0 1.32.247 2.376.742 3.168.495.793 1.178 1.19 2.048 1.19.684 0 1.3-.212 1.848-.636.549-.424 1.002-.998 1.36-1.72.357-.722.628-1.56.813-2.513.184-.954.276-1.95.276-2.988 0-.824-.086-1.547-.258-2.167-.173-.62-.418-1.126-.735-1.517a2.736 2.736 0 0 0-1.052-.879 2.837 2.837 0 0 0-1.315-.458zm.23 1.12c.38.057.709.21.984.46.276.25.5.584.673.999.172.416.259.9.259 1.454 0 .87-.108 1.705-.323 2.5-.214.797-.504 1.492-.869 2.085-.365.592-.781 1.06-1.247 1.4-.467.342-.953.513-1.459.513-.59 0-1.048-.252-1.375-.757-.327-.505-.49-1.223-.49-2.155 0-.84.093-1.673.28-2.502.186-.828.449-1.562.788-2.2.34-.638.733-1.15 1.182-1.534.45-.385.927-.576 1.432-.576.058 0 .115.004.166.013z" />
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
            meta: "https://www.facebook.com/kagounga",
            deezer: "https://www.deezer.com/track/1234567890",
        },
    },
];

const platformConfig = [
    { key: "spotify", icon: SpotifyIcon, label: "Spotify", color: "#1DB954" },
    { key: "appleMusic", icon: AppleMusicIcon, label: "Apple Music", color: "#FA243C" },
    { key: "youtubeMusic", icon: YouTubeMusicIcon, label: "YouTube Music", color: "#FF0000" },
    { key: "amazonMusic", icon: AmazonMusicIcon, label: "Amazon Music", color: "#FF9900" },
    { key: "meta", icon: MetaIcon, label: "Meta", color: "#0081FB" },
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

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-6 sm:gap-8 items-center justify-items-center">
                        {/* Spotify */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#1DB954">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                            </svg>
                        </div>

                        {/* Apple Music */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#FA243C">
                                <path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 0 0-1.877-.726 10.496 10.496 0 0 0-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.364-1.29.44-2.27 1.22-2.94 2.41-.265.468-.395.972-.495 1.49-.093.49-.12.985-.123 1.48-.004.123-.008.247-.008.37V18.87c.003.19.01.38.024.57.04.6.11 1.19.31 1.75.36 1 .96 1.81 1.83 2.42.49.34 1.03.56 1.61.71.5.12 1.01.18 1.52.21.19.01.38.02.57.02h12.02c.19 0 .38-.01.57-.02.62-.04 1.24-.12 1.84-.33 1.14-.38 2.06-1.03 2.73-2.04.24-.36.43-.74.57-1.15.16-.47.26-.95.31-1.44.04-.4.06-.8.06-1.2V6.13c-.01-.01-.01-.01-.01-.01zm-7.145 5.396l-.008 6.06c0 .24-.02.47-.07.71-.12.54-.38.98-.82 1.32-.44.34-.95.51-1.5.55-.53.04-1.03-.05-1.5-.3-.47-.23-.8-.58-.97-1.07-.21-.58-.09-1.13.27-1.63.32-.46.76-.74 1.3-.88.29-.07.58-.12.88-.15.42-.04.84-.1 1.26-.18.25-.05.37-.18.38-.45V9.54c0-.26-.11-.41-.38-.44l-5.05.97c-.04.01-.07.02-.12.03-.23.06-.32.18-.32.42v7.87c0 .28-.02.56-.09.83-.13.53-.39.97-.84 1.3-.45.34-.96.5-1.53.54-.72.04-1.37-.15-1.92-.62-.33-.28-.54-.64-.64-1.07-.12-.53-.02-1.03.32-1.47.35-.46.8-.74 1.35-.87.28-.07.56-.11.84-.14.41-.04.83-.1 1.24-.18.26-.05.38-.18.38-.45V8.14c0-.18.06-.32.21-.42.15-.1.32-.16.49-.2.13-.02.27-.04.4-.06l6.62-1.27c.16-.03.32-.05.49-.05.29 0 .51.18.53.46.01.1.01.2.01.29z" />
                            </svg>
                        </div>

                        {/* Deezer */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-6 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#FEAA2D">
                                <path d="M18.81 4.16v3.03H24V4.16h-5.19zM6.27 8.38v3.027h5.189V8.38h-5.19zm12.54 0v3.027H24V8.38h-5.19zM0 12.62v3.028h5.19V12.62H0zm6.27 0v3.028h5.189V12.62h-5.19zm6.27 0v3.028h5.189V12.62h-5.19zm6.27 0v3.028H24V12.62h-5.19zM0 16.81v3.028h5.19v-3.027H0zm6.27 0v3.028h5.189v-3.027h-5.19zm6.27 0v3.028h5.189v-3.027h-5.19zm6.27 0v3.028H24v-3.027h-5.19z" />
                            </svg>
                        </div>

                        {/* YouTube Music */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#FF0000">
                                <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228 18.228 15.432 18.228 12 15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z" />
                            </svg>
                        </div>

                        {/* TikTok */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-7 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#000000">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                            </svg>
                        </div>

                        {/* Shazam */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#0088FF">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.917 14.508c-.765 2.45-2.725 4.235-5.089 4.789a6.47 6.47 0 0 1-4.07-.357c-1.476-.65-2.652-1.903-3.264-3.46a.434.434 0 0 1 .243-.556.426.426 0 0 1 .549.247c.532 1.354 1.555 2.442 2.836 3.006a5.607 5.607 0 0 0 3.526.308c2.052-.479 3.75-2.03 4.416-4.165.42-1.351.368-2.83-.145-4.138-.52-1.326-1.518-2.425-2.766-3.045a5.506 5.506 0 0 0-4.334-.258.43.43 0 0 1-.544-.275.436.436 0 0 1 .273-.55 6.368 6.368 0 0 1 5.018.296c1.444.718 2.598 1.99 3.199 3.526.596 1.513.652 3.22.168 4.782zM11.52 8.235c.72-.168 1.493-.078 2.168.246.673.326 1.214.87 1.5 1.514.292.655.305 1.415.04 2.087-.265.67-.772 1.223-1.423 1.57-.58.312-1.247.43-1.906.34a.436.436 0 0 1-.365-.494.43.43 0 0 1 .49-.368c.476.064.966-.024 1.38-.245.468-.252.833-.648 1.025-1.131.19-.483.181-1.032-.029-1.504-.21-.469-.593-.858-1.082-1.093-.491-.237-1.051-.295-1.575-.178-.587.134-1.125.494-1.466.989-.342.496-.459 1.114-.324 1.709.078.34.23.658.443.929.113.147.078.358-.068.472a.33.33 0 0 1-.465-.068 3.084 3.084 0 0 1-.613-1.28c-.187-.822-.027-1.684.448-2.374.474-.69 1.217-1.182 2.036-1.371z" />
                            </svg>
                        </div>

                        {/* Amazon Music */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-7 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#FF9900">
                                <path d="M13.957 17.672c-2.473 1.798-6.057 2.756-9.146 2.756-4.329 0-8.226-1.6-11.178-4.264-.231-.21-.025-.496.253-.332 3.18 1.851 7.115 2.965 11.181 2.965 2.74 0 5.752-.569 8.524-1.746.418-.18.769.274.366.621zm1.044-1.189c-.315-.404-2.087-.191-2.883-.096-.241.028-.279-.182-.061-.335 1.413-.993 3.732-.707 4.003-.374.271.334-.071 2.651-1.396 3.758-.204.17-.398.08-.307-.145.298-.743.967-2.403.644-2.808z" />
                                <path d="M10.997 7.106c0-.593.049-1.088-.285-1.613-.264-.426-.688-.688-1.299-.688-.721 0-1.145.551-1.145 1.364 0 1.603 1.436 1.969 2.729 1.969v-1.032zm1.85 4.476c-.121.109-.296.116-.433.043-.609-.506-.717-.741-1.05-1.225-.1 1.028-1.108 1.76-1.952 1.76-1.524 0-2.713-1.201-2.713-3.606 0-1.877.706-3.151 1.916-3.773.75-.376 1.545-.503 2.205-.503.847 0 1.553.101 2.233.401v1.389c-.697-.378-1.184-.535-2.079-.535-1.083 0-1.862.804-1.862 2.082 0 1.365.693 2.255 1.717 2.255.525 0 .925-.222 1.228-.645.16-.236.19-.354.315-.541l1.087.672c.346.588-.18 1.366-.612 1.726z" />
                            </svg>
                        </div>

                        {/* Joox */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-7 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#00D95F">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.95 16.667c-.598.345-1.283.54-2.006.54-2.187 0-3.96-1.712-3.96-3.823 0-.666.178-1.29.489-1.833l-2.99-5.178a.424.424 0 0 1 .158-.58l1.453-.839a.424.424 0 0 1 .58.158l2.99 5.178c.365-.118.752-.183 1.157-.183 2.188 0 3.96 1.712 3.96 3.823 0 1.054-.44 2.01-1.147 2.71l1.494 2.588a.424.424 0 0 1-.158.58l-1.453.839a.424.424 0 0 1-.58-.158l-1.494-2.588c.374-.118.72-.298 1.026-.533l.48.299z" />
                            </svg>
                        </div>

                        {/* Tidal */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-6 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#000000">
                                <path d="M12.012 3.992L8.008 7.996 4.004 3.992 0 7.996 4.004 12l4.004-4.004L12.012 12l4.004-4.004L20.02 12l4.004-4.004-4.004-4.004-4.004 4.004-4.004-4.004zM12.012 12l-4.004 4.004L12.012 20.008l4.004-4.004L12.012 12z" />
                            </svg>
                        </div>

                        {/* iHeart Radio */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-7 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#C6002B">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182a9.818 9.818 0 1 1 0 19.636 9.818 9.818 0 0 1 0-19.636zM12 6c-1.654 0-3 .803-3 1.8 0 .993.556 3.148.92 4.56.208.808.364 1.44.364 1.44s.128-.632.336-1.44c.364-1.412.92-3.567.92-4.56 0-.997-1.346-1.8-3-1.8zm0 9c-.828 0-1.5.672-1.5 1.5S11.172 18 12 18s1.5-.672 1.5-1.5S12.828 15 12 15z" />
                            </svg>
                        </div>

                        {/* Meta Music */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-7 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#0081FB">
                                <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a4.518 4.518 0 0 0 1.762 2.77c.82.538 1.75.808 2.735.808 1.408 0 2.688-.56 3.886-1.499l-.195-.238c-.94.716-1.923 1.108-2.962 1.108-.756 0-1.436-.187-2.024-.55a3.893 3.893 0 0 1-1.456-2.261c-.126-.545-.192-1.13-.192-1.748 0-2.445.67-4.857 1.815-6.594 1.084-1.644 2.409-2.583 3.893-2.583 1.168 0 2.139.613 2.938 1.703.863 1.178 1.315 2.847 1.315 4.846 0 .956-.093 1.852-.283 2.667-.173.732-.428 1.376-.757 1.898-.29.46-.63.825-1.01 1.08-.334.224-.695.337-1.076.337-.26 0-.463-.056-.607-.168a.545.545 0 0 1-.22-.468 1.29 1.29 0 0 1 .053-.37l.01-.037c.022-.082.081-.27.161-.513l.011-.033.102-.303c.154-.453.27-.847.356-1.21.095-.397.165-.793.212-1.184a8.89 8.89 0 0 0 .059-.976c0-.627-.052-1.18-.16-1.65a3.179 3.179 0 0 0-.464-1.123c-.21-.326-.48-.58-.796-.754a1.968 1.968 0 0 0-.99-.263c-.422 0-.845.127-1.256.38-.392.24-.76.595-1.09 1.044a8.143 8.143 0 0 0-.972 1.892 11.153 11.153 0 0 0-.703 2.773 11.04 11.04 0 0 0-.107 1.53c0 1.181.197 2.106.592 2.775.395.67.956 1.006 1.682 1.006.611 0 1.193-.202 1.735-.605.541-.402 1.01-.959 1.396-1.67.192.398.448.714.768.948.465.341 1.051.512 1.756.512.689 0 1.34-.187 1.952-.562a5.373 5.373 0 0 0 1.565-1.506c.427-.632.76-1.377.999-2.233.258-.922.387-1.925.387-3.01 0-2.389-.55-4.344-1.648-5.866C10.005 4.96 8.548 4.03 6.915 4.03z" />
                                <path d="M21.927 6.58c-.846 0-1.633.382-2.351 1.09-.666.652-1.225 1.564-1.642 2.67A11.764 11.764 0 0 0 17.2 14.1c0 1.32.247 2.376.742 3.168.495.793 1.178 1.19 2.048 1.19.684 0 1.3-.212 1.848-.636.549-.424 1.002-.998 1.36-1.72.357-.722.628-1.56.813-2.513.184-.954.276-1.95.276-2.988 0-.824-.086-1.547-.258-2.167-.173-.62-.418-1.126-.735-1.517a2.736 2.736 0 0 0-1.052-.879 2.837 2.837 0 0 0-1.315-.458zm.23 1.12c.38.057.709.21.984.46.276.25.5.584.673.999.172.416.259.9.259 1.454 0 .87-.108 1.705-.323 2.5-.214.797-.504 1.492-.869 2.085-.365.592-.781 1.06-1.247 1.4-.467.342-.953.513-1.459.513-.59 0-1.048-.252-1.375-.757-.327-.505-.49-1.223-.49-2.155 0-.84.093-1.673.28-2.502.186-.828.449-1.562.788-2.2.34-.638.733-1.15 1.182-1.534.45-.385.927-.576 1.432-.576.058 0 .115.004.166.013z" />
                            </svg>
                        </div>

                        {/* SoundCloud */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-6 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#FF5500">
                                <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.084-.1zm-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c.014.057.045.094.09.094s.089-.037.099-.094l.194-1.308-.194-1.332c-.01-.057-.044-.094-.09-.094zm1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.104.106.104.061 0 .12-.044.12-.104l.24-2.474-.24-2.547c0-.06-.045-.104-.12-.104zm.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.544c.016.077.075.138.149.138.075 0 .135-.061.15-.138l.225-2.559-.225-2.625c-.016-.075-.06-.135-.135-.135h-.031zm.96-.405c-.09 0-.149.075-.164.164l-.18 3.03.195 2.715c.016.09.075.164.165.164.09 0 .164-.074.164-.164l.21-2.715-.21-3.045c0-.09-.075-.165-.165-.165l-.015.016zm.989-.12c-.104 0-.179.09-.194.194l-.164 3.135.18 2.745c.015.105.09.18.194.18.104 0 .179-.075.193-.18l.194-2.73-.194-3.15c-.015-.104-.09-.194-.209-.194zm1.02.045c-.12 0-.209.09-.225.209l-.149 3.074.149 2.76c.016.121.105.211.225.211s.21-.09.225-.21l.17-2.76-.155-3.074c-.015-.121-.105-.21-.24-.21zm1.005-.195c-.135 0-.24.105-.255.24l-.12 3.225.135 2.73c.015.121.12.226.255.226.12 0 .24-.105.24-.226l.149-2.73-.15-3.24c-.014-.135-.119-.225-.254-.225zm1.02.48c-.15 0-.255.12-.27.27l-.12 2.97.135 2.716c.015.135.12.254.27.254.135 0 .24-.12.255-.27l.149-2.7-.149-2.985c-.015-.15-.12-.255-.27-.255zm1.02-.915c-.165 0-.285.135-.3.3l-.105 3.6.12 2.715c.015.15.135.285.3.285.15 0 .285-.12.285-.285l.135-2.715-.135-3.6c-.015-.165-.12-.3-.285-.3h-.015zm.99-.285c-.165 0-.3.135-.315.315l-.09 3.885.09 2.7c.014.165.149.3.315.3.149 0 .3-.135.3-.3l.12-2.7-.105-3.885c-.015-.18-.15-.315-.315-.315zm1.02.255c-.18 0-.33.15-.33.33l-.075 3.6.09 2.7c0 .166.15.316.33.316.165 0 .315-.15.315-.316l.105-2.685-.105-3.6c0-.195-.135-.345-.33-.345zm1.005-.555c-.18 0-.345.165-.345.36l-.06 4.11.075 2.67c0 .18.165.345.345.345.195 0 .345-.165.345-.345l.09-2.685-.09-4.095c0-.21-.15-.36-.345-.36h-.015zm1.02-.315c-.195 0-.36.18-.36.375l-.045 4.41.06 2.655c0 .195.165.375.375.375.195 0 .36-.165.375-.375l.075-2.655-.075-4.41c-.015-.195-.18-.375-.39-.375h-.015zm2.34 1.17c-.21-.165-.45-.24-.705-.24-.195 0-.39.045-.555.135-.165-.87-.93-1.515-1.845-1.515-.225 0-.435.045-.63.12-.09.03-.12.075-.12.135v5.37c0 .06.045.12.12.135l4.275.015c.72 0 1.305-.585 1.305-1.305 0-.72-.585-1.305-1.305-1.305-.18 0-.345.03-.51.09-.03-.585-.255-1.125-.615-1.545l.585-.09z" />
                            </svg>
                        </div>

                        {/* 7digital */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <span className="text-xl font-bold filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" style={{ color: "#FF6B00" }}>
                                7digital
                            </span>
                        </div>

                        {/* TME (Tencent Music) */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-7 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#00BE67">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.08c-.163.258-.452.377-.735.377H6.841c-.283 0-.572-.119-.735-.377-.163-.258-.119-.624.044-.852L11.31 8.2c.163-.228.452-.362.735-.362s.572.134.735.362l5.16 8.028c.163.258.119.594-.044.852z" />
                            </svg>
                        </div>

                        {/* Line Music */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-8 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#00C300">
                                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.064-.023.134-.034.199-.034.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                            </svg>
                        </div>

                        {/* Pandora */}
                        <div className="group flex items-center justify-center h-12 w-full">
                            <svg viewBox="0 0 24 24" className="h-7 w-auto filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" fill="#3668FF">
                                <path d="M12.096 0H1.734v24h6.462v-8.148h3.9c5.676 0 10.17-3.792 10.17-7.908S17.772 0 12.096 0zm-.288 11.478H8.196V4.374h3.612c2.664 0 4.416 1.404 4.416 3.552s-1.752 3.552-4.416 3.552z" />
                            </svg>
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
