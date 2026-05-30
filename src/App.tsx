import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import NewArrivals from './components/NewArrivals';
import Customize from './components/Customize';
import Categories from './components/Categories';
import Bestsellers from './components/Bestsellers';
import Testimonials from './components/Testimonials';
import Heritage from './components/Heritage';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import Catalog from './pages/Catalog';
import Order from './pages/Order';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <NewArrivals />
      <Customize />
      <Categories />
      <Bestsellers />
      <Testimonials />
      <Heritage />
      <Newsletter />
    </>
  );
}

function App() {
  return (
    <div className="font-body bg-earth-50 text-night-950">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/order" element={<Order />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;