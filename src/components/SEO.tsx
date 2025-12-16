import { Helmet } from "react-helmet-async";

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: "website" | "article" | "product";
    keywords?: string;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    noindex?: boolean;
    children?: React.ReactNode;
}

const BASE_URL = "https://kagounga.vercel.app";
const DEFAULT_TITLE = "Kagōunga | Move, Moreover!";
const DEFAULT_DESCRIPTION = "Kagōunga Popeda Instant — makanan tradisional Maluku Utara yang praktis dan lezat. Pesan sekarang dan nikmati kelezatan popeda kapan saja!";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = "Kagōunga";

export const SEO = ({
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    url,
    type = "website",
    keywords = "popeda, makanan tradisional, maluku utara, kagounga, popeda instant",
    author = "Kagōunga",
    publishedTime,
    modifiedTime,
    noindex = false,
    children,
}: SEOProps) => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
    const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
    const fullImage = image.startsWith("http") ? image : `${BASE_URL}${image}`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
            <link rel="canonical" href={fullUrl} />

            {/* Robots */}
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="id_ID" />

            {/* Article specific */}
            {type === "article" && publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {type === "article" && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {type === "article" && <meta property="article:author" content={author} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@kagounga" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />

            {/* Additional children (for JSON-LD etc) */}
            {children}
        </Helmet>
    );
};

// JSON-LD Structured Data Components
export const OrganizationSchema = () => (
    <Helmet>
        <script type="application/ld+json">
            {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Kagōunga",
                url: BASE_URL,
                logo: `${BASE_URL}/logo/logo_white.svg`,
                description: DEFAULT_DESCRIPTION,
                address: {
                    "@type": "PostalAddress",
                    addressRegion: "Maluku Utara",
                    addressCountry: "ID",
                },
                sameAs: ["https://instagram.com/kagounga", "https://twitter.com/kagounga"],
            })}
        </script>
    </Helmet>
);

interface ProductSchemaProps {
    name: string;
    description: string;
    image: string;
    price: number;
    currency?: string;
    sku?: string;
    availability?: "InStock" | "OutOfStock" | "PreOrder";
}

export const ProductSchema = ({ name, description, image, price, currency = "IDR", sku, availability = "InStock" }: ProductSchemaProps) => (
    <Helmet>
        <script type="application/ld+json">
            {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Product",
                name,
                description,
                image: image.startsWith("http") ? image : `${BASE_URL}${image}`,
                brand: {
                    "@type": "Brand",
                    name: "Kagōunga",
                },
                offers: {
                    "@type": "Offer",
                    price,
                    priceCurrency: currency,
                    availability: `https://schema.org/${availability}`,
                    seller: {
                        "@type": "Organization",
                        name: "Kagōunga",
                    },
                },
                ...(sku && { sku }),
            })}
        </script>
    </Helmet>
);

interface BreadcrumbItem {
    name: string;
    url: string;
}

export const BreadcrumbSchema = ({ items }: { items: BreadcrumbItem[] }) => (
    <Helmet>
        <script type="application/ld+json">
            {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: items.map((item, index) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    name: item.name,
                    item: `${BASE_URL}${item.url}`,
                })),
            })}
        </script>
    </Helmet>
);
