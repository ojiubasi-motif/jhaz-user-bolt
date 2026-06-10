import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, MapPin, Mail, Phone } from 'lucide-react';
import logo from '../assets/logo.png';

const footerLinks = {
  shop: [
    { label: 'Shop All', to: '/catalog' },
    { label: 'New Arrivals', to: '/#new-arrivals' },
    { label: 'Bestsellers', to: '/#bestsellers' },
    { label: 'Collections', to: '/#categories' },
    { label: 'Customize Yours', to: '/#customize' },
  ],
  help: [
    { label: 'Size Guide', href: '#' },
    { label: 'Customization FAQ', href: '#' },
    { label: 'Shipping & Returns', href: '#' },
    { label: 'Track Your Order', href: '#' },
    { label: 'Contact Us', href: '#' },
  ],
  about: [
    { label: 'Our Heritage', href: '#heritage' },
    { label: 'Artisan Partners', href: '#' },
    { label: 'Sustainability', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Careers', href: '#' },
  ],
};

const socials = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-night-950 text-earth-400 border-t border-earth-800">
      <div className="section-container py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="inline-block group">
              <img 
                src={logo} 
                alt="Jhaz-imprints Logo" 
                className="h-20 w-20 object-contain brightness-0 invert transition-transform duration-300 transform-gpu will-change-transform [backface-visibility:hidden] group-hover:scale-105" 
              />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Handcrafted African fashion, made to your measure. Every piece
              tells a story of heritage and individuality.
            </p>
            <div className="space-y-2">
              <a href="#" className="flex items-center gap-2 text-sm hover:text-terra-400 transition-colors">
                <MapPin size={14} /> Accra, Ghana
              </a>
              <a href="#" className="flex items-center gap-2 text-sm hover:text-terra-400 transition-colors">
                <Mail size={14} /> hello@jhazimprints.com
              </a>
              <a href="#" className="flex items-center gap-2 text-sm hover:text-terra-400 transition-colors">
                <Phone size={14} /> +233 XX XXX XXXX
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-body text-sm font-semibold text-earth-200 tracking-wider uppercase mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm hover:text-terra-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold text-earth-200 tracking-wider uppercase mb-4">
              Help
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.help.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm hover:text-terra-400 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold text-earth-200 tracking-wider uppercase mb-4">
              About
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm hover:text-terra-400 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-earth-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-earth-600">
            &copy; {new Date().getFullYear()} Jhaz-imprints. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 rounded-full bg-earth-900/50 flex items-center justify-center text-earth-500 hover:text-terra-400 hover:bg-earth-800/50 transition-all duration-300"
              >
                <s.icon size={16} />
              </a>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-earth-600">
            <a href="#" className="hover:text-terra-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-terra-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-terra-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
