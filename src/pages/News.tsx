import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

interface NewsPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    featured_image: string | null;
    published_at: string | null;
}

const News = () => {
    const { data: posts, isLoading } = useQuery({
        queryKey: ["news-posts"],
        queryFn: async () => {
            const { data, error } = await supabase.from("news_posts").select("id, slug, title, excerpt, featured_image, published_at").eq("is_published", true).order("published_at", { ascending: false });

            if (error) throw error;
            return data as NewsPost[];
        },
    });

    return (
        <Layout>
            <SEO
                title="Berita & Artikel"
                description="Baca berita terbaru, cerita, dan artikel menarik dari Kagōunga seputar popeda, kuliner Maluku Utara, dan budaya lokal."
                url="/news"
                keywords="berita kagounga, artikel popeda, news maluku utara, cerita kuliner"
            />
            {/* Hero */}
            <section className="bg-secondary/30 py-16 sm:py-20">
                <div className="container-page text-center">
                    <p className="section-label mb-3">Latest Updates</p>
                    <h1 className="font-heading text-4xl font-bold sm:text-5xl">News & Stories</h1>
                    <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">Stay updated with the latest news, events, and stories from Kagōunga.</p>
                </div>
            </section>

            {/* News Grid */}
            <section className="py-16 sm:py-20">
                <div className="container-page">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse">
                                    <div className="aspect-video bg-secondary" />
                                    <div className="p-6 space-y-3">
                                        <div className="h-4 w-24 bg-secondary rounded" />
                                        <div className="h-6 w-full bg-secondary rounded" />
                                        <div className="h-4 w-3/4 bg-secondary rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : posts && posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <Link key={post.id} to={`/news/${post.slug}`} className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-primary-border hover:shadow-soft transition-all">
                                    {/* Image */}
                                    <div className="aspect-video overflow-hidden bg-secondary">
                                        {post.featured_image ? (
                                            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl">📰</div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        {post.published_at && (
                                            <div className="flex items-center gap-2 text-sm text-muted mb-3">
                                                <Calendar className="h-4 w-4" />
                                                <time dateTime={post.published_at}>{format(new Date(post.published_at), "d MMMM yyyy", { locale: idLocale })}</time>
                                            </div>
                                        )}
                                        <h2 className="font-heading text-xl font-semibold group-hover:text-accent transition-colors line-clamp-2">{post.title}</h2>
                                        {post.excerpt && <p className="mt-2 text-muted line-clamp-2">{post.excerpt}</p>}
                                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                                            Read more <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-4xl mb-4">📭</p>
                            <p className="text-muted">No news posts yet. Check back soon!</p>
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
};

export default News;
