import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductsPage from './components/ProductsPage';
import CartSidebar from './components/CartSidebar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ProductsPage />
        <CartSidebar />
      </main>
    </>
  );
}