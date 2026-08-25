import { products } from '@/data/products';
import { DisclosureBar } from '@/components/DisclosureBar';
import { Hero } from '@/components/Hero';
import { TrustStrip } from '@/components/TrustStrip';
import { ProductGrid } from '@/components/ProductGrid';
import { HowTo } from '@/components/HowTo';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <>
      <DisclosureBar />
      <main>
        <Hero />
        <TrustStrip />
        <ProductGrid products={products} />
        <HowTo />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
