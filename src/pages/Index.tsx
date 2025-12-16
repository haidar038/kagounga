import { Layout } from "@/components/layout/Layout";
import { HeroNew } from "@/components/home/HeroNew";
import { SignatureProduct } from "@/components/home/SignatureProduct";
import { MissionCard } from "@/components/home/MissionCard";
import { ShowcaseGallery } from "@/components/home/ShowcaseGallery";
import { CTASection } from "@/components/home/CTASection";
import { SEO, OrganizationSchema } from "@/components/SEO";

const Index = () => {
    return (
        <Layout>
            <SEO url="/" />
            <OrganizationSchema />
            <HeroNew />
            <SignatureProduct />
            <MissionCard />
            <ShowcaseGallery />
            <CTASection />
        </Layout>
    );
};

export default Index;
