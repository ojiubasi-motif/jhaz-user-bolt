import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts } from '../store/slices/catalogSlice';

export default function NewArrivals() {
  const { ref, isVisible } = useInView();
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.catalog);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  const displayProducts = useMemo(() => {
    const newItems = products.filter((p) => p.tag === 'New');
    if (newItems.length > 0) {
      return newItems.slice(0, 4);
    }
    return products.slice(0, 4);
  }, [products]);

  return (
    <section id="new-arrivals" className="py-20 sm:py-28 bg-earth-50">
      <div className="section-container" ref={ref}>
        {/* Section Header */}
        <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}>
          <div>
            <span className="text-terra-600 font-body text-sm font-semibold tracking-widest uppercase">
              Fresh Drops
            </span>
            <h2 className="heading-lg text-night-950 mt-2">New Arrivals</h2>
            <p className="body-md mt-3 max-w-md">
              Our latest pieces, each one customizable to match your vision.
            </p>
          </div>
          <Link to="/catalog" className="btn-ghost shrink-0">
            View All New Arrivals
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading && displayProducts.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl overflow-hidden border border-earth-100 h-96" />
            ))
          ) : (
            displayProducts.map((product, i) => (
              <div
                key={product.id}
                className={`group ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: `${(i + 1) * 100}ms` }}
              >
                <div className="card-hover bg-white rounded-xl overflow-hidden border border-earth-200/60 shadow-sm flex flex-col h-full">
                  {/* Image */}
                  <div className="relative aspect-square md:aspect-[4/3] overflow-hidden bg-earth-100">
                    <img
                      src={product.image_url || 'https://images.pexels.com/photos/7691105/pexels-photo-7691105.jpeg?auto=compress&cs=tinysrgb&w=600'}
                      alt={product.name}
                      className="img-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Tag */}
                    <span className="absolute top-3 left-3 px-3 py-1 bg-night-950/90 text-earth-50 text-xs font-semibold tracking-wider uppercase rounded-full">
                      {product.tag || 'New'}
                    </span>
                    {/* Wishlist */}
                    <button className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-night-800 hover:text-red-500 hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100">
                      <Heart size={16} />
                    </button>
                    {/* Customize badge */}
                    {product.is_customizable && (
                      <span className="absolute bottom-3 left-3 px-3 py-1 bg-terra-500/90 backdrop-blur-sm text-white text-xs font-semibold tracking-wider uppercase rounded-full">
                        Customizable
                      </span>
                    )}
                    {/* Quick action overlay (desktop only) */}
                    <div className="hidden md:block absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Link to={`/order?product=${product.id}`} className="w-full btn-primary text-xs py-3 rounded-lg flex items-center justify-center gap-2">
                        Customize & Order
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="flex flex-col flex-1 gap-2 p-4 justify-between">
                    <div>
                      <h3 className="font-display text-base font-semibold text-night-950 group-hover:text-terra-700 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="font-body text-sm font-semibold text-[#B8860B] dark:text-[#D4AF37] mt-1">
                        from ₦{product.price.toLocaleString('en-NG')}
                      </p>
                    </div>
                    {/* Mobile action button (always visible on mobile/tablet, hidden on desktop) */}
                    <div className="mt-3 md:hidden">
                      <Link
                        to={`/order?product=${product.id}`}
                        className="w-full btn-primary text-xs py-3 rounded-lg flex items-center justify-center gap-2 min-h-[44px]"
                      >
                        Customize & Order
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
