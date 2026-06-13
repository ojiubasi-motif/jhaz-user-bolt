import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import logo from '../assets/logo.png';

const navLinks = [
  { label: 'Shop All', href: '/catalog' },
  { label: 'New Arrivals', href: '/#new-arrivals' },
  { label: 'Customize', href: '/#customize' },
  { label: 'Collections', href: '/#categories' },
  { label: 'My Orders', href: '/my-orders' },
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

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsOpen(false);
  };

  const isHome = location.pathname === '/';

  const CartBadge = () =>
    cartCount > 0 ? (
      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-terra-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
        {cartCount}
      </span>
    ) : null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isHome
            ? 'bg-earth-50/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-20 sm:h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center h-full group">
              <img 
                src={logo} 
                alt="Jhaz-imprints Logo" 
                className="h-16 w-16 sm:h-20 sm:w-20 object-contain transition-all duration-300 transform-gpu will-change-transform [backface-visibility:hidden] group-hover:scale-105" 
              />
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
                to="/cart"
                className="p-2 text-night-800 hover:text-terra-600 transition-colors relative mr-2"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                <CartBadge />
              </Link>

              {user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-earth-200">
                  <span className="font-body text-xs font-semibold tracking-wider text-terra-600 uppercase">
                    Hello, {user.firstName || user.full_name || 'Guest'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-night-950 text-night-950 font-body font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:bg-night-950 hover:text-earth-50 rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pl-4 border-l border-earth-200">
                  <Link
                    to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
                    className="px-4 py-2 bg-night-950 text-earth-50 font-body font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:bg-terra-700 hover:shadow-md rounded-lg"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions & Menu Toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <Link
                to="/catalog"
                className="p-2 text-night-800 hover:text-terra-600 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
                aria-label="Search"
              >
                <Search size={20} />
              </Link>
              <Link
                to="/cart"
                className="p-2 text-night-800 hover:text-terra-600 transition-colors relative mr-1 flex items-center justify-center min-w-[44px] min-h-[44px]"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                <CartBadge />
              </Link>
              <button
                className="p-2 text-night-950 flex items-center justify-center min-w-[44px] min-h-[44px]"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-night-950/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Drawer panel */}
        <div
          className={`absolute inset-y-0 right-0 w-80 max-w-[85vw] bg-earth-50 shadow-2xl flex flex-col p-6 transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between pb-6 border-b border-earth-200">
            <span className="font-display text-lg font-bold text-night-950">Menu</span>
            <button
              onClick={() => setIsOpen(false)}
              className="w-11 h-11 rounded-full bg-earth-200/50 flex items-center justify-center text-night-950 hover:bg-earth-300 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="block font-body text-lg font-semibold text-night-800 hover:text-terra-600 transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="pt-6 border-t border-earth-200 flex flex-col gap-4">
                <span className="font-body text-xs font-semibold tracking-wider text-terra-600 uppercase">
                  Hello, {user.firstName || user.full_name || 'Guest'}
                </span>
                <button
                  onClick={handleLogout}
                  className="w-full py-3.5 border border-night-950 text-night-950 font-body font-semibold text-sm tracking-wider uppercase text-center rounded-xl active:bg-night-950 active:text-earth-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-6 border-t border-earth-200">
                <Link
                  to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3.5 bg-night-950 text-earth-50 font-body font-semibold text-sm tracking-wider uppercase text-center rounded-xl active:bg-terra-700"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
