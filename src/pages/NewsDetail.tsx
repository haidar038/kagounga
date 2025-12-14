import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Calendar, ArrowLeft, Share2 } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";

interface NewsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  featured_image: string | null;
  published_at: string | null;
}

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["news-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data as NewsPost | null;
    },
    enabled: !!slug,
  });

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || "",
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <article className="py-16 sm:py-20">
          <div className="container-page max-w-3xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-3/4 bg-secondary rounded" />
              <div className="h-4 w-32 bg-secondary rounded" />
              <div className="aspect-video bg-secondary rounded-2xl" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-secondary rounded" />
                <div className="h-4 w-full bg-secondary rounded" />
                <div className="h-4 w-2/3 bg-secondary rounded" />
              </div>
            </div>
          </div>
        </article>
      </Layout>
    );
  }

  if (!post || error) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="font-heading text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="text-muted mb-6">The article you're looking for doesn't exist.</p>
          <Button asChild variant="hero">
            <Link to="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* SEO Meta would go here in a real app */}
      <article className="py-16 sm:py-20">
        <div className="container-page max-w-3xl">
          {/* Back link */}
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>

          {/* Header */}
          <header className="mb-8">
            <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 mt-6 text-muted">
              {post.published_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.published_at}>
                    {format(new Date(post.published_at), "d MMMM yyyy", { locale: idLocale })}
                  </time>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="ml-auto"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8 rounded-2xl overflow-hidden">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full aspect-video object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-muted leading-relaxed mb-8 font-medium">
              {post.excerpt}
            </p>
          )}

          {/* Body */}
          {post.body && (
            <div className="prose prose-lg max-w-none">
              {post.body.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button asChild variant="outline">
                <Link to="/news">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  More News
                </Link>
              </Button>
              <Button asChild variant="hero">
                <Link to="/products">
                  Explore Products
                </Link>
              </Button>
            </div>
          </footer>
        </div>
      </article>
    </Layout>
  );
};

export default NewsDetail;
