
import Header from "./components/Header";
import HeroCarousel from "./components/HeroCarousel";
import BigBanner from "./components/BigBanner";
import CategoryFilter from "./components/CategoryFilter";
import CampaignBannerMarquee from "./components/CampaignBannerMarquee";
import StudentDeals from "./components/StudentDeals";
import FashionDeals from "./components/FashionDeals";
import ProductGrid from "./components/ProductGrid";
import FlashDeals from "./components/FlashDeals";
import SocialCommerceBanner from "./components/SocialCommerceBanner";

// Header and RiriAI now provided globally by layout

export default function Home() {
  return (
    <div className="w-full" style={{ background: 'var(--bg)' }}>
      <Header />
      <HeroCarousel />
      <CategoryFilter />
      <BigBanner />
      <CampaignBannerMarquee />
      <StudentDeals />
      <FashionDeals />
      <ProductGrid horizontal />
      <FlashDeals />
      <SocialCommerceBanner />
      
    </div>
  );
}