import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search } from 'lucide-react';

const navLinks = [
  { label: 'Shop All', href: '/catalog' },
  { label: 'New Arrivals', href: '/#new-arrivals' },
  { label: 'Customize', href: '/#customize' },
  { label: 'Collections', href: '/#categories' },
  { label: 'Heritage', href: '/#heritage' },
];

function useCartCount() {
  const [count, setCount] = useState(0);

  const readCount = () => {
    try {
      const raw = localStorage.getItem('jhaz_cart');
      if (raw) {
        const parsed = JSON.parse(raw);
        setCount(Array.isArray(parsed) ? parsed.length : 0);
      } else {
        setCount(0);
      }
    } catch {
      setCount(0);
    }
  };

  useEffect(() => {
    readCount();
    // Listen for cross-tab storage changes
    window.addEventListener('storage', readCount);
    // Listen for same-tab updates dispatched by Order.tsx
    window.addEventListener('jhaz-cart-updated', readCount);
    return () => {
      window.removeEventListener('storage', readCount);
      window.removeEventListener('jhaz-cart-updated', readCount);
    };
  }, []);

  return count;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const cartCount = useCartCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = location.pathname === '/';

  const CartBadge = () =>
    cartCount > 0 ? (
      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-terra-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
        {cartCount}
      </span>
    ) : null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? 'bg-earth-50/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-night-950 group-hover:text-terra-700 transition-colors duration-300">
              Jhaz-imprints
            </span>
            <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-terra-500 mt-1" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="font-body text-sm font-medium tracking-wide text-night-800 hover:text-terra-600 transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-terra-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/catalog" className="p-2 text-night-800 hover:text-terra-600 transition-colors" aria-label="Search">
              <Search size={20} />
            </Link>
            <Link
              to="/order?step=5"
              className="p-2 text-night-800 hover:text-terra-600 transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              <CartBadge />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-night-950"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-earth-50/98 backdrop-blur-lg border-t border-earth-200">
          <div className="section-container py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="block font-body text-lg font-medium text-night-800 hover:text-terra-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-4 pt-4 border-t border-earth-200">
              <Link to="/catalog" onClick={() => setIsOpen(false)} className="p-2 text-night-800" aria-label="Search">
                <Search size={20} />
              </Link>
              <Link
                to="/order?step=5"
                onClick={() => setIsOpen(false)}
                className="p-2 text-night-800 relative"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                <CartBadge />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
