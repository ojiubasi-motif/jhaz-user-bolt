import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const categories = [
  {
    name: 'Dresses & Gowns',
    count: 24,
    image: 'https://images.pexels.com/photos/7691105/pexels-photo-7691105.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'From casual wraps to ceremonial elegance',
  },
  {
    name: 'Tops & Blouses',
    count: 18,
    image: 'https://images.pexels.com/photos/5710203/pexels-photo-5710203.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Dashikis, tunics, and modern silhouettes',
  },
  {
    name: 'Bottoms & Skirts',
    count: 15,
    image: 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Palazzos, wrappers, and wide-leg cuts',
  },
  {
    name: 'Jackets & Outerwear',
    count: 12,
    image: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Bombers, blazers, and structured layers',
  },
  {
    name: 'Matching Sets',
    count: 9,
    image: 'https://images.pexels.com/photos/6044242/pexels-photo-6044242.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Co-ords and two-piece ensembles',
  },
  {
    name: 'Accessories',
    count: 20,
    image: 'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=600',
    desc: 'Headwraps, scarves, and statement jewelry',
  },
];

export default function Categories() {
  const { ref, isVisible } = useInView();

  return (
    <section id="categories" className="py-20 sm:py-28 bg-earth-100/50">
      <div className="section-container" ref={ref}>
        <div className={`text-center mb-12 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
          <span className="text-terra-600 font-body text-sm font-semibold tracking-widest uppercase">
            Explore
          </span>
          <h2 className="heading-lg text-night-950 mt-2">Shop by Category</h2>
          <p className="body-md max-w-xl mx-auto mt-3">
            Every category, every piece, made customizable to your taste.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <Link
              key={cat.name}
              to="/catalog"
              className={`group relative rounded-2xl overflow-hidden aspect-[4/3] ${isVisible ? 'animate-scale-in' : 'opacity-0'}`}
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="img-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night-950/80 via-night-950/20 to-transparent" />
              <div className="absolute inset-0 bg-terra-700/0 group-hover:bg-terra-700/10 transition-all duration-500" />

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs text-earth-300 font-medium tracking-wider uppercase">
                  {cat.count} Pieces
                </p>
                <h3 className="font-display text-xl font-semibold text-earth-50 mt-1 group-hover:text-terra-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-earth-400 mt-1">{cat.desc}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-terra-400 text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Shop Now <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
