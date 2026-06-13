import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import AuthInitializer from './components/AuthInitializer';
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
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, search, hash]);
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
    <Provider store={store}>
      <AuthInitializer>
        <div className="font-body bg-earth-50 text-night-950">
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/order" element={<Order />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Routes>
          <Footer />
        </div>
      </AuthInitializer>
    </Provider>
  );
}

export default App;