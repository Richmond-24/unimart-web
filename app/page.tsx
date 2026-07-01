
import ClientOnly from "./components/ClientOnly";
import HeroCarousel from "./components/HeroCarousel";
import BigBanner from "./components/BigBanner";
import CategoryFilter from "./components/CategoryFilter";
import CampusTrending from "./components/CampusTrending";
import StudentDeals from "./components/StudentDeals";
import FashionDeals from "./components/FashionDeals";
import ProductGrid from "./components/ProductGrid";
import FlashDeals from "./components/FlashDeals";
import SecondHandDeals from "./components/SecondHandDeals";
import LogoCarousel from "./components/LogoCarousel";
import Greeting from "./components/Greeting";
// Header and RiriAI now provided globally by layout

export default function Home() {
  return (
    <div className="w-full bg-white">
      <ClientOnly>
        <Greeting />
      </ClientOnly>
      <HeroCarousel />
        <CategoryFilter />
        <BigBanner />
      <StudentDeals />
      <FashionDeals />
      <ProductGrid horizontal />
      <FlashDeals />
      <SecondHandDeals />
      <CampusTrending />
      {/* Logos carousel (replaces developer text) */}
      <LogoCarousel />
      
    </div>
  );
}