import { Layout } from "@/components/layout/Layout";
import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Features } from "@/components/home/Features";
import { FooterCTA } from "@/components/home/FooterCTA";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <FeaturedProducts />
      <Features />
      <FooterCTA />
    </Layout>
  );
};

export default Index;
