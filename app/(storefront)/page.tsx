import db from "@/lib/db";
import HeroSection from "@/components/storefront/HeroSection";
import ValuesSection from "@/components/storefront/ValuesSection";
import HorizontalProducts from "@/components/storefront/HorizontalProducts";
import TrustSection from "@/components/storefront/TrustSection";
import TestimonialsCarousel from "@/components/storefront/TestimonialsCarousel";

export default async function Homepage() {
  const dbProducts = await db.product.findMany({
    where: { featured: true, isPublished: true },
    take: 6,
    include: { images: true }
  });

  // Fetch ALL dynamic CMS sections
  const sections = await db.homepageSection.findMany({
    orderBy: { position: 'asc' }
  });

  const heroSection = sections.find(s => s.type === 'hero');
  const valuesSection = sections.find(s => s.type === 'values');

  // Parse JSON if available
  const heroContent = heroSection?.content ? JSON.parse(heroSection.content) : null;
  const valuesContent = valuesSection?.content ? JSON.parse(valuesSection.content) : null;

  const showHero = heroSection ? heroSection.isEnabled : true;
  const showValues = valuesSection ? valuesSection.isEnabled : true;

  return (
    <>
      {showHero && <HeroSection content={heroContent} />}
      
      {showValues && <ValuesSection content={valuesContent} />}

      <HorizontalProducts products={dbProducts} />

      <TrustSection />
      
      <TestimonialsCarousel />
    </>
  );
}
